const express = require('express');
const routes = express.Router();
const { isLoggedIn } = require('../middlewares/index.middleware');
const { pool } = require('../config/db.config');

routes.get('/buscar/:filtro/:termino', isLoggedIn, async(request, response) => {
    const termino = request.params.termino;
    const filtro = request.params.filtro;
    let data = '';
    switch (filtro) {
        case 'nombre':
            data = await pool.query(`SELECT * FROM doctores JOIN usuarios ON doctores.email = usuarios.email WHERE usuarios.estado='1' AND (doctores.nombre LIKE '%${termino}%' OR doctores.apellido LIKE '%${termino}%') LIMIT 6`);
            if (data.length > 0) {
                response.send(data);
            } else {
                response.send('{}');
            }
            break;
        case 'profesion':
            data = await pool.query(`SELECT * FROM doctores JOIN usuarios ON doctores.email = usuarios.email WHERE usuarios.estado='1' AND doctores.profesion LIKE '%${termino}%' LIMIT 6`);
            if (data.length > 0) {
                response.send(data);
            } else {
                response.send('{}');
            }
            break;
        case 'especialidad':
            data = await pool.query(`SELECT * FROM doctores JOIN usuarios ON doctores.email = usuarios.email WHERE usuarios.estado='1' AND doctores.especialidad LIKE '%${termino}%' LIMIT 6`);
            if (data.length > 0) {
                response.send(data);
            } else {
                response.send('{}');
            }
            break;
        default:
            response.send('{}');
            break;
    }
});

routes.get('/buscar-limit', isLoggedIn, async(request, response) => {
    const doctores = await pool.query('SELECT rutaImg, nombre, apellido, especialidad, profesion, fechaNacimiento FROM doctores LIMIT 6');
    response.send(doctores);
});

module.exports = routes;


/*
SELECT * FROM doctores JOIN users ON doctores.email = users.email WHERE users.estado='1' AND doctores.nombre LIKE '%${termino}%'
SELECT * FROM doctores JOIN users ON doctores.email = users.email WHERE users.estado='1' AND doctores.apellidos LIKE '%${termino}%'
SELECT * FROM doctores JOIN users ON doctores.email = users.email WHERE users.estado='1' AND doctores.especialidad LIKE '%${termino}%'
*/