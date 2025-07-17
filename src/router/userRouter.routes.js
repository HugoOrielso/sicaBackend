import { Router } from "express";
import { login, newUser } from "../controllers/users/users.js";
import { authenticate } from "../utils/jwt.js";

const userRouter = Router()

userRouter.post("/create", newUser)
userRouter.post("/login", login)
userRouter.get("/", authenticate, (req, res) => {
    return res.status(200).json({
        status: "ok",
        message: "Ruta protegida accedida correctamente",
        user: req.user  // puedes ver el payload del token aquí
    });
});

export default userRouter