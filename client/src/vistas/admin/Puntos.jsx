import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api.js';
import { formatoFecha } from '../../utilidades.js';
import Aviso from '../../componentes/Aviso.jsx';
import EstadoBadge from '../../componentes/EstadoBadge.jsx';

export default function Puntos() {
  const [puntos, setPuntos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', direccion: '' });
  const [historial, setHistorial] = useState({ id: null, tareas: [] });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargar = useCallback(() => {
    api('/puntos')
      .then(setPuntos)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(cargar, [cargar]);

  const crear = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      await api('/puntos', { metodo: 'POST', datos: nuevo });
      setNuevo({ nombre: '', direccion: '' });
      setExito('Punto creado.');
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (punto) => {
    if (!window.confirm(`¿Eliminar ${punto.nombre}?`)) return;
    setError('');
    try {
      await api(`/puntos/${punto._id}`, { metodo: 'DELETE' });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const verHistorial = async (id) => {
    if (historial.id === id) return setHistorial({ id: null, tareas: [] });
    try {
      setHistorial({ id, tareas: await api(`/puntos/${id}/historial`) });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <form className="tarjeta formulario" onSubmit={crear}>
        <h2>Nuevo punto de lavado</h2>
        <label>
          Nombre
          <input
            placeholder="Ej: Punto Centro"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          />
        </label>
        <label>
          Dirección u observaciones (opcional)
          <input
            value={nuevo.direccion}
            onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })}
          />
        </label>
        <Aviso error={error} exito={exito} />
        <button type="submit">Crear punto</button>
      </form>

      <h2>Puntos ({puntos.length})</h2>
      {puntos.length === 0 && <p className="vacio">Aún no hay puntos.</p>}
      {puntos.map((punto) => (
        <article key={punto._id} className="tarjeta">
          <div className="tarjeta-encabezado">
            <h3>{punto.nombre}</h3>
          </div>
          {punto.direccion && <p className="notas">📍 {punto.direccion}</p>}
          <dl className="detalles">
            {punto.productos.map((p) => (
              <div key={p.nombre} className="contents">
                <dt>{p.nombre}</dt>
                <dd>{p.ultimaRecarga ? `Llenado ${formatoFecha(p.ultimaRecarga)}` : 'Sin registro'}</dd>
              </div>
            ))}
          </dl>
          <div className="fila-botones">
            <button className="boton-secundario" onClick={() => verHistorial(punto._id)}>
              {historial.id === punto._id ? 'Ocultar historial' : 'Ver historial'}
            </button>
            <button className="boton-peligro" onClick={() => eliminar(punto)}>
              Eliminar
            </button>
          </div>
          {historial.id === punto._id && (
            <ul className="lista">
              {historial.tareas.length === 0 && <li>Sin tareas todavía.</li>}
              {historial.tareas.map((t) => (
                <li key={t._id}>
                  {formatoFecha(t.createdAt)} · {t.productos.join(', ')} · {t.asignadoA?.nombre}{' '}
                  <EstadoBadge tarea={t} />
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </>
  );
}
