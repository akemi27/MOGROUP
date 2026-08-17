const db = require('../config/db');

const getVentas = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT ov.*, c.nombre AS cliente,
                   tr.nombre AS tipo_recibo, rv.numero AS numero_recibo,
                   COUNT(dv.id) AS total_unidades
            FROM ord_venta ov
            LEFT JOIN cliente c ON ov.cliente_id = c.id
            LEFT JOIN rec_venta rv ON rv.ord_venta_id = ov.id
            LEFT JOIN tip_recibo tr ON rv.tip_recibo_id = tr.id
            LEFT JOIN det_venta dv ON dv.ord_venta_id = ov.id
            GROUP BY ov.id, c.nombre, tr.nombre, rv.numero
            ORDER BY ov.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
};

const getVentaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [venta, items] = await Promise.all([
            db.query(`
                SELECT ov.*, c.nombre AS cliente, tr.nombre AS tipo_recibo, rv.numero AS numero_recibo,
                       ov.destino, ov.fecha_separacion
                FROM ord_venta ov
                LEFT JOIN cliente c ON ov.cliente_id = c.id
                LEFT JOIN rec_venta rv ON rv.ord_venta_id = ov.id
                LEFT JOIN tip_recibo tr ON rv.tip_recibo_id = tr.id
                WHERE ov.id = $1
            `, [id]),
            db.query(`
                SELECT dv.*, u.serie, p.nombre AS producto, al.nombre AS almacen
                FROM det_venta dv
                JOIN unidad u ON dv.unidad_id = u.id
                JOIN producto p ON u.producto_id = p.id
                JOIN almacen al ON u.almacen_id = al.id
                WHERE dv.ord_venta_id = $1
            `, [id])
        ]);
        if (venta.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json({ ...venta.rows[0], items: items.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener venta' });
    }
};

const createVenta = async (req, res) => {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const { cliente_id, fecha, fecha_separacion, destino, unidades, tip_recibo_id, numero_recibo } = req.body;

        if (!unidades || unidades.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'La venta debe tener al menos una unidad' });
        }

        for (const u of unidades) {
            const check = await client.query(
                `SELECT id FROM unidad WHERE id = $1 AND estado = 'disponible' AND activo = true`, [u.unidad_id]
            );
            if (check.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: `La unidad ${u.unidad_id} no está disponible` });
            }
        }

        const total = unidades.reduce((s, u) => s + parseFloat(u.precio), 0);

        const orden = await client.query(`
            INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion)
            VALUES ($1, $2, $3, 'completado', $4, $5) RETURNING *
        `, [cliente_id || null, fecha || new Date(), total, destino || null, fecha_separacion || null]);

        const ord_id = orden.rows[0].id;

        for (const u of unidades) {
            const det = await client.query(`
                INSERT INTO det_venta (ord_venta_id, unidad_id, precio)
                VALUES ($1, $2, $3) RETURNING id
            `, [ord_id, u.unidad_id, u.precio]);

            const info = await client.query(
                `SELECT almacen_id FROM unidad WHERE id = $1`, [u.unidad_id]
            );

            await client.query(`UPDATE unidad SET estado = 'vendido' WHERE id = $1`, [u.unidad_id]);

            await client.query(`
                INSERT INTO movimiento_kardex (unidad_id, almacen_id, tipo, cantidad, costo_unit, fecha, det_venta_id, saldo)
                VALUES ($1, $2, 'salida', 1, $3, CURRENT_DATE, $4, 0)
            `, [u.unidad_id, info.rows[0].almacen_id, u.precio, det.rows[0].id]);
        }

        await client.query(`
            INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha)
            VALUES ($1, $2, $3, $4)
        `, [ord_id, tip_recibo_id, numero_recibo, fecha || new Date()]);

        await client.query('COMMIT');
        res.status(201).json({ ...orden.rows[0], total_unidades: unidades.length });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error al registrar venta' });
    } finally {
        client.release();
    }
};

module.exports = { getVentas, getVentaById, createVenta };
