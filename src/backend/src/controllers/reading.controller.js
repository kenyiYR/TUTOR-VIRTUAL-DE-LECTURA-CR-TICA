import { z } from 'zod';
import multer from 'multer';
import crypto from 'node:crypto';
import { uploadBuffer, publicUrl } from '../lib/storage.service.js';
import Reading from '../models/Reading.js';

export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

const metaSchema = z.object({
  titulo: z.string().min(2),
  descripcion: z.string().max(1000).optional().or(z.literal(''))
});

export async function createReading(req, res, next) {
  try {
    const { titulo, descripcion } = metaSchema.parse(req.body);
    if (!req.file) return res.status(400).json({ ok:false, error:'Archivo requerido' });

    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'bin';
    const objectPath = `${req.userId}/${crypto.randomUUID()}.${ext}`;

    const path = await uploadBuffer({
      bucket: process.env.SUPABASE_BUCKET_LECTURAS,
      path: objectPath,
      buffer: req.file.buffer,
      contentType: req.file.mimetype
    });

    const reading = await Reading.create({
      titulo, descripcion,
      bucket: process.env.SUPABASE_BUCKET_LECTURAS,
      objectPath: path,
      mime: req.file.mimetype,
      size: req.file.size,
      createdBy: req.userId
    });

    const url = publicUrl({ bucket: reading.bucket, path: reading.objectPath });
    res.status(201).json({ ok:true, reading: { ...reading.toObject(), url } });
  } catch (e) { next(e); }
}

export async function listMyReadings(req, res, next) {
  try {
    const docs = await Reading.find({ createdBy: req.userId }).sort({ createdAt: -1 }).lean();
    const mapped = docs.map(r => ({ ...r, url: publicUrl({ bucket: r.bucket, path: r.objectPath }) }));
    res.json({ ok:true, readings: mapped });
  } catch (e) { next(e); }
}
