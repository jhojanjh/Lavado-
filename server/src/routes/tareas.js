import { Router } from 'express';
import Tarea from '../models/Tarea.js';
import Punto from '../models/Punto.js';
import Usuario from '../models/Usuario.js';
import { requiereAdmin } from '../auth.js';
import { subirFoto, urlFoto } from '../fotos.js';
import { ESTADOS, PRODUCTOS } from '../config.js';

const router = Router();

const conDatos = (consulta) =>
  consulta.populate('punto', 'nombre direccion').populate('asignadoA', 'nombre');

const buscarTareaPropia = async (req, res) => {
  const tarea = await Tarea.findById(req.params.id);
  if (!tarea) {
    res.status(404).json({ error: 'Tarea no encontrada.' });
    return null;
  }
  const esAdmin = req.usuario.rol === 'admin';
  if (!esAdmin && String(tarea.asignadoA) !== req.usuario.id) {
    res.status(403).json({ error: 'Esta tarea no está asignada a ti.' });
    return null;
  }
  return tarea;
};

router.get('/', async (req, res) => {
  const filtro = {};
  if (req.usuario.rol !== 'admin') filtro.asignadoA = req.usuario.id;
  else if (req.query.asignadoA) filtro.asignadoA = req.query.asignadoA;
  if (ESTADOS.includes(req.query.estado)) filtro.estado = req.query.estado;
  if (req.query.punto) filtro.punto = req.query.punto;

  const tareas = await conDatos(Tarea.find(filtro))
    .populate('problemas.reportadoPor', 'nombre')
    .sort({ fechaLimite: 1 })
    .limit(300);
  res.json(tareas);
});

router.post('/', requiereAdmin, async (req, res) => {
  const { punto, productos, asignadoA, fechaLimite, notas } = req.body;
  const productosValidos = (productos || []).filter((p) => PRODUCTOS.includes(p));

  if (!(await Punto.exists({ _id: punto }))) {
    return res.status(400).json({ error: 'Elige un punto.' });
  }
  if (productosValidos.length === 0) {
    return res.status(400).json({ error: 'Elige al menos un producto.' });
  }
  if (!(await Usuario.exists({ _id: asignadoA, activo: true }))) {
    return res.status(400).json({ error: 'Elige a quién se le asigna.' });
  }
  if (!fechaLimite || Number.isNaN(Date.parse(fechaLimite))) {
    return res.status(400).json({ error: 'Elige la fecha límite.' });
  }

  const tarea = await Tarea.create({
    punto,
    productos: productosValidos,
    asignadoA,
    fechaLimite,
    notas,
    creadaPor: req.usuario.id
  });
  res.status(201).json(await conDatos(Tarea.findById(tarea.id)));
});

router.post('/:id/iniciar', async (req, res) => {
  const tarea = await buscarTareaPropia(req, res);
  if (!tarea) return;
  if (tarea.estado !== 'pendiente') {
    return res.status(400).json({ error: 'Solo se pueden iniciar tareas pendientes.' });
  }
  tarea.estado = 'en_curso';
  tarea.iniciadaEn = new Date();
  await tarea.save();
  res.json(await conDatos(Tarea.findById(tarea.id)));
});

router.post('/:id/completar', subirFoto, async (req, res) => {
  const tarea = await buscarTareaPropia(req, res);
  if (!tarea) return;
  if (tarea.estado === 'hecha') {
    return res.status(400).json({ error: 'Esta tarea ya está terminada.' });
  }
  if (tarea.problemas.some((p) => !p.resuelto)) {
    return res
      .status(400)
      .json({ error: 'Hay un problema sin resolver. El administrador debe revisarlo primero.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Toma una foto del producto lleno para terminar.' });
  }

  const ahora = new Date();
  tarea.estado = 'hecha';
  tarea.iniciadaEn = tarea.iniciadaEn || ahora;
  tarea.completadaEn = ahora;
  tarea.fotoEvidencia = urlFoto(req.file);
  await tarea.save();

  await Punto.updateOne(
    { _id: tarea.punto },
    { $set: { 'productos.$[p].ultimaRecarga': ahora } },
    { arrayFilters: [{ 'p.nombre': { $in: tarea.productos } }] }
  );

  res.json(await conDatos(Tarea.findById(tarea.id)));
});

router.post('/:id/problemas', subirFoto, async (req, res) => {
  const tarea = await buscarTareaPropia(req, res);
  if (!tarea) return;
  const descripcion = (req.body.descripcion || '').trim();
  if (!descripcion) return res.status(400).json({ error: 'Describe el problema.' });
  if (!req.file) return res.status(400).json({ error: 'Toma una foto del problema.' });

  tarea.problemas.push({
    descripcion,
    foto: urlFoto(req.file),
    reportadoPor: req.usuario.id
  });
  if (tarea.estado !== 'hecha') tarea.estado = 'con_problema';
  await tarea.save();
  res.status(201).json(await conDatos(Tarea.findById(tarea.id)));
});

router.post('/:id/problemas/:problemaId/resolver', requiereAdmin, async (req, res) => {
  const tarea = await Tarea.findById(req.params.id);
  const problema = tarea?.problemas.id(req.params.problemaId);
  if (!problema) return res.status(404).json({ error: 'Problema no encontrado.' });

  problema.resuelto = true;
  problema.resueltoEn = new Date();
  if (tarea.estado === 'con_problema' && tarea.problemas.every((p) => p.resuelto)) {
    tarea.estado = tarea.iniciadaEn ? 'en_curso' : 'pendiente';
  }
  await tarea.save();
  res.json(await conDatos(Tarea.findById(tarea.id)));
});

router.delete('/:id', requiereAdmin, async (req, res) => {
  await Tarea.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
