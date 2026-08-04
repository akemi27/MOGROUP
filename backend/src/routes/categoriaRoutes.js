const express = require('express');
const router = express.Router();
const c = require("../controllers/categoriaController");

router.get('/', c.selectCategorias);
router.post('/', c.createCategoria);
router.put('/:id', c.updateCategoria);
router.delete('/:id', c.deleteCategoria);

module.exports = router;