import { pool } from "../../database/connection.js";

export const crearCurso = ({ nombre, horario, fecha_inicio, fecha_fin, docente_id }) => {
    return pool.query(
        'INSERT INTO cursos ( nombre, horario, fecha_inicio, fecha_fin, docente_id) VALUES ( ?, ?, ?, ?, ?)',
        [nombre, horario, fecha_inicio, fecha_fin, docente_id]
    );
};


export const getDocenteById = (id) => {
    return pool.query(
        'SELECT * FROM usuarios WHERE id = ? AND rol = "docente"',
        [id]
    );
};

export const registerActivity = (usuario_id, tipo, descripcion) => {
    return pool.query(
        `INSERT INTO actividades (usuario_id, tipo, descripcion) VALUES (?, ?, ?)`,
        [usuario_id, tipo, descripcion]
    );
};