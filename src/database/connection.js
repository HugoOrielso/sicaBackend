import { createPool } from 'mysql2/promise'


export const pool = createPool({
    database: 'control_cursos',
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306 ',
    waitForConnections: true,
    connectionLimit: 10
});
