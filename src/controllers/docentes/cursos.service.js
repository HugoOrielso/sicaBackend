import { pool } from '../../database/connection.js';
import {randomUUID} from 'node:crypto'
export const getCursoByIdWithEstudiantes = (curso_id) => {
    return pool.query(
        `SELECT 
            c.id AS curso_id,
            c.nombre AS curso_nombre,
            c.horario,
            c.fecha_inicio,
            c.fecha_fin,
            c.docente_id,
            e.id AS estudiante_id,
            e.nombre AS estudiante_nombre,
            e.email AS estudiante_email
        FROM cursos c
        INNER JOIN matriculas m ON c.id = m.curso_id
        INNER JOIN estudiantes e ON m.estudiante_id = e.id
        WHERE c.id = ?`,
        [curso_id]
    );
};

export const getCursosByDocenteId = (docente_id) => {
    return pool.query(
        `SELECT * FROM cursos WHERE docente_id = ?`,
        [docente_id]
    );
};

export const getStatsOfAssistance = (docente_id) => {
    return pool.query(
        `
        SELECT 
            ra.tipo,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS porcentaje
        FROM 
            cursos c
        JOIN 
            registro_asistencias ra ON ra.curso_id = c.id
        WHERE 
            c.docente_id = ?
        GROUP BY 
            ra.tipo;
        `,
        [docente_id]
    );
};
export const getStatsOfAssistanceOrderByCourse = (docente_id) => {
    return pool.query(
        `
        SELECT 
            c.id AS curso_id,
            c.nombre AS nombre_curso,
            ra.tipo,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY c.id), 2) AS porcentaje
        FROM 
            cursos c
        JOIN 
            registro_asistencias ra ON ra.curso_id = c.id
        WHERE 
            c.docente_id = ?
        GROUP BY 
            c.id, c.nombre, ra.tipo;
        `,
        [docente_id]
    );
};

export const getTotalStudentsByTeacher = (docente_id) => {
    return pool.query(
        `
            SELECT 
                u.nombre AS nombre_docente,
                COUNT(DISTINCT m.estudiante_id) AS cantidad_estudiantes
            FROM 
                usuarios u
            JOIN 
                cursos c ON c.docente_id = u.id
            JOIN 
                matriculas m ON m.curso_id = c.id
            WHERE 
                u.id = ?  
            GROUP BY 
                u.id, u.nombre;
        `,
        [docente_id]
    );
};
export const getCoursesAndStudentsByTeacher = (docente_id) => {
    return pool.query(
        `
            SELECT 
                c.id AS curso_id,
                c.nombre AS nombre_curso,
                e.id AS estudiante_id,
                e.nombre AS nombre_estudiante,
                e.email AS email_estudiante
            FROM 
                cursos c
            LEFT JOIN 
                matriculas m ON m.curso_id = c.id
            LEFT JOIN 
                estudiantes e ON e.id = m.estudiante_id
            WHERE 
                c.docente_id = ?
            ORDER BY 
                c.nombre, e.nombre;
        `,
        [docente_id]
    );
};

export async function registrarAsistencia({ estudiante_id, curso_id, fecha, tipo, justificada = 0 }) {
    const id = randomUUID();

    const [existing] = await pool.execute(
        `SELECT id FROM registro_asistencias WHERE estudiante_id = ? AND curso_id = ? AND fecha = ?`,
        [estudiante_id, curso_id, fecha]
    );

    if (existing.length > 0) {
        // Ya existe asistencia registrada para ese estudiante ese día
        return;
    }

    await pool.execute(
        `INSERT INTO registro_asistencias (id, estudiante_id, curso_id, fecha, tipo, justificada)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, estudiante_id, curso_id, fecha, tipo, justificada]
    );
}

