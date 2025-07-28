import { createPool } from 'mysql2/promise'
import { MYSQL_DB, MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_PORT } from '../utils/config.js';


export const pool = createPool({
    database: MYSQL_DB,
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    port: MYSQL_PORT,
    waitForConnections: true,
    connectionLimit: 10
});
