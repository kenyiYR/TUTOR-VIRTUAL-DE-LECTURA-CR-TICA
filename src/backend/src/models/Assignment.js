import { Schema, model } from 'mongoose';

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
  }
}, { timestamps: true, versionKey: false });

assignmentSchema.index({ reading: 1, student: 1 }, { unique: true });

export default model('Assignment', assignmentSchema);
