const express = require('express');
const path = require('path');
const routes = express.Router();
const uniq = require('uniqid');
const { pool } = require('../config/db.config');
const { isLoggedIn } = require('../middlewares/index.middleware');

routes.post('/uploads-support', isLoggedIn, async(request, response) => {
    const archivos = request.files;
    console.log(request.body);
    archivos.file.forEach( async(archivo) => {
        const fileName = uniq() + '-' + archivo.name;

        await archivo.mv(path.join(__dirname, `../src/uploads/support/${fileName}`), async(err) => {
            if (err) {
                console.log(err);
                return response.send(`{estado: 'error'}`);
            }
            console.log('archivo cargado: ' + archivo.name);
        });

        const datosDoc = {
            id_consulta: Number(request.body.idConsulta),
            fileName: fileName,
            email: request.user.email
        };

        await pool.query('INSERT INTO `uploads-support` SET ?', [datosDoc]);
    });
    
    const resultado = {
        estado: 'ok'
    }

    response.send(resultado);
});

module.exports = routes;