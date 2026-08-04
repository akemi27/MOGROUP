const db = require('../config/db');

const getUnidades = async (req, res) => {
    try {
        const { producto_id, estado } = req.query;
        let query = `
            SELECT u.*, p.nombre AS producto, c.nombre AS categoria, al.nombre AS almacen
            FROM unidad u
            JOIN producto p ON u.producto_id = p.id
            LEFT JOIN cat_producto c ON p.cat_producto_id = c.id
            JOIN almacen al ON u.almacen_id = al.id
            WHERE u.activo = true
        `;
        const params = [];
        if (producto_id) { params.push(producto_id); query += ` AND u.producto_id = $${params.length}`; }
        if (estado) { params.push(estado); query += ` AND u.estado = $${params.length}`; }
        query += ` ORDER BY u.id DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener unidades' });
    }
};

const createUnidad = async (req, res) => {
    try {
        const { producto_id, almacen_id, serie, color, precio_venta, garantia_meses } = req.body;
        const result = await db.query(`
            INSERT INTO unidad (producto_id, almacen_id, serie, color, estado, precio_venta, garantia_meses)
            VALUES ($1, $2, $3, $4, 'disponible', $5, $6)
            RETURNING *
        `, [producto_id, almacen_id, serie || null, color || null, precio_venta, garantia_meses || null]);

        const completo = await db.query(`
            SELECT u.*, p.nombre AS producto, c.nombre AS categoria, al.nombre AS almacen
            FROM unidad u
            JOIN producto p ON u.producto_id = p.id
            LEFT JOIN cat_producto c ON p.cat_producto_id = c.id
            JOIN almacen al ON u.almacen_id = al.id
            WHERE u.id = $1
        `, [result.rows[0].id]);

        res.status(201).json(completo.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear unidad' });
    }
};

const updateUnidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { almacen_id, serie, color, estado, precio_venta, garantia_meses } = req.body;
        const result = await db.query(`
            UPDATE unidad SET almacen_id=$1, serie=$2, color=$3, estado=$4, precio_venta=$5, garantia_meses=$6
            WHERE id=$7 AND activo=true RETURNING *
        `, [almacen_id, serie || null, color || null, estado, precio_venta, garantia_meses || null, id]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Unidad no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar unidad' });
    }
};

const deleteUnidad = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `UPDATE unidad SET activo = false WHERE id = $1 RETURNING *`, [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Unidad no encontrada' });
        res.json({ mensaje: 'Unidad eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar unidad' });
    }
};

module.exports = { getUnidades, createUnidad, updateUnidad, deleteUnidad };
