# Jobtrack

Tablero gamificado para registrar ofertas de empleo, seguir su avance y mantener
la informacion sincronizada entre la computadora y el telefono.

## Que incluye

- **Tablero kanban** con seis estados y arrastre de tarjetas entre columnas.
- **Captura manual** de empresa, puesto, ubicacion, modalidad, prioridad,
  expectativa salarial, enlace, notas y fechas de postulacion y entrevista.
- **Capa de juego**: experiencia, niveles con rango, racha diaria y ocho logros.
- **Ocho temas visuales** (claro, oscuro, minimalista, pixel rosa, pixel azul,
  gaming, anime y galaxy) y **dos paquetes de iconos** SVG intercambiables.
- **Sincronizacion en vivo** por WebSockets entre todos los dispositivos de la
  misma cuenta.

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
```

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

## Despliegue

- **Web**: Vercel. Con el repositorio como raiz del proyecto, usa
  `npm run build --workspace @jobtrack/web` como comando de compilacion y
  `apps/web/.next` como directorio de salida. Define `NEXT_PUBLIC_API_URL`,
  `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **API**: cualquier entorno Node. Compila con `npm run build --workspace @jobtrack/api`
  y arranca con `npm run start:prod --workspace @jobtrack/api`. Declara en
  `CORS_ORIGINS` el dominio publico de la web.

## Convenciones de codigo

- TypeScript estricto en los tres paquetes.
- Sin emojis en el codigo ni en la interfaz; la iconografia es SVG vectorial
  (ver [`apps/web/src/components/icons/ICONS_LICENSE.md`](apps/web/src/components/icons/ICONS_LICENSE.md)).
- Las reglas de dominio viven en `packages/contracts` y las consumen tanto la
  API como la web, de modo que no existan calculos duplicados.

## Licencia

MIT.
