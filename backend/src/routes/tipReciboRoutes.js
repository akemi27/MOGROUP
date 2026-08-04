const express = require('express');
const router = express.Router();
const c = require('../controllers/tipReciboController');

router.get('/', c.getTiposRecibo);
router.post('/', c.createTipoRecibo);
router.put('/:id', c.updateTipoRecibo);
router.delete('/:id', c.deleteTipoRecibo);

module.exports = router;
