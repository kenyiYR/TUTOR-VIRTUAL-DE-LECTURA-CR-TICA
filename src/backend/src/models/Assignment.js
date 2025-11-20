import { Schema, model } from 'mongoose';

const questionSubschema = new Schema(
  {
    id:            { type: String },          // ej: "literal-1"
    level:         { type: String },          // "literal" | "inferential" | "critical"
    prompt:        { type: String, required: true },
    expectedAnswer:{ type: String }
  },
  { _id: false } // no queremos _id extra por cada pregunta
);

const answerSubschema = new Schema(
  {
    questionId:   { type: String, required: true }, // ej: "literal-1"
    level:        { type: String },                 // literal | inferential | critical
    prompt:       { type: String },                 // snapshot de la pregunta
    answer:       { type: String, required: true }, // lo que escribió el alumno

    feedbackText: { type: String },                 // texto de retroalimentación
    score:        { type: Number },                 // 0-100
    verdict:      { type: String },                 // "excelente", "parcial", etc.

    createdAt:    { type: Date, default: Date.now },
    updatedAt:    { type: Date, default: Date.now }
  },
  { _id: false }
);

const assignmentSchema = new Schema({
  reading:     { type: Schema.Types.ObjectId, ref: 'Reading', required: true },
  student:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy:  { type: Schema.Types.ObjectId, ref: 'User', required: true }, // docente
  dueDate:     { type: Date },
  readAt:      { type: Date },

  submission: {
    bucket:     { type: String },       // tareas
    objectPath: { type: String },
    mime:       { type: String },
    size:       { type: Number },
    notes:      { type: String, trim: true },
    at:         { type: Date }
  },

  feedback: {
    text:   { type: String, trim: true },
    score:  { type: Number, min: 0, max: 100 },
    by:     { type: Schema.Types.ObjectId, ref: 'User' },
    at:     { type: Date }
  },

  questions: {
    status: {
      type: String,
      enum: ['pending', 'ready', 'failed'],
      default: 'pending'
    },
    literal:      { type: [questionSubschema], default: [] },
    inferential:  { type: [questionSubschema], default: [] },
    critical:     { type: [questionSubschema], default: [] },
    error:        { type: String } // mensaje corto de error si falla la IA
  },

  answers: {
    type: [answerSubschema],
    default: []
  },

}, { timestamps: true, versionKey: false });

assignmentSchema.index({ reading: 1, student: 1 }, { unique: true });

export default model('Assignment', assignmentSchema);
