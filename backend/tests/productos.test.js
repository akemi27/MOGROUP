const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

afterAll(async () => {
    await db.end();
});

describe('CRUD /api/productos', () => {
    let token;
    let categoriaId;
    let productoId;
    const sufijo = Date.now();

    beforeAll(async () => {
        token = await loginAsAdmin();
        // Se reutiliza una categoría existente: eliminar cat_producto es un DELETE físico
        // con restricción de FK, y un producto desactivado (soft-delete) sigue referenciándola.
        const catRes = await request(app)
            .get('/api/categorias')
            .set('Authorization', `Bearer ${token}`);
        categoriaId = catRes.body[0].id;
    });

    afterAll(async () => {
        // Borrado físico tras probar el endpoint DELETE (soft-delete): evita dejar
        // registros de prueba acumulados en la base de datos real.
        if (productoId) await db.query(`DELETE FROM producto WHERE id = $1`, [productoId]);
    });

    it('crea un producto asociado a la categoría', async () => {
        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: `Producto Test ${sufijo}`, cat_producto_id: categoriaId, precio_ref: 500, garantia_std: 12 });
        expect(res.status).toBe(201);
        expect(res.body.cat_producto_id).toBe(categoriaId);
        expect(res.body.stock_disponible).toBe(0);
        productoId = res.body.id;
    });

    it('actualiza el producto', async () => {
        const res = await request(app)
            .put(`/api/productos/${productoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: `Producto Test Editado ${sufijo}`, cat_producto_id: categoriaId, precio_ref: 550, garantia_std: 12 });
        expect(res.status).toBe(200);
        expect(parseFloat(res.body.precio_ref)).toBe(550);
    });

    it('lista los productos incluyendo el creado', async () => {
        const res = await request(app)
            .get('/api/productos')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.some(p => p.id === productoId)).toBe(true);
    });

    it('elimina (desactiva) el producto de prueba', async () => {
        const res = await request(app)
            .delete(`/api/productos/${productoId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });
});
