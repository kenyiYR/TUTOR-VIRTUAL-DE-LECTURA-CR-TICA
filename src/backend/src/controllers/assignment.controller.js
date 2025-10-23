import { z } from 'zod';
import multer from 'multer';
import crypto from 'node:crypto';
import Assignment from '../models/Assignment.js';
import Reading from '../models/Reading.js';
import { uploadBuffer, publicUrl } from '../lib/storage.service.js';

export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Acepta studentId o studentIds. Al menos uno es requerido.
const assignSchema = z.object({
  readingId: z.string(),
  studentId: z.string().optional(),
  studentIds: z.array(z.string()).min(1).optional(),
  dueDate: z.string().datetime().optional()
}).refine(d => d.studentId || (d.studentIds && d.studentIds.length > 0), {
  message: 'studentId(s) requerido'
});

export async function assignReading(req, res, next) {
  try {
    const payload = assignSchema.parse(req.body);
    const { readingId, dueDate } = payload;
    const studentIds = payload.studentIds ?? (payload.studentId ? [payload.studentId] : []);

    // Solo docentes asignan. Los tests te setean req.user.rol.
    if (!req.user || req.user.rol !== 'docente') {
      return res.status(403).json({ ok: false, error: 'No autorizado' });
    }

    const reading = await Reading.findById(readingId);
    if (!reading) return res.status(404).json({ ok: false, error: 'Lectura no encontrada' });

    // Caso 1 alumno: crea y devuelve 201 + assignment (con status)
    if (studentIds.length === 1) {
      const created = await Assignment.create({
        reading: reading._id,
        student: studentIds[0],
        assignedBy: req.user.id ?? req.userId,
        dueDate,
        status: 'assigned'
      });
      return res.status(201).json({ ok: true, assignment: created });
    }

    // Batch para varios alumnos: upsert y estadísticos
    const ops = studentIds.map(student => ({
      updateOne: {
        filter: { reading: reading._id, student },
        update: {
          $setOnInsert: {
            reading: reading._id,
            student,
            assignedBy: req.user.id ?? req.userId,
            dueDate,
            status: 'assigned'
          }
        },
        upsert: true
      }
    }));

    const result = await Assignment.bulkWrite(ops, { ordered: false });
    return res.status(201).json({
      ok: true,
      stats: {
        upserted: result.upsertedCount,
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (e) {
    next(e);
  }
}

export async function listMyAssignmentsStudent(req, res, next) {
  try {
    const docs = await Assignment.find({ student: req.userId })
      .populate('reading', 'titulo descripcion bucket objectPath createdBy')
      .sort({ createdAt: -1 }).lean();

    const mapped = docs.map(a => ({
      ...a,
      reading: {
        ...a.reading,
        url: publicUrl({ bucket: a.reading.bucket, path: a.reading.objectPath })
      },
      status: a.feedback?.at ? 'revisado' : a.submission?.at ? 'entregado' : a.readAt ? 'leido' : 'pendiente'
    }));

    res.json({ ok:true, assignments: mapped });
  } catch (e) { next(e); }
}

export async function toggleRead(req, res, next) {
  try {
    const id = req.params.id;
    const a = await Assignment.findOne({ _id: id, student: req.userId });
    if (!a) return res.status(404).json({ ok:false, error:'Asignación no encontrada' });
    a.readAt = a.readAt ? null : new Date();
    await a.save();
    res.json({ ok:true, readAt: a.readAt });
  } catch (e) { next(e); }
}

export async function submitWork(req, res, next) {
  try {
    const id = req.params.id;
    const a = await Assignment.findOne({ _id: id, student: req.userId }).populate('reading', 'createdBy');
    if (!a) return res.status(404).json({ ok:false, error:'Asignación no encontrada' });

    if (!req.file) return res.status(400).json({ ok:false, error:'Archivo requerido' });
    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'bin';
    const objectPath = `${req.userId}/${a.reading._id}/${crypto.randomUUID()}.${ext}`;

    const path = await uploadBuffer({
      bucket: process.env.SUPABASE_BUCKET_TAREAS,
      path: objectPath, buffer: req.file.buffer, contentType: req.file.mimetype
    });

    a.submission = {
      bucket: process.env.SUPABASE_BUCKET_TAREAS,
      objectPath: path,
      mime: req.file.mimetype,
      size: req.file.size,
      notes: req.body?.notes || '',
      at: new Date()
    };
    await a.save();
    res.status(201).json({ ok:true, submission: a.submission });
  } catch (e) { next(e); }
}

const feedbackSchema = z.object({
  text:  z.string().max(1000).optional().or(z.literal('')),
  score: z.number().min(0).max(100).optional()
});

export async function sendFeedback(req, res, next) {
  try {
    const id = req.params.id;
    const a = await Assignment.findById(id).populate('reading', 'createdBy');
    if (!a) return res.status(404).json({ ok:false, error:'Asignación no encontrada' });
    if (String(a.reading.createdBy) !== String(req.userId)) {
      return res.status(403).json({ ok:false, error:'No autorizado' });
    }
    const { text = '', score } = feedbackSchema.parse(req.body);
    a.feedback = { text, score, by: req.userId, at: new Date() };
    await a.save();
    res.json({ ok:true, feedback: a.feedback });
  } catch (e) { next(e); }
}

export async function listTeacherBoard(req, res, next) {
  try {
    const readingId = req.query.readingId;
    const filter = {};
    if (readingId) filter.reading = readingId;

    const docs = await Assignment.find({ assignedBy: req.userId, ...filter })
      .populate('student', 'nombre email')
      .populate('reading', 'titulo')
      .sort({ createdAt: -1 }).lean();

    res.json({ ok:true, items: docs });
  } catch (e) { next(e); }
}
