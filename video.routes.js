const express = require('express');
const routes = express.Router();
const { isLoggedIn } = require('../middlewares/index.middleware');
const { opentok, API_PUBLIC_TOK } = require('../services/video.call');
const { pool } = require('../config/db.config');

routes.post('/llamar', isLoggedIn, async(request, response) => {
    const rol = request.user.rol;
    if (rol == 'salud') {
        await pool.query(`UPDATE llamadas SET estado='cancelada' WHERE paciente='${request.body.paciente}'`);
        let call = {};
        let infoCallSend = {};
        const hora = new Date().getTime();
        const horaExpiracion = hora + 1500000;
        opentok.createSession({ mediaMode: 'routed', archiveMode: 'always' }, async function(err, session) {
            if (err) return console.log(err);
            call.sesion = session.sessionId;
            call.profesional = request.user.email;
            call.paciente = request.body.paciente;
            call.archivo = '';
            call.estado = 'calling';
            const guardarDatosCall = await pool.query('INSERT INTO llamadas SET ?', [call]);
            infoCallSend.id = guardarDatosCall.insertId;
            infoCallSend.token = session.generateToken({
                role: 'moderator',
                expireTime: horaExpiracion, // 25 minutos
            });

            infoCallSend.sesion_id = session.sessionId;
            infoCallSend.api = API_PUBLIC_TOK;
            infoCallSend.profesional = request.user.email;
            infoCallSend.paciente = request.body.paciente;

            response.send(infoCallSend);
        });
    } else {
        response.send('no tengo permisos');
    }
});

routes.post('/llamar/contestar', isLoggedIn, async(request, response) => {
    const rol = request.user.rol;
    if (rol == 'paciente') {
        let infCallSend = {}
        const hora = new Date().getTime();
        const horaExpiracion = hora + 1500000;
        const infoLlamada = await pool.query(`SELECT * FROM llamadas WHERE paciente='${request.user.email}' AND estado='calling'`);
        const datos = infoLlamada[0];
        if (JSON.stringify(datos) != '{}') {
            await pool.query(`UPDATE llamadas SET estado='progress' WHERE id='${datos.id}'`);
            infCallSend.id = datos.id;
            infCallSend.token = opentok.generateToken(datos.sesion, {
                role: 'publisher',
                expireTime: horaExpiracion, // 25 minutos
            });
            infCallSend.sesion_id = datos.sesion;
            infCallSend.api = API_PUBLIC_TOK;
            infCallSend.profesional = datos.profesional;
            infCallSend.paciente = datos.paciente;
            response.send(infCallSend);
        } else {
            response.send('{}');
        }
    } else {
        response.send('{}');
    }
});

routes.get('/AquienLlamo', isLoggedIn, async(request, response) => {
    if (request.user.rol == 'salud') {
        const aquienllamar = await pool.query(`SELECT * FROM pacientes JOIN consultas ON pacientes.email = consultas.correoPaciente WHERE consultas.correoDoctor='${request.user.email}' AND consultas.estado='agendada' ORDER BY consultas.fechaConsulta, consultas.horaConsulta`);
        if (aquienllamar.length > 0) {
            const servicioSalud = await pool.query(`SELECT * FROM servicio_salud WHERE id_servicio='${aquienllamar[0].email}' ORDER BY fecha DESC`);
            const servicioOcupacion = await pool.query(`SELECT * FROM servicio_ocupacion WHERE id_servicio='${aquienllamar[0].email}' ORDER BY fecha DESC`);
            const alergias = await pool.query(`SELECT * FROM alergias_pacientes WHERE id_alergia='${aquienllamar[0].email}' AND valida='1'`);
            const datosDoc = await pool.query(`SELECT * FROM doctores WHERE email='${request.user.email}'`);
            const datosAntecedentes = await pool.query(`SELECT * FROM antecedentes WHERE paciente='${aquienllamar[0].email}'`);
            let listAlergia = '';
            let antecedentePaciente = '';
            if (datosAntecedentes.length > 0) {
                datosAntecedentes.forEach(item => {
                    antecedentePaciente += item.antecedentes + ', ';
                })
            } else {
                antecedentePaciente = '';
            }
            if (alergias.length > 0) {
                alergias.forEach(ale => {
                    listAlergia += ' ' + ale.descripcion + ',';
                });
                aquienllamar[0].alergias = listAlergia;
            } else {
                aquienllamar[0].alergias = 'No registra';
            }

            if (servicioSalud.length > 0) {
                aquienllamar[0].saludData = servicioSalud[0];
            }
            if (servicioOcupacion.length > 0) {
                aquienllamar[0].ocupacionData = servicioOcupacion[0];
            }
            aquienllamar[0].doc = datosDoc[0];
            aquienllamar[0].antecede = antecedentePaciente;
            response.send(aquienllamar[0]);
        } else {
            response.send('{}')
        }
    } else {
        const aquienllamar = await pool.query(`SELECT * FROM doctores JOIN consultas ON doctores.email = consultas.correoDoctor WHERE consultas.correoPaciente='${request.user.email}' AND consultas.estado='agendada' ORDER BY consultas.fechaConsulta, consultas.horaConsulta`);
        if (aquienllamar.length > 0) {
            response.send(aquienllamar[0]);
        } else {
            response.send('{}')
        }
    }
});

routes.get('/consultaNoValida/:id', isLoggedIn, async(request, response) => {
    const id = request.params.id;
    await pool.query(`UPDATE consultas SET estado='no realizada' WHERE id='${id}'`);
    response.send(`{estatus:'ok'}`);
});


routes.get('/verificarLlamadaEntrante', isLoggedIn, async(request, response) => {
    if (request.user.rol == 'paciente') {
        const verificar = await pool.query(`SELECT * FROM llamadas WHERE paciente='${request.user.email}' AND estado='calling'`);
        if (verificar.length > 0) {
            response.send(verificar[0]);
        } else {
            response.send('{}');
        }
    }
});

routes.post('/finalizar-llamada', isLoggedIn, async(request, response) => {
    const idFinalizar = request.body.id_consulta;
    await pool.query(`UPDATE consultas SET estado='finalizada' WHERE id='${idFinalizar}'`);
    response.send(`{estado:'ok'}`);
});

module.exports = routes;