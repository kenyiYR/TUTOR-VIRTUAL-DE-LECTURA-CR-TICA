import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import { upload, createReading, listMyReadings } from '../controllers/reading.controller.js';

const r = Router();

r.get('/', authRequired, requireRole('docente'), listMyReadings);
r.post('/', authRequired, requireRole('docente'), upload.single('file'), createReading);

export default r;
