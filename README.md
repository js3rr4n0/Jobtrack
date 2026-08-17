# Jobtrack

Tablero gamificado para registrar ofertas de empleo, seguir su avance y mantener
la informacion sincronizada entre la computadora y el telefono.

![Tablero kanban de Jobtrack en tema claro](docs/capturas/tablero-claro.jpg)

## Que incluye

- **Tablero kanban** con seis estados y arrastre de tarjetas entre columnas.
- **Captura manual** de empresa, puesto, ubicacion, modalidad, prioridad,
  expectativa salarial, enlace, notas y fechas de postulacion y entrevista.
- **Capa de juego**: experiencia, niveles con rango, racha diaria y ocho logros.
- **Ocho temas visuales** y **dos paquetes de iconos** SVG intercambiables.
- **Sincronizacion en vivo** por WebSockets entre todos los dispositivos de la
  misma cuenta.

## Capturas

### Temas

El mismo tablero cambia por completo de personalidad sin tocar el markup: cada
tema redefine el mismo conjunto de variables CSS.

| Oscuro | Galaxy |
| --- | --- |
| ![Tema oscuro](docs/capturas/tablero-oscuro.jpg) | ![Tema galaxy](docs/capturas/tablero-galaxy.jpg) |

| Pixel rosa (con iconos pixel) | Gaming |
| --- | --- |
| ![Tema pixel rosa](docs/capturas/tablero-pixel-rosa.jpg) | ![Tema gaming](docs/capturas/tablero-gaming.jpg) |

### Selector de apariencia

Ocho temas agrupados en familias y dos paquetes de iconos, con vista previa.

![Panel de apariencia con los ocho temas y los dos paquetes de iconos](docs/capturas/temas.jpg)

### Movil

En pantallas pequenas las columnas se apilan y el panel de progreso sube al
inicio. El selector de estado de cada tarjeta sustituye al arrastre.

<img src="docs/capturas/movil-tablero.jpg" alt="Tablero en un telefono con tema anime" width="360">

### Bienvenida y acceso

| Pagina de inicio | Inicio de sesion |
| --- | --- |
| ![Pagina de bienvenida](docs/capturas/inicio.jpg) | ![Formulario de acceso](docs/capturas/acceso.jpg) |

## Arquitectura

```
Jobtrack/
  apps/
    api/                 API NestJS 10 (REST + WebSockets)
    web/                 Interfaz Next.js 14 (App Router) + Tailwind CSS 3
  packages/
    contracts/           Tipos y reglas de dominio compartidos
  supabase/
    schema.sql           Esquema PostgreSQL con RLS
  docs/
    MANUAL_USUARIO.md    Guia paso a paso
    MANUAL_TECNICO.md    Arquitectura, modulos y convenciones
    PLAN_DE_PRUEBAS.md   Casos, restricciones y resultados esperados
    capturas/            Imagenes de este README
```

Las reglas de dominio viven en `packages/contracts` y las consumen tanto la API
como la web. Gracias a eso el reordenamiento optimista del navegador y el que
persiste el servidor invocan la **misma** funcion, asi que no pueden divergir.

El detalle de cada modulo esta en [`docs/MANUAL_TECNICO.md`](docs/MANUAL_TECNICO.md).

## Stack

| Capa | Tecnologia |
| --- | --- |
| Interfaz | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3 |
| Arrastre | dnd-kit (puntero y teclado) |
| API | NestJS 10, class-validator, Socket.IO, Helmet |
| Autenticacion | Supabase Auth (correo y contrasena), JWT verificado en la API |
| Base de datos | PostgreSQL 15 gestionado por Supabase, con Row Level Security |
| Pruebas | Vitest y Testing Library en la web, Jest y Supertest en la API |

## Puesta en marcha

Requisitos: Node.js 20 o superior.

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Arranca los dos procesos en terminales separadas:

```bash
npm run dev:api    # http://localhost:4000/api
npm run dev:web    # http://localhost:3000
```

Con la configuracion de ejemplo la API usa el driver `memory`, asi que arranca
sin credenciales externas. Para persistir en PostgreSQL, ejecuta
`supabase/schema.sql` en tu proyecto de Supabase y completa en `apps/api/.env`:

```
DATA_DRIVER=supabase
SUPABASE_URL=https://<proyecto>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<clave de servicio>
SUPABASE_JWT_SECRET=<secreto JWT del proyecto>
```

Y en `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave publica>
```

## Comandos

| Comando | Efecto |
| --- | --- |
| `npm run build` | Compila el paquete compartido, la API y la web |
| `npm test` | Ejecuta las suites de los tres paquetes |
| `npm run test:unit` | Solo pruebas unitarias |
| `npm run test:integration` | Solo pruebas de integracion |
| `npm run lint` | Analisis estatico de la API y la web |

## Pruebas

175 casos, todos en verde y sin dependencias de red externas:

| Paquete | Herramienta | Casos |
| --- | --- | --- |
| `contracts` | Vitest | 44 |
| `api` | Jest y Supertest | 44 |
| `web` | Vitest y Testing Library | 87 |

Cubren las restricciones del plan: ausencia de conexion, valores nulos, datos
corruptos y sincronizacion entre dispositivos. Las pruebas de tiempo real
levantan la API en un puerto real y usan clientes `socket.io` autenticos. El
desglose completo esta en [`docs/PLAN_DE_PRUEBAS.md`](docs/PLAN_DE_PRUEBAS.md).

## Despliegue

- **Web**: Vercel. El `vercel.json` de la raiz ya define el comando de
  compilacion y el directorio de salida del monorepo. Define
  `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **API**: cualquier entorno Node. Compila con
  `npm run build --workspace @jobtrack/api` y arranca con
  `npm run start:prod --workspace @jobtrack/api`. Declara en `CORS_ORIGINS` el
  dominio publico de la web.

## Convenciones de codigo

- TypeScript estricto en los tres paquetes.
- Sin emojis en el codigo ni en la interfaz; la iconografia es SVG vectorial
  (ver [`apps/web/src/components/icons/ICONS_LICENSE.md`](apps/web/src/components/icons/ICONS_LICENSE.md)).
- Una sola fuente por regla: si una logica se necesita en la API y en la web,
  vive en `@jobtrack/contracts`.

## Licencia

MIT.
