const express = require('express');
const router = express.Router();
const c = require('../controllers/clienteController');

router.get('/', c.getClientes);
router.post('/', c.createCliente);
router.put('/:id', c.updateCliente);
router.delete('/:id', c.deleteCliente);

module.exports = router;
