import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { authRequired } from '../middlewares/auth.js';

const r = Router();

r.post('/register', register);
r.post('/login', login);
r.get('/me', authRequired, (req, res) => res.json({ ok: true, user: req.user }));

export default r;
