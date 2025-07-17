import { crearCurso, getDocenteById, registerActivity } from "./admin.service.js";

export const crearCursoController = async (req, res) => {
    try {
        const { nombre, horario, fecha_inicio, fecha_fin, docente_id } = req.body;
        const admin_id = req.user?.id;

        if (!nombre || !horario || !fecha_inicio || !fecha_fin || !docente_id) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
        }

        const [docente] = await getDocenteById(docente_id);
        if (!docente?.length) {
            return res.status(404).json({ status: 'error', message: 'Docente no encontrado' });
        }

        // 1. Crear curso
        await crearCurso({ nombre, horario, fecha_inicio, fecha_fin, docente_id });

        // 2. Registrar actividad del administrador
        if (admin_id) {
            await registerActivity(admin_id, 'Curso registrado', `Registraste el curso: ${nombre}`);
        }

        // 3. Registrar actividad del docente
        await registerActivity(docente_id, 'Curso asignado', `Se te asignó el curso: ${nombre}`);

        return res.status(201).json({ status: 'ok', message: 'Curso creado exitosamente' });

    } catch (error) {
        console.error('[ERROR AL CREAR CURSO]', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al crear el curso' });
    }
};