import mongoose from 'mongoose';
import { ESTADOS } from '../config.js';

const problemaSchema = new mongoose.Schema(
  {
    descripcion: { type: String, required: true, trim: true },
    foto: { type: String, required: true },
    reportadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    resuelto: { type: Boolean, default: false },
    resueltoEn: { type: Date, default: null }
  },
  { timestamps: true }
);

const tareaSchema = new mongoose.Schema(
  {
    punto: { type: mongoose.Schema.Types.ObjectId, ref: 'Punto', required: true },
    productos: { type: [String], required: true },
    asignadoA: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    creadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fechaLimite: { type: Date, required: true },
    notas: { type: String, default: '', trim: true },
    estado: { type: String, enum: ESTADOS, default: 'pendiente' },
    iniciadaEn: { type: Date, default: null },
    completadaEn: { type: Date, default: null },
    fotoEvidencia: { type: String, default: null },
    problemas: { type: [problemaSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model('Tarea', tareaSchema);
