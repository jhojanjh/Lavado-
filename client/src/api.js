const CLAVE_TOKEN = 'lavado-token';

export const guardarToken = (token) => localStorage.setItem(CLAVE_TOKEN, token);
export const borrarToken = () => localStorage.removeItem(CLAVE_TOKEN);
export const hayToken = () => Boolean(localStorage.getItem(CLAVE_TOKEN));

export async function api(ruta, { metodo = 'GET', datos, formulario } = {}) {
  const headers = {};
  const token = localStorage.getItem(CLAVE_TOKEN);
  if (token) headers.Authorization = `Bearer ${token}`;

  let body;
  if (formulario) body = formulario;
  else if (datos !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(datos);
  }

  const res = await fetch(`/api${ruta}`, { method: metodo, headers, body });
  if (res.status === 204) return null;
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) borrarToken();
  if (!res.ok) throw new Error(json.error || 'Ocurrió un error. Intenta de nuevo.');
  return json;
}
