import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../utils/config.js';

export function isAdmin(req, res, next) {
    if (req.user?.rol !== 'administrador') {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado: solo administradores' });
    }
    next();
}

export function isDocente(req, res, next) {
    if (req.user?.rol !== 'docente') {
        return res.status(403).json({ status: 'error', message: 'Acceso denegado: solo docentes' });
    }
    return res.sendStatus(200)
}

export function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;

    if (!token) return res.sendStatus(401);

    jwt.verify(token, REFRESH_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403); 

        const payload = { id: user.id, role: user.role };

        const newAccessToken = jwt.sign(payload, ACCESS_TOKEN, {
            expiresIn: '15m'
        });

        res.json({ accessToken: newAccessToken });
    });
}