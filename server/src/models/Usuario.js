import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    pinHash: { type: String, required: true },
    rol: { type: String, enum: ['admin', 'trabajador'], default: 'trabajador' },
    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

usuarioSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.pinHash;
    return ret;
  }
});

export default mongoose.model('Usuario', usuarioSchema);
