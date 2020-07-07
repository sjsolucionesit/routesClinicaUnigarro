const express = require('express');
const routes = express.Router();
const { pool } = require('../config/db.config');
const { isLoggedIn } = require('../middlewares/index.middleware');

routes.get('/signals', isLoggedIn, async(request, response) => {
    if (request.user.rol == 'paciente') {
        const datosSignals = await pool.query(`SELECT * FROM doctores JOIN signals ON doctores.email = signals.doctor WHERE signals.paciente='${request.user.email}' AND signals.estado='aprobado'`);
        if (datosSignals.length > 0) {
            response.send(datosSignals);
        } else {
            response.send('{}');
        }
    } else {
        const datosSignals = await pool.query(`SELECT * FROM pacientes JOIN signals ON pacientes.email = signals.paciente WHERE signals.doctor='${request.user.email}' AND signals.estado='aprobado'`);
        if (datosSignals.length > 0) {
            response.send(datosSignals);
        } else {
            response.send('{}');
        }
    }
});

routes.get('/signals-pendientes', isLoggedIn, async(request, response) => {
    if (request.user.rol == 'paciente') {
        const datosSignals = await pool.query(`SELECT * FROM doctores JOIN signals ON doctores.email = signals.doctor WHERE signals.paciente='${request.user.email}' AND signals.estado='pendiente'`);
        if (datosSignals.length > 0) {
            response.send(datosSignals);
        } else {
            response.send('{}');
        }
    } else {
        const datosSignals = await pool.query(`SELECT * FROM pacientes JOIN signals ON pacientes.email = signals.paciente WHERE signals.doctor='${request.user.email}' AND signals.estado='pendiente'`);
        if (datosSignals.length > 0) {
            response.send(datosSignals);
        } else {
            response.send('{}');
        }
    }
});

routes.get('/signals-search/:cedula', isLoggedIn, async(request, response) => {
    if (request.user.rol == 'salud') {
        const datosSignals = await pool.query(`SELECT * FROM pacientes WHERE cedula='${request.params.cedula}'`);
        if (datosSignals.length > 0) {
            const verificarPaciente = await pool.query(`SELECT * FROM usuarios WHERE email='${datosSignals[0].email}' AND estado='1'`);
            if(verificarPaciente.length > 0){
                response.send(datosSignals);
            }else{
                response.send('{}');
            }
        } else {
            response.send('{}');
        }
    }
});

routes.post('/signals-add', isLoggedIn, async(request, response) => {
    if (request.user.rol == 'salud') {
        const doctor = request.user.email;
        const paciente = request.body.email;
        const signalSave = {
            doctor,
            paciente,
            estado: 'aprobado'
        }
        await pool.query('INSERT INTO signals SET ?', [signalSave]);

        const sendResponse = {
            estado: 'ok'
        }
        response.send(sendResponse);
    }
});

routes.post('/signals-accept', isLoggedIn, async(request, response) => {
    if (request.user.rol == 'paciente') {
        const correoDoctor = request.body.correo;
        await pool.query(`UPDATE signals SET estado='aprobado' WHERE doctor='${correoDoctor}' AND paciente='${request.user.email}'`);
        const success = {
            estado: 'ok'
        }
        response.send(success);
    }
});

routes.post('/signals-rechazar', isLoggedIn, async(request, response) => {
    if (request.user.rol == 'paciente') {
        const correoDoctor = request.body.correo;
        await pool.query(`UPDATE signals SET estado='aprobado' WHERE doctor='${correoDoctor}' AND paciente='${request.user.email}'`);
        const success = {
            estado: 'ok'
        }
        response.send(success);
    }
});

module.exports = routes;