const db = require('../config/db');

const getClientes = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM cliente WHERE activo = true ORDER BY id DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

const createCliente = async (req, res) => {
    try {
        const { nombre, dni, celular, email } = req.body;
        const result = await db.query(
            `INSERT INTO cliente (nombre, dni, celular, email) VALUES ($1, $2, $3, $4) RETURNING *`,
            [nombre, dni || null, celular, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'El DNI ya está registrado' });
        console.error(error);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
};

const updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, dni, celular, email } = req.body;
        const result = await db.query(
            `UPDATE cliente SET nombre=$1, dni=$2, celular=$3, email=$4 WHERE id=$5 AND activo=true RETURNING *`,
            [nombre, dni || null, celular, email, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ error: 'El DNI ya está registrado' });
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
};

const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `UPDATE cliente SET activo = false WHERE id = $1 RETURNING *`, [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ mensaje: 'Cliente eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
};

module.exports = { getClientes, createCliente, updateCliente, deleteCliente };
