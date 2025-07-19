import { crearCurso, getAllCourses, getAllCoursesWithStudents, getDocenteById, getTeachers, registerActivity } from "./admin.service.js";

export const crearCursoController = async (req, res) => {
    try {
        const { nombre, horario, fecha_inicio, fecha_fin, docente_id } = req.body;
        const admin_id = req.user?.id;

        if (!nombre || !horario || !fecha_inicio || !fecha_fin || !docente_id) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
        }

        // 1. Verificar si el docente existe
        const [docente] = await getDocenteById(docente_id);
        if (!docente?.length) {
            return res.status(404).json({ status: 'error', message: 'Docenteno encontrado' });
        }
        
        // 1. Crear curso
        await crearCurso({ nombre, horario, fecha_inicio, fecha_fin, docente_id });

        // 2. Registrar actividad del administrador
        if (admin_id) {
            await registerActivity(admin_id, 'Curso registrado', `Registraste el curso: ${nombre}`);
        }


        return res.status(201).json({ status: 'ok', message: 'Curso creado exitosamente' });

    } catch (error) {
        console.error('[ERROR AL CREAR CURSO]', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al crear el curso' });
    }
};

export const getAllCoursesController = async (req, res) => {
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
    }
    try {
        const [courses] = await getAllCourses();
        return res.status(200).json({ status: 'ok', data: courses });
    } catch (error) {
        console.error('[ERROR AL OBTENER CURSOS]', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al obtener los cursos' });
    }
}

export const getAllCoursesWithStudentsController = async (req, res) => {
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
    }

    try {
        const cursos = await getAllCoursesWithStudents(); 

        let total_registros = 0;
        let total_asistencias = 0;
        let total_inasistencias = 0;
        let total_retrasos = 0;

        for (const curso of cursos) {
            total_registros += curso.total_registros || 0;
            total_asistencias += curso.total_asistencias || 0;
            total_inasistencias += curso.total_inasistencias || 0;
            total_retrasos += curso.total_retrasos || 0;
        }

        const resumen = {
            total_cursos: cursos.length,
            total_registros,
            porcentaje_asistencia_global: total_registros ? (total_asistencias / total_registros) * 100 : 0,
            porcentaje_inasistencia_global: total_registros ? (total_inasistencias / total_registros) * 100 : 0,
            porcentaje_retraso_global: total_registros ? (total_retrasos / total_registros) * 100 : 0,
        };

        return res.status(200).json({ status: 'ok', data: cursos, resumen });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error interno al obtener los cursos con estudiantes' });
    }
};


export const getAllTeachersController = async (req, res) => {
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
    }

    try {
        const [teachers] = await getTeachers();
        return res.status(200).json({ status: 'ok', data: teachers });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error interno al obtener los docentes' });
    }
}