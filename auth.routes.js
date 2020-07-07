const express = require('express');
const routes = express.Router();
const passport = require('passport');
const { isLoggedIn } = require('../middlewares/index.middleware');
const { pool } = require('../config/db.config');
const { sendEmailPin } = require('../services/send.email');
const { encriptar  } = require('../services/encrypt.pass');

routes.post('/auth', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/inicio',
    failureFlash: true
}));

routes.get('/logout', isLoggedIn, (request, response) => {
    request.logOut();
    response.redirect('/inicio');
});

routes.get('/verificar-cuenta/:cedula', async(request, response) => {
    const cedula = request.params.cedula;
    let datosUsuario = await pool.query(`SELECT email FROM pacientes WHERE cedula="${cedula}"`);
    if (datosUsuario.length == 0) {
        datosUsuario = await pool.query(`SELECT email FROM doctores WHERE cedula="${cedula}"`);
    }
    const data = datosUsuario[0];
    await pool.query(`UPDATE usuarios SET estado="1" WHERE email="${data.email}"`);
    console.log('cuenta verificada, numero de identificación:' + cedula);
    request.flash('verify', 'Cuenta verificada con éxito!');
    response.redirect('/inicio');
});

routes.post('/recuperar-correo', async(request, response) => {
    const email = request.body.email;
    const datosEmail = await pool.query(`SELECT email FROM usuarios WHERE email='${email}'`);
    if (datosEmail.length > 0) {
        const pin = Math.round(Math.random() * 999999);
        await sendEmailPin(email, pin);
        const datosRecuperar = {
            pin,
            email,
            estado: 'generado'
        }
        await pool.query('INSERT INTO recuperar_pass SET ?', [datosRecuperar]);
        response.send(datosEmail);
    } else {
        response.send('{}');
    }
});

routes.post('/verificar-pin', async(request, response) => {
    const { pin, email } = request.body;
    const resultadoPin = await pool.query(`SELECT * FROM recuperar_pass WHERE pin='${pin}' AND email='${email}'`);
    if (resultadoPin.length > 0) {
        response.send(resultadoPin[0]);
    } else {
        response.send('{}');
    }
});

routes.post('/change-pass', async(request, response) => {
    const { email, password1 } = request.body;
    const passwordNew = await encriptar(password1);
    await pool.query(`UPDATE usuarios SET pass='${passwordNew}' WHERE email='${email}'`);
    const res = {
        status: 'ok'
    }
    console.log('Contraseña Actualizada de ' + email);
    response.send(res);
});

module.exports = routes;