const express = require('express');
const path = require('path');
const routes = express.Router();
const { pool } = require('../config/db.config');
const { isLoggedIn } = require('../middlewares/index.middleware');

routes.get('/inicio', (request, response) => {
    console.log('peticion de cliente /');
    response.render(path.join(__dirname, '../src/views/login.html'));
});

routes.get('/', isLoggedIn, async(request, response, next) => {
    const rol = request.user.rol;
    if (rol == 'paciente') {
        const dataUser = await pool.query(`SELECT nombre, apellido, email, rutaImg FROM pacientes WHERE email='${request.user.email}'`);
        const { nombre, apellido, email, rutaImg } = dataUser[0];
        const datosRender = {
            usuario: {
                nombre,
                apellido,
                email,
                rutaImg
            }
        }
        response.render(path.join(__dirname, '../src/views/index.paciente.html'), datosRender);
    }
    if (rol == 'salud') {
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
        response.render(path.join(__dirname, '../src/views/index.doctor.html'), datosRender);
    }
});

routes.get('/perfil', isLoggedIn, async(request, response, next) => {
    const rol = request.user.rol;
    if (rol == 'paciente') {
        const dataUser = await pool.query(`SELECT nombre, apellido, email, rutaImg, telefono, cedula, fechaNacimiento FROM pacientes WHERE email='${request.user.email}'`);
        const { nombre, apellido, email, rutaImg, telefono, cedula, fechaNacimiento } = dataUser[0];
        const datosRender = {
            usuario: {
                nombre,
                apellido,
                email,
                rutaImg,
                telefono,
                cedula,
                fechaNacimiento
            }
        }
        response.render(path.join(__dirname, '../src/views/perfil.paciente.html'), datosRender);
    }
    if (rol == 'salud') {
        const dataUser = await pool.query(`SELECT * FROM doctores WHERE email='${request.user.email}'`);
        const { nombre, apellido, email, rutaImg, telefono, cedula, fechaNacimiento, genero, direccion, pais, ciudad, numeroCarne, especialidad, profesion } = dataUser[0];
        const fechaN = fechaNacimiento.toLocaleString();
        const anioNacimiento = fechaN.split(' ')[0].split('-')[0];
        let mesNacimiento = '';
        let diaNacimiento = '';
        if(Number(fechaN.split(' ')[0].split('-')[1]) <= 9){
             mesNacimiento = '0' + fechaN.split(' ')[0].split('-')[1];
        } else {
             mesNacimiento = fechaN.split(' ')[0].split('-')[1];
        }
        if(Number(fechaN.split(' ')[0].split('-')[2]) <= 9){
             diaNacimiento = '0' + fechaN.split(' ')[0].split('-')[2];
        } else {
             diaNacimiento = fechaN.split(' ')[0].split('-')[2];
        }
        const fechaModified = anioNacimiento + '-' + mesNacimiento + '-' + diaNacimiento;
        const datosRender = {
            usuario: {
                nombre,//
                apellido,//
                email,//
                rutaImg,//
                telefono,//
                cedula,//
                fechaNacimiento: fechaModified,// 
                genero,
                direccion, 
                pais, 
                ciudad,
                numeroCarne,
                especialidad,
                profesion
            }
        }
        response.render(path.join(__dirname, '../src/views/perfil.doctor.html'), datosRender);
    }
});

routes.get('/historia', isLoggedIn, async(request, response, next) => {
    const rol = request.user.rol;
    if (rol == 'paciente') {
        const dataUser = await pool.query(`SELECT nombre, apellido, email, rutaImg FROM pacientes WHERE email='${request.user.email}'`);
        const { nombre, apellido, email, rutaImg, telefono, cedula, fechaNacimiento } = dataUser[0];
        const datosRender = {
            usuario: {
                nombre,
                apellido,
                email,
                rutaImg
            }
        }
        response.render(path.join(__dirname, '../src/views/historia.paciente.html'), datosRender);
    }
});

routes.get('/consulta', isLoggedIn, async(request, response, next) => {
    const rol = request.user.rol;
    if (rol == 'paciente') {
        const dataUser = await pool.query(`SELECT nombre, apellido, email, rutaImg, tipoDoc, cedula FROM pacientes WHERE email='${request.user.email}'`);
        const { nombre, apellido, email, rutaImg, telefono, cedula, fechaNacimiento, tipoDoc } = dataUser[0];
        const datosRender = {
            usuario: {
                nombre,
                apellido,
                email,
                rutaImg,
                cedula,
                tipoDoc
            }
        }
        response.render(path.join(__dirname, '../src/views/consulta.paciente.html'), datosRender);
    }
    if (rol == 'salud') {
        const dataUser = await pool.query(`SELECT * FROM doctores WHERE email='${request.user.email}'`);
        const { nombre, apellido, email, rutaImg, profesion, especialidad, numeroCarne } = dataUser[0];
        const datosRender = {
            usuario: {
                nombre,
                apellido,
                email,
                rutaImg,
                profesion,
                especialidad,
                numeroCarne
            }
        }
        response.render(path.join(__dirname, '../src/views/consulta.doctor.html'), datosRender);
    }
});

routes.get('/agenda', isLoggedIn, async(request, response, next) => {
    const rol = request.user.rol;
    if (rol == 'paciente') {
        const dataUser = await pool.query(`SELECT nombre, apellido, email, rutaImg FROM pacientes WHERE email='${request.user.email}'`);
        const { nombre, apellido, email, rutaImg, telefono, cedula, fechaNacimiento } = dataUser[0];
        const datosRender = {
            usuario: {
                nombre,
                apellido,
                email,
                rutaImg
            }
        }
        response.render(path.join(__dirname, '../src/views/agenda.paciente.html'), datosRender);
    }
    if (rol == 'salud') {
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
        response.render(path.join(__dirname, '../src/views/agenda.doctor.html'), datosRender);
    }
});

module.exports = routes;