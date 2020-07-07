const express = require('express');
const routes = express.Router();
const { pool } = require('../config/db.config');
const { isLoggedIn } = require('../middlewares/index.middleware');


routes.post('/opinar', isLoggedIn, async (req, res) => {
    const usuario = req.user.email;
    const {
        opinion
    } = req.body;

    const datosOpinion = {
        usuario,
        opinion
    }
    
    await pool.query(`INSERT INTO opiniones SET ?`, [datosOpinion]);

    const respuesta = {
        estado: 'ok'
    }

    res.send(respuesta);
});

module.exports = routes