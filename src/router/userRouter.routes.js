import { Router } from "express";
import { login, newUser } from "../controllers/users/users.js";

const userRouter = Router()

userRouter.post("/create", newUser)
userRouter.post("/login", login)
userRouter.post("/logout", (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
    });

    if (req.logout) {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ status: 'error', message: 'Error al cerrar sesión' });
            }
            return res.status(200).json({ status: 'ok', message: 'Sesión cerrada correctamente' });
        });
    } else {
        return res.status(200).json({ status: 'ok', message: 'Sesión cerrada correctamente' });
    }
});

export default userRouter