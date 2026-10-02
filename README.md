# Lavado · Tareas

App web (pensada para el celular) para controlar el llenado de productos
(lava llantas, espuma y cera) en los puntos de lavado de carros.

**Fase 1:** puntos, personas, tareas de llenado, fotos de evidencia,
reportes de problemas con foto y panel de seguimiento.

## Cómo funciona

- **Administrador**
  - Crea los puntos de lavado. Cada punto trae lava llantas, espuma y cera.
  - Crea a las personas (trabajadores) con un PIN.
  - Crea tareas de llenado: punto + productos + persona + fecha límite.
  - Ve el panel: cuántas tareas hay por estado, las atrasadas, los problemas
    abiertos, la última recarga de cada producto por punto y la actividad de
    cada persona.
  - Marca los problemas como resueltos.
- **Trabajador**
  - Entra con su nombre y PIN y ve solo sus tareas.
  - `Iniciar` → `Terminar con foto` (la foto del producto lleno es obligatoria).
    Al terminar se actualiza la "última recarga" de esos productos en el punto.
  - `Reportar problema`: descripción + foto. La tarea queda "Con problema" y no
    se puede terminar hasta que el administrador lo marque resuelto.

Estados de una tarea: `Pendiente` → `En curso` → `Hecha`, o `Con problema`.

## Tecnología

- `server/`: Node.js + Express + MongoDB (Mongoose). Las fotos se guardan en
  `server/uploads/`.
- `client/`: React + Vite.

## Cómo correrlo en tu computador

Necesitas Node.js 20 o superior y MongoDB (local o MongoDB Atlas).

```bash
# 1. Servidor
cd server
cp .env.example .env      # edita MONGO_URI, TOKEN_SECRET y ADMIN_PIN
npm install
npm run dev               # http://localhost:4000

# 2. App web (en otra terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

La primera vez que arranca el servidor se crea el administrador con
`ADMIN_NOMBRE` y `ADMIN_PIN` (por defecto `Admin` / `1234`). **Cambia ese PIN**
en la pestaña Personas.

### Producción (un solo servidor)

```bash
cd client && npm install && npm run build
cd ../server && npm install && npm start
```

Si existe `client/dist`, el servidor también sirve la app web en el mismo puerto.

## Próximas fases (no incluidas todavía)

- Guardar las fotos en la nube (por ejemplo Cloudinary o S3) para desplegar en
  servicios sin disco permanente, como Render.
- Tareas recurrentes y alertas.
- Reportes por fechas.
- WhatsApp.
