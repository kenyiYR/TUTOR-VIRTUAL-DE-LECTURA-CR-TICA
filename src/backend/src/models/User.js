import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true, minlength: 2 },
    email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    rol:    { type: String, enum: ['estudiante','docente','admin'], default: 'estudiante' }
  },
  { timestamps: true, versionKey: false }
);

// ocultar hash al serializar
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default model('User', userSchema);
