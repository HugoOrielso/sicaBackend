import {
    getCursoById,
    getEstudianteByEmail,
    crearEstudiante,
    registrarMatricula,
    getEstudianteById,
} from './estudiantes.service.js';

export const matricularEstudiante = async (req, res) => {
    try {
        const { nombre, email } = req.body;

        if (!nombre || !email ) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos obligatorios o tipo de datos inválido',
            });
        }

        let [estudianteRows] = await getEstudianteByEmail(email);
        if (estudianteRows.length > 0) {
            return res.status(201).json({
                status: 'ok',
                message: 'El estudiante ya existe' 
            });
        }

        const crear = await crearEstudiante(nombre, email);
        if (crear.affectedRows === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Error al crear el estudiante',
            });
        }

        [estudianteRows] = await getEstudianteByEmail(email);

        return res.status(201).json({
            status: 'ok',
            message: 'Estudiante creado',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al matricular estudiante',
        });
    }
};

export const matricularEstudianteACursoController = async (req, res) => {
    try {
        const { estudiante_id, curso_id } = req.body;

        if (!estudiante_id || !curso_id ) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos obligatorios o tipo de datos inválido',
            });
        }

        let [estudianteRows] = await getEstudianteById(estudiante_id);
        if (estudianteRows.length === 0) {
            return res.status(201).json({
                status: 'ok',
                message: 'El estudiante no existe, creando nuevo estudiante', 
            });
        }

        const crear = await registrarMatricula(estudiante_id, curso_id);
        if (crear.affectedRows === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Error al registrar matrícula',
            });
        }

        return res.status(201).json({
            status: 'ok',
            message: 'Matrícula registrada correctamente',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al matricular estudiante',
        });
    }
};
