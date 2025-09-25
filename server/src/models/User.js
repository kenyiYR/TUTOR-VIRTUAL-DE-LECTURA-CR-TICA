import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    rol:    { type: String, enum: ['estudiante','docente','admin'], default: 'estudiante' }
  },
  { timestamps: true }
);

export default model('User', userSchema);
