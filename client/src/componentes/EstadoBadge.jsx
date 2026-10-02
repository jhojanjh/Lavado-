import { ESTADOS, estaAtrasada } from '../utilidades.js';

export default function EstadoBadge({ tarea }) {
  return (
    <span className="badges">
      <span className={`badge badge-${tarea.estado}`}>{ESTADOS[tarea.estado]}</span>
      {estaAtrasada(tarea) && <span className="badge badge-atrasada">Atrasada</span>}
    </span>
  );
}
