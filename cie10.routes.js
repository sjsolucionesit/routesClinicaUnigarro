const express = require('express');
const routes = express.Router();
const { isLoggedIn } = require('../middlewares/index.middleware');
const { pool } = require('../config/db.config');


routes.get('/cie10/:termino', isLoggedIn, async(request, response) => {
    const termino = request.params.termino;
    const cie = await pool.query(`SELECT descripcion FROM cie10 WHERE codigo LIKE '%${termino}%'`);
    if (cie.length > 0) {
        response.send(cie);
    } else {
        response.send('{}');
    }
});

routes.get('/cie10', isLoggedIn, async(request, response) => {
    const cie = await pool.query(`SELECT codigo, descripcion FROM cie10`);
    if (cie.length > 0) {
        response.send(cie);
    } else {
        response.send('{}');
    }
});


routes.get('/medicamentosList', isLoggedIn, async(request, response) => {
    const medicamentos = await pool.query(`SELECT * FROM medicamentos`);
    if(medicamentos.length){
        response.send(medicamentos);
    }else{
        response.send('{}');
    }
});

routes.get('/farmacos', isLoggedIn, async(request, response) => {
    const farmacos = await pool.query(`SELECT * FROM presentMedicamento`);
    if(farmacos.length){
        response.send(farmacos);
    }else{
        response.send('{}');
    }
});

routes.get('/cups', isLoggedIn, async(request, response) => {
    const cups = await pool.query(`SELECT * FROM cups`);
    if(cups.length){
        response.send(cups);
    }else{
        response.send('{}');
    }
});

module.exports = routes;