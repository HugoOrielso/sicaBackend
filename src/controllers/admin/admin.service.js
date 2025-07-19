import { pool } from "../../database/connection.js";

export const crearCurso = ({ nombre, horario, fecha_inicio, fecha_fin, docente_id }) => {
    return pool.query(
        'INSERT INTO cursos (nombre, horario, fecha_inicio, fecha_fin, docente_id, estado) VALUES (?, ?, ?, ?, ?, ?)',
        [nombre, horario, fecha_inicio, fecha_fin, docente_id, "activo"]
    );
};

export const getDocenteById = (id) => {
    return pool.query(
        'SELECT * FROM usuarios WHERE id = ? AND rol = "docente"',
        [id]
    );
};

export const getAllCourses = () => {
    return pool.query(
        'SELECT * FROM cursos WHERE estado = "activo"',
    );
};


export const getAllCoursesWithStudents = async () => {
    const [rows] = await pool.query(`
        SELECT 
            c.id AS curso_id,
            c.nombre AS curso_nombre,
            c.fecha_inicio,
            c.fecha_fin,
            c.horario,
            c.docente_id,
            u.nombre AS docente_nombre,
            e.id AS estudiante_id,
            e.nombre AS estudiante_nombre,
            e.email AS estudiante_email,
            COUNT(ra.id) AS total_registros_estudiante,
            SUM(CASE WHEN ra.tipo = 'asistencia' THEN 1 ELSE 0 END) AS total_asistencias_estudiante,
            SUM(CASE WHEN ra.tipo = 'inasistencia' THEN 1 ELSE 0 END) AS total_inasistencias_estudiante,
            SUM(CASE WHEN ra.tipo = 'retraso' THEN 1 ELSE 0 END) AS total_retrasos_estudiante
        FROM cursos c
        LEFT JOIN usuarios u ON c.docente_id = u.id
        LEFT JOIN matriculas m ON c.id = m.curso_id
        LEFT JOIN estudiantes e ON m.estudiante_id = e.id
        LEFT JOIN registro_asistencias ra ON ra.estudiante_id = e.id AND ra.curso_id = c.id
        WHERE c.estado = "activo"
        GROUP BY c.id, e.id
        ORDER BY c.nombre ASC, e.nombre ASC
    `);

    const cursosMap = new Map();

    for (const row of rows) {
        let curso = cursosMap.get(row.curso_id);

        if (!curso) {
            curso = {
                curso_id: row.curso_id,
                curso_nombre: row.curso_nombre,
                fecha_inicio: row.fecha_inicio,
                fecha_fin: row.fecha_fin,
                horario: row.horario,
                docente_id: row.docente_id,
                docente_nombre: row.docente_nombre,
                estudiantes: [],
                total_asistencias: 0,
                total_inasistencias: 0,
                total_retrasos: 0,
                total_registros: 0,
                porcentaje_asistencia: 0,
                porcentaje_inasistencia: 0,
                porcentaje_retraso: 0,
            };
            cursosMap.set(row.curso_id, curso);
        }

        if (row.estudiante_id) {
            const total = row.total_registros_estudiante || 0;

            curso.estudiantes.push({
                estudiante_id: row.estudiante_id,
                nombre: row.estudiante_nombre,
                email: row.estudiante_email,
                porcentaje_asistencia: total ? (row.total_asistencias_estudiante / total) * 100 : 0,
                porcentaje_inasistencia: total ? (row.total_inasistencias_estudiante / total) * 100 : 0,
                porcentaje_retraso: total ? (row.total_retrasos_estudiante / total) * 100 : 0,
            });

            curso.total_asistencias += row.total_asistencias_estudiante || 0;
            curso.total_inasistencias += row.total_inasistencias_estudiante || 0;
            curso.total_retrasos += row.total_retrasos_estudiante || 0;
            curso.total_registros += row.total_registros_estudiante || 0;
        }
    }

    const result = Array.from(cursosMap.values()).map(curso => ({
        ...curso,
        porcentaje_asistencia: curso.total_registros ? (curso.total_asistencias / curso.total_registros) * 100 : 0,
        porcentaje_inasistencia: curso.total_registros ? (curso.total_inasistencias / curso.total_registros) * 100 : 0,
        porcentaje_retraso: curso.total_registros ? (curso.total_retrasos / curso.total_registros) * 100 : 0,
    }));

    return result;
};


export const registerActivity = (usuario_id, tipo, descripcion) => {
    return pool.query(
        `INSERT INTO actividades (usuario_id, tipo, descripcion) VALUES (?, ?, ?)`,
        [usuario_id, tipo, descripcion]
    );
};


export const getTeachers = () => {
    return pool.query(
        `SELECT * FROM usuarios WHERE rol = 'docente'`,
        []);
};