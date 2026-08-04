const db = require("../config/db");

const selectProductos = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                p.*,
                c.nombre AS categoria,
                COUNT(u.id) FILTER (WHERE u.estado = 'disponible' AND u.activo = true) AS stock_disponible
            FROM producto p
            LEFT JOIN cat_producto c ON p.cat_producto_id = c.id
            LEFT JOIN unidad u ON u.producto_id = p.id
            WHERE p.activo = true
            GROUP BY p.id, c.nombre
            ORDER BY p.id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

const createProducto = async (req, res) => {
    try {
        const { nombre, cat_producto_id, precio_ref, garantia_std } = req.body;

        const result = await db.query(`
            INSERT INTO producto (nombre, cat_producto_id, precio_ref, garantia_std)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [nombre, cat_producto_id, precio_ref, garantia_std || 12]);

        const completo = await db.query(`
            SELECT p.*, c.nombre AS categoria, 0 AS stock_disponible
            FROM producto p
            LEFT JOIN cat_producto c ON p.cat_producto_id = c.id
            WHERE p.id = $1
        `, [result.rows[0].id]);

        res.status(201).json(completo.rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cat_producto_id, precio_ref, garantia_std } = req.body;

        const result = await db.query(`
            UPDATE producto
            SET nombre = $1, cat_producto_id = $2, precio_ref = $3, garantia_std = $4
            WHERE id = $5 AND activo = true
            RETURNING *
        `, [nombre, cat_producto_id, precio_ref, garantia_std, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const completo = await db.query(`
            SELECT
                p.*, c.nombre AS categoria,
                COUNT(u.id) FILTER (WHERE u.estado = 'disponible' AND u.activo = true) AS stock_disponible
            FROM producto p
            LEFT JOIN cat_producto c ON p.cat_producto_id = c.id
            LEFT JOIN unidad u ON u.producto_id = p.id
            WHERE p.id = $1
            GROUP BY p.id, c.nombre
        `, [id]);

        res.json(completo.rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `UPDATE producto SET activo = false WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
};

module.exports = { selectProductos, createProducto, updateProducto, deleteProducto };
