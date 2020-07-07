const express = require('express');
const routes = express.Router();
const { pool } = require('../config/db.config');
const { isLoggedIn } = require('../middlewares/index.middleware');

routes.post('/agendar', isLoggedIn, async(request, response) => {
    const { email } = request.body;
    const datosPaciente = await pool.query(`SELECT nombre, apellido, rutaImg, cedula, telefono, rh, email, genero FROM pacientes WHERE email='${email}'`);
    const serviciosSalud = await pool.query(`SELECT * FROM servicio_salud WHERE id_servicio='${email}' ORDER BY fecha DESC`);
    const serviciosOcupacion = await pool.query(`SELECT * FROM servicio_ocupacion WHERE id_servicio='${email}' ORDER BY fecha DESC`);
    const alergias = await pool.query(`SELECT * FROM alergias_pacientes WHERE id_alergia='${email}' AND valida='1'`);
    if (serviciosSalud.length > 0) {
        datosPaciente[0].servicio_salud = serviciosSalud[0].tipoSalud;
        datosPaciente[0].nombre_salud = serviciosSalud[0].servicio;
    } else {
        datosPaciente[0].servicio_salud = 'no registrado';
        datosPaciente[0].nombre_salud = 'no registrado';
    }
    if (serviciosOcupacion.length > 0) {
        datosPaciente[0].ocupacion = serviciosOcupacion[0].ocupacion;
        datosPaciente[0].descripcion_ocupacion = serviciosOcupacion[0].descripcion;
    } else {
        datosPaciente[0].ocupacion = 'no registrado';
        datosPaciente[0].descripcion_ocupacion = 'no registrado';
    }
    if (alergias.length > 0) {
        let alergiasList = '';
        alergias.forEach(alergia => {
            alergiasList += alergia.descripcion + ', ';
        });

        datosPaciente[0].alergias = alergiasList.slice(0, -2);

    } else {
        datosPaciente[0].alergias = 'no registrado';
    }

    response.send(datosPaciente[0]);
});

module.exports = routes;