import { Schema, model } from 'mongoose';

const teacherProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, index: true, required: true },
  especialidad: { type: String, trim: true },
  bio: { type: String, trim: true, maxlength: 1000 },
  cursos: [{ type: String, trim: true }],
  redes: {
    linkedin: { type: String, trim: true },
    github:   { type: String, trim: true }
  },
  disponibilidad: {
    dias:   [{ type: String }],     
    horario:{ type: String, trim: true } 
  },
  avatarUrl: { type: String, trim: true }
}, { timestamps: true, versionKey: false });

export default model('TeacherProfile', teacherProfileSchema);
