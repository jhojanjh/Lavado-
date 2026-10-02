import { Router } from 'express';
import Tarea from '../models/Tarea.js';
import Punto from '../models/Punto.js';
import { ESTADOS } from '../config.js';

const router = Router();

router.get('/', async (_req, res) => {
  const ahora = new Date();

  const conteos = await Tarea.aggregate([{ $group: { _id: '$estado', total: { $sum: 1 } } }]);
  const porEstado = Object.fromEntries(ESTADOS.map((e) => [e, 0]));
  conteos.forEach((c) => {
    porEstado[c._id] = c.total;
  });

  const atrasadas = await Tarea.find({ estado: { $ne: 'hecha' }, fechaLimite: { $lt: ahora } })
    .populate('punto', 'nombre')
    .populate('asignadoA', 'nombre')
    .sort({ fechaLimite: 1 })
    .limit(50);

  const conProblemas = await Tarea.find({ 'problemas.resuelto': false })
    .populate('punto', 'nombre')
    .populate('asignadoA', 'nombre')
    .populate('problemas.reportadoPor', 'nombre')
    .sort({ updatedAt: -1 })
    .limit(50);

  const porTrabajador = await Tarea.aggregate([
    {
      $group: {
        _id: '$asignadoA',
        total: { $sum: 1 },
        hechas: { $sum: { $cond: [{ $eq: ['$estado', 'hecha'] }, 1, 0] } },
        atrasadas: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ['$estado', 'hecha'] }, { $lt: ['$fechaLimite', ahora] }] },
              1,
              0
            ]
          }
        }
      }
    },
    { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'usuario' } },
    { $unwind: '$usuario' },
    { $project: { _id: 0, nombre: '$usuario.nombre', total: 1, hechas: 1, atrasadas: 1 } },
    { $sort: { nombre: 1 } }
  ]);

  const puntos = await Punto.find().sort('nombre');

  res.json({ porEstado, atrasadas, conProblemas, porTrabajador, puntos });
});

export default router;
