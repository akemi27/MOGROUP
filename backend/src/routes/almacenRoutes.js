const express = require('express');
const router = express.Router();
const c = require('../controllers/almacenController');

router.get('/', c.getAlmacenes);
router.post('/', c.createAlmacen);
router.put('/:id', c.updateAlmacen);
router.delete('/:id', c.deleteAlmacen);

module.exports = router;
