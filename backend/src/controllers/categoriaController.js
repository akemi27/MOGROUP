const db = require("../config/db");

const selectCategorias = async (req, res) => {
    try {
        const result = await db.query(`SELECT id, nombre FROM cat_producto ORDER BY nombre ASC`);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

const createCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;
        const result = await db.query(
            `INSERT INTO cat_producto (nombre) VALUES ($1) RETURNING *`, [nombre]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'La categoría ya existe' });
        console.error(error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const result = await db.query(
            `UPDATE cat_producto SET nombre = $1 WHERE id = $2 RETURNING *`, [nombre, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'La categoría ya existe' });
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM cat_producto WHERE id = $1`, [id]);
        res.json({ mensaje: 'Categoría eliminada' });
    } catch (error) {
        if (error.code === '23503') return res.status(400).json({ error: 'No se puede eliminar, tiene productos asociados' });
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar categoría' });
    }
};

module.exports = { selectCategorias, createCategoria, updateCategoria, deleteCategoria };
