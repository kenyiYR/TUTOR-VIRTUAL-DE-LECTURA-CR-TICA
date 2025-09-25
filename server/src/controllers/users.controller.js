import User from '../models/User.js';

export async function listUsers(req, res, next) {
  try {
    const data = await User.find().lean();
    res.json(data);
  } catch (e) { next(e); }
}

export async function createUser(req, res, next) {
  try {
    const { nombre, email, rol } = req.body;
    const user = await User.create({ nombre, email, rol });
    res.status(201).json(user);
  } catch (e) { next(e); }
}
