import { getCoursesAndStudentsByTeacher, getCursoByIdWithEstudiantes, getCursosByDocenteId, getStatsOfAssistance, getStatsOfAssistanceOrderByCourse, getTotalStudentsByTeacher, registrarAsistencia } from "./cursos.service.js";

export const getCursosConEstudiantesByIdController = async (req, res) => {
    try {
        const { curso_id } = req.params;
        const docente_id = req.user?.id;

        if (!curso_id || !docente_id) {
            return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
        }

        const rows = await getCursoByIdWithEstudiantes(curso_id);

        if (!rows.length) {
            return res.status(404).json({ status: 'error', message: 'Curso no encontrado' });
        }

        if (rows[0].docente_id !== docente_id) {
            return res.status(403).json({ status: 'error', message: 'Acceso denegado: no eres el docente de este curso' });
        }

        const estudiantes = [];
        const conteo = {
            asistencia: 0,
            inasistencia: 0,
            retraso: 0,
        };

        for (const row of rows) {
            estudiantes.push({
                estudiante_id: row.estudiante_id,
                nombre: row.estudiante_nombre,
                email: row.estudiante_email,
                tipo_asistencia: row.tipo_asistencia || null,
            });

            if (row.tipo_asistencia) {
                conteo[row.tipo_asistencia] += 1;
            }
        }

        const curso = {
            curso_id: rows[0].curso_id,
            curso_nombre: rows[0].curso_nombre,
            horario: rows[0].horario,
            fecha_inicio: rows[0].fecha_inicio,
            fecha_fin: rows[0].fecha_fin,
            estudiantes,
            asistencia_hoy: conteo,
        };

        return res.status(200).json({ status: 'ok', curso });
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

        if (!result.length) {
            return res.status(204).json({ status: 'error', message: 'No hay registros de asistencia' });
        }

        return res.status(200).json({ status: 'ok', estadisticas: result });
    } catch (error) {
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
        return res.status(500).json({ status: 'error', message: 'Error interno al obtener los cursos con estudiantes' });
    }
};


export const guardarAsistenciaController = async (req, res) => {
    try {
        const { curso_id, registros } = req.body;

        if (!curso_id || !Array.isArray(registros)) {
            return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
        }

        const fecha = new Date().toLocaleDateString('en-CA')

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
        res.status(500).json({ status: 'error', message: 'Error al registrar la asistencia' });
    }
};
