const express = require('express');
const routes = express.Router();
const { pool } = require('../config/db.config');
const { isLoggedIn } = require('../middlewares/index.middleware');

routes.get('/consultar-eps', isLoggedIn, async(request, response) => {
    const consultarDatosEps = await pool.query('SELECT eps FROM listEps ORDER BY eps');
    if (consultarDatosEps.length > 0) {
        response.send(consultarDatosEps);
    } else {
        const ok = {
            busqueda: {
                status: 'notFound'
            }
        }
        response.send(ok);
    }
});

routes.get('/consultar-salud', isLoggedIn, async(request, response) => {
    const resultado = await pool.query(`SELECT * FROM servicio_salud WHERE id_servicio='${request.user.email}' ORDER BY fecha DESC`);
    if (resultado.length > 0) {
        const sendData = resultado[0];
        response.send(sendData);
    } else {
        response.send('{}');
    }
});


routes.post('/services-salud', isLoggedIn, async(request, response) => {
    const tipoSalud = request.body.tipoSalud;
    const servicio = request.body.servicio;

    const datos = {
        id_servicio: request.user.email,
        tipoSalud,
        servicio
    };

    await pool.query('INSERT INTO servicio_salud SET ?', [datos]);

    const respuesta = {
        status: 'ok'
    }
    response.send(respuesta);
    console.log('el usuario: ' + request.user.email + ' actualizo su servicio de salud');
});

routes.post('/services-ocupacion', isLoggedIn, async(request, response) => {
    const ocupacion = request.body.ocupacion;
    const descripcion = request.body.descripcion;

    const datos = {
        id_servicio: request.user.email,
        ocupacion,
        descripcion
    };

    await pool.query('INSERT INTO servicio_ocupacion SET ?', [datos]);

    const respuesta = {
        status: 'ok'
    }
    response.send(respuesta);
    console.log('el usuario: ' + request.user.email + ' actualizo su servicio de ocupacion');
});

routes.get('/consultar-ocupacion', isLoggedIn, async(request, response) => {
    const resultado = await pool.query(`SELECT * FROM servicio_ocupacion WHERE id_servicio='${request.user.email}' ORDER BY fecha DESC`);
    if (resultado.length > 0) {
        const sendData = resultado[0];
        response.send(sendData);
    } else {
        response.send('{}');
    }
});

routes.post('/services-alergias', isLoggedIn, async(request, response) => {
    const alergias = request.body.list;
    let arrayAlergias = alergias.split('-*-');
    arrayAlergias.pop();
    arrayAlergias.forEach(async(alergia) => {
        const datos = {
            id_alergia: request.user.email,
            descripcion: alergia
        }
        await pool.query(`INSERT INTO alergias_pacientes SET ?`, [datos]);
    });
    console.log(`el usuario ${request.user.email} registro alergias nuevas`);
    response.send('ok');
});

routes.get('/consultar-alergias', isLoggedIn, async(request, response) => {
    const alergias = await pool.query(`SELECT id, descripcion FROM alergias_pacientes WHERE id_alergia='${request.user.email}' AND valida='1'`);
    if (alergias.length > 0) {
        response.send(alergias);
    } else {
        response.send('{}');
    }
});

routes.post('/consultar-alergias/:id', isLoggedIn, async(request, response) => {
    const id = request.body.id;
    await pool.query(`UPDATE alergias_pacientes SET valida='0' WHERE id='${id}' AND id_alergia='${request.user.email}'`);
    console.log(`el usuario ${request.user.email} elimino la alergia sobre ${request.body.descripcion}`);
    response.send('ok');
});

routes.post('/Actualizar/salud', isLoggedIn, async(request, response) => {
    const {emailPaciente, salud} = request.body;
    await pool.query(`UPDATE servicio_salud SET servicio='${salud}', tipoSalud='EPS' WHERE id_servicio='${emailPaciente}'`);
    const estado = {
        accept: 'ok'
    };
    response.send(estado);
});

routes.post('/Actualizar/salud/par', isLoggedIn, async(request, response) => {
    const {emailPaciente, salud} = request.body;
    await pool.query(`UPDATE servicio_salud SET servicio='${salud}', tipoSalud='Particular' WHERE id_servicio='${emailPaciente}'`);
    const estado = {
        accept: 'ok'
    };
    response.send(estado);
});

routes.post('/Actualizar/salud/pre', isLoggedIn, async(request, response) => {
    const {emailPaciente, salud} = request.body;
    await pool.query(`UPDATE servicio_salud SET servicio='${salud}', tipoSalud='Prepagada' WHERE id_servicio='${emailPaciente}'`);
    const estado = {
        accept: 'ok'
    };
    response.send(estado);
});

routes.post('/antecedentes-pacientes',  isLoggedIn, async (req, res) => {
    const { ante } = req.body;
    let antecede = ante.split('*-*-*-*');
    antecede.pop();
    antecede.forEach( async (item)=> {
        const datosSave = {
            antecedentes: item,
            paciente: req.user.email
        }
        await pool.query(`INSERT INTO antecedentes SET ?`, [datosSave]);
    });

    const respuesta = {
        estado: 'ok'
    }
    res.send(respuesta);
});

routes.get('/solicitar-antecedentes', isLoggedIn, async (req, res) => {
    const datosAntecedentes = await pool.query(`SELECT * FROM antecedentes WHERE paciente='${req.user.email}'`);
    if(datosAntecedentes.length > 0){
        res.send(datosAntecedentes);
    } else {
        const estado = {
            accept: 'ok'
        }
        res.send(estado);
    }
});

routes.get('/eliminar-antecedente/:id', isLoggedIn, async (req, res)=>{
    const id = req.params.id;
    await pool.query(`DELETE FROM antecedentes WHERE id='${id}' AND paciente='${req.user.email}'`);
    const estado = {
        accept: 'ok'
    };
    res.send(estado);
});

module.exports = routes;