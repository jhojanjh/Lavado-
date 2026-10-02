import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { ADMIN_NOMBRE, ADMIN_PIN, CLIENT_DIST, MONGO_URI, PORT, UPLOAD_DIR } from './config.js';
import { hashPin, requiereAdmin, requiereSesion } from './auth.js';
import Usuario from './models/Usuario.js';
import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import puntosRoutes from './routes/puntos.js';
import tareasRoutes from './routes/tareas.js';
import panelRoutes from './routes/panel.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', requiereSesion, requiereAdmin, usuariosRoutes);
app.use('/api/puntos', requiereSesion, puntosRoutes);
app.use('/api/tareas', requiereSesion, tareasRoutes);
app.use('/api/panel', requiereSesion, requiereAdmin, panelRoutes);

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

const ERRORES_DEL_USUARIO = {
  CastError: 'Dato no válido.',
  ValidationError: 'Faltan datos o no son válidos.',
  MulterError: 'La foto no es válida o pesa más de 15 MB.',
  FotoInvalida: 'El archivo debe ser una imagen.'
};

app.use((err, _req, res, _next) => {
  const mensaje = ERRORES_DEL_USUARIO[err.name];
  if (mensaje) return res.status(400).json({ error: mensaje });
  console.error(err);
  res.status(500).json({ error: 'Error en el servidor.' });
});

const crearAdminInicial = async () => {
  if (await Usuario.exists({ rol: 'admin' })) return;
  await Usuario.create({ nombre: ADMIN_NOMBRE, pinHash: hashPin(ADMIN_PIN), rol: 'admin' });
  console.log(`👤 Administrador inicial creado: ${ADMIN_NOMBRE} (cambia su PIN)`);
};

await mongoose.connect(MONGO_URI);
console.log('✅ Conectado a MongoDB');
await crearAdminInicial();

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
