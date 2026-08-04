const express = require('express');
const router = express.Router();
const c = require('../controllers/compraController');

router.get('/', c.getCompras);
router.get('/:id', c.getCompraById);
router.post('/', c.createCompra);
router.patch('/:id/recibir', c.recibirCompra);

module.exports = router;
