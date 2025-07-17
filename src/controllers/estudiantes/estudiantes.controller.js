import {
    getCursoById,
    getEstudianteByEmail,
    crearEstudiante,
    registrarMatricula
} from './estudiantes.service.js';

export const matricularEstudiante = async (req, res) => {
    try {
        const { nombre, curso_id } = req.body;

        // 1. Validación básica
        if (!nombre || !curso_id || typeof nombre !== 'string' || typeof curso_id !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos obligatorios o tipo de datos inválido',
            });
        }

        // 2. Validar existencia del curso
        const [cursoRows] = await getCursoById(curso_id);
        if (!Array.isArray(cursoRows) || cursoRows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Curso no encontrado',
            });
        }

        // 3. Crear email institucional
        const email = `${nombre.replace(/\s+/g, '').toLowerCase()}@fesc.edu.co`;

        // 4. Verificar si ya existe el estudiante
        let [estudianteRows] = await getEstudianteByEmail(email);

        if (!Array.isArray(estudianteRows)) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al consultar estudiante',
            });
        }

        // 5. Si no existe, crearlo
        if (estudianteRows.length === 0) {
            await crearEstudiante(nombre, email);
            [estudianteRows] = await getEstudianteByEmail(email);
        }

        // 6. Validar estudiante_id
        if (!estudianteRows.length || !estudianteRows[0].id) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al obtener ID del estudiante',
            });
        }

        const estudiante_id = estudianteRows[0].id;

        // 7. Registrar la matrícula (evitar duplicados)
        await registrarMatricula(estudiante_id, curso_id);

        return res.status(201).json({
            status: 'ok',
            message: 'Estudiante matriculado correctamente',
            estudiante: { id: estudiante_id, nombre, email },
        });
    } catch (error) {
        console.error('[ERROR AL MATRICULAR]', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al matricular estudiante',
        });
    }
};

