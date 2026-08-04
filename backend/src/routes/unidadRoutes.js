const express = require('express');
const router = express.Router();
const c = require('../controllers/unidadController');

router.get('/', c.getUnidades);
router.post('/', c.createUnidad);
router.put('/:id', c.updateUnidad);
router.delete('/:id', c.deleteUnidad);

module.exports = router;
