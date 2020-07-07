const express = require('express');
const path = require('path');
const routes = express.Router();
const { crearPac } = require('../database/crear.paciente');
const { crearDoc } = require('../database/crear.doctor');
const { sendEmailVerify } = require('../services/send.email');
const { isLoggedIn } = require('../middlewares/index.middleware');
const { pool } = require('../config/db.config');

routes.post('/crear-paciente', async(request, response) => {
    const { email, pass } = request.body; // recibir correo y pass verificados
    const datosUser = {
        user: {
            email,
            pass
        }
    }; // destructurar post
    console.log('peticion de cliente /crear/paciente');
    response.render(path.join(__dirname, '../src/views/crear-paciente.html'), datosUser); // render e incluir pass y correo
});

routes.post('/save-paciente', async(request, response) => {
    const {
        email,
        pass,
        nombre,
        apellido,
        tipoDoc,
        cedula,
        fechaNacimiento,
        lugarNacimiento,
        genero,
        rh,
        telefono,
        direccion,
        pais,
        ciudad,
        nombreTutor,
        parentesco,
        cedulaTutor,
        estadoCivil
    } = request.body; // recibir correo y pass verificados

    const datosUser = {
        email,
        pass,
        rutaImg: './img/avatar.jpg',
        nombre,
        apellido,
        estadoCivil,
        tipoDoc,
        cedula,
        fechaNacimiento,
        lugarNacimiento,
        genero,
        rh,
        telefono,
        direccion,
        pais,
        ciudad,
        nombreTutor,
        parentesco,
        cedulaTutor
    }; // destructurar post

    await crearPac(datosUser, request.files);
    await sendEmailVerify(email, nombre, apellido, cedula); // enviar email de verificacion
    request.flash('CreatePacient', 'Creaste tu cuenta con éxito, ve a tu email y verifica tu cuenta!');
    response.redirect('/inicio');
});

routes.post('/crear-doctor', (request, response) => {
    const { email, pass } = request.body; // recibir correo y pass verificados
    const datosUser = {
        user: {
            email,
            pass
        }
    }; // destructurar post
    console.log('peticion de cliente /crear/doctor');
    response.render(path.join(__dirname, '../src/views/crear-doctor.html'), datosUser); // render e incluir pass y correo
});

routes.post('/save-doctor', async(request, response) => {
    const { email, pass, nombre, apellido, profesion, especialidad, tipoDoc, cedula, fechaNacimiento, genero, telefono, direccion, pais, ciudad, numeroCarne } = request.body;
    const datosSave = {
        email,
        pass,
        rutaImg: './img/doctor.png',
        nombre,
        apellido,
        profesion,
        especialidad,
        tipoDoc,
        cedula,
        fechaNacimiento,
        genero,
        telefono,
        direccion,
        pais,
        ciudad,
        rutaCarne: '',
        numeroCarne
    }
    console.table(datosSave);
    await crearDoc(datosSave, request.files);
    await sendEmailVerify(email, nombre, apellido, cedula); // enviar email de verificacion
    request.flash('CreatePacient', 'Creaste tu cuenta con éxito, ve a tu email y verifica la cuenta!');
    response.redirect('/inicio');
});

routes.post('/actualizar-perfil-doctor', isLoggedIn, async(req, res) => {
    const {
        profesion,
        especialidad,
        cedula,
        fechaNacimiento,
        genero,
        telefono,
        direccion,
        pais,
        ciudad,
        numeroCarne
    } = req.body;

    await pool.query(`UPDATE doctores SET profesion = '${profesion}',
                            especialidad = '${especialidad}', cedula = '${cedula}', 
                            fechaNacimiento = '${fechaNacimiento}', genero = '${genero}', 
                            telefono = '${telefono}', direccion = '${direccion}', 
                            pais = '${pais}', ciudad = '${ciudad}', 
                            numeroCarne = '${numeroCarne}' WHERE email='${req.user.email}'`);

    const respuesta = {
        estado: 'ok'
    };

    console.log('datos doctor actualizados ' + req.user.email);
    res.send(respuesta);
});

routes.post('/actualizar-perfil-paciente', isLoggedIn, async (req, res) => {
    const {
        nombre,
        apellido,
        tipoDoc,
        cedula,
        fechaNacimiento,
        lugarNacimiento,
        estadoCivil,
        genero,
        rh,
        telefono,
        direccion,
        pais,
        ciudad
    } = req.body;

    const datosPerfil = {
        nombre,
        apellido,
        tipoDoc,
        cedula,
        fechaNacimiento,
        lugarNacimiento,
        estadoCivil,
        genero,
        rh,
        telefono,
        direccion,
        pais,
        ciudad
    }

    await pool.query(`UPDATE pacientes SET ? WHERE email="${req.user.email}"`, [datosPerfil], (err, result) =>{
        if(err){res.send(err)}
        if(result){
            res.redirect('/perfil');
        }
    })
});

routes.get('/getInfoPatient', isLoggedIn, async (req, res) => {
    const infoPatient = await pool.query(`SELECT * FROM pacientes WHERE email='${req.user.email}'`);
    res.send(infoPatient[0]);
})

module.exports = routes;