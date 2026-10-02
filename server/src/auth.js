import crypto from 'node:crypto';
import { TOKEN_SECRET } from './config.js';
import Usuario from './models/Usuario.js';

const DURACION_SESION_MS = 30 * 24 * 60 * 60 * 1000;

export const hashPin = (pin) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(pin), salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verificarPin = (pin, pinHash) => {
  const [salt, hash] = pinHash.split(':');
  const calculado = crypto.scryptSync(String(pin), salt, 64);
  const guardado = Buffer.from(hash, 'hex');
  return guardado.length === calculado.length && crypto.timingSafeEqual(calculado, guardado);
};

const firmar = (datos) =>
  crypto.createHmac('sha256', TOKEN_SECRET).update(datos).digest('base64url');

export const crearToken = (usuario) => {
  const datos = Buffer.from(
    JSON.stringify({ id: usuario.id, exp: Date.now() + DURACION_SESION_MS })
  ).toString('base64url');
  return `${datos}.${firmar(datos)}`;
};

const leerToken = (token) => {
  const [datos, firma] = String(token).split('.');
  if (!datos || !firma) return null;
  const esperada = Buffer.from(firmar(datos));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length) return null;
  if (!crypto.timingSafeEqual(esperada, recibida)) return null;
  try {
    const { id, exp } = JSON.parse(Buffer.from(datos, 'base64url').toString());
    return exp > Date.now() ? id : null;
  } catch {
    return null;
  }
};

export const requiereSesion = async (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const id = token ? leerToken(token) : null;
  const usuario = id ? await Usuario.findById(id) : null;
  if (!usuario || !usuario.activo) {
    return res.status(401).json({ error: 'Sesión no válida. Vuelve a entrar.' });
  }
  req.usuario = usuario;
  next();
};

export const requiereAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo el administrador puede hacer esto.' });
  }
  next();
};
