import { Router } from "express";
import { systemAuth } from "../middlewares/systemAuth.js";
import { authRequired } from "../middlewares/auth.js";
import { createSystemMetric, listMetrics } from "../controllers/metric.controller.js";

const r = Router();

// n8n manda aquí las métricas
r.post("/system", systemAuth, createSystemMetric);

// para que luego el docente (o tú) pueda verlas
r.get("/", authRequired, listMetrics);

export default r;
