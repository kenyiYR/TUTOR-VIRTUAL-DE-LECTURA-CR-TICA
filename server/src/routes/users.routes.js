import { Router } from 'express';
import { listUsers, createUser } from '../controllers/users.controller.js';

const r = Router();
r.get('/', listUsers);
r.post('/', createUser);

export default r;
