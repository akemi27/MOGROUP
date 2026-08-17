const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

afterAll(async () => {
    await db.end();
});

describe('CRUD /api/categorias', () => {
    let token;
    let categoriaId;
    const nombreTest = `Test Categoria ${Date.now()}`;

    beforeAll(async () => {
        token = await loginAsAdmin();
    });

    afterAll(async () => {
        if (categoriaId) {
            await request(app)
                .delete(`/api/categorias/${categoriaId}`)
                .set('Authorization', `Bearer ${token}`);
        }
    });

    it('crea una categoría nueva', async () => {
        const res = await request(app)
            .post('/api/categorias')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: nombreTest });
        expect(res.status).toBe(201);
        expect(res.body.nombre).toBe(nombreTest);
        categoriaId = res.body.id;
    });

    it('rechaza crear una categoría con nombre duplicado', async () => {
        const res = await request(app)
            .post('/api/categorias')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: nombreTest });
        expect(res.status).toBe(400);
    });

    it('actualiza el nombre de la categoría', async () => {
        const nuevoNombre = `${nombreTest} editada`;
        const res = await request(app)
            .put(`/api/categorias/${categoriaId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: nuevoNombre });
        expect(res.status).toBe(200);
        expect(res.body.nombre).toBe(nuevoNombre);
    });

    it('lista las categorías incluyendo la creada', async () => {
        const res = await request(app)
            .get('/api/categorias')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.some(c => c.id === categoriaId)).toBe(true);
    });

    it('elimina la categoría de prueba', async () => {
        const res = await request(app)
            .delete(`/api/categorias/${categoriaId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        categoriaId = null;
    });
});
