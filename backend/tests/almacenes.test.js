const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

afterAll(async () => {
    await db.end();
});

describe('CRUD /api/almacenes', () => {
    let token;
    let almacenId;
    const nombreTest = `Test Almacen ${Date.now()}`;

    beforeAll(async () => {
        token = await loginAsAdmin();
    });

    afterAll(async () => {
        // Borrado físico tras probar el endpoint DELETE (soft-delete): evita dejar
        // registros de prueba acumulados en la base de datos real.
        if (almacenId) await db.query(`DELETE FROM almacen WHERE id = $1`, [almacenId]);
    });

    it('crea un almacén nuevo', async () => {
        const res = await request(app)
            .post('/api/almacenes')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: nombreTest });
        expect(res.status).toBe(201);
        almacenId = res.body.id;
    });

    it('rechaza un almacén con nombre duplicado', async () => {
        const res = await request(app)
            .post('/api/almacenes')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: nombreTest });
        expect(res.status).toBe(400);
    });

    it('actualiza el almacén', async () => {
        const res = await request(app)
            .put(`/api/almacenes/${almacenId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: `${nombreTest} editado` });
        expect(res.status).toBe(200);
        expect(res.body.nombre).toBe(`${nombreTest} editado`);
    });

    it('lista los almacenes', async () => {
        const res = await request(app)
            .get('/api/almacenes')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.some(a => a.id === almacenId)).toBe(true);
    });

    it('desactiva el almacén de prueba y deja de listarse', async () => {
        const del = await request(app)
            .delete(`/api/almacenes/${almacenId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(del.status).toBe(200);

        const lista = await request(app)
            .get('/api/almacenes')
            .set('Authorization', `Bearer ${token}`);
        expect(lista.body.some(a => a.id === almacenId)).toBe(false);
    });
});
