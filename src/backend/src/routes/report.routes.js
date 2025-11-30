import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { getTeacherReminderReport } from "../controllers/report.controller.js";

const r = Router();

// Reporte para el docente autenticado
r.get("/reminders/teacher", authRequired, getTeacherReminderReport);

export default r;
