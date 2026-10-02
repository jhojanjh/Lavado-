import { Router } from 'express';
import Usuario from '../models/Usuario.js';
import { hashPin } from '../auth.js';

const router = Router();

const pinValido = (pin) => /^\d{4,8}$/.test(String(pin || ''));

router.get('/', async (_req, res) => {
  res.json(await Usuario.find().sort({ rol: 1, nombre: 1 }));
});

router.post('/', async (req, res) => {
  const { nombre, pin, rol } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'Escribe el nombre.' });
  if (!pinValido(pin)) {
    return res.status(400).json({ error: 'El PIN debe tener entre 4 y 8 números.' });
  }
  if (await Usuario.exists({ nombre: nombre.trim() })) {
    return res.status(400).json({ error: 'Ya existe una persona con ese nombre.' });
  }
  const usuario = await Usuario.create({
    nombre: nombre.trim(),
    pinHash: hashPin(pin),
    rol: rol === 'admin' ? 'admin' : 'trabajador'
  });
  res.status(201).json(usuario);
});

router.patch('/:id', async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'Persona no encontrada.' });

  const { activo, pin } = req.body;
  if (typeof activo === 'boolean') {
    if (!activo && usuario.id === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes desactivarte a ti mismo.' });
    }
    usuario.activo = activo;
  }
  if (pin !== undefined) {
    if (!pinValido(pin)) {
      return res.status(400).json({ error: 'El PIN debe tener entre 4 y 8 números.' });
    }
    usuario.pinHash = hashPin(pin);
  }
  await usuario.save();
  res.json(usuario);
});

export default router;
