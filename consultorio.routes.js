const express = require('express');
const routes = express.Router();
const { pool } = require('../config/db.config');
const { isLoggedIn } = require('../middlewares/index.middleware');
const { sendEmailConsulta, sendEmailCancelConsulta } = require('../services/send.email');

routes.get('/consultorio', isLoggedIn, async(request, response) => {
    if (request.user.rol == 'salud') {
        const dataUser = await pool.query(`SELECT nombre, apellido, email, rutaImg FROM doctores WHERE email='${request.user.email}'`);
        const { nombre, apellido, email, rutaImg } = dataUser[0];
        const datosRender = {
            usuario: {
                nombre,
                apellido,
                email,
                rutaImg
            }
        }
        response.render('../src/views/consultorio.doctor.html', datosRender);
    } else {
        response.redirect('/inicio');
    }
});

routes.post('/agendar-consulta', isLoggedIn, async(request, response) => {
    const {
        motivo,
        fechaConsulta,
        horaConsulta,
        correoPaciente,
        afiliacion,
        tipoUser,
        autorizacion
    } = request.body

    const datosConsulta = {
        motivo,
        fechaConsulta,
        horaConsulta,
        correoPaciente,
        correoDoctor: request.user.email,
        estado: 'agendada',
        afiliacion,
        tipoUser,
        autorizacion
    };

    const verificarConsulta = await pool.query(`SELECT * FROM cupones WHERE estado='${request.user.email}'`);
    if (verificarConsulta.length > 0) {
        if (verificarConsulta[0].consultas > 0) {
            await pool.query(`INSERT INTO consultas SET ?`, [datosConsulta]);
            await pool.query(`UPDATE cupones SET consultas = consultas - 1 WHERE estado='${request.user.email}' AND consultas > 0`);
            console.log('consulta agendada por ' + request.user.email + ' para ' + datosConsulta.correoPaciente);
            const enviarRepuesta = {
                estado: 'agendada'
            }
            response.send(enviarRepuesta);
        } else {
            pool.query(`UPDATE cupones SET estado = 'used' WHERE estado='${request.user.email}'`);
            const enviarRepuesta = {
                estado: 'noCupons'
            }
            response.send(enviarRepuesta);
        }
    } else {
        const enviarRepuesta = {
            estado: 'noCupons'
        }
        response.send(enviarRepuesta);
    }
});

routes.post('/historial-hc', isLoggedIn, async(req, res) => {
    const { emailPaciente } = req.body;
    const datosHc = await pool.query(`SELECT * FROM hcFiles WHERE paciente='${emailPaciente}';`);
    const datosFormula = await pool.query(`SELECT * FROM formulaFiles WHERE paciente='${emailPaciente}';`);

    let infoAenviar = [];

    datosHc.forEach(info => {
        let infoFormula = 'notFound';

        const formula = datosFormula.forEach(informacion => {
            if (informacion.id_consulta == info.id_consulta) {
                infoFormula = informacion.file;
            }
        });

        const NewJson = {
            id_consulta: info.id_consulta,
            hc: info.file,
            formula: infoFormula,
            fecha: info.fecha
        }

        infoAenviar.push(NewJson);
    });

    res.send(infoAenviar);
});

routes.post('/enviar-correo-consulta', isLoggedIn, async(req, res) => {
    sendEmailConsulta(req.body);
    res.send('ok');
});

routes.get('/cancelar-cita/:id', isLoggedIn, async(req, res) => {
    const idCancel = req.params.id;
    const consultaCancel = await pool.query(`SELECT * FROM consultas WHERE id='${idCancel}'`);
    const { motivo, fechaConsulta, horaConsulta, correoPaciente } = consultaCancel[0];
    const infoEmail = {
        motivo,
        fechaConsulta,
        horaConsulta,
        correoPaciente
    };
    await pool.query(`UPDATE consultas SET estado='cancelada' WHERE id='${idCancel}' AND correoDoctor='${req.user.email}'`);
    await pool.query(`UPDATE cupones SET consultas = consultas + 1 WHERE estado='${req.user.email}'`);
    sendEmailCancelConsulta(infoEmail);
    res.send('ok');
})

module.exports = routes;