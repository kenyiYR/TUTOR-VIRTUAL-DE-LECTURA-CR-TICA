import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';              
import { connectDB } from './config/db.js';
import usersRouter from './routes/users.routes.js';   

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use('/api/users', usersRouter);


app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'tvlc-api', env: process.env.NODE_ENV || 'dev' });
});

// monitor del estado de la DB
app.get('/db/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const s = mongoose.connection.readyState;
  res.json({ ok: s === 1, state: states[s] || s });
});

const PORT = process.env.PORT || 4000;

// conecta a Mongo y recién ahí levanta el server
connectDB()
  .then(() => {
    app.listen(PORT, () => logger.info(`API escuchando en http://localhost:${PORT}`));
  })
  .catch((err) => {
    logger.error({ err }, 'No se pudo conectar a MongoDB');
    process.exit(1);
  });

// seguridad mínima
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
});
