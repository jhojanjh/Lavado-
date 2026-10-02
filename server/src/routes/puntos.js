import { Router } from 'express';
import Punto from '../models/Punto.js';
import Tarea from '../models/Tarea.js';
import { requiereAdmin } from '../auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  res.json(await Punto.find().sort('nombre'));
});

router.post('/', requiereAdmin, async (req, res) => {
  const { nombre, direccion } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'Escribe el nombre del punto.' });
  if (await Punto.exists({ nombre: nombre.trim() })) {
    return res.status(400).json({ error: 'Ya existe un punto con ese nombre.' });
  }
  res.status(201).json(await Punto.create({ nombre, direccion }));
});

router.put('/:id', requiereAdmin, async (req, res) => {
  const { nombre, direccion } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'Escribe el nombre del punto.' });
  const punto = await Punto.findByIdAndUpdate(
    req.params.id,
    { nombre, direccion },
    { new: true, runValidators: true }
  );
  if (!punto) return res.status(404).json({ error: 'Punto no encontrado.' });
  res.json(punto);
});

router.delete('/:id', requiereAdmin, async (req, res) => {
  if (await Tarea.exists({ punto: req.params.id })) {
    return res
      .status(400)
      .json({ error: 'Este punto tiene tareas registradas; no se puede eliminar.' });
  }
  await Punto.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

router.get('/:id/historial', requiereAdmin, async (req, res) => {
  const tareas = await Tarea.find({ punto: req.params.id })
    .populate('asignadoA', 'nombre')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(tareas);
});

export default router;
