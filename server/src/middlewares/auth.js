import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: 'Token requerido' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userRole = payload.role;

    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ ok: false, error: 'Usuario no encontrado' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Token inválido o expirado' });
  }
}
