import { z } from 'zod';
import TeacherProfile from '../models/TeacherProfile.js';

const profileSchema = z.object({
  especialidad: z.string().trim().max(120).optional().or(z.literal('')),
  bio: z.string().trim().max(1000).optional().or(z.literal('')),
  cursos: z.array(z.string().trim().max(100)).optional(),
  redes: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github:   z.string().url().optional().or(z.literal('')),
  }).partial().optional(),
  disponibilidad: z.object({
    dias: z.array(z.string()).optional(),
    horario: z.string().trim().max(50).optional().or(z.literal('')),
  }).partial().optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
}).strict();

export async function getMyProfile(req, res, next) {
  try {
    let prof = await TeacherProfile.findOne({ user: req.userId }).lean();
    if (!prof) {
      prof = await TeacherProfile.create({ user: req.userId, cursos: [], disponibilidad:{ dias:[] } });
      prof = prof.toObject();
    }
    res.json({ ok:true, profile: prof });
  } catch (e) { next(e); }
}

export async function updateMyProfile(req, res, next) {
  try {
    const payload = profileSchema.parse(req.body);
    const prof = await TeacherProfile.findOneAndUpdate(
      { user: req.userId },
      { $set: payload, $setOnInsert: { user: req.userId } },
      { new: true, upsert: true }
    ).lean();
    res.json({ ok:true, profile: prof });
  } catch (e) { next(e); }
}
