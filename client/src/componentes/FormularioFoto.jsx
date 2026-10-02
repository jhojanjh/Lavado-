import { useEffect, useState } from 'react';

export default function FormularioFoto({
  titulo,
  textoBoton,
  pedirDescripcion = false,
  alEnviar,
  alCancelar
}) {
  const [foto, setFoto] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [vistaPrevia, setVistaPrevia] = useState(null);

  useEffect(() => {
    if (!foto) return setVistaPrevia(null);
    const url = URL.createObjectURL(foto);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const enviar = async (e) => {
    e.preventDefault();
    if (pedirDescripcion && !descripcion.trim()) return setError('Describe el problema.');
    if (!foto) return setError('Toma o elige una foto.');
    const formulario = new FormData();
    formulario.append('foto', foto);
    if (pedirDescripcion) formulario.append('descripcion', descripcion.trim());
    setEnviando(true);
    setError('');
    try {
      await alEnviar(formulario);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <form className="formulario-foto" onSubmit={enviar}>
      <strong>{titulo}</strong>
      {pedirDescripcion && (
        <textarea
          placeholder="¿Qué pasó? Ej: fuga en la manguera de espuma"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
        />
      )}
      <label className="selector-foto">
        📷 {foto ? 'Cambiar foto' : 'Tomar foto'}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
        />
      </label>
      {vistaPrevia && <img className="vista-previa" src={vistaPrevia} alt="Vista previa" />}
      {error && <div className="aviso aviso-error">{error}</div>}
      <div className="fila-botones">
        <button type="button" className="boton-secundario" onClick={alCancelar}>
          Cancelar
        </button>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando…' : textoBoton}
        </button>
      </div>
    </form>
  );
}
