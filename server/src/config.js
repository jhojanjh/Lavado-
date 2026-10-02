import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_SERVIDOR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/lavado-tareas';
export const PORT = Number(process.env.PORT) || 4000;
export const TOKEN_SECRET = process.env.TOKEN_SECRET || 'solo-para-desarrollo';
export const ADMIN_NOMBRE = process.env.ADMIN_NOMBRE || 'Admin';
export const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
export const UPLOAD_DIR = path.resolve(RAIZ_SERVIDOR, process.env.UPLOAD_DIR || 'uploads');
export const CLIENT_DIST = path.resolve(RAIZ_SERVIDOR, '../client/dist');

export const PRODUCTOS = ['Lava llantas', 'Espuma', 'Cera'];
export const ESTADOS = ['pendiente', 'en_curso', 'hecha', 'con_problema'];
