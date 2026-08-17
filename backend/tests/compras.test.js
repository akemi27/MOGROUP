const request = require('supertest');
const app = require('../index');
const db = require('../src/config/db');
const { loginAsAdmin } = require('./helpers');

describe('Flujo de compras: registro y recepción al inventario', () => {
    let token;
    let categoriaId, proveedorId, tipReciboId, almacenId;
    let productoId;
    let ordCompraId;
    let detCompraId;
    const sufijo = Date.now();

    beforeAll(async () => {
        token = await loginAsAdmin();
        const [categorias, proveedores, tiposRecibo, almacenes] = await Promise.all([
            request(app).get('/api/categorias').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/proveedores').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/tip-recibos').set('Authorization', `Bearer ${token}`),
            request(app).get('/api/almacenes').set('Authorization', `Bearer ${token}`),
        ]);
        categoriaId = categorias.body[0].id;
        proveedorId = proveedores.body[0].id;
        tipReciboId = tiposRecibo.body[0].id;
        almacenId = almacenes.body[0].id;

        const productoRes = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: `Producto Compra Test ${sufijo}`, cat_producto_id: categoriaId, precio_ref: 500, garantia_std: 12 });
        productoId = productoRes.body.id;
    });

    afterAll(async () => {
        // Limpieza directa por SQL: no existen endpoints DELETE para órdenes de compra
        // (regla de negocio correcta: una orden de compra no debe poder borrarse).
        await db.query(`DELETE FROM movimiento_kardex WHERE unidad_id IN (SELECT id FROM unidad WHERE producto_id = $1)`, [productoId]);
        await db.query(`DELETE FROM unidad WHERE producto_id = $1`, [productoId]);
        if (ordCompraId) {
            await db.query(`DELETE FROM det_compra WHERE ord_compra_id = $1`, [ordCompraId]);
            await db.query(`DELETE FROM rec_compra WHERE ord_compra_id = $1`, [ordCompraId]);
            await db.query(`DELETE FROM ord_compra WHERE id = $1`, [ordCompraId]);
        }
        await db.query(`DELETE FROM producto WHERE id = $1`, [productoId]);
        await db.end();
    }, 20000);

    it('rechaza una compra sin items', async () => {
        const res = await request(app)
            .post('/api/compras')
            .set('Authorization', `Bearer ${token}`)
            .send({ proveedor_id: proveedorId, items: [], tip_recibo_id: tipReciboId, numero_recibo: 'X' });
        expect(res.status).toBe(400);
    });

    it('regresión: el rechazo por "sin items" no deja una transacción abierta que afecte otras escrituras', async () => {
        // El cliente pg de la validación fallida vuelve al pool; si no se hace ROLLBACK antes
        // de liberarlo, esta escritura podría ejecutarse dentro de esa transacción huérfana y
        // nunca confirmarse (COMMIT), aunque la API responda éxito.
        const nombre = `Producto Regresion Kardex ${sufijo}`;
        const res = await request(app)
            .post('/api/productos')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre, cat_producto_id: categoriaId, precio_ref: 10, garantia_std: 12 });
        expect(res.status).toBe(201);

        const verificacion = await db.query(`SELECT id FROM producto WHERE nombre = $1`, [nombre]);
        expect(verificacion.rows).toHaveLength(1);
        await db.query(`DELETE FROM producto WHERE id = $1`, [res.body.id]);
    });

    it('registra una orden de compra en estado pendiente', async () => {
        const res = await request(app)
            .post('/api/compras')
            .set('Authorization', `Bearer ${token}`)
            .send({
                proveedor_id: proveedorId,
                tip_recibo_id: tipReciboId,
                numero_recibo: `F-TEST-${sufijo}`,
                items: [{ producto_id: productoId, cantidad: 2, costo_unit: 100 }],
            });
        expect(res.status).toBe(201);
        expect(res.body.estado).toBe('pendiente');
        expect(parseFloat(res.body.total)).toBe(200);
        ordCompraId = res.body.id;
    });

    it('la orden creada incluye el detalle del producto', async () => {
        const res = await request(app)
            .get(`/api/compras/${ordCompraId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].cantidad).toBe(2);
        detCompraId = res.body.items[0].id;
    });

    it('recibe la compra y da de alta la unidad física con su serie', async () => {
        const serie = `TEST-COMPRA-${sufijo}`;
        const res = await request(app)
            .patch(`/api/compras/${ordCompraId}/recibir`)
            .set('Authorization', `Bearer ${token}`)
            .send({ almacen_id: almacenId, unidades: [{ det_compra_id: detCompraId, serie, color: 'Rojo', precio_venta: 150 }] });
        expect(res.status).toBe(200);

        const unidades = await request(app)
            .get(`/api/unidades?producto_id=${productoId}&estado=disponible`)
            .set('Authorization', `Bearer ${token}`);
        expect(unidades.body.some(u => u.serie === serie)).toBe(true);
    });

    it('no permite recibir dos veces la misma orden', async () => {
        const res = await request(app)
            .patch(`/api/compras/${ordCompraId}/recibir`)
            .set('Authorization', `Bearer ${token}`)
            .send({ almacen_id: almacenId, unidades: [] });
        expect(res.status).toBe(400);
    });
});
