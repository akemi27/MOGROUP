const db = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        const [ventasQ, comprasQ, unidadesQ, clientesQ, actividadQ] = await Promise.all([
            db.query(`SELECT COUNT(*) AS total, COALESCE(SUM(total), 0) AS ingresos FROM ord_venta`),
            db.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes FROM ord_compra`),
            db.query(`SELECT COUNT(*) FILTER (WHERE estado = 'disponible') AS disponibles FROM unidad WHERE activo = true`),
            db.query(`SELECT COUNT(*) AS total FROM cliente WHERE activo = true`),
            db.query(`
                SELECT tipo, id, fecha, total, contraparte, recibo FROM (
                    SELECT 'venta' AS tipo, ov.id, ov.fecha, ov.total,
                           COALESCE(c.nombre, 'Anónimo') AS contraparte, rv.numero AS recibo
                    FROM ord_venta ov
                    LEFT JOIN cliente c ON ov.cliente_id = c.id
                    LEFT JOIN rec_venta rv ON rv.ord_venta_id = ov.id
                    UNION ALL
                    SELECT 'compra', oc.id, oc.fecha, oc.total,
                           pr.nombre, rc.numero
                    FROM ord_compra oc
                    LEFT JOIN proveedor pr ON oc.proveedor_id = pr.id
                    LEFT JOIN rec_compra rc ON rc.ord_compra_id = oc.id
                ) sub
                ORDER BY fecha DESC
                LIMIT 10
            `)
        ]);

        res.json({
            total_ventas: parseInt(ventasQ.rows[0].total),
            ingresos_totales: parseFloat(ventasQ.rows[0].ingresos),
            total_compras: parseInt(comprasQ.rows[0].total),
            compras_pendientes: parseInt(comprasQ.rows[0].pendientes),
            unidades_disponibles: parseInt(unidadesQ.rows[0].disponibles),
            clientes_activos: parseInt(clientesQ.rows[0].total),
            actividad_reciente: actividadQ.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cargar dashboard' });
    }
};

const getMovimientos = async (req, res) => {
    try {
        const { tipo } = req.query;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 15;
        const offset = (page - 1) * limit;

        const ventaFilter = tipo === 'compra' ? 'WHERE 1=0' : '';
        const compraFilter = tipo === 'venta' ? 'WHERE 1=0' : '';

        const [movQ, countQ] = await Promise.all([
            db.query(`
                SELECT tipo, id, fecha, total, contraparte, recibo, extra FROM (
                    SELECT 'venta' AS tipo, ov.id, ov.fecha, ov.total,
                           COALESCE(c.nombre, 'Anónimo') AS contraparte,
                           rv.numero AS recibo, ov.destino AS extra
                    FROM ord_venta ov
                    LEFT JOIN cliente c ON ov.cliente_id = c.id
                    LEFT JOIN rec_venta rv ON rv.ord_venta_id = ov.id
                    ${ventaFilter}
                    UNION ALL
                    SELECT 'compra', oc.id, oc.fecha, oc.total,
                           pr.nombre, rc.numero, oc.estado
                    FROM ord_compra oc
                    LEFT JOIN proveedor pr ON oc.proveedor_id = pr.id
                    LEFT JOIN rec_compra rc ON rc.ord_compra_id = oc.id
                    ${compraFilter}
                ) sub
                ORDER BY fecha DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]),
            db.query(`
                SELECT COUNT(*) AS total FROM (
                    SELECT id FROM ord_venta ${ventaFilter}
                    UNION ALL
                    SELECT id FROM ord_compra ${compraFilter}
                ) sub
            `)
        ]);

        res.json({
            movimientos: movQ.rows,
            total: parseInt(countQ.rows[0].total),
            page,
            perPage: limit
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cargar movimientos' });
    }
};

const getGraficos = async (req, res) => {
    try {
        const [ventasMes, comprasMes, estadosUnidades] = await Promise.all([
            db.query(`
                SELECT
                    TO_CHAR(DATE_TRUNC('month', fecha), 'YYYY-MM') AS mes,
                    TO_CHAR(DATE_TRUNC('month', fecha), 'Mon YY') AS mes_label,
                    COUNT(*) AS count,
                    COALESCE(SUM(total), 0) AS total
                FROM ord_venta
                WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
                GROUP BY DATE_TRUNC('month', fecha)
                ORDER BY DATE_TRUNC('month', fecha)
            `),
            db.query(`
                SELECT
                    TO_CHAR(DATE_TRUNC('month', fecha), 'YYYY-MM') AS mes,
                    TO_CHAR(DATE_TRUNC('month', fecha), 'Mon YY') AS mes_label,
                    COUNT(*) AS count,
                    COALESCE(SUM(total), 0) AS total
                FROM ord_compra
                WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
                GROUP BY DATE_TRUNC('month', fecha)
                ORDER BY DATE_TRUNC('month', fecha)
            `),
            db.query(`
                SELECT estado, COUNT(*) AS count
                FROM unidad
                WHERE activo = true
                GROUP BY estado
                ORDER BY count DESC
            `)
        ]);

        const ventasMap = Object.fromEntries(ventasMes.rows.map(r => [r.mes, r]));
        const comprasMap = Object.fromEntries(comprasMes.rows.map(r => [r.mes, r]));

        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        const allMonths = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
            allMonths.push({ key, label });
        }

        const meses = allMonths.map(({ key, label }) => ({
            mes: key,
            mes_label: label,
            ventas_count: parseInt(ventasMap[key]?.count || 0),
            ventas_total: parseFloat(ventasMap[key]?.total || 0),
            compras_count: parseInt(comprasMap[key]?.count || 0),
            compras_total: parseFloat(comprasMap[key]?.total || 0),
        }));

        res.json({
            meses,
            estados_unidades: estadosUnidades.rows.map(r => ({
                estado: r.estado,
                count: parseInt(r.count)
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cargar gráficos' });
    }
};

module.exports = { getDashboard, getMovimientos, getGraficos };
