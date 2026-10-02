import { useEffect, useState } from 'react';
import { api, borrarToken, hayToken } from './api.js';
import Login from './vistas/Login.jsx';
import Admin from './vistas/Admin.jsx';
import Trabajador from './vistas/Trabajador.jsx';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(hayToken());

  useEffect(() => {
    if (!hayToken()) return;
    api('/auth/yo')
      .then(setUsuario)
      .catch(() => borrarToken())
      .finally(() => setCargando(false));
  }, []);

  const salir = () => {
    borrarToken();
    setUsuario(null);
  };

  if (cargando) return <p className="centrado">Cargando…</p>;
  if (!usuario) return <Login alEntrar={setUsuario} />;

  return (
    <div className="app">
      <header className="barra">
        <div>
          <strong>🚗 Lavado · Tareas</strong>
          <span className="barra-usuario">
            {usuario.nombre} · {usuario.rol === 'admin' ? 'Administrador' : 'Trabajador'}
          </span>
        </div>
        <button className="boton-secundario" onClick={salir}>
          Salir
        </button>
      </header>
      {usuario.rol === 'admin' ? <Admin usuario={usuario} /> : <Trabajador />}
    </div>
  );
}
