const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/publico/catalogo — catálogo sin autenticación
router.get('/catalogo', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                p.id,
                p.nombre,
                p.precio_ref,
                p.garantia_std,
                c.nombre AS categoria,
                COUNT(u.id) FILTER (WHERE u.estado = 'disponible' AND u.activo = true) AS disponibles,
                ARRAY_REMOVE(
                    ARRAY_AGG(DISTINCT u.color) FILTER (WHERE u.estado = 'disponible' AND u.activo = true),
                    NULL
                ) AS colores
            FROM producto p
            LEFT JOIN cat_producto c ON p.cat_producto_id = c.id
            LEFT JOIN unidad u ON u.producto_id = p.id
            WHERE p.activo = true
            GROUP BY p.id, c.nombre
            ORDER BY c.nombre NULLS LAST, p.nombre
        `);
        res.json(result.rows.map(r => ({
            ...r,
            disponibles: parseInt(r.disponibles || 0),
            precio_ref: r.precio_ref ? parseFloat(r.precio_ref) : null,
            garantia_std: r.garantia_std ? parseInt(r.garantia_std) : null,
            colores: r.colores || [],
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cargar catálogo' });
    }
});

module.exports = router;
