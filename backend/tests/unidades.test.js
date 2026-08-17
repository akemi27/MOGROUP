const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

afterAll(async () => {
    await db.end();
});

describe('CRUD /api/unidades (inventario por unidad física)', () => {
    let token;
    let productoId;
    let almacenId;
    let unidadId;
    const serie = `TEST-${Date.now()}`;

    beforeAll(async () => {
        token = await loginAsAdmin();
        const [productos, almacenes] = await Promise.all([
            request(app).get('/api/productos').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/almacenes').set('Authorization', `Bearer ${token}`),
        ]);
        productoId = productos.body[0].id;
        almacenId = almacenes.body[0].id;
    });

    afterAll(async () => {
        if (unidadId) await db.query(`DELETE FROM unidad WHERE id = $1`, [unidadId]);
    });

    it('registra una unidad física en el inventario, disponible por defecto', async () => {
        const res = await request(app)
            .post('/api/unidades')
            .set('Authorization', `Bearer ${token}`)
            .send({ producto_id: productoId, almacen_id: almacenId, serie, color: 'Negro', precio_venta: 1000, garantia_meses: 12 });
        expect(res.status).toBe(201);
        expect(res.body.estado).toBe('disponible');
        expect(res.body.serie).toBe(serie);
        unidadId = res.body.id;
    });

    it('filtra unidades por producto y estado', async () => {
        const res = await request(app)
            .get(`/api/unidades?producto_id=${productoId}&estado=disponible`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.some(u => u.id === unidadId)).toBe(true);
    });

    it('actualiza el estado de la unidad', async () => {
        const res = await request(app)
            .put(`/api/unidades/${unidadId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ almacen_id: almacenId, serie, color: 'Negro', estado: 'exhibicion', precio_venta: 1000, garantia_meses: 12 });
        expect(res.status).toBe(200);
        expect(res.body.estado).toBe('exhibicion');
    });

    it('elimina (desactiva) la unidad de prueba', async () => {
        const res = await request(app)
            .delete(`/api/unidades/${unidadId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });
});
