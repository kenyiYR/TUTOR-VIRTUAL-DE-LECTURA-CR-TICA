import { z } from "zod";
import multer from "multer";
import crypto from "node:crypto";
import Assignment from "../models/Assignment.js";
import Reading from "../models/Reading.js";
import { uploadBuffer, publicUrl } from "../lib/storage.service.js";
import {
  generateReadingQuestions,
  evaluateAnswer,
} from "../lib/ai.service.js";
import { getReadingText } from "../lib/reading-text.service.js";

const IS_TEST_ENV = process.env.NODE_ENV === "test";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Acepta studentId o studentIds. Al menos uno es requerido.
const assignSchema = z
  .object({
    readingId: z.string().min(1, "readingId requerido"),
    studentId: z.string().min(1).optional(),
    studentIds: z.array(z.string().min(1)).optional(),
    dueDate: z
      .string()
      .optional()
      .nullable()
      .refine(
        (v) => {
          if (!v) return true;
          return !Number.isNaN(Date.parse(v));
        },
        { message: "Fecha inválida" }
      ),
  })
  .refine(
    (data) => {
      const fromArray = data.studentIds && data.studentIds.length > 0;
      const fromSingle = !!data.studentId;
      return fromArray || fromSingle;
    },
    {
      message: "Debe haber al menos un estudiante",
      path: ["studentIds"],
    }
  );

export async function assignReading(req, res, next) {
  try {
    const payload = assignSchema.parse(req.body);
    const { readingId, dueDate, studentId, studentIds: rawIds } = payload;

    const studentIds =
      rawIds && rawIds.length > 0
        ? rawIds
        : studentId
        ? [studentId]
        : [];

    // Solo docentes asignan. Los tests te setean req.user.rol.
    if (!req.user || req.user.rol !== "docente") {
      return res
        .status(403)
        .json({ ok: false, error: "No autorizado" });
    }

    const reading = await Reading.findById(readingId);
    if (!reading) {
      return res
        .status(404)
        .json({ ok: false, error: "Lectura no encontrada" });
    }

    // Caso 1 alumno: crea y devuelve 201 + assignment (con status)
    if (studentIds.length === 1) {
      const created = await Assignment.create({
        reading: reading._id,
        student: studentIds[0],
        assignedBy: req.user.id ?? req.userId,
        dueDate,
        status: "assigned", // status global de la asignación
        // questions: se llena con el default "pending" del schema
      });

      // IA en background (no en entorno de test)
      if (!IS_TEST_ENV) {
        generateQuestionsForAssignments({
          reading,
          assignments: [created],
        }).catch((err) => {
          console.error(
            "[AssignmentsController] Error background IA (1 alumno):",
            err?.message || err
          );
        });
      }

      return res.status(201).json({ ok: true, assignment: created });
    }

    // Batch para varios alumnos: upsert y estadísticos
    const ops = studentIds.map((student) => ({
      updateOne: {
        filter: { reading: reading._id, student },
        update: {
          $setOnInsert: {
            reading: reading._id,
            student,
            assignedBy: req.user.id ?? req.userId,
            dueDate,
            status: "assigned",
          },
        },
        upsert: true,
      },
    }));

    const result = await Assignment.bulkWrite(ops, { ordered: false });

    // IA en background para todos los alumnos afectados (no en test)
    if (!IS_TEST_ENV) {
      Assignment.find({
        reading: reading._id,
        student: { $in: studentIds },
      })
        .then((assignments) => {
          if (!assignments || assignments.length === 0) return;
          return generateQuestionsForAssignments({ reading, assignments });
        })
        .catch((err) => {
          console.error(
            "[AssignmentsController] Error background IA (batch):",
            err?.message || err
          );
        });
    }

    return res.status(201).json({
      ok: true,
      stats: {
        upserted: result.upsertedCount,
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function listMyAssignmentsStudent(req, res, next) {
  try {
    const docs = await Assignment.find({ student: req.userId })
      .populate("reading", "titulo descripcion bucket objectPath createdBy")
      .sort({ createdAt: -1 })
      .lean();

    const mapped = docs.map((a) => ({
      ...a,
      reading: {
        ...a.reading,
        url: publicUrl({
          bucket: a.reading.bucket,
          path: a.reading.objectPath,
        }),
      },
      status: a.feedback?.at
        ? "revisado"
        : a.submission?.at
        ? "entregado"
        : a.readAt
        ? "leido"
        : "pendiente",
    }));

    res.json({ ok: true, assignments: mapped });
  } catch (e) {
    next(e);
  }
}

export async function toggleRead(req, res, next) {
  try {
    const id = req.params.id;
    const a = await Assignment.findOne({
      _id: id,
      student: req.userId,
    });
    if (!a)
      return res
        .status(404)
        .json({ ok: false, error: "Asignación no encontrada" });
    a.readAt = a.readAt ? null : new Date();
    await a.save();
    res.json({ ok: true, readAt: a.readAt });
  } catch (e) {
    next(e);
  }
}

export async function submitWork(req, res, next) {
  try {
    const id = req.params.id;
    const a = await Assignment.findOne({
      _id: id,
      student: req.userId,
    }).populate("reading", "createdBy");
    if (!a)
      return res
        .status(404)
        .json({ ok: false, error: "Asignación no encontrada" });

    if (!req.file)
      return res
        .status(400)
        .json({ ok: false, error: "Archivo requerido" });
    const ext =
      req.file.originalname.split(".").pop()?.toLowerCase() || "bin";
    const objectPath = `${req.userId}/${a.reading._id}/${crypto.randomUUID()}.${ext}`;

    const path = await uploadBuffer({
      bucket: process.env.SUPABASE_BUCKET_TAREAS,
      path: objectPath,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
    });

    a.submission = {
      bucket: process.env.SUPABASE_BUCKET_TAREAS,
      objectPath: path,
      mime: req.file.mimetype,
      size: req.file.size,
      notes: req.body?.notes || "",
      at: new Date(),
    };
    await a.save();
    res.status(201).json({ ok: true, submission: a.submission });
  } catch (e) {
    next(e);
  }
}

const feedbackSchema = z.object({
  text: z.string().max(1000).optional().or(z.literal("")),
  score: z.number().min(0).max(100).optional(),
});

export async function sendFeedback(req, res, next) {
  try {
    const id = req.params.id;
    const a = await Assignment.findById(id).populate(
      "reading",
      "createdBy"
    );
    if (!a)
      return res
        .status(404)
        .json({ ok: false, error: "Asignación no encontrada" });
    if (String(a.reading.createdBy) !== String(req.userId)) {
      return res
        .status(403)
        .json({ ok: false, error: "No autorizado" });
    }
    const { text = "", score } = feedbackSchema.parse(req.body);
    a.feedback = { text, score, by: req.userId, at: new Date() };
    await a.save();
    res.json({ ok: true, feedback: a.feedback });
  } catch (e) {
    next(e);
  }
}

export async function listTeacherBoard(req, res, next) {
  try {
    const readingId = req.query.readingId;
    const filter = {};
    if (readingId) filter.reading = readingId;

    const docs = await Assignment.find({
      assignedBy: req.userId,
      ...filter,
    })
      .populate("student", "nombre email")
      .populate("reading", "titulo descripcion")
      .sort({ createdAt: -1 })
      .lean();

    const items = docs.map((doc) => {
      const item = { ...doc };

      if (item.submission?.bucket && item.submission?.objectPath) {
        try {
          item.submissionUrl = publicUrl({
            bucket: item.submission.bucket,
            path: item.submission.objectPath,
          });
        } catch {
          item.submissionUrl = null;
        }
      }

      return item;
    });

    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
}

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z
    .string()
    .min(1, "La respuesta no puede estar vacía"),
});

/**
 * Permite al estudiante responder una pregunta de la asignación
 * y obtiene feedback automático de la IA.
 *
 * POST /api/assignments/:id/answer
 */
export async function answerQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const payload = answerSchema.parse(req.body);

    if (!req.user || req.user.rol !== "estudiante") {
      return res.status(403).json({
        ok: false,
        error: "Solo estudiantes pueden responder aquí.",
      });
    }

    const assignment = await Assignment.findById(id).populate(
      "reading",
      "titulo descripcion"
    );
    if (!assignment) {
      return res
        .status(404)
        .json({ ok: false, error: "Asignación no encontrada." });
    }

    if (assignment.student.toString() !== req.userId) {
      return res.status(403).json({
        ok: false,
        error: "No puedes responder asignaciones de otro usuario.",
      });
    }

    const q = findQuestionInAssignment(
      assignment,
      payload.questionId
    );
    if (!q) {
      return res.status(400).json({
        ok: false,
        error: "Pregunta no encontrada en esta asignación.",
      });
    }

    const level = q.level || "critical";
    const questionPrompt = q.prompt;
    const expectedAnswer = q.expectedAnswer || "";

    const evalResult = await evaluateAnswer({
      level,
      questionPrompt,
      expectedAnswer,
      studentAnswer: payload.answer,
      title: assignment.reading?.titulo,
    });

    const now = new Date();
    const answers = assignment.answers || [];
    const idx = answers.findIndex(
      (a) => a.questionId === payload.questionId
    );

    const newEntry = {
      questionId: payload.questionId,
      level,
      prompt: questionPrompt,
      answer: payload.answer,
      feedbackText: evalResult.feedback,
      score: evalResult.score,
      verdict: evalResult.verdict,
      updatedAt: now,
      createdAt: idx >= 0 ? answers[idx].createdAt : now,
    };

    if (idx >= 0) {
      answers[idx] = newEntry;
    } else {
      answers.push(newEntry);
    }

    assignment.answers = answers;
    await assignment.save();

    return res.json({ ok: true, answer: newEntry });
  } catch (e) {
    next(e);
  }
}

/**
 * Genera preguntas con IA para una o varias asignaciones de la misma lectura
 * y las guarda en cada documento.
 */
async function generateQuestionsForAssignments({ reading, assignments }) {
  if (!assignments || assignments.length === 0) return;

  try {
    const text = await getReadingText(reading);

    const questionsByLevel = await generateReadingQuestions({
      text,
      title: reading.titulo,
    });

    for (const assignment of assignments) {
      assignment.questions = {
        status: "ready",
        literal: questionsByLevel.literal,
        inferential: questionsByLevel.inferential,
        critical: questionsByLevel.critical,
      };
      await assignment.save();
    }
  } catch (err) {
    console.error(
      "[AssignmentsController] Error generando preguntas IA:",
      err?.message || err
    );

    for (const assignment of assignments) {
      assignment.questions = {
        ...(assignment.questions || {}),
        status: "failed",
        error:
          err?.message || "Error generando preguntas con IA",
      };
      await assignment.save();
    }
  }
}

function findQuestionInAssignment(assignment, questionId) {
  if (!assignment?.questions) return null;

  const { literal = [], inferential = [], critical = [] } =
    assignment.questions;

  const groups = [
    { level: "literal", arr: literal },
    { level: "inferential", arr: inferential },
    { level: "critical", arr: critical },
  ];

  for (const { level, arr } of groups) {
    for (const q of arr) {
      const candidateId =
        (q.id && String(q.id)) ||
        (q._id && q._id.toString());

      if (candidateId && candidateId === questionId) {
        const plain = q.toObject ? q.toObject() : q;
        return { ...plain, level };
      }
    }
  }

  return null;
}

export async function getReminderCandidates(req, res, next) {
  try {
    const now = new Date();
    const inTwoDays = new Date(
      now.getTime() + 2 * 24 * 60 * 60 * 1000
    );

    const assignments = await Assignment.find({
      dueDate: { $ne: null, $lte: inTwoDays },
      "submission.at": { $exists: false },
    })
      .populate("student", "nombre email")
      .populate("reading", "titulo descripcion");

    const items = assignments.map((a) => ({
      id: a._id.toString(),
      student: {
        id: a.student._id.toString(),
        nombre: a.student.nombre,
        email: a.student.email,
      },
      reading: {
        id: a.reading._id.toString(),
        titulo: a.reading.titulo,
        descripcion: a.reading.descripcion,
      },
      dueDate: a.dueDate,
    }));

    return res.json({ ok: true, assignments: items });
  } catch (e) {
    next(e);
  }
}
