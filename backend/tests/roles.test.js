const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');

afterAll(async () => {
    await db.end();
});

async function loginAs(username, password) {
    const res = await request(app).post('/api/auth/login').send({ username, password });
    return res.body.token;
}

describe('Autorización por roles', () => {
    it('un empleado no puede acceder a /api/usuarios (solo admin)', async () => {
        const token = await loginAs('mariag', 'admin123');
        expect(token).toBeDefined();

        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it('un administrador sí puede acceder a /api/usuarios', async () => {
        const token = await loginAs('admin', 'admin123');
        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });
});
