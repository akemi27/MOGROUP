const db = require("../config/db");

const getProveedores = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT * FROM proveedor WHERE activo = true ORDER BY id DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};

const getProveedorById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT * FROM proveedor WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
};

const createProveedor = async (req, res) => {
    try {
        const { ruc, nombre, contacto, email, telefono, direccion } = req.body;

        const result = await db.query(`
            INSERT INTO proveedor (ruc, nombre, contacto, email, telefono, direccion)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [ruc, nombre, contacto, email, telefono, direccion]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El RUC ya está registrado' });
        }
        console.error(error.message);
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
};

const updateProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const { ruc, nombre, contacto, email, telefono, direccion } = req.body;

        const result = await db.query(`
            UPDATE proveedor
            SET ruc = $1, nombre = $2, contacto = $3, email = $4, telefono = $5, direccion = $6
            WHERE id = $7 AND activo = true
            RETURNING *
        `, [ruc, nombre, contacto, email, telefono, direccion, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El RUC ya está registrado' });
        }
        console.error(error.message);
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
};

const deleteProveedor = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `UPDATE proveedor SET activo = false WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json({ mensaje: 'Proveedor eliminado correctamente' });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({ error: 'No se puede eliminar porque tiene órdenes de compra registradas' });
        }
        console.error(error.message);
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
};

module.exports = { getProveedores, getProveedorById, createProveedor, updateProveedor, deleteProveedor };
