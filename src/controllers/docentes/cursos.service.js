import { pool } from '../../database/connection.js';
import { randomUUID } from 'node:crypto'


export const getCursoByIdWithEstudiantes = async (curso_id) => {
    const fechaHoyColombia = new Date().toLocaleDateString('en-CA', {
        timeZone: 'America/Bogota',
    });

    const [rows] = await pool.execute(
        `SELECT 
            c.id AS curso_id,
            c.nombre AS curso_nombre,
            c.horario,
            c.fecha_inicio,
            c.fecha_fin,
            c.docente_id,
            e.id AS estudiante_id,
            e.nombre AS estudiante_nombre,
            e.email AS estudiante_email,
            ra.tipo AS tipo_asistencia
        FROM cursos c
        LEFT JOIN matriculas m ON c.id = m.curso_id
        LEFT JOIN estudiantes e ON m.estudiante_id = e.id
        LEFT JOIN registro_asistencias ra
            ON ra.estudiante_id = e.id AND ra.curso_id = c.id AND ra.fecha = ?
        WHERE c.id = ?`,
        [fechaHoyColombia, curso_id]
    );

    // Asegúrate de que el curso exista aunque no tenga estudiantes
    if (rows.length === 0) {
        // Hacemos una segunda consulta solo para validar la existencia del curso
        const [cursoExists] = await pool.execute('SELECT id, nombre FROM cursos WHERE id = ?', [curso_id]);
        if (cursoExists.length === 0) {
            throw new Error('Curso no encontrado');
        }

        // El curso existe pero no tiene estudiantes ni asistencias hoy
        return [{
            curso_id: cursoExists[0].id,
            curso_nombre: cursoExists[0].nombre,
            estudiantes: []
        }];
    }

    return rows;
};


export const getCursosByDocenteId = (docente_id) => {
    return pool.query(
        `SELECT * FROM cursos WHERE docente_id = ? AND estado = 'activo'`,
        [docente_id]
    );
};

export const getCursosById = (docente_id) => {
    return pool.query(
        `SELECT * FROM cursos WHERE id = ? AND estado = 'activo'`,
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
                ROUND(COUNT(ra.id) * 100.0 / NULLIF(SUM(COUNT(ra.id)) OVER (PARTITION BY c.id), 0), 2) AS porcentaje
            FROM 
                cursos c
            LEFT JOIN 
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
            e.email AS email_estudiante,
            COUNT(CASE WHEN a.tipo = 'inasistencia' THEN 1 END) AS inasistencias,
            (
                SELECT tipo
                FROM registro_asistencias a2
                WHERE 
                    a2.estudiante_id = e.id 
                    AND a2.curso_id = c.id 
                    AND DATE(a2.fecha) = CURDATE()
                LIMIT 1
            ) AS asistencia_hoy
        FROM 
            cursos c
        LEFT JOIN 
            matriculas m ON m.curso_id = c.id
        LEFT JOIN 
            estudiantes e ON e.id = m.estudiante_id
        LEFT JOIN 
            registro_asistencias  a ON a.estudiante_id = e.id AND a.curso_id = c.id
        WHERE 
            c.docente_id = ?
        GROUP BY 
            c.id, c.nombre, e.id, e.nombre, e.email
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
        const registroId = existing[0].id;

        await pool.execute(
            `UPDATE registro_asistencias 
             SET tipo = ?, justificada = ?
             WHERE id = ?`,
            [tipo, justificada, registroId]
        );
    } else {
        await pool.execute(
            `INSERT INTO registro_asistencias (id, estudiante_id, curso_id, fecha, tipo, justificada)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, estudiante_id, curso_id, fecha, tipo, justificada]
        );
    }
}


