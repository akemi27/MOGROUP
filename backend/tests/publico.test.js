const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');

afterAll(async () => {
    await db.end();
});

describe('GET /api/publico/catalogo', () => {
    it('devuelve el catálogo sin necesidad de autenticación', async () => {
        const res = await request(app).get('/api/publico/catalogo');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('cada producto trae los campos que consume la landing', async () => {
        const res = await request(app).get('/api/publico/catalogo');
        expect(res.status).toBe(200);
        if (res.body.length > 0) {
            const producto = res.body[0];
            expect(producto).toHaveProperty('nombre');
            expect(producto).toHaveProperty('precio_ref');
            expect(producto).toHaveProperty('disponibles');
            expect(producto).toHaveProperty('colores');
            expect(Array.isArray(producto.colores)).toBe(true);
        }
    });
});
