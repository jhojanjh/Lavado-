import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { UPLOAD_DIR } from './config.js';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const almacenamiento = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${crypto.randomUUID()}${extension}`);
  }
});

export const subirFoto = multer({
  storage: almacenamiento,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    const error = new Error('El archivo debe ser una imagen.');
    error.name = 'FotoInvalida';
    cb(error);
  }
}).single('foto');

export const urlFoto = (file) => `/uploads/${file.filename}`;
