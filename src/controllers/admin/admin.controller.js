import { createUser, selectUser } from "../users/users.service.js";
import { allStudents, crearCurso, estudiantesMatriculados, getAllCourses, getAllCoursesWithStudents, getDocenteById, getResumenGlobalAsistencias, getTeachers, registerActivity } from "./admin.service.js";
import { hash } from "bcrypt";

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

        await crearCurso({ nombre, horario, fecha_inicio, fecha_fin, docente_id });

        // 2. Registrar actividad del administrador
        if (admin_id) {
            await registerActivity(admin_id, 'Curso registrado', `Registraste el curso: ${nombre}`);
        }


        if (docente_id) {
            await registerActivity(docente_id, 'Curso creado', `Se te ha asignado el curso: ${nombre}`);
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

        const resumen = await getResumenGlobalAsistencias();
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

export async function saveTeacher(req, res) {
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
    }

    const { name, email, password, rol } = req.body;

    if (!name || !email || !password || !rol) {
        return res.status(400).json({ status: "error", message: 'Faltan datos por enviar' });
    }

    if (!['docente'].includes(rol)) {
        return res.status(400).json({ status: "error", message: 'Rol inválido' });
    }

    try {
        const existingUser = await selectUser(email);

        if (existingUser.length > 0) {
            return res.status(400).json({ status: "error", message: 'El docente ya existe' });
        }

        const encryptedPassword = await hash(password, 10);
        const result = await createUser(name, email, encryptedPassword, rol);

        if (result.affectedRows) {
            return res.status(201).json({ status: "ok", message: 'Docente creado correctamente' });
        }

        return res.status(500).json({ status: "error", message: 'No se pudo crear el docente' });
    } catch (error) {
        return res.status(500).json({ status: "error", message: 'Error interno del servidor' });
    }
}

export async function allStudentsController(req, res) {
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
    }

    try {
        const [students] = await allStudents();

        return res.status(200).json({
            status: 'ok',
            data: students
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al obtener los estudiantes',
        });
    }
}

export async function totalStudentsController(req, res) {
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
    }

    try {
        const total = await estudiantesMatriculados();
        res.status(200).json({ status: "ok", total });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al contar estudiantes activos" });
    }
}

