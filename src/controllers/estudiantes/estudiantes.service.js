import { pool } from '../../database/connection.js';

export const getCursoById = (id) => {
    return pool.query('SELECT * FROM cursos WHERE id = ?', [id]);
};

export const getEstudianteByEmail = (email) => {
    return pool.query('SELECT id FROM estudiantes WHERE email = ?', [email]);
};

export const crearEstudiante = (nombre, email) => {
    return pool.query(
        'INSERT INTO estudiantes (nombre, email) VALUES (?, ?)',
        [nombre, email]
    );
};

export const registrarMatricula = (estudiante_id, curso_id) => {
    return pool.query(
        'INSERT INTO matriculas (estudiante_id, curso_id) VALUES (?, ?)',
        [estudiante_id, curso_id]
    );
};
