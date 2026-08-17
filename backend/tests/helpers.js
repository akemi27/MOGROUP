const request = require('supertest');
const app = require('../index');

async function loginAsAdmin() {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });
    return res.body.token;
}

module.exports = { loginAsAdmin };
