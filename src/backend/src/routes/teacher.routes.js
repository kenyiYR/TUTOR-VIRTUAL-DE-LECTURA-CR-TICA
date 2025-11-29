import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import {
  getMyProfile,
  updateMyProfile,
  listAssignableStudents
} from '../controllers/teacher.controller.js';

const r = Router();

r.get('/profile/me', authRequired, requireRole('docente'), getMyProfile);
r.put('/profile/me', authRequired, requireRole('docente'), updateMyProfile);
r.get(
  '/students/assignable',
  authRequired,
  requireRole('docente'),
  listAssignableStudents
);

export default r;
