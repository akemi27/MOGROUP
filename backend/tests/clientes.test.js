const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

afterAll(async () => {
    await db.end();
});

describe('CRUD /api/clientes', () => {
    let token;
    let clienteId;
    const dni = `${Date.now()}`.slice(-8);

    beforeAll(async () => {
        token = await loginAsAdmin();
    });

    afterAll(async () => {
        if (clienteId) await db.query(`DELETE FROM cliente WHERE id = $1`, [clienteId]);
    });

    it('crea un cliente nuevo', async () => {
        const res = await request(app)
            .post('/api/clientes')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Cliente de Prueba', dni, celular: '999888777', email: 'cliente@test.com' });
        expect(res.status).toBe(201);
        expect(res.body.dni).toBe(dni);
        clienteId = res.body.id;
    });

    it('rechaza un cliente con DNI duplicado', async () => {
        const res = await request(app)
            .post('/api/clientes')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Otro Cliente', dni, celular: '', email: '' });
        expect(res.status).toBe(400);
    });

    it('actualiza el cliente', async () => {
        const res = await request(app)
            .put(`/api/clientes/${clienteId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Cliente de Prueba Editado', dni, celular: '999888777', email: 'cliente@test.com' });
        expect(res.status).toBe(200);
        expect(res.body.nombre).toBe('Cliente de Prueba Editado');
    });

    it('lista los clientes incluyendo el creado', async () => {
        const res = await request(app)
            .get('/api/clientes')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.some(c => c.id === clienteId)).toBe(true);
    });

    it('elimina (desactiva) el cliente de prueba', async () => {
        const res = await request(app)
            .delete(`/api/clientes/${clienteId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });
});
