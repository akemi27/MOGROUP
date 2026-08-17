const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

describe('Flujo de ventas: registro y salida de inventario', () => {
    let token;
    let categoriaId, clienteId, tipReciboId, almacenId;
    let productoId, unidadId;
    let ordVentaId;
    const sufijo = Date.now();

    beforeAll(async () => {
        token = await loginAsAdmin();
        const [categorias, clientes, tiposRecibo, almacenes] = await Promise.all([
            request(app).get('/api/categorias').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/clientes').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/tip-recibos').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/almacenes').set('Authorization', `Bearer ${token}`),
        ]);
        categoriaId = categorias.body[0].id;
        clienteId = clientes.body[0].id;
        tipReciboId = tiposRecibo.body[0].id;
        almacenId = almacenes.body[0].id;

        const productoRes = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: `Producto Venta Test ${sufijo}`, cat_producto_id: categoriaId, precio_ref: 1000, garantia_std: 12 });
        productoId = productoRes.body.id;

        const unidadRes = await request(app)
            .post('/api/unidades')
            .set('Authorization', `Bearer ${token}`)
            .send({ producto_id: productoId, almacen_id: almacenId, serie: `TEST-VENTA-${sufijo}`, color: 'Azul', precio_venta: 1200 });
        unidadId = unidadRes.body.id;
    });

    afterAll(async () => {
        // Limpieza directa por SQL: no existe endpoint DELETE para órdenes de venta
        // (regla de negocio correcta: una venta confirmada no debe poder borrarse).
        await db.query(`DELETE FROM movimiento_kardex WHERE unidad_id = $1`, [unidadId]);
        if (ordVentaId) {
            await db.query(`DELETE FROM det_venta WHERE ord_venta_id = $1`, [ordVentaId]);
            await db.query(`DELETE FROM rec_venta WHERE ord_venta_id = $1`, [ordVentaId]);
            await db.query(`DELETE FROM ord_venta WHERE id = $1`, [ordVentaId]);
        }
        await db.query(`DELETE FROM unidad WHERE id = $1`, [unidadId]);
        await db.query(`DELETE FROM producto WHERE id = $1`, [productoId]);
        await db.end();
    }, 20000);

    it('rechaza una venta sin unidades', async () => {
        const res = await request(app)
            .post('/api/ventas')
            .set('Authorization', `Bearer ${token}`)
            .send({ cliente_id: clienteId, unidades: [], tip_recibo_id: tipReciboId, numero_recibo: 'X' });
        expect(res.status).toBe(400);
    });

    it('registra la venta y marca la unidad como vendida', async () => {
        const res = await request(app)
            .post('/api/ventas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                cliente_id: clienteId,
                destino: 'Chiclayo',
                tip_recibo_id: tipReciboId,
                numero_recibo: `B-TEST-${sufijo}`,
                unidades: [{ unidad_id: unidadId, precio: 1200 }],
            });
        expect(res.status).toBe(201);
        expect(parseFloat(res.body.total)).toBe(1200);
        ordVentaId = res.body.id;

        const unidad = await request(app)
            .get(`/api/unidades?producto_id=${productoId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(unidad.body[0].estado).toBe('vendido');
    });

    it('no permite vender la misma unidad dos veces', async () => {
        const res = await request(app)
            .post('/api/ventas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                cliente_id: clienteId,
                tip_recibo_id: tipReciboId,
                numero_recibo: `B-TEST-2-${sufijo}`,
                unidades: [{ unidad_id: unidadId, precio: 1200 }],
            });
        expect(res.status).toBe(400);
    });

    it('la venta creada incluye el detalle de la unidad vendida', async () => {
        const res = await request(app)
            .get(`/api/ventas/${ordVentaId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].unidad_id).toBe(unidadId);
    });
});
