import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api.js';
import { ESTADOS, diasDesde, formatoFecha } from '../../utilidades.js';
import TarjetaTarea from '../../componentes/TarjetaTarea.jsx';
import Aviso from '../../componentes/Aviso.jsx';

export default function Panel() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api('/panel')
      .then(setDatos)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(cargar, [cargar]);

  if (!datos) return <Aviso error={error} exito={error ? '' : 'Cargando…'} />;

  return (
    <>
      <div className="titulo-seccion">
        <h2>Panel</h2>
        <button className="boton-secundario" onClick={cargar}>
          Actualizar
        </button>
      </div>
      <Aviso error={error} />

      <div className="resumen">
        {Object.entries(ESTADOS).map(([clave, texto]) => (
          <div key={clave} className={`cifra cifra-${clave}`}>
            <span>{datos.porEstado[clave]}</span>
            {texto}
          </div>
        ))}
        <div className="cifra cifra-atrasada">
          <span>{datos.atrasadas.length}</span>
          Atrasadas
        </div>
      </div>

      <section>
        <h3>⚠️ Problemas abiertos</h3>
        {datos.conProblemas.length === 0 && <p className="vacio">No hay problemas abiertos.</p>}
        {datos.conProblemas.map((t) => (
          <TarjetaTarea key={t._id} tarea={t} esAdmin alCambiar={cargar} alEliminar={cargar} />
        ))}
      </section>

      <section>
        <h3>⏰ Tareas atrasadas</h3>
        {datos.atrasadas.length === 0 && <p className="vacio">No hay tareas atrasadas.</p>}
        <ul className="lista">
          {datos.atrasadas.map((t) => (
            <li key={t._id}>
              <strong>{t.punto?.nombre}</strong> · {t.productos.join(', ')} ·{' '}
              {t.asignadoA?.nombre} · venció {formatoFecha(t.fechaLimite)}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>🧴 Última recarga por punto</h3>
        {datos.puntos.length === 0 && <p className="vacio">Aún no hay puntos.</p>}
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Punto</th>
                {datos.puntos[0]?.productos.map((p) => (
                  <th key={p.nombre}>{p.nombre}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.puntos.map((punto) => (
                <tr key={punto._id}>
                  <td>{punto.nombre}</td>
                  {punto.productos.map((p) => {
                    const dias = diasDesde(p.ultimaRecarga);
                    return (
                      <td key={p.nombre} className={dias === null || dias > 7 ? 'texto-alerta' : ''}>
                        {dias === null ? 'Nunca' : dias === 0 ? 'Hoy' : `Hace ${dias} d`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>👷 Actividad por persona</h3>
        {datos.porTrabajador.length === 0 && <p className="vacio">Aún no hay tareas asignadas.</p>}
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Persona</th>
                <th>Asignadas</th>
                <th>Hechas</th>
                <th>Atrasadas</th>
              </tr>
            </thead>
            <tbody>
              {datos.porTrabajador.map((t) => (
                <tr key={t.nombre}>
                  <td>{t.nombre}</td>
                  <td>{t.total}</td>
                  <td>{t.hechas}</td>
                  <td className={t.atrasadas ? 'texto-alerta' : ''}>{t.atrasadas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
