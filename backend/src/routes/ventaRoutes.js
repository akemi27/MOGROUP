const express = require('express');
const router = express.Router();
const c = require('../controllers/ventaController');

router.get('/', c.getVentas);
router.get('/:id', c.getVentaById);
router.post('/', c.createVenta);

module.exports = router;
