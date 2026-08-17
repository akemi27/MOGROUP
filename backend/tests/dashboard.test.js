const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

afterAll(async () => {
    await db.end();
});

describe('GET /api/dashboard', () => {
    let token;

    beforeAll(async () => {
        token = await loginAsAdmin();
    });

    it('devuelve los indicadores principales', async () => {
        const res = await request(app)
            .get('/api/dashboard')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('total_ventas');
        expect(res.body).toHaveProperty('ingresos_totales');
        expect(res.body).toHaveProperty('unidades_disponibles');
        expect(Array.isArray(res.body.actividad_reciente)).toBe(true);
    });

    it('devuelve el historial de movimientos paginado', async () => {
        const res = await request(app)
            .get('/api/dashboard/movimientos?page=1')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.movimientos)).toBe(true);
        expect(res.body).toHaveProperty('total');
        expect(res.body.page).toBe(1);
    });

    it('devuelve los datos para los gráficos de ventas y compras', async () => {
        const res = await request(app)
            .get('/api/dashboard/graficos')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.meses).toHaveLength(6);
        expect(Array.isArray(res.body.estados_unidades)).toBe(true);
    });

    it('rechaza el acceso sin token', async () => {
        const res = await request(app).get('/api/dashboard');
        expect(res.status).toBe(401);
    });
});
