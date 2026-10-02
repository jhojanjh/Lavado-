import { useEffect, useState } from 'react';
import { api, guardarToken } from '../api.js';

export default function Login({ alEntrar }) {
  const [nombres, setNombres] = useState([]);
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/auth/usuarios')
      .then((lista) => {
        setNombres(lista);
        setNombre(lista[0] || '');
      })
      .catch((err) => setError(err.message));
  }, []);

  const entrar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token, usuario } = await api('/auth/login', { metodo: 'POST', datos: { nombre, pin } });
      guardarToken(token);
      alEntrar(usuario);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login">
      <form className="tarjeta" onSubmit={entrar}>
        <h1>🚗 Lavado · Tareas</h1>
        <p>Control de llenado de productos en los puntos de lavado.</p>
        <label>
          ¿Quién eres?
          <select value={nombre} onChange={(e) => setNombre(e.target.value)}>
            {nombres.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </label>
        {error && <div className="aviso aviso-error">{error}</div>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
