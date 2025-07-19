import { Router } from "express";
import { authenticate } from "../utils/jwt.js";
import { isAdmin } from "../middlewares/middlewares.js";
import { allStudentsController, crearCursoController, getAllCoursesController, getAllCoursesWithStudentsController, getAllTeachersController, saveTeacher, totalStudentsController } from "../controllers/admin/admin.controller.js";
import { matricularEstudiante, matricularEstudianteACursoController } from "../controllers/estudiantes/estudiantes.controller.js";

const adminRouter = Router()

adminRouter.get("/auth", authenticate, isAdmin, (req, res) => {res.sendStatus(200)})
adminRouter.post("/crearCurso", authenticate, isAdmin, crearCursoController)
adminRouter.post("/matricularEstudiante", authenticate, isAdmin, matricularEstudiante)
adminRouter.post("/matricularEstudianteACurso", authenticate, isAdmin, matricularEstudianteACursoController)
adminRouter.get("/allCourses", authenticate, isAdmin, getAllCoursesController)
adminRouter.get("/allCoursesWithStudents", authenticate, isAdmin, getAllCoursesWithStudentsController)
adminRouter.get("/allTeachers", authenticate, isAdmin, getAllTeachersController)
adminRouter.post("/saveTeacher", authenticate, isAdmin, saveTeacher)
adminRouter.get("/allStudents", authenticate, isAdmin, allStudentsController)
adminRouter.get("/totalStudents", authenticate, isAdmin, totalStudentsController)

export default adminRouter