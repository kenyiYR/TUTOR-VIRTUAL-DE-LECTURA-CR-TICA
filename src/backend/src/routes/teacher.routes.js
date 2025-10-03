import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import { getMyProfile, updateMyProfile } from '../controllers/teacher.controller.js';

const r = Router();

r.get('/profile/me', authRequired, requireRole('docente'), getMyProfile);
r.put('/profile/me', authRequired, requireRole('docente'), updateMyProfile);

export default r;
