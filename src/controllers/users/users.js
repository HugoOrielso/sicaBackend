import { selectUser, createUser } from './users.service.js'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../utils/config.js';



export async function newUser(req, res) {
    const { name, email, password, rol } = req.body;

    if (!name || !email || !password || !rol) {
        return res.status(400).json({ status: "error", message: 'Faltan datos por enviar' });
    }

    if (!['administrador', 'docente'].includes(rol)) {
        return res.status(400).json({ status: "error", message: 'Rol inválido' });
    }

    try {
        const existingUser = await selectUser(email);

        if (existingUser.length > 0) {
            return res.status(400).json({ status: "error", message: 'El usuario ya existe' });
        }

        const encryptedPassword = await hash(password, 10);
        const result = await createUser(name, email, encryptedPassword, rol);

        if (result.affectedRows) {
            return res.status(201).json({ status: "ok", message: 'Usuario creado correctamente' });
        }

        return res.status(500).json({ status: "error", message: 'No se pudo crear el usuario' });

    } catch (error) {
        return res.status(500).json({ status: "error", message: 'Error interno del servidor' });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    

    if (!email || !password) {
        return res.status(400).json({ status: "error", message: 'Faltan datos por enviar' });
    }

    try {
        const existingUser = await selectUser(email);

        if (existingUser.length === 0) {
            return res.status(400).json({ status: "error", message: 'El usuario no existe' });
        }

        const userInDb = existingUser[0];

        const validPassword = await compare(password, userInDb.password);
        if (!validPassword) {
            return res.status(401).json({ status: "error", message: 'Contraseña incorrecta' });
        }

        const userPayload = {
            id: userInDb.id,
            name: userInDb.nombre,
            email: userInDb.email,
            rol: userInDb.rol
        };

        const accessToken = jwt.sign(userPayload, ACCESS_TOKEN, { expiresIn: '15m' });
        const refreshToken = jwt.sign(userPayload, REFRESH_TOKEN, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken)
        return res.status(200).json({
            status: "ok",
            message: "Inicio de sesión exitoso",
            accessToken,
            user: userPayload
        });

    } catch (error) {
        console.error('[ERROR login]', error);
        return res.status(500).json({ status: "error", message: 'Error interno del servidor' });
    }
}

