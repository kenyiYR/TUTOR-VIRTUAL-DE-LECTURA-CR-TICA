import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'tvlc-api', env: process.env.NODE_ENV || 'dev' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.info(`API escuchando en http://localhost:${PORT}`));
