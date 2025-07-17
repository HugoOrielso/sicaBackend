import { Router } from 'express';
import { authenticate } from '../utils/jwt.js';
import { isDocente } from '../middlewares/middlewares.js';
import { getAssistanceStatsByCursoController, getAssistanceStatsController, getCursosByDocenteController, getCursosConEstudiantesByIdController, getCursosConEstudiantesController, getTotalStudentsByDocenteController, guardarAsistenciaController } from '../controllers/docentes/cursos.controller.js';

const docentesRouter = Router();

docentesRouter.get('/auth', authenticate, isDocente, (req, res) => {
    res.sendStatus(200);
});

docentesRouter.get('/curso/:curso_id', authenticate, getCursosConEstudiantesByIdController);
docentesRouter.get('/cursos', authenticate, getCursosByDocenteController);
docentesRouter.get('/totalStudenst', authenticate, getTotalStudentsByDocenteController);
docentesRouter.get('/statsAssistance', authenticate, getAssistanceStatsController);
docentesRouter.get('/statsAssistanceByCourse', authenticate, getAssistanceStatsByCursoController);
docentesRouter.get('/cursosConEstudiantes', authenticate, getCursosConEstudiantesController);
docentesRouter.post('/guardarAsistencia', authenticate, guardarAsistenciaController);

export default docentesRouter;
