export const PRODUCTOS = ['Lava llantas', 'Espuma', 'Cera'];

export const ESTADOS = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  hecha: 'Hecha',
  con_problema: 'Con problema'
};

export const formatoFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleString('es-CO', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit'
      })
    : '—';

export const diasDesde = (fecha) => {
  if (!fecha) return null;
  return Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
};

export const estaAtrasada = (tarea) =>
  tarea.estado !== 'hecha' && new Date(tarea.fechaLimite) < new Date();

export const fechaLocalParaInput = (fecha) => {
  const d = new Date(fecha);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
