import mongoose from 'mongoose';
import { PRODUCTOS } from '../config.js';

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    ultimaRecarga: { type: Date, default: null }
  },
  { _id: false }
);

const puntoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    direccion: { type: String, default: '', trim: true },
    productos: {
      type: [productoSchema],
      default: () => PRODUCTOS.map((nombre) => ({ nombre }))
    }
  },
  { timestamps: true }
);

export default mongoose.model('Punto', puntoSchema);
