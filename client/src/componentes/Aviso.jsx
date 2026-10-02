export default function Aviso({ error, exito }) {
  if (error) return <div className="aviso aviso-error">{error}</div>;
  if (exito) return <div className="aviso aviso-exito">{exito}</div>;
  return null;
}
