const db = require('../config/db');

const getAlmacenes = async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM almacen WHERE activo = true ORDER BY id ASC`);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener almacenes' });
    }
};

const createAlmacen = async (req, res) => {
    try {
        const { nombre } = req.body;
        const result = await db.query(
            `INSERT INTO almacen (nombre) VALUES ($1) RETURNING *`, [nombre]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'El almacén ya existe' });
        console.error(error);
        res.status(500).json({ error: 'Error al crear almacén' });
    }
};

const updateAlmacen = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const result = await db.query(
            `UPDATE almacen SET nombre = $1 WHERE id = $2 RETURNING *`, [nombre, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Almacén no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar almacén' });
    }
};

const deleteAlmacen = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `UPDATE almacen SET activo = false WHERE id = $1 RETURNING *`, [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Almacén no encontrado' });
        res.json({ mensaje: 'Almacén desactivado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar almacén' });
    }
};

module.exports = { getAlmacenes, createAlmacen, updateAlmacen, deleteAlmacen };
