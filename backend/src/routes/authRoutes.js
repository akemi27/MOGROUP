const express = require('express');
const router = express.Router();
const { login, getMe, updateMe } = require('../controllers/usuarioController');
const auth = require('../middlewares/authMiddleware');

router.post('/login', login);
router.get('/me',  auth, getMe);
router.put('/me',  auth, updateMe);

module.exports = router;
