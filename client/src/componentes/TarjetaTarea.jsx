import { useState } from 'react';
import { api } from '../api.js';
import { formatoFecha } from '../utilidades.js';
import EstadoBadge from './EstadoBadge.jsx';
import FormularioFoto from './FormularioFoto.jsx';

export default function TarjetaTarea({ tarea, esAdmin, alCambiar, alEliminar }) {
  const [modo, setModo] = useState(null);
  const [error, setError] = useState('');
  const problemasAbiertos = tarea.problemas.filter((p) => !p.resuelto);

  const accion = async (ruta, opciones) => {
    setError('');
    try {
      const actualizada = await api(`/tareas/${tarea._id}${ruta}`, { metodo: 'POST', ...opciones });
      setModo(null);
      alCambiar(actualizada);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const eliminar = async () => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      await api(`/tareas/${tarea._id}`, { metodo: 'DELETE' });
      alEliminar(tarea._id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <article className="tarjeta">
      <div className="tarjeta-encabezado">
        <h3>{tarea.punto?.nombre || 'Punto eliminado'}</h3>
        <EstadoBadge tarea={tarea} />
      </div>
      <p className="productos">{tarea.productos.join(' · ')}</p>
      <dl className="detalles">
        <dt>Asignada a</dt>
        <dd>{tarea.asignadoA?.nombre || '—'}</dd>
        <dt>Fecha límite</dt>
        <dd>{formatoFecha(tarea.fechaLimite)}</dd>
        {tarea.completadaEn && (
          <>
            <dt>Terminada</dt>
            <dd>{formatoFecha(tarea.completadaEn)}</dd>
          </>
        )}
      </dl>
      {tarea.notas && <p className="notas">📝 {tarea.notas}</p>}

      {tarea.fotoEvidencia && (
        <a href={tarea.fotoEvidencia} target="_blank" rel="noreferrer">
          <img className="foto" src={tarea.fotoEvidencia} alt="Evidencia de llenado" />
        </a>
      )}

      {tarea.problemas.length > 0 && (
        <div className="problemas">
          {tarea.problemas.map((p) => (
            <div key={p._id} className={`problema ${p.resuelto ? 'resuelto' : ''}`}>
              <a href={p.foto} target="_blank" rel="noreferrer">
                <img src={p.foto} alt="Foto del problema" />
              </a>
              <div>
                <strong>{p.resuelto ? '✅ Resuelto' : '⚠️ Problema'}</strong>
                <p>{p.descripcion}</p>
                <small>
                  {p.reportadoPor?.nombre ? `${p.reportadoPor.nombre} · ` : ''}
                  {formatoFecha(p.createdAt)}
                </small>
                {esAdmin && !p.resuelto && (
                  <button
                    className="boton-pequeno"
                    onClick={() => accion(`/problemas/${p._id}/resolver`).catch(() => {})}
                  >
                    Marcar resuelto
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="aviso aviso-error">{error}</div>}

      {modo === 'completar' && (
        <FormularioFoto
          titulo="Foto del producto lleno"
          textoBoton="Terminar tarea"
          alEnviar={(formulario) => accion('/completar', { formulario })}
          alCancelar={() => setModo(null)}
        />
      )}
      {modo === 'problema' && (
        <FormularioFoto
          titulo="Reportar problema"
          textoBoton="Enviar reporte"
          pedirDescripcion
          alEnviar={(formulario) => accion('/problemas', { formulario })}
          alCancelar={() => setModo(null)}
        />
      )}

      {!modo && (
        <div className="fila-botones">
          {!esAdmin && tarea.estado === 'pendiente' && (
            <button onClick={() => accion('/iniciar').catch(() => {})}>Iniciar</button>
          )}
          {!esAdmin && tarea.estado === 'en_curso' && (
            <button onClick={() => setModo('completar')}>Terminar con foto</button>
          )}
          {!esAdmin && tarea.estado !== 'hecha' && problemasAbiertos.length === 0 && (
            <button className="boton-alerta" onClick={() => setModo('problema')}>
              Reportar problema
            </button>
          )}
          {esAdmin && (
            <button className="boton-peligro" onClick={eliminar}>
              Eliminar
            </button>
          )}
        </div>
      )}
    </article>
  );
}
