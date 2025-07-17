import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN } from './config.js';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[0];

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Token no proporcionado' });
    }

    try {
        const user = jwt.verify(token, ACCESS_TOKEN); 
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ status: 'error', message: 'Token inválido o expirado' });
    }
};
