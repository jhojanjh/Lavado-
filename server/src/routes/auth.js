import { Router } from 'express';
import Usuario from '../models/Usuario.js';
import { crearToken, requiereSesion, verificarPin } from '../auth.js';

const router = Router();

router.get('/usuarios', async (_req, res) => {
  const usuarios = await Usuario.find({ activo: true }).select('nombre').sort('nombre');
  res.json(usuarios.map((u) => u.nombre));
});

router.post('/login', async (req, res) => {
  const { nombre, pin } = req.body;
  const usuario = await Usuario.findOne({ nombre, activo: true });
  if (!usuario || !pin || !verificarPin(pin, usuario.pinHash)) {
    return res.status(401).json({ error: 'Nombre o PIN incorrecto.' });
  }
  res.json({ token: crearToken(usuario), usuario });
});

router.get('/yo', requiereSesion, (req, res) => {
  res.json(req.usuario);
});

export default router;
