import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import adminRouter from './src/router/adminRouter.routes.js'
import userRouter from './src/router/userRouter.routes.js'
import docentesRouter from './src/router/docente.routes.js'
import { refreshToken } from './src/middlewares/middlewares.js'

const PORT = process.env.PORT ?? 4321
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials:true,origin: process.env.ALLOW_ORIGIN}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

app.use("/api/admin", adminRouter)
app.use("/api/users", userRouter)
app.use("/api/docentes", docentesRouter)
app.get("/api/refresh", refreshToken)


app.listen(PORT,()=>{
    console.log("Server on port ", PORT)
})