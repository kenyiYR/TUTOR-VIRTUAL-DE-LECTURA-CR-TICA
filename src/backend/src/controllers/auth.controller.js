import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User.js";

const registerSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(["estudiante", "docente", "admin"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function signToken(user) {
  const payload = { sub: user._id.toString(), role: user.rol };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  return jwt.sign(payload, secret, { expiresIn });
}

export async function register(req, res, next) {
  try {
    const { nombre, email, password, rol } = registerSchema.parse(req.body);
    const emailNorm = email.trim().toLowerCase();
    const exists = await User.findOne({ email: emailNorm });
    if (exists) return res.status(409).json({ ok: false, error: "Email ya registrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ nombre, email: emailNorm, passwordHash, rol });
    const token = signToken(user);
    res.status(201).json({ ok: true, user: user.toJSON(), token });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const emailNorm = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailNorm });
    if (!user) return res.status(404).json({ ok: false, error: "Usuario no encontrado" });

    // Soporta passwordHash o password por si el modelo varía
    const hash = user.passwordHash ?? user.password ?? "";
    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ ok: false, error: "Credenciales inválidas" });

    const token = signToken(user);
    const dto = user.toJSON ? user.toJSON() : { _id: user._id, email: user.email, rol: user.rol };

    // Normaliza email en la respuesta
    return res.status(200).json({ ok: true, user: { ...dto, email: emailNorm }, token });
  } catch (err) { next(err); }
}
