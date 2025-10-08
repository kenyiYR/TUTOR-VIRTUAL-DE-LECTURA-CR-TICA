import { Schema, model } from 'mongoose';

const readingSchema = new Schema({
  titulo:      { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  bucket:      { type: String, required: true },   // lecturas
  objectPath:  { type: String, required: true },   // ej: docenteId/uuid.pdf
  mime:        { type: String, required: true },
  size:        { type: Number, required: true },
  createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true }, // docente
}, { timestamps: true, versionKey: false });

readingSchema.index({ createdBy: 1, titulo: 1 });

export default model('Reading', readingSchema);
