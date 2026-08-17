const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');

afterAll(async () => {
    await db.end();
});

describe('POST /api/auth/login', () => {
    it('rechaza el login sin usuario ni contraseña', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('rechaza credenciales inválidas', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'password-incorrecta' });
        expect(res.status).toBe(401);
    });

    it('autentica con credenciales válidas y devuelve un token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'admin123' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.usuario).toMatchObject({ username: 'admin', rol: 'admin' });
    });
});

describe('Protección de rutas', () => {
    it('rechaza el acceso a una ruta protegida sin token', async () => {
        const res = await request(app).get('/api/categorias');
        expect(res.status).toBe(401);
    });

    it('rechaza un token inválido', async () => {
        const res = await request(app)
            .get('/api/categorias')
            .set('Authorization', 'Bearer token-invalido');
        expect(res.status).toBe(401);
    });
});
