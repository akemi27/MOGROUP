require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

const auth     = require('./src/middlewares/authMiddleware');
const adminOnly = require('./src/middlewares/adminMiddleware');

// Rutas
const authRoutes      = require('./src/routes/authRoutes');
const usuarioRoutes   = require('./src/routes/usuarioRoutes');
const categoriaRoutes = require('./src/routes/categoriaRoutes');
const productoRoutes  = require('./src/routes/productoRoutes');
const almacenRoutes   = require('./src/routes/almacenRoutes');
const unidadRoutes    = require('./src/routes/unidadRoutes');
const proveedorRoutes = require('./src/routes/proveedorRoutes');
const clienteRoutes   = require('./src/routes/clienteRoutes');
const compraRoutes    = require('./src/routes/compraRoutes');
const ventaRoutes     = require('./src/routes/ventaRoutes');
const tipReciboRoutes    = require('./src/routes/tipReciboRoutes');
const dashboardRoutes    = require('./src/routes/dashboardRoutes');
const publicRoutes       = require('./src/routes/publicRoutes');

app.use(cors());
app.use(express.json());

// Públicas (sin auth)
app.use('/api/auth', authRoutes);
app.use('/api/publico', publicRoutes);

// Protegidas (todos los usuarios autenticados)
app.use('/api/categorias',  auth, categoriaRoutes);
app.use('/api/productos',   auth, productoRoutes);
app.use('/api/almacenes',   auth, almacenRoutes);
app.use('/api/unidades',    auth, unidadRoutes);
app.use('/api/proveedores', auth, proveedorRoutes);
app.use('/api/clientes',    auth, clienteRoutes);
app.use('/api/compras',     auth, compraRoutes);
app.use('/api/ventas',      auth, ventaRoutes);

// Dashboard y movimientos
app.use('/api/dashboard',   auth, dashboardRoutes);

// Solo administradores
app.use('/api/usuarios',    auth, adminOnly, usuarioRoutes);
app.use('/api/tip-recibos', auth, adminOnly, tipReciboRoutes);

app.get('/', (req, res) => res.send('MO GROUP API - Servidor en línea'));

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
}

module.exports = app;
