const db = require('../config/db');

const getTiposRecibo = async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM tip_recibo ORDER BY id ASC`);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tipos de recibo' });
    }
};

const createTipoRecibo = async (req, res) => {
    try {
        const { nombre } = req.body;
        const result = await db.query(
            `INSERT INTO tip_recibo (nombre) VALUES ($1) RETURNING *`, [nombre]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'El tipo ya existe' });
        console.error(error);
        res.status(500).json({ error: 'Error al crear tipo de recibo' });
    }
};

const updateTipoRecibo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const result = await db.query(
            `UPDATE tip_recibo SET nombre = $1 WHERE id = $2 RETURNING *`, [nombre, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Tipo no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar tipo de recibo' });
    }
};

const deleteTipoRecibo = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM tip_recibo WHERE id = $1`, [id]);
        res.json({ mensaje: 'Tipo de recibo eliminado' });
    } catch (error) {
        if (error.code === '23503') return res.status(400).json({ error: 'No se puede eliminar, está en uso' });
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar tipo de recibo' });
    }
};

module.exports = { getTiposRecibo, createTipoRecibo, updateTipoRecibo, deleteTipoRecibo };
