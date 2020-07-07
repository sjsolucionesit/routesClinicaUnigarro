const express = require('express');
const routes = express.Router();
const { isLoggedIn } = require('../middlewares/index.middleware');
const { pool } = require('../config/db.config');

routes.post('/validar-cupon', isLoggedIn, async(request, response) => {
    const { email, cupon } = request.body;
    const peticion = await pool.query(`SELECT * FROM cupones WHERE codigo='${cupon}'`);
    if (peticion.length > 0) {
        if (peticion[0].estado == 'clean') {
            await pool.query(`UPDATE cupones SET estado='${email}' WHERE codigo='${cupon}'`);
            console.log('Cupon redimido por ' + request.user.email);
            const respuesta = {
                estado: 'valid'
            }
            response.send(respuesta);
        } else {
            const respuesta = {
                estado: 'used'
            }
            response.send(respuesta);
        }
    } else {
        const respuesta = {
            estado: 'noExist'
        }
        response.send(respuesta);
    }
});

routes.get('/verificar-cupon', isLoggedIn, async(request, response) => {
    const email = request.user.email;
    await pool.query(`UPDATE cupones SET estado='used' WHERE consultas='0'`);
    const pedir = await pool.query(`SELECT * FROM cupones WHERE estado = '${email}'`);
    if (pedir.length > 0) {
        response.send(pedir);
    } else {
        response.send('{}');
    }
});

module.exports = routes;