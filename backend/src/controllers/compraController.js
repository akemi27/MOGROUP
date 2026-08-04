const db = require('../config/db');

const getCompras = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT oc.*, pr.nombre AS proveedor,
                   tr.nombre AS tipo_recibo, rc.numero AS numero_recibo,
                   COUNT(dc.id) AS total_items
            FROM ord_compra oc
            LEFT JOIN proveedor pr ON oc.proveedor_id = pr.id
            LEFT JOIN rec_compra rc ON rc.ord_compra_id = oc.id
            LEFT JOIN tip_recibo tr ON rc.tip_recibo_id = tr.id
            LEFT JOIN det_compra dc ON dc.ord_compra_id = oc.id
            GROUP BY oc.id, pr.nombre, tr.nombre, rc.numero
            ORDER BY oc.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener compras' });
    }
};

const getCompraById = async (req, res) => {
    try {
        const { id } = req.params;
        const [compra, items] = await Promise.all([
            db.query(`
                SELECT oc.*, pr.nombre AS proveedor, tr.nombre AS tipo_recibo, rc.numero AS numero_recibo
                FROM ord_compra oc
                LEFT JOIN proveedor pr ON oc.proveedor_id = pr.id
                LEFT JOIN rec_compra rc ON rc.ord_compra_id = oc.id
                LEFT JOIN tip_recibo tr ON rc.tip_recibo_id = tr.id
                WHERE oc.id = $1
            `, [id]),
            db.query(`
                SELECT dc.*, p.nombre AS producto
                FROM det_compra dc JOIN producto p ON dc.producto_id = p.id
                WHERE dc.ord_compra_id = $1
            `, [id])
        ]);
        if (compra.rows.length === 0) return res.status(404).json({ error: 'Compra no encontrada' });
        res.json({ ...compra.rows[0], items: items.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener compra' });
    }
};

const createCompra = async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const { proveedor_id, fecha, items, tip_recibo_id, numero_recibo } = req.body;

        if (!items || items.length === 0)
            return res.status(400).json({ error: 'La compra debe tener al menos un producto' });

        const total = items.reduce((s, i) => s + parseFloat(i.cantidad) * parseFloat(i.costo_unit), 0);

        const orden = await client.query(`
            INSERT INTO ord_compra (proveedor_id, fecha, total, estado)
            VALUES ($1, $2, $3, 'pendiente') RETURNING *
        `, [proveedor_id, fecha || new Date(), total]);

        const ord_id = orden.rows[0].id;

        for (const item of items) {
            await client.query(`
                INSERT INTO det_compra (ord_compra_id, producto_id, cantidad, costo_unit)
                VALUES ($1, $2, $3, $4)
            `, [ord_id, item.producto_id, item.cantidad, item.costo_unit]);
        }

        await client.query(`
            INSERT INTO rec_compra (ord_compra_id, tip_recibo_id, numero, fecha)
            VALUES ($1, $2, $3, $4)
        `, [ord_id, tip_recibo_id, numero_recibo, fecha || new Date()]);

        await client.query('COMMIT');
        res.status(201).json({ ...orden.rows[0], total_items: items.length });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error al registrar compra' });
    } finally {
        client.release();
    }
};

const recibirCompra = async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { almacen_id, unidades } = req.body;
        // unidades: [{det_compra_id, serie, color}] — una entrada por cada moto física

        const orden = await client.query(
            `SELECT * FROM ord_compra WHERE id = $1 AND estado = 'pendiente'`, [id]
        );
        if (orden.rows.length === 0)
            return res.status(400).json({ error: 'Orden no encontrada o ya fue recibida' });

        const items = await client.query(
            `SELECT * FROM det_compra WHERE ord_compra_id = $1`, [id]
        );

        // Mapa: det_compra_id → {producto_id, costo_unit}
        const itemMap = {};
        for (const it of items.rows) itemMap[it.id] = it;

        if (unidades && unidades.length > 0) {
            // Modo con series: cada elemento del array representa una unidad física
            for (const u of unidades) {
                const item = itemMap[u.det_compra_id];
                if (!item) continue;
                const precioVenta = u.precio_venta ? parseFloat(u.precio_venta) : parseFloat(item.costo_unit);
                const garantia = u.garantia_meses ? parseInt(u.garantia_meses) : null;
                const created = await client.query(`
                    INSERT INTO unidad (producto_id, almacen_id, serie, color, estado, precio_venta, garantia_meses)
                    VALUES ($1, $2, $3, $4, 'disponible', $5, $6) RETURNING id
                `, [item.producto_id, almacen_id,
                    u.serie?.trim() || null,
                    u.color || null,
                    precioVenta,
                    garantia]);

                try {
                    await client.query('SAVEPOINT sp_kardex');
                    await client.query(`
                        INSERT INTO movimiento_kardex (unidad_id, almacen_id, tipo, cantidad, costo_unit, fecha, det_compra_id, saldo)
                        VALUES ($1, $2, 'entrada', 1, $3, CURRENT_DATE, $4, $3)
                    `, [created.rows[0].id, almacen_id, item.costo_unit, item.id]);
                    await client.query('RELEASE SAVEPOINT sp_kardex');
                } catch (kardexErr) {
                    await client.query('ROLLBACK TO SAVEPOINT sp_kardex');
                    console.warn('[kardex] omitido:', kardexErr.message);
                }
            }
        } else {
            // Fallback: sin series, crea unidades en blanco
            for (const item of items.rows) {
                for (let i = 0; i < item.cantidad; i++) {
                    const created = await client.query(`
                        INSERT INTO unidad (producto_id, almacen_id, estado, precio_venta)
                        VALUES ($1, $2, 'disponible', $3) RETURNING id
                    `, [item.producto_id, almacen_id, item.costo_unit]);

                    try {
                        await client.query('SAVEPOINT sp_kardex');
                        await client.query(`
                            INSERT INTO movimiento_kardex (unidad_id, almacen_id, tipo, cantidad, costo_unit, fecha, det_compra_id, saldo)
                            VALUES ($1, $2, 'entrada', 1, $3, CURRENT_DATE, $4, $3)
                        `, [created.rows[0].id, almacen_id, item.costo_unit, item.id]);
                        await client.query('RELEASE SAVEPOINT sp_kardex');
                    } catch (kardexErr) {
                        await client.query('ROLLBACK TO SAVEPOINT sp_kardex');
                        console.warn('[kardex] omitido:', kardexErr.message);
                    }
                }
            }
        }

        await client.query(`UPDATE ord_compra SET estado = 'recibido' WHERE id = $1`, [id]);
        await client.query('COMMIT');
        res.json({ mensaje: 'Compra recibida. Unidades registradas en inventario.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error al recibir compra' });
    } finally {
        client.release();
    }
};

module.exports = { getCompras, getCompraById, createCompra, recibirCompra };
