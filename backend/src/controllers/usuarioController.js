const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        const result = await db.query(
            'SELECT * FROM usuarios WHERE username = $1 AND activo = true',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, usuario.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: usuario.id, username: usuario.username, rol: usuario.rol, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                username: usuario.username,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getUsuarios = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, nombre, username, rol, activo, creado_en FROM usuarios ORDER BY id DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

const createUsuario = async (req, res) => {
    try {
        const { nombre, username, password, rol } = req.body;

        if (!nombre || !username || !password) {
            return res.status(400).json({ error: 'Nombre, usuario y contraseña son requeridos' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO usuarios (nombre, username, password, rol)
             VALUES ($1, $2, $3, $4)
             RETURNING id, nombre, username, rol, activo, creado_en`,
            [nombre, username, hashedPassword, rol || 'empleado']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El nombre de usuario ya existe' });
        }
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, username, password, rol } = req.body;

        let result;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            result = await db.query(
                `UPDATE usuarios SET nombre = $1, username = $2, password = $3, rol = $4
                 WHERE id = $5 RETURNING id, nombre, username, rol, activo, creado_en`,
                [nombre, username, hashedPassword, rol, id]
            );
        } else {
            result = await db.query(
                `UPDATE usuarios SET nombre = $1, username = $2, rol = $3
                 WHERE id = $4 RETURNING id, nombre, username, rol, activo, creado_en`,
                [nombre, username, rol, id]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El nombre de usuario ya existe' });
        }
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
        }

        const result = await db.query(
            'UPDATE usuarios SET activo = false WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};

const getMe = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, nombre, username, rol, activo, creado_en FROM usuarios WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};

const updateMe = async (req, res) => {
    try {
        const { nombre, currentPassword, newPassword } = req.body;
        const { id } = req.user;

        // Validar nombre
        const nombreTrimmed = (nombre || '').trim();
        if (!nombreTrimmed) return res.status(400).json({ error: 'El nombre no puede estar vacío' });
        if (nombreTrimmed.length > 128) return res.status(400).json({ error: 'El nombre es demasiado largo' });

        if (newPassword) {
            
            if (typeof newPassword !== 'string' || newPassword.length > 128)
                return res.status(400).json({ error: 'Contraseña inválida' });
            if (newPassword.length < 6)
                return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            if (!currentPassword)
                return res.status(400).json({ error: 'Ingresa tu contraseña actual' });

            const userRow = await db.query('SELECT password FROM usuarios WHERE id = $1 AND activo = true', [id]);
            if (userRow.rows.length === 0)
                return res.status(404).json({ error: 'Usuario no encontrado' });

            const match = await bcrypt.compare(currentPassword, userRow.rows[0].password);
            if (!match)
                return res.status(400).json({ error: 'Contraseña actual incorrecta' });

            const samePass = await bcrypt.compare(newPassword, userRow.rows[0].password);
            if (samePass)
                return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual' });

            const hashed = await bcrypt.hash(newPassword, 10);
            const result = await db.query(
                'UPDATE usuarios SET nombre=$1, password=$2 WHERE id=$3 RETURNING id, nombre, username, rol',
                [nombreTrimmed, hashed, id]
            );
            return res.json({ ...result.rows[0], passwordChanged: true });
        }

        const result = await db.query(
            'UPDATE usuarios SET nombre=$1 WHERE id=$2 RETURNING id, nombre, username, rol',
            [nombreTrimmed, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
};

module.exports = { login, getMe, updateMe, getUsuarios, createUsuario, updateUsuario, deleteUsuario };
