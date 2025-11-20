import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import {
  upload, assignReading, listMyAssignmentsStudent, toggleRead,
  submitWork, sendFeedback, listTeacherBoard, answerQuestion
} from '../controllers/assignment.controller.js';

const r = Router();

// docente
r.post('/assign', authRequired, requireRole('docente'), assignReading);
r.get('/teacher', authRequired, requireRole('docente'), listTeacherBoard);
r.post('/:id/feedback', authRequired, requireRole('docente'), sendFeedback);

// estudiante
r.get('/my', authRequired, listMyAssignmentsStudent);
r.patch('/:id/read', authRequired, toggleRead);
r.post('/:id/submit', authRequired, upload.single('file'), submitWork);

r.post('/:id/answer', authRequired, answerQuestion);

export default r;
