const express = require('express');
const routes = express.Router();
const { isLoggedIn } = require('../middlewares/index.middleware');
const { createHc, createFormula, createOrdenes } = require('../services/create.pdf');
const {pool} = require('../config/db.config');

routes.post('/generate-pdf-hc', isLoggedIn, async(request, response) => {
    const objDatos = request.body;
    await createHc(objDatos); 
    const respuesta = {
        ok: 'ok'
    }
    response.send(respuesta);
});

routes.post('/generate-pdf-formula', isLoggedIn, async(request, response) => {
    const objDatos = request.body;
    await createFormula(objDatos); 
    const respuesta = {
        ok: 'ok'
    }
    response.send(respuesta);
});

routes.post('/generate-pdf-ordenes', isLoggedIn, async(request, response) => {
    const objDatos = request.body;
    await createOrdenes(objDatos); 
    const respuesta = {
        ok: 'ok'
    }
    response.send(respuesta);
});


routes.get('/descargar/hc/:id', isLoggedIn, async function(request, response) {
    const id_consulta = request.params.id;
    const dataFile = await pool.query(`SELECT * FROM hcFiles WHERE id_consulta='${id_consulta}'`);
    const route = dataFile[0].file;
    response.download(route);
});

routes.get('/descargar/formula/:id', isLoggedIn, async function(request, response) {
    const id_consulta = request.params.id;
    const dataFile = await pool.query(`SELECT * FROM formulaFiles WHERE id_consulta='${id_consulta}'`);
    const route = dataFile[0].file;
    response.download(route);
});

routes.get('/descargar/ordenes/:id', isLoggedIn, async function(request, response) {
    const id_consulta = request.params.id;
    const dataFile = await pool.query(`SELECT * FROM ordenesFiles WHERE id_consulta='${id_consulta}'`);
    const route = dataFile[0].file;
    response.download(route);
});

routes.get('/descargar/consentimiento/:id', isLoggedIn, async function(request, response) {
    const id_consulta = request.params.id;
    const dataFile = await pool.query(`SELECT * FROM consentimiento WHERE id_consulta='${id_consulta}'`);
    const route = dataFile[0].rutaArchivo;
    response.download(route);
});

module.exports = routes;