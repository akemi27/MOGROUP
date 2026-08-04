const express = require('express');
const router = express.Router();
const { getDashboard, getMovimientos, getGraficos } = require('../controllers/dashboardController');

router.get('/', getDashboard);
router.get('/movimientos', getMovimientos);
router.get('/graficos', getGraficos);

module.exports = router;
