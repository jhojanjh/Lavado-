import { useState } from 'react';
import Panel from './admin/Panel.jsx';
import Tareas from './admin/Tareas.jsx';
import Puntos from './admin/Puntos.jsx';
import Personas from './admin/Personas.jsx';

const PESTANAS = [
  ['panel', 'Panel'],
  ['tareas', 'Tareas'],
  ['puntos', 'Puntos'],
  ['personas', 'Personas']
];

export default function Admin({ usuario }) {
  const [pestana, setPestana] = useState('panel');

  return (
    <>
      <nav className="pestanas">
        {PESTANAS.map(([id, texto]) => (
          <button
            key={id}
            className={pestana === id ? 'activa' : ''}
            onClick={() => setPestana(id)}
          >
            {texto}
          </button>
        ))}
      </nav>
      <main className="contenido">
        {pestana === 'panel' && <Panel />}
        {pestana === 'tareas' && <Tareas />}
        {pestana === 'puntos' && <Puntos />}
        {pestana === 'personas' && <Personas usuario={usuario} />}
      </main>
    </>
  );
}
