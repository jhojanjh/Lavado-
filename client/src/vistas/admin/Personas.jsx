import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api.js';
import Aviso from '../../componentes/Aviso.jsx';

export default function Personas({ usuario }) {
  const [personas, setPersonas] = useState([]);
  const [nueva, setNueva] = useState({ nombre: '', pin: '', rol: 'trabajador' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargar = useCallback(() => {
    api('/usuarios')
      .then(setPersonas)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(cargar, [cargar]);

  const ejecutar = async (accion, mensaje) => {
    setError('');
    setExito('');
    try {
      await accion();
      setExito(mensaje);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const crear = (e) => {
    e.preventDefault();
    ejecutar(async () => {
      await api('/usuarios', { metodo: 'POST', datos: nueva });
      setNueva({ nombre: '', pin: '', rol: 'trabajador' });
    }, 'Persona creada.');
  };

  const cambiarPin = (persona) => {
    const pin = window.prompt(`Nuevo PIN para ${persona.nombre} (4 a 8 números):`);
    if (pin === null) return;
    ejecutar(() => api(`/usuarios/${persona._id}`, { metodo: 'PATCH', datos: { pin } }), 'PIN cambiado.');
  };

  const alternarActivo = (persona) =>
    ejecutar(
      () => api(`/usuarios/${persona._id}`, { metodo: 'PATCH', datos: { activo: !persona.activo } }),
      persona.activo ? 'Persona desactivada.' : 'Persona activada.'
    );

  return (
    <>
      <form className="tarjeta formulario" onSubmit={crear}>
        <h2>Nueva persona</h2>
        <label>
          Nombre
          <input value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} />
        </label>
        <label>
          PIN (4 a 8 números)
          <input
            inputMode="numeric"
            value={nueva.pin}
            onChange={(e) => setNueva({ ...nueva, pin: e.target.value })}
          />
        </label>
        <label>
          Rol
          <select value={nueva.rol} onChange={(e) => setNueva({ ...nueva, rol: e.target.value })}>
            <option value="trabajador">Trabajador</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        <Aviso error={error} exito={exito} />
        <button type="submit">Crear persona</button>
      </form>

      <h2>Personas</h2>
      {personas.map((p) => (
        <article key={p._id} className={`tarjeta fila-persona ${p.activo ? '' : 'inactiva'}`}>
          <div>
            <strong>{p.nombre}</strong>
            <small>
              {p.rol === 'admin' ? 'Administrador' : 'Trabajador'}
              {p.activo ? '' : ' · Desactivado'}
            </small>
          </div>
          <div className="fila-botones">
            <button className="boton-secundario" onClick={() => cambiarPin(p)}>
              Cambiar PIN
            </button>
            {p._id !== usuario._id && (
              <button className="boton-secundario" onClick={() => alternarActivo(p)}>
                {p.activo ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </div>
        </article>
      ))}
    </>
  );
}
