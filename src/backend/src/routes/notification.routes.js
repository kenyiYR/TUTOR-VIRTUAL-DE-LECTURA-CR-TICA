import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { systemAuth } from "../middlewares/systemAuth.js";
import {
  createSystemNotification,
  listMyNotifications,
  markNotificationRead,
} from "../controllers/notification.controller.js";

const r = Router();

// Rutas que usará n8n (backend interno)
r.post("/system", systemAuth, createSystemNotification);

// Rutas para el frontend
r.get("/my", authRequired, listMyNotifications);
r.patch("/:id/read", authRequired, markNotificationRead);

export default r;
