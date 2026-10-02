import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api.js';
import { ESTADOS, PRODUCTOS, fechaLocalParaInput } from '../../utilidades.js';
import TarjetaTarea from '../../componentes/TarjetaTarea.jsx';
import Aviso from '../../componentes/Aviso.jsx';

const mananaAlMediodia = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return fechaLocalParaInput(d);
};

export default function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [filtros, setFiltros] = useState({ estado: '', punto: '', asignadoA: '' });
  const [nueva, setNueva] = useState({
    punto: '',
    productos: [],
    asignadoA: '',
    fechaLimite: mananaAlMediodia(),
    notas: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargarTareas = useCallback(() => {
    const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v));
    api(`/tareas?${params}`)
      .then(setTareas)
      .catch((err) => setError(err.message));
  }, [filtros]);

  useEffect(cargarTareas, [cargarTareas]);

  useEffect(() => {
    Promise.all([api('/puntos'), api('/usuarios')])
      .then(([listaPuntos, listaPersonas]) => {
        setPuntos(listaPuntos);
        setPersonas(listaPersonas.filter((p) => p.activo));
      })
      .catch((err) => setError(err.message));
  }, []);

  const alternarProducto = (producto) =>
    setNueva((n) => ({
      ...n,
      productos: n.productos.includes(producto)
        ? n.productos.filter((p) => p !== producto)
        : [...n.productos, producto]
    }));

  const crear = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      await api('/tareas', {
        metodo: 'POST',
        datos: { ...nueva, fechaLimite: new Date(nueva.fechaLimite).toISOString() }
      });
      setNueva((n) => ({ ...n, productos: [], notas: '' }));
      setExito('Tarea creada y asignada.');
      cargarTareas();
    } catch (err) {
      setError(err.message);
    }
  };

  const actualizar = (tarea) =>
    setTareas((prev) => prev.map((t) => (t._id === tarea._id ? tarea : t)));
  const quitar = (id) => setTareas((prev) => prev.filter((t) => t._id !== id));

  return (
    <>
      <form className="tarjeta formulario" onSubmit={crear}>
        <h2>Nueva tarea de llenado</h2>
        {puntos.length === 0 && (
          <p className="vacio">Primero crea un punto en la pestaña “Puntos”.</p>
        )}
        <label>
          Punto
          <select value={nueva.punto} onChange={(e) => setNueva({ ...nueva, punto: e.target.value })}>
            <option value="">Elige un punto…</option>
            {puntos.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Productos a llenar</legend>
          {PRODUCTOS.map((p) => (
            <label key={p} className="check">
              <input
                type="checkbox"
                checked={nueva.productos.includes(p)}
                onChange={() => alternarProducto(p)}
              />
              {p}
            </label>
          ))}
        </fieldset>
        <label>
          Asignar a
          <select
            value={nueva.asignadoA}
            onChange={(e) => setNueva({ ...nueva, asignadoA: e.target.value })}
          >
            <option value="">Elige una persona…</option>
            {personas.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre}
                {p.rol === 'admin' ? ' (admin)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fecha límite
          <input
            type="datetime-local"
            value={nueva.fechaLimite}
            onChange={(e) => setNueva({ ...nueva, fechaLimite: e.target.value })}
          />
        </label>
        <label>
          Notas (opcional)
          <textarea
            rows={2}
            value={nueva.notas}
            onChange={(e) => setNueva({ ...nueva, notas: e.target.value })}
          />
        </label>
        <Aviso error={error} exito={exito} />
        <button type="submit">Crear tarea</button>
      </form>

      <div className="titulo-seccion">
        <h2>Todas las tareas</h2>
      </div>
      <div className="filtros">
        <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([clave, texto]) => (
            <option key={clave} value={clave}>
              {texto}
            </option>
          ))}
        </select>
        <select value={filtros.punto} onChange={(e) => setFiltros({ ...filtros, punto: e.target.value })}>
          <option value="">Todos los puntos</option>
          {puntos.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nombre}
            </option>
          ))}
        </select>
        <select
          value={filtros.asignadoA}
          onChange={(e) => setFiltros({ ...filtros, asignadoA: e.target.value })}
        >
          <option value="">Todas las personas</option>
          {personas.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>
      {tareas.length === 0 && <p className="vacio">No hay tareas con estos filtros.</p>}
      {tareas.map((t) => (
        <TarjetaTarea key={t._id} tarea={t} esAdmin alCambiar={actualizar} alEliminar={quitar} />
      ))}
    </>
  );
}
