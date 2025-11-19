import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import usersRouter from './routes/users.routes.js';
import authRouter from './routes/auth.routes.js';
import teacherRouter from './routes/teacher.routes.js';
import readingRouter from './routes/reading.routes.js';
import assignmentRouter from './routes/assignment.routes.js';

import aiRoutes from "./routes/ai.routes.js";

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.set('trust proxy', true);

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

// health checks
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'tvlc-api', env: process.env.NODE_ENV || 'dev' });
});
// alias para que no te quedes sin ping si esperas /api/health
app.get('/api/health', (req, res) => res.redirect(307, '/health'));

app.get('/db/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const s = mongoose.connection.readyState;
  res.json({ ok: s === 1, state: states[s] || s });
});

// rutas
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/readings', readingRouter);
app.use('/api/assignments', assignmentRouter);
app.use("/api/ai", aiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// errores
app.use((err, req, res, next) => {
  req.log?.error({ err }, 'API error');
  const code = (err.name === 'ZodError' || err.name === 'ValidationError') ? 400 : 500;
  res.status(code).json({ ok: false, error: err.message || 'Error interno' });
});

const PORT = process.env.PORT || 4000;

// ÚNICO bootstrap: conecta DB y luego escucha
async function bootstrap() {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => logger.info(`API en http://localhost:${PORT}`));
}

// Solo arranca si este archivo es el entrypoint (evita doble listen en tests)
if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 4000;
      const server = app.listen(PORT, () => logger.info(`API en http://localhost:${PORT}`));
      // cierre limpio (evita EADDRINUSE con nodemon)
      const shutdown = (why) => server.close(() => process.exit(0));
      process.on("SIGTERM", () => shutdown("SIGTERM"));
      process.on("SIGINT",  () => shutdown("SIGINT"));
      process.once("SIGUSR2", () => { shutdown("SIGUSR2"); process.kill(process.pid, "SIGUSR2"); });
    })
    .catch((err) => { logger.error({ err }, "No se pudo conectar a MongoDB"); process.exit(1); });
}

// higiene
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
});
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export { app };
