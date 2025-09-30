import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import usersRouter from './routes/users.routes.js';
import authRouter from './routes/auth.routes.js';

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


app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'tvlc-api', env: process.env.NODE_ENV || 'dev' });
});

app.get('/db/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const s = mongoose.connection.readyState;
  res.json({ ok: s === 1, state: states[s] || s });
});

// rutas
app.use('/api/users', usersRouter);   // CRUD mínimo (lista/crea)
app.use('/api/auth', authRouter);     // register, login, me

// 404 explícito
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// manejo de errores
app.use((err, req, res, next) => {
  req.log?.error({ err }, 'API error');
  const code =
    err.name === 'ZodError' ? 400 :
    err.name === 'ValidationError' ? 400 :
    500;
  res.status(code).json({ ok: false, error: err.message || 'Error interno' });
});

const PORT = process.env.PORT || 4000;

// conecta a Mongo y recién levanta el server
connectDB()
  .then(() => {
    app.listen(PORT, () => logger.info(`API escuchando en http://localhost:${PORT}`));
  })
  .catch((err) => {
    logger.error({ err }, 'No se pudo conectar a MongoDB');
    process.exit(1);
  });

// higiene mínima
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
});
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
