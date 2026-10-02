import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import TarjetaTarea from '../componentes/TarjetaTarea.jsx';
import Aviso from '../componentes/Aviso.jsx';

const ORDEN = { con_problema: 0, en_curso: 1, pendiente: 2, hecha: 3 };

export default function Trabajador() {
  const [tareas, setTareas] = useState([]);
  const [verHechas, setVerHechas] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api('/tareas')
      .then(setTareas)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(cargar, [cargar]);

  const actualizar = (tarea) =>
    setTareas((prev) => prev.map((t) => (t._id === tarea._id ? tarea : t)));

  const visibles = tareas
    .filter((t) => verHechas || t.estado !== 'hecha')
    .sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado] || new Date(a.fechaLimite) - new Date(b.fechaLimite));

  return (
    <main className="contenido">
      <div className="titulo-seccion">
        <h2>Mis tareas</h2>
        <button className="boton-secundario" onClick={cargar}>
          Actualizar
        </button>
      </div>
      <label className="check">
        <input type="checkbox" checked={verHechas} onChange={(e) => setVerHechas(e.target.checked)} />
        Ver también las terminadas
      </label>
      <Aviso error={error} />
      {visibles.length === 0 && <p className="vacio">No tienes tareas pendientes. 🎉</p>}
      {visibles.map((t) => (
        <TarjetaTarea key={t._id} tarea={t} alCambiar={actualizar} />
      ))}
    </main>
  );
}
