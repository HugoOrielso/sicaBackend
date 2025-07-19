import { pool } from "../../database/connection.js";


export async function selectUser(email) {
    const [query] = await pool.query('SELECT * FROM usuarios WHERE email = ?;', [email])

    return query
}

export async function createUser(name, email, password, rol) {
    const [query] = await pool.query('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
        [name, email, password, rol])

    return query
}

export async function getHistory(id) {
    const [query] = await pool.query('SELECT * FROM actividades WHERE usuario_id = ? ORDER BY fecha DESC;',
        [id])

    return query
}