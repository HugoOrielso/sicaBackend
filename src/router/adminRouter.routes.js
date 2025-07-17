import { Router } from "express";
import { authenticate } from "../utils/jwt.js";
import { isAdmin } from "../middlewares/middlewares.js";
import { crearCursoController } from "../controllers/admin/admin.controller.js";
import { matricularEstudiante } from "../controllers/estudiantes/estudiantes.controller.js";

const adminRouter = Router()

adminRouter.post("/crearCurso", authenticate, isAdmin, crearCursoController)
adminRouter.get("/auth", authenticate, isAdmin, (req, res) => {
    res.sendStatus(200);
})
adminRouter.post("/registrarEstudiante", authenticate, isAdmin, matricularEstudiante)

export default adminRouter