const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

afterAll(async () => {
    await db.end();
});

describe('CRUD /api/proveedores', () => {
    let token;
    let proveedorId;
    const ruc = `20${Date.now()}`.slice(-11);

    beforeAll(async () => {
        token = await loginAsAdmin();
    });

    afterAll(async () => {
        if (proveedorId) await db.query(`DELETE FROM proveedor WHERE id = $1`, [proveedorId]);
    });

    it('crea un proveedor nuevo', async () => {
        const res = await request(app)
            .post('/api/proveedores')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ruc,
                nombre: 'Proveedor de Prueba SAC',
                contacto: 'Juan Pérez',
                email: 'proveedor@test.com',
                telefono: '999999999',
                direccion: 'Av. Test 123',
            });
        expect(res.status).toBe(201);
        expect(res.body.ruc).toBe(ruc);
        proveedorId = res.body.id;
    });

    it('rechaza un proveedor con RUC duplicado', async () => {
        const res = await request(app)
            .post('/api/proveedores')
            .set('Authorization', `Bearer ${token}`)
            .send({ ruc, nombre: 'Otro nombre', contacto: '', email: '', telefono: '', direccion: '' });
        expect(res.status).toBe(400);
    });

    it('obtiene el proveedor por id', async () => {
        const res = await request(app)
            .get(`/api/proveedores/${proveedorId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.ruc).toBe(ruc);
    });

    it('actualiza el proveedor', async () => {
        const res = await request(app)
            .put(`/api/proveedores/${proveedorId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                ruc,
                nombre: 'Proveedor de Prueba SAC Editado',
                contacto: 'Juan Pérez',
                email: 'proveedor@test.com',
                telefono: '999999999',
                direccion: 'Av. Test 123',
            });
        expect(res.status).toBe(200);
        expect(res.body.nombre).toBe('Proveedor de Prueba SAC Editado');
    });

    it('elimina (desactiva) el proveedor de prueba', async () => {
        const res = await request(app)
            .delete(`/api/proveedores/${proveedorId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });
});
