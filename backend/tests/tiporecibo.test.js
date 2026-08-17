const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

afterAll(async () => {
    await db.end();
});

describe('CRUD /api/tip-recibos (solo administrador)', () => {
    let adminToken;
    let empleadoToken;
    let tipoId;
    const nombreTest = `Test Recibo ${Date.now()}`;

    beforeAll(async () => {
        adminToken = await loginAsAdmin();
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'mariag', password: 'admin123' });
        empleadoToken = res.body.token;
    });

    it('un empleado no puede gestionar tipos de recibo', async () => {
        const res = await request(app)
            .get('/api/tip-recibos')
            .set('Authorization', `Bearer ${empleadoToken}`);
        expect(res.status).toBe(403);
    });

    it('un administrador crea un tipo de recibo', async () => {
        const res = await request(app)
            .post('/api/tip-recibos')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ nombre: nombreTest });
        expect(res.status).toBe(201);
        tipoId = res.body.id;
    });

    it('actualiza el tipo de recibo', async () => {
        const res = await request(app)
            .put(`/api/tip-recibos/${tipoId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ nombre: `${nombreTest} editado` });
        expect(res.status).toBe(200);
    });

    it('elimina el tipo de recibo de prueba', async () => {
        const res = await request(app)
            .delete(`/api/tip-recibos/${tipoId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
    });
});
