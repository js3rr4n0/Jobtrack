# Deska

<p align="center"><b>English</b> · <a href="README.es.md">Español</a></p>

A gamified board for tracking job applications, following their progress, and keeping everything in sync between your computer and your phone.

![Deska kanban board, light theme](docs/capturas/tablero-claro.jpg)

The interface is in Spanish.

## Features

- **Kanban board** with six stages and drag-and-drop between columns.
- **Board areas** with free-form names (development, marketing, anything you need) and a switcher to view one at a time.
- **Sticky-note wall** with free dragging, five colors, and positions that persist across devices.
- **Manual entry** of company, role, location, work mode, priority, salary expectation, link, contact, process notes, and application, interview and follow-up dates.
- **Uploaded CVs and cover letters** stored in a private bucket and selectable from each application; notes accept screenshots.
- **Game layer**: experience points, levels with ranks, a daily streak, and eight achievements.
- **Twelve visual themes** built from custom palettes and **two swappable SVG icon packs**, each with its own depth layer (inset surfaces, shadows and background), with contrast verified by tests.
- **Live sync** over WebSockets across every device on the same account.
- **Guided tutorial** on first use that dims the screen and highlights where to click.

## Screenshots

### Themes

The same board completely changes personality without touching the markup: each theme redefines the same set of CSS variables.

| Dark | Galaxy |
| --- | --- |
| ![Dark theme](docs/capturas/tablero-oscuro.jpg) | ![Galaxy theme](docs/capturas/tablero-galaxy.jpg) |

| Pixel pink (with pixel icons) | Gaming |
| --- | --- |
| ![Pixel pink theme](docs/capturas/tablero-pixel-rosa.jpg) | ![Gaming theme](docs/capturas/tablero-gaming.jpg) |

### Areas and sticky-note wall

Above the board, one tab per area (free-form name) filters what you see without affecting progress. Below it, the wall holds loose reminders: they can be dragged with a mouse, a finger or the keyboard, and their position is stored relative to the wall, so it survives switching devices.

![Sticky-note wall below the board, anime theme](docs/capturas/mural.jpg)

### Welcome tutorial

While the board is empty, a four-step tour blurs the rest of the interface and keeps only the element you need to use in focus. It can be skipped at any time and never comes back.

![Guided tutorial highlighting the new application button](docs/capturas/tutorial.jpg)

### Appearance picker

Twelve themes grouped into four families, plus two icon packs with a live preview inside the account panel.

![Account panel with the twelve themes and two icon packs](docs/capturas/temas.jpg)

### Mobile

On small screens the columns stack and the progress panel moves to the top. Each card's status selector replaces drag-and-drop.

<img src="docs/capturas/movil-tablero.jpg" alt="Board on a phone, anime theme" width="360">

### Landing and sign-in

| Landing page | Sign-in |
| --- | --- |
| ![Landing page](docs/capturas/inicio.jpg) | ![Sign-in form](docs/capturas/acceso.jpg) |

## Architecture

```
Deska/
  apps/
    api/                 NestJS 10 API (REST + WebSockets)
    web/                 Next.js 14 interface (App Router) + Tailwind CSS 3
  packages/
    contracts/           Shared types and domain rules
  supabase/
    schema.sql           PostgreSQL schema with Row Level Security
  docs/
    MANUAL_USUARIO.md    Step-by-step user guide (Spanish)
    MANUAL_TECNICO.md    Architecture, modules and conventions (Spanish)
    PLAN_DE_PRUEBAS.md   Test cases, constraints and expected results (Spanish)
    capturas/            Images used in this README
```

Domain rules live in `packages/contracts` and are used by both the API and the web app. Because of that, the optimistic reordering in the browser and the reordering the server persists call the **same** function, so they can't drift apart.

Module details are in [`docs/MANUAL_TECNICO.md`](docs/MANUAL_TECNICO.md).

## Tech stack

| Layer | Technology |
| --- | --- |
| Interface | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3 |
| Drag and drop | dnd-kit (pointer and keyboard) |
| API | NestJS 10, class-validator, Socket.IO, Helmet |
| Authentication | Supabase Auth: Google and email/password; JWT verified in the API |
| Database | PostgreSQL 15 managed by Supabase, with Row Level Security |
| Testing | Vitest and Testing Library on the web, Jest and Supertest on the API |

## Getting started

Requirements: Node.js 20 or later.

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Start both processes in separate terminals:

```bash
npm run dev:api    # http://localhost:4000/api
npm run dev:web    # http://localhost:3000
```

With the example configuration the API uses the `memory` driver, so it starts without any external credentials. To persist data in PostgreSQL, run `supabase/schema.sql` in your Supabase project and fill in `apps/api/.env`:

```
DATA_DRIVER=supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service key>
ADMIN_EMAIL=<your email>          # optional: enables /admin for that account only
```

The schema can be re-run in full on an existing project: types, tables, indexes and policies are only created if missing, and columns added later are applied at the end with `alter table ... add column if not exists`.

The API verifies tokens with the project's public keys (`SUPABASE_URL`), so no signing secret is needed. Only projects still on the legacy HS256 scheme also need `SUPABASE_JWT_SECRET`.

And in `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<public key>
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the shared package, the API and the web app |
| `npm test` | Runs the test suites of all three packages |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run lint` | Static analysis of the API and the web app |

## Testing

596 tests, all passing, with no external network dependencies:

| Package | Tool | Tests |
| --- | --- | --- |
| `contracts` | Vitest | 159 |
| `api` | Jest and Supertest | 128 |
| `web` | Vitest and Testing Library | 309 |

They cover the plan's constraints: offline use, null values, corrupted data and cross-device sync. The real-time tests start the API on a real port and use real `socket.io` clients. The full breakdown is in [`docs/PLAN_DE_PRUEBAS.md`](docs/PLAN_DE_PRUEBAS.md).

## Deployment

### Web app on Vercel

When importing the repository, under **Settings -> General**:

| Setting | Value |
| --- | --- |
| Root Directory | `apps/web` |
| Include files outside the root directory | **Enabled** |
| Framework Preset | Next.js (detected automatically) |
| Build Command | default (`npm run build`) |

If you set a **custom Build Command**, reference the workspace **by path** (`npm run build --workspace apps/web`) rather than by package name: the path survives a product rename, the package name doesn't.

The **Root Directory must point to `apps/web`**, not the repo root: Vercel looks for the `next` dependency in that directory's `package.json`, and the root one only declares the workspaces. The outside-files option is required because the web app builds `packages/contracts` first.

Project environment variables:

```
NEXT_PUBLIC_API_URL=https://<your-api>/api
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<public key>
```

Without them the app still deploys and shows a notice explaining that Supabase isn't configured, but sign-in is disabled.

### Authentication in production

In the Supabase project, under **Authentication -> URL Configuration**:

| Field | Value |
| --- | --- |
| Site URL | The public domain of the web app |
| Redirect URLs | `https://<domain>/**` |

To enable external sign-in, paste each OAuth app's client ID and secret under **Authentication -> Providers**. For all of them, the authorized redirect URI is `https://<project>.supabase.co/auth/v1/callback`.

| Supabase provider | Where the app is created |
| --- | --- |
| Google | Google Cloud, OAuth credentials section |

Supabase's built-in email service is meant for development and limits sends per hour. A real deployment that uses email sign-up needs its own **SMTP** server, configured under *Project Settings -> Authentication*.

### API on Render

The repository includes `render.yaml`, so you only need **New -> Blueprint** and select the repository. Render asks for three values when creating the service: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `CORS_ORIGINS` (the web app's public domain).

The API is a long-running process with WebSockets, so it doesn't fit Vercel's serverless functions: it needs a service with a persistent process.

For any other provider, the commands are:

```bash
npm install --include=dev   # NODE_ENV=production would skip TypeScript and the Nest CLI
npm run build --workspace apps/api
npm run start:prod --workspace apps/api
```

The health check is `GET /api/health`.

## Code conventions

- Strict TypeScript in all three packages.
- No emojis in the code or the interface; icons are vector SVGs (see [`apps/web/src/components/icons/ICONS_LICENSE.md`](apps/web/src/components/icons/ICONS_LICENSE.md)).
- One source of truth per rule: if logic is needed in both the API and the web app, it lives in `@deska/contracts`.

## License

MIT.
