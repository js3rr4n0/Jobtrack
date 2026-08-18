# Manual tecnico

Documento de referencia para desarrollar y mantener Jobtrack: arquitectura,
estructura de carpetas, responsabilidad de cada modulo y decisiones de diseno.

## 1. Vision general

Jobtrack es un monorepo de tres paquetes con una separacion estricta de
responsabilidades:

```
+-------------------+        HTTPS/REST        +-------------------+
|  @jobtrack/web    | -----------------------> |  @jobtrack/api    |
|  Next.js 14       | <----------------------- |  NestJS 10        |
|  (navegador)      |       WebSockets         |                   |
+-------------------+                          +---------+---------+
         |                                               |
         | Supabase Auth (correo y contrasena)           | PostgreSQL
         v                                               v
+-------------------------------------------------------------------+
|                          Supabase                                  |
|   auth.users     public.job_applications, public.sticky_notes (RLS)  |
+-------------------------------------------------------------------+
                     ^
                     |
          +----------+-----------+
          |  @jobtrack/contracts |
          |  tipos y reglas puras|
          +----------------------+
```

**Flujo de una peticion**

1. El navegador obtiene un JWT de Supabase Auth al iniciar sesion.
2. Cada llamada a la API viaja con `Authorization: Bearer <token>` y con la
   cabecera `X-Jobtrack-Origin`, que identifica al dispositivo emisor.
3. La API verifica la firma del token, resuelve el `userId` y opera solo sobre
   las filas de esa persona.
4. Tras cada escritura, la API publica un evento en la sala privada del usuario;
   los demas dispositivos lo reciben por WebSocket y actualizan su tablero.

## 2. Estructura de carpetas

```
Jobtrack/
  package.json                 Workspaces y scripts agregados
  supabase/schema.sql          Tablas, indices, disparadores y politicas RLS
  docs/                        Manuales y plan de pruebas

  packages/contracts/src/
    job-application.ts         Estados, catalogo, modelo y entradas
    board.ts                   Columnas, reordenamiento y areas del tablero
    sticky-note.ts             Modelo, posiciones y arrastre de las notas
    gamification.ts            Experiencia, niveles y definiciones de logros
    analytics.ts               Estadisticas, rachas y perfil de juego
    realtime.ts                Contrato de los eventos de tiempo real
    test-factories.ts          Constructor de datos para pruebas

  apps/api/src/
    main.ts                    Arranque del proceso
    bootstrap.ts               Middleware transversal reutilizable en pruebas
    app.module.ts              Composicion de modulos
    config/                    Validacion del entorno y proveedor global
    auth/                      Estrategia JWT, guard, decorador y verificador
    applications/              Controlador, servicio, DTO y repositorios
    notes/                     Mural de notas: controlador, servicio y puertos
    gamification/             Perfil de juego derivado del tablero
    realtime/                  Puerto de publicacion y gateway WebSocket
    common/filters/            Normalizacion de errores HTTP
    health/                    Sonda publica de disponibilidad

  apps/web/src/
    app/                       Rutas del App Router y hoja de estilos global
    components/
      account/                 Menu de cuenta con perfil, apariencia y salida
      auth/                    Formulario de acceso y registro
      board/                   Tablero, columnas, tarjetas y formulario
      gamification/            Nivel, resumen, logros y aviso de ascenso
      icons/                   Catalogo, dos paquetes SVG y licencias
      landing/                 Bloques de la pagina de bienvenida
      notes/                   Mural, nota arrastrable y editor de notas
      theme/                   Proveedor de preferencias y selector
      ui/                      Boton, campos, dialogo y avisos
    hooks/                     Sesion, cliente, tablero, mural, canal y red
    lib/                       Cliente HTTP, tiempo real, formularios, temas
```

## 3. Paquete compartido `@jobtrack/contracts`

Es la unica fuente de verdad del dominio. No depende de React ni de NestJS: solo
tipos y funciones puras, lo que permite consumirlo desde los dos extremos y
probarlo de forma aislada.

| Modulo | Responsabilidad |
| --- | --- |
| `job-application.ts` | Union `ApplicationStatus`, `STATUS_CATALOG` con etiqueta, descripcion, orden y peso de progreso, y el modelo `JobApplication`. |
| `board.ts` | `groupIntoColumns`, `reorderBoard`, `diffBoardPositions` y las areas del tablero (`listCategories`, `filterByCategory`). |
| `sticky-note.ts` | Modelo `StickyNote`, saneado de texto y color, `clampNotePosition`, `applyNoteMove` y `translateNotePosition`. |
| `gamification.ts` | Tabla de recompensas, curva de niveles, titulos y catalogo de logros. |
| `analytics.ts` | `buildPlayerStats`, `calculateStreaks`, `calculateBaseExperience` y `buildGamificationProfile`. |
| `realtime.ts` | Nombres de los eventos y forma de `BoardChangeEvent` y `NoteChangeEvent`. |

**Por que compartir el reordenamiento.** La interfaz aplica el movimiento de
forma optimista antes de que responda el servidor. Si el algoritmo estuviera
duplicado, cualquier divergencia produciria un salto visual al llegar la
respuesta. Al invocar ambos extremos la misma funcion `reorderBoard`, el orden
optimista y el persistido coinciden por construccion.

**Por que recalcular la experiencia en lugar de acumularla.** El perfil se
deriva del estado actual del tablero mediante `buildGamificationProfile`. No hay
contador almacenado que pueda desincronizarse: dos dispositivos con las mismas
postulaciones calculan siempre el mismo nivel.

El paquete se compila a `dist/` con `tsc`; los scripts `build`, `dev` y `start`
de la API y de la web lo compilan antes de arrancar. Las suites de pruebas
apuntan directamente a `src/` mediante alias, de modo que no requieren
compilacion previa.

## 4. API (`@jobtrack/api`)

### 4.1 Configuracion

`config/environment.ts` valida el entorno con Zod **una sola vez al arrancar**.
Un valor invalido detiene el proceso con un mensaje que enumera cada problema,
en lugar de fallar mas tarde con un error difuso. `ConfigModule` publica el
resultado como proveedor global bajo el token `APPLICATION_CONFIG`.

Variables relevantes:

| Variable | Valor por defecto | Notas |
| --- | --- | --- |
| `PORT` | `4000` | Puerto HTTP. |
| `CORS_ORIGINS` | `http://localhost:3000` | Lista separada por comas. |
| `DATA_DRIVER` | `memory` | `memory` o `supabase`. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | vacios | Obligatorios con `supabase`. |
| `SUPABASE_JWT_SECRET` | secreto de desarrollo | Firma HS256 de los tokens. |

### 4.2 Autenticacion

`TokenVerifierService` es el unico punto de verificacion de tokens y soporta los
dos esquemas de firma de Supabase Auth, eligiendo segun el encabezado del propio
token:

| Algoritmo del token | Como se verifica |
| --- | --- |
| `ES256` / `RS256` | Contra las claves publicas del proyecto, descargadas de `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`. |
| `HS256` | Contra `SUPABASE_JWT_SECRET`, el secreto compartido heredado. |

Los proyectos actuales de Supabase firman con **JWT Signing Keys asimetricas**,
asi que basta con declarar `SUPABASE_URL`; el secreto compartido solo hace falta
en proyectos que no han migrado. Soportar ambos permite rotar de un esquema al
otro sin ventana de indisponibilidad.

El conjunto de claves se resuelve una sola vez por proceso y `jose` se encarga de
cachearlo y renovarlo cuando aparece un `kid` desconocido.

`JwtAuthGuard` aplica esa verificacion en HTTP y deja la identidad resuelta en la
peticion, de donde la toma el decorador `@CurrentUser()`. El gateway de
WebSockets usa el mismo servicio sobre el token del handshake, de modo que ambos
transportes comparten exactamente las mismas reglas.

### 4.3 Modulo de postulaciones

Sigue una arquitectura de puertos y adaptadores:

- `JobApplicationsRepository` es una **clase abstracta** que define el contrato
  de persistencia. El servicio depende de ella, nunca del proveedor concreto.
- `SupabaseJobApplicationsRepository` traduce a PostgreSQL mediante
  `@supabase/supabase-js` y convierte los fallos del proveedor en
  `ServiceUnavailableException` con mensaje legible.
- `InMemoryJobApplicationsRepository` mantiene la misma semantica en memoria; se
  usa para desarrollo local sin credenciales y para las pruebas de integracion.
- `job-application.mapper.ts` concentra la traduccion entre `camelCase` del
  dominio y `snake_case` de la base de datos.

`JobApplicationsModule` elige el adaptador con una fabrica que lee
`config.dataDriver`, de modo que cambiar de backend no toca ni una linea del
servicio.

`JobApplicationsService` concentra las reglas de aplicacion:

- Al crear, asigna la posicion al final de la columna y fija `appliedAt` solo si
  el estado no es `wishlist`.
- Al actualizar, construye un parche que contiene **solo** los campos enviados,
  preservando las actualizaciones parciales.
- Al mover, delega el calculo en `reorderBoard`, persiste unicamente las filas
  que cambiaron segun `diffBoardPositions` y publica el evento correspondiente.

**Areas del tablero.** `category` es texto libre de hasta 60 caracteres. No hay
catalogo de areas: se derivan de las propias postulaciones con `listCategories`,
asi que no existe una tabla que pueda quedar desincronizada con los datos ni un
area huerfana que limpiar. Los identificadores de las vistas *Todas* y *Sin area*
empiezan por un espacio y las areas se recortan antes de guardarse, de modo que
ningun area escrita por una persona puede suplantarlas.

### 4.4 Modulo del mural de notas

`notes/` reproduce la misma estructura de puertos y adaptadores:
`StickyNotesRepository` como contrato, con adaptador de Supabase y adaptador en
memoria, y `sticky-note.mapper.ts` como unico punto de traduccion entre el
dominio y las columnas `position_x` y `position_y`.

`StickyNotesService` decide dos cosas propias del mural:

- Al crear sin posicion, escalona la nota con `nextNotePosition` para que no
  quede exactamente debajo de otra.
- Distingue el evento `moved` del evento `updated` segun si el parche toca solo
  la posicion, de modo que la interfaz puede reaccionar al arrastre sin
  confundirlo con una edicion de texto.

La posicion se guarda en **porcentaje**, no en pixeles: una nota colocada en el
telefono aparece en el mismo lugar relativo en la computadora. El mapeador sanea
color y posicion al leer, asi que una fila corrupta o de una version anterior del
esquema no rompe el renderizado.

### 4.5 Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/api/health` | Sonda publica de disponibilidad. |
| `GET` | `/api/applications` | Lista plana de las postulaciones del usuario. |
| `GET` | `/api/applications/board` | Tablero por columnas mas perfil de juego. |
| `GET` | `/api/applications/:id` | Detalle de una postulacion. |
| `POST` | `/api/applications` | Registra una postulacion. |
| `PATCH` | `/api/applications/:id` | Actualiza campos parciales. |
| `PATCH` | `/api/applications/:id/move` | Cambia estado y posicion. |
| `DELETE` | `/api/applications/:id` | Elimina una postulacion. |
| `GET` | `/api/notes` | Notas del mural del usuario. |
| `POST` | `/api/notes` | Crea una nota. |
| `PATCH` | `/api/notes/:id` | Cambia texto, color o posicion. |
| `DELETE` | `/api/notes/:id` | Elimina una nota. |
| `GET` | `/api/gamification/profile` | Perfil de juego del usuario. |

Todas las rutas salvo `/health` exigen JWT. El `ValidationPipe` global aplica
`whitelist` y `forbidNonWhitelisted`, asi que un cuerpo con propiedades
desconocidas se rechaza con 400.

### 4.6 Errores

`HttpExceptionFilter` normaliza cualquier fallo en un cuerpo unico:

```json
{
  "statusCode": 400,
  "message": "Revisa los datos ingresados.",
  "details": ["La empresa es obligatoria."],
  "path": "/api/applications",
  "timestamp": "2026-02-10T10:00:00.000Z"
}
```

Los errores 5xx se registran con traza en el servidor pero devuelven un mensaje
generico al cliente, sin filtrar detalles internos.

### 4.7 Tiempo real

`BoardGateway` expone el namespace `/realtime`. En la conexion valida el token y
une al cliente a la sala `user:<id>`; si el token falta o es invalido, emite
`connection:rejected` y cierra el socket.

`BoardEventPublisher` es el puerto que usan los servicios; `BoardGateway` es su
implementacion. Publica `board:changed` para el tablero y `note:changed` para el
mural sobre la **misma** sala, asi que un dispositivo mantiene una sola conexion.
Gracias a esa indireccion, los servicios se prueban con `RecordingEventPublisher`,
un doble que solo registra lo publicado.

Cada evento incluye `originId`, con el que el dispositivo emisor descarta su
propio eco y evita renderizados redundantes.

## 5. Interfaz (`@jobtrack/web`)

### 5.1 Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Pagina de bienvenida (componente de servidor). |
| `/acceso` | Inicio de sesion. |
| `/registro` | Alta de cuenta. |
| `/tablero` | Tablero kanban y capa de juego. |

`layout.tsx` inyecta un script de arranque que aplica el tema guardado **antes**
de pintar, de modo que no hay parpadeo de colores al cargar.

### 5.2 Estado de la pantalla principal

La pantalla se compone de cuatro hooks con responsabilidades separadas:

| Hook | Responsabilidad |
| --- | --- |
| `useApiClient(accessToken)` | Crea el **unico** `ApiClient` de la pantalla y fija el `originId` del dispositivo para toda la sesion. |
| `useBoard(client, originId)` | Estado del tablero: carga, columnas, area activa, mutaciones optimistas y perfil de juego. |
| `useNotes(client, originId)` | Estado del mural con el mismo patron de mutaciones optimistas. |
| `useRealtimeChannel(...)` | Abre **una** conexion y reparte los eventos entre tablero y mural. |

Compartir cliente y `originId` es lo que permite que ninguno de los dos reaccione
a su propio eco, y que un dispositivo no abra dos sockets para la misma sesion.

`useBoard` ademas:

1. Expone `status` (`loading`, `ready`, `error`) y traduce los fallos a
   `BoardFeedback` legible.
2. Deriva columnas, areas y perfil de juego con `useMemo` a partir de una
   **unica** lista plana de postulaciones. El filtro por area afecta al tablero,
   nunca a la capa de juego: el nivel es de la persona, no de un area.
3. Aplica los movimientos de forma optimista y los revierte si la peticion falla.
4. Recarga automaticamente cuando vuelve la conexion tras un error.

La logica pura vive fuera de los hooks, en `lib/board-state.ts`
(`applyRemoteChange`, `replaceApplication`, `isOwnEcho`) y `lib/note-state.ts`
(`applyRemoteNoteChange`, `replaceNote`), lo que permite probarla sin renderizar.

### 5.3 Cliente HTTP

`ApiClient` centraliza el acceso a la API:

- Comprueba `navigator.onLine` antes de salir a la red y evita peticiones
  condenadas al fallo.
- Aborta la peticion a los 10 segundos y la reporta como `timeout`.
- Traduce el codigo de respuesta a un `ApiError` con `kind` (`offline`,
  `timeout`, `unauthorized`, `validation`, `server`) y conserva el detalle de las
  validaciones del servidor.
- Recibe `fetchImplementation` e `isOnline` por constructor, lo que hace las
  pruebas deterministas sin parchear globales.

### 5.4 Arrastrar y soltar

`KanbanBoard` monta un `DndContext` de dnd-kit con dos sensores: puntero (con un
umbral de 6 px para no confundir un toque con un arrastre) y teclado. Cada
columna es una zona soltable y cada tarjeta un elemento ordenable.

`lib/drag-and-drop.ts` traduce el resultado del arrastre a `{ status, boardOrder }`
mediante `resolveDropTarget`, una funcion pura que devuelve `null` cuando el
destino coincide con el origen, evitando peticiones inutiles.

Como alternativa accesible, cada tarjeta incluye un selector de estado que
produce el mismo movimiento. Es la via preferente en pantallas tactiles.

El mural usa el mismo motor pero con arrastre **libre**: `NoteWall` monta su
propio `DndContext` con `useDraggable`, mide el mural al soltar y convierte el
desplazamiento en pixeles a porcentaje con `translateNotePosition`. La medida que
se pasa es el *recorrido util* (el mural menos el tamano de la nota, calculado en
`note-geometry.ts`), de modo que el cien por ciento deja la nota pegada al borde
y nunca fuera. El arrastre por teclado funciona igual, porque dnd-kit entrega el
mismo desplazamiento en ambos casos.

### 5.5 Temas e iconos

Los ocho temas se declaran en `app/globals.css` como bloques `[data-theme='...']`
que redefinen el **mismo** conjunto de variables CSS (colores en canales RGB,
radios, sombras, tipografia). `tailwind.config.ts` mapea esas variables a nombres
semanticos (`bg-raised`, `text-primary`, `border-subtle`, `bg-interview`), asi
que agregar un tema no exige tocar ningun componente.

Las variables incluyen la **capa de profundidad**: `--color-sunken` para las
superficies hundidas, `--shadow-lifted` y `--shadow-sunken` para las sombras y
`--page-backdrop` para el fondo de la pagina. Cada tema define su propia version,
de modo que un tema pixel usa sombras solidas desplazadas y uno claro, sombras
difusas. Los colores del mural son la excepcion deliberada: son fijos en todos
los temas y llevan tinta oscura, para que el contraste de una nota no dependa del
tema elegido.

Los iconos son SVG en linea, sin emojis ni imagenes de mapa de bits. El catalogo
`icon-names.ts` declara los nombres disponibles y cada paquete los implementa
como `Record<IconName, ReactNode>`: el sistema de tipos impide publicar un
paquete incompleto. Las licencias estan en
`src/components/icons/ICONS_LICENSE.md`.

`PreferencesProvider` guarda tema y paquete de iconos en `localStorage` con
lectura tolerante a fallos, porque el modo privado de algunos navegadores lanza
al acceder al almacenamiento.

## 6. Base de datos

`supabase/schema.sql` crea:

- Los tipos enumerados `application_status`, `work_mode` y `application_priority`.
- La tabla `public.job_applications` con restricciones de longitud y de rango,
  incluida el area libre `category`.
- La tabla `public.sticky_notes`, con el color restringido al catalogo y la
  posicion acotada entre 0 y 100.
- Indices por `(user_id, status, board_order)` para el tablero, por
  `(user_id, category)` para el filtro de areas, por `(user_id, interview_at)`
  para las entrevistas agendadas y por `(user_id, created_at)` para el mural.
- El disparador `touch_updated_at`, que mantiene `updated_at` coherente sin
  depender de la capa de aplicacion.
- Politicas de **Row Level Security** que restringen cada operacion a
  `auth.uid() = user_id`.

La RLS es una segunda linea de defensa: aunque la API ya filtra por usuario, la
base rechazaria por su cuenta cualquier acceso cruzado.

## 7. Pruebas

| Paquete | Herramienta | Alcance |
| --- | --- | --- |
| `contracts` | Vitest | Reglas de dominio puras: niveles, logros, rachas, reordenamiento, areas y posiciones del mural. |
| `api` | Jest y Supertest | Servicio con repositorio en memoria, ciclo HTTP completo y sincronizacion por WebSocket. |
| `web` | Vitest y Testing Library | Utilidades puras, componentes y flujo completo del tablero con API simulada. |

Ejecuta todo con `npm test` desde la raiz. El desglose de casos, restricciones y
resultados esperados esta en [`PLAN_DE_PRUEBAS.md`](PLAN_DE_PRUEBAS.md).

## 8. Convenciones

- **TypeScript estricto** en los tres paquetes; sin `any` implicito.
- **Nombres de dominio en la frontera**: los DTO y el modelo usan `camelCase`; la
  traduccion a `snake_case` ocurre unicamente en el mapeador.
- **Funciones puras primero**: toda regla que pueda vivir sin framework se
  extrae a un modulo propio y se prueba de forma aislada.
- **Sin emojis** en codigo, comentarios ni interfaz.
- **Comentarios que explican el porque**, no el que; el codigo describe el
  comportamiento por si mismo.
- **Un solo lugar por regla**: si una logica se necesita en la API y en la web,
  vive en `@jobtrack/contracts`.

## 9. Como extender el sistema

**Agregar un campo a la postulacion**

1. Anadelo a `JobApplication` y a `CreateJobApplicationInput` en `contracts`.
2. Declara su validacion en `CreateJobApplicationDto`.
3. Registra la columna en `job-application.mapper.ts` y en `schema.sql`.
4. Propaga el campo en `buildPatch` del servicio.
5. Anade el control al formulario y su regla en `lib/application-form.ts`.

**Agregar un estado al tablero**

1. Amplia `APPLICATION_STATUSES` y `STATUS_CATALOG` con orden y peso.
2. Agrega el valor al tipo enumerado de PostgreSQL.
3. Define su color en cada bloque de tema de `globals.css` y su clase en
   `BoardColumn`.

**Agregar un logro**

Anade la definicion a `ACHIEVEMENTS` en `gamification.ts`. La interfaz lo muestra
sin cambios adicionales, siempre que su `iconId` exista en el catalogo de iconos.

**Agregar un tema**

Anade el identificador a `THEME_IDS`, la entrada descriptiva a `THEMES` y el
bloque `[data-theme='...']` en `globals.css`. El selector lo listara solo.
