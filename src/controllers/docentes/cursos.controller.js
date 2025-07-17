import { getCoursesAndStudentsByTeacher, getCursoByIdWithEstudiantes, getCursosByDocenteId, getStatsOfAssistance, getStatsOfAssistanceOrderByCourse, getTotalStudentsByTeacher, registrarAsistencia } from "./cursos.service.js";

export const getCursosConEstudiantesByIdController = async (req, res) => {
    try {
        const { curso_id } = req.params;
        const docente_id = req.user?.id;

        if (!curso_id || !docente_id) {
            return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
        }

        const [curso] = await getCursoByIdWithEstudiantes(curso_id);

        if (!curso?.length) {
            return res.status(404).json({ status: 'error', message: 'Curso no encontrado' });
        }

        if (curso[0].docente_id !== docente_id) {
            return res.status(403).json({ status: 'error', message: 'Acceso denegado: no eres el docente de este curso' });
        }

        return res.status(200).json({ status: 'ok', curso: curso[0] });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const getCursosByDocenteController = async (req, res) => {
    try {
        const docente_id = req.user?.id;

        if (!docente_id) {
            return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
        }

        const [cursos] = await getCursosByDocenteId(docente_id);

        if (!cursos?.length) {
            return res.status(404).json({ status: 'error', message: 'Curso no encontrado' });
        }

        return res.status(200).json({ status: 'ok', cursos: cursos });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const getTotalStudentsByDocenteController = async (req, res) => {
    try {
        const docente_id = req.user?.id;

        if (!docente_id) {
            return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
        }

        const [estudiantes] = await getTotalStudentsByTeacher(docente_id);

        if (!estudiantes?.length) {
            return res.status(204).json({ status: 'error', message: 'No se encontraron estudiantes' });
        }

        return res.status(200).json({ status: 'ok', total: estudiantes });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const getAssistanceStatsController = async (req, res) => {
    try {
        const docente_id = req.user?.id

        if (!docente_id) {
            return res.status(400).json({ status: 'error', message: 'ID de docente no proporcionado' });
        }

        const [result] = await getStatsOfAssistance(docente_id);
        console.log(result);


        if (!result.length) {
            return res.status(204).json({ status: 'error', message: 'No hay registros de asistencia' });
        }

        return res.status(200).json({ status: 'ok', estadisticas: result });
    } catch (error) {
        console.error('[ERROR getAssistanceStatsController]', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const getAssistanceStatsByCursoController = async (req, res) => {
    try {
        const docente_id = req.user?.id;

        if (!docente_id) {
            return res.status(400).json({ status: 'error', message: 'ID de docente no proporcionado' });
        }

        const [result] = await getStatsOfAssistanceOrderByCourse(docente_id);

        if (!result.length) {
            return res.status(204).json({ status: 'error', message: 'No hay registros de asistencia por curso' });
        }

        // Agrupar por curso
        const agrupado = result.reduce((acc, row) => {
            let curso = acc.find(c => c.curso_id === row.curso_id);
            if (!curso) {
                curso = {
                    curso_id: row.curso_id,
                    nombre_curso: row.nombre_curso,
                    estadisticas: []
                };
                acc.push(curso);
            }

            curso.estadisticas.push({
                tipo: row.tipo,
                porcentaje: parseFloat(row.porcentaje)
            });

            return acc;
        }, []);

        return res.status(200).json({ status: 'ok', estadisticas: agrupado });

    } catch (error) {
        console.error('[ERROR getAssistanceStatsByCursoController]', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const getCursosConEstudiantesController = async (req, res) => {
    try {
        const docente_id = req.user?.id;

        if (!docente_id) {
            return res.status(400).json({ status: 'error', message: 'ID de docente no proporcionado' });
        }

        const [result] = await getCoursesAndStudentsByTeacher(docente_id);

        if (!result.length) {
            return res.status(204).json({ status: 'error', message: 'No hay cursos registrados para este docente' });
        }

        // Agrupar por curso
        const cursos = result.reduce((acc, row) => {
            let curso = acc.find(c => c.curso_id === row.curso_id);
            if (!curso) {
                curso = {
                    curso_id: row.curso_id,
                    nombre_curso: row.nombre_curso,
                    estudiantes: []
                };
                acc.push(curso);
            }

            if (row.estudiante_id) {
                curso.estudiantes.push({
                    estudiante_id: row.estudiante_id,
                    nombre: row.nombre_estudiante,
                    email: row.email_estudiante
                });
            }

            return acc;
        }, []);

        return res.status(200).json({ status: 'ok', cursos });

    } catch (error) {
        console.error('[ERROR getCursosConEstudiantesController]', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al obtener los cursos con estudiantes' });
    }
};


export const guardarAsistenciaController = async (req, res) => {
    try {
        const { curso_id, registros } = req.body;

        if (!curso_id || !Array.isArray(registros)) {
            return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
        }

        const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        for (const item of registros) {
            const { estudiante_id, estado } = item;

            let tipo;
            if (estado === 'presente') tipo = 'asistencia';
            else if (estado === 'ausente') tipo = 'inasistencia';
            else tipo = 'retraso';

            await registrarAsistencia({
                estudiante_id,
                curso_id,
                fecha,
                tipo,
                justificada: 0, 
            });
        }

        res.status(200).json({ status: 'ok', message: 'Asistencias registradas correctamente' });
    } catch (error) {
        console.error('[ERROR AL GUARDAR ASISTENCIA]', error);
        res.status(500).json({ status: 'error', message: 'Error al registrar la asistencia' });
    }
};
