# Manual tecnico

Documento de referencia para desarrollar y mantener Deska: arquitectura,
estructura de carpetas, responsabilidad de cada módulo y decisiones de diseño.

## 1. Vision general

Deska es un monorepo de tres paquetes con una separación estricta de
responsabilidades:

```
+-------------------+        HTTPS/REST        +-------------------+
|  @deska/web    | -----------------------> |  @deska/api    |
|  Next.js 14       | <----------------------- |  NestJS 10        |
|  (navegador)      |       WebSockets         |                   |
+-------------------+                          +---------+---------+
         |                                               |
         | Supabase Auth (correo y contraseña)           | PostgreSQL
         v                                               v
+-------------------------------------------------------------------+
|                          Supabase                                  |
|   auth.users     public.job_applications, public.sticky_notes (RLS)  |
+-------------------------------------------------------------------+
                     ^
                     |
          +----------+-----------+
          |  @deska/contracts |
          |  tipos y reglas puras|
          +----------------------+
```

**Flujo de una petición**

1. El navegador obtiene un JWT de Supabase Auth al iniciar sesión.
2. Cada llamada a la API viaja con `Authorization: Bearer <token>` y con la
   cabecera `X-Deska-Origin`, que identifica al dispositivo emisor.
3. La API verifica la firma del token, resuelve el `userId` y opera solo sobre
   las filas de esa persona.
4. Tras cada escritura, la API publica un evento en la sala privada del usuario;
   los demás dispositivos lo reciben por WebSocket y actualizan su tablero.

## 2. Estructura de carpetas

```
Deska/
  package.json                 Workspaces y scripts agregados
  supabase/schema.sql          Tablas, indices, disparadores y politicas RLS
  docs/                        Manuales y plan de pruebas

  packages/contracts/src/
    job-application.ts         Estados, catalogo, modelo y entradas
    board.ts                   Columnas, reordenamiento y áreas del tablero
    sticky-note.ts             Modelo, posiciones y arrastre de las notas
    gamification.ts            Experiencia, niveles y definiciones de logros
    analytics.ts               Estadisticas, rachas y perfil de juego
    realtime.ts                Contrato de los eventos de tiempo real
    test-factories.ts          Constructor de datos para pruebas

  apps/api/src/
    main.ts                    Arranque del proceso
    bootstrap.ts               Middleware transversal reutilizable en pruebas
    app.module.ts              Composición de módulos
    config/                    Validación del entorno y proveedor global
    auth/                      Estrategia JWT, guard, decorador y verificador
    applications/              Controlador, servicio, DTO y repositorios
    notes/                     Mural de notas: controlador, servicio y puertos
    admin/                     Informe agregado, con su propia puerta por correo
    gamification/             Perfil de juego derivado del tablero
    realtime/                  Puerto de publicación y gateway WebSocket
    common/filters/            Normalizacion de errores HTTP
    health/                    Sonda publica de disponibilidad

  apps/web/src/
    app/                       Rutas del App Router y hoja de estilos global
    components/
      account/                 Menú de cuenta con perfil, apariencia y salida
      auth/                    Formulario de acceso y registro
      board/                   Tablero, columnas, tarjetas y formulario
      gamification/            Nivel, resumen, logros y aviso de ascenso
      icons/                   Catalogo, dos paquetes SVG y licencias
      landing/                 Bloques de la página de bienvenida
      notes/                   Mural, nota arrastrable y editor de notas
      theme/                   Proveedor de preferencias y selector
      ui/                      Botón, campos, diálogo, panel, plegable e interruptor
    hooks/                     Sesión, cliente, tablero, mural, canal y red
    lib/                       Cliente HTTP, tiempo real, formularios, temas
```

## 3. Paquete compartido `@deska/contracts`

Es la única fuente de verdad del dominio. No depende de React ni de NestJS: solo
tipos y funciones puras, lo que permite consumirlo desde los dos extremos y
probarlo de forma aislada.

| Módulo | Responsabilidad |
| --- | --- |
| `job-application.ts` | Union `ApplicationStatus`, `STATUS_CATALOG` con etiqueta, descripción, orden y peso de progreso, y el modelo `JobApplication`. |
| `board.ts` | `groupIntoColumns`, `reorderBoard`, `diffBoardPositions` y las áreas del tablero (`listCategories`, `filterByCategory`). |
| `sticky-note.ts` | Modelo `StickyNote`, saneado de texto y color, `clampNotePosition`, `applyNoteMove` y `translateNotePosition`. |
| `gamification.ts` | Tabla de recompensas, curva de niveles, títulos y catalogo de logros. |
| `analytics.ts` | `buildPlayerStats`, `calculateStreaks`, `calculateBaseExperience` y `buildGamificationProfile`. |
| `agenda.ts` | `buildAgenda`: reune entrevistas y seguimientos de todo el tablero en una lista ordenada por proximidad, con los dias contados por calendario. |
| `support.ts` | Motivos del formulario de contacto y reglas de aceptacion de un mensaje, compartidas por el navegador y el servidor. |
| `meeting.ts` | Reconoce la plataforma de una videollamada por el host del enlace, normaliza la direccion a `http`/`https` y decide la ventana en la que tiene sentido unirse. |
| `document.ts` | Clases de archivo, formatos y tamaño admitidos, composicion de la ruta en el almacen y reglas de aceptacion compartidas. |
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

**Por que existe `furthestStatus`.** Derivar la experiencia del estado tiene un
efecto indeseado: mover una tarjeta fuera de *Contratado* borraba sus puntos y
bajaba el nivel de golpe. Cada postulacion guarda por eso la etapa mas
adelantada que ha alcanzado, una marca monotona que solo sube
(`mergeFurthestStatus` compara por `progressWeight`, de modo que el descarte,
con peso cero, nunca la rebaja). La experiencia y los logros se cuentan desde
esa marca, no desde la columna actual. Sigue siendo un calculo derivado y
reproducible: lo unico que cambia es que el dato del que deriva recuerda por
donde paso la tarjeta. La marca la fija el servidor en `create`, `update` y
`move`, y no forma parte de ningun DTO de entrada, asi que ningun cliente puede
rebajarla.

El paquete se compila a `dist/` con `tsc`; los scripts `build`, `dev` y `start`
de la API y de la web lo compilan antes de arrancar. Las suites de pruebas
apuntan directamente a `src/` mediante alias, de modo que no requieren
compilacion previa.

## 4. API (`@deska/api`)

### 4.1 Configuración

`config/environment.ts` valida el entorno con Zod **una sola vez al arrancar**.
Un valor invalido detiene el proceso con un mensaje que enumera cada problema,
en lugar de fallar más tarde con un error difuso. `ConfigModule` publica el
resultado como proveedor global bajo el token `APPLICATION_CONFIG`.

Variables relevantes:

| Variable | Valor por defecto | Notas |
| --- | --- | --- |
| `PORT` | `4000` | Puerto HTTP. |
| `CORS_ORIGINS` | `http://localhost:3000` | Lista separada por comas. |
| `DATA_DRIVER` | `memory` | `memory` o `supabase`. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | vacíos | Obligatorios con `supabase`. |
| `SUPABASE_JWT_SECRET` | secreto de desarrollo | Firma HS256 de los tokens. |

### 4.2 Autenticación

`TokenVerifierService` es el único punto de verificación de tokens y soporta los
dos esquemas de firma de Supabase Auth, eligiendo según el encabezado del propio
token:

| Algoritmo del token | Como se verifica |
| --- | --- |
| `ES256` / `RS256` | Contra las claves publicas del proyecto, descargadas de `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`. |
| `HS256` | Contra `SUPABASE_JWT_SECRET`, el secreto compartido heredado. |

Los proyectos actuales de Supabase firman con **JWT Signing Keys asimetricas**,
así que basta con declarar `SUPABASE_URL`; el secreto compartido solo hace falta
en proyectos que no han migrado. Soportar ambos permite rotar de un esquema al
otro sin ventana de indisponibilidad.

El conjunto de claves se resuelve una sola vez por proceso y `jose` se encarga de
cachearlo y renovarlo cuando aparece un `kid` desconocido.

`JwtAuthGuard` aplica esa verificación en HTTP y deja la identidad resuelta en la
petición, de donde la toma el decorador `@CurrentUser()`. El gateway de
WebSockets usa el mismo servicio sobre el token del handshake, de modo que ambos
transportes comparten exactamente las mismas reglas.

### 4.3 Módulo de postulaciones

Sigue una arquitectura de puertos y adaptadores:

- `JobApplicationsRepository` es una **clase abstracta** que define el contrato
  de persistencia. El servicio depende de ella, nunca del proveedor concreto.
- `SupabaseJobApplicationsRepository` traduce a PostgreSQL mediante
  `@supabase/supabase-js` y convierte los fallos del proveedor en
  `ServiceUnavailableException` con mensaje legible.
- `InMemoryJobApplicationsRepository` mantiene la misma semántica en memoria; se
  usa para desarrollo local sin credenciales y para las pruebas de integracion.
- `job-application.mapper.ts` concentra la traducción entre `camelCase` del
  dominio y `snake_case` de la base de datos.

`JobApplicationsModule` elige el adaptador con una fabrica que lee
`config.dataDriver`, de modo que cambiar de backend no toca ni una línea del
servicio.

`JobApplicationsService` concentra las reglas de aplicación:

- Al crear, asigna la posición al final de la columna y fija `appliedAt` solo si
  el estado no es `wishlist`.
- Al actualizar, construye un parche que contiene **solo** los campos enviados,
  preservando las actualizaciones parciales.
- Al mover, delega el calculo en `reorderBoard`, persiste unicamente las filas
  que cambiaron según `diffBoardPositions` y publica el evento correspondiente.

**Seguimiento.** `followUpAt` guarda el día en que toca insistir. Que esté
vencido no se almacena: lo deriva `isFollowUpDue` en el paquete compartido, que
descarta los procesos ya cerrados y tolera una fecha corrupta. Así la tarjeta,
el resumen y cualquier consumidor futuro aplican exactamente la misma regla.

**Áreas del tablero.** `category` es texto libre de hasta 60 caracteres. No hay
catalogo de áreas: se derivan de las propias postulaciones con `listCategories`,
así que no existe una tabla que pueda quedar desincronizada con los datos ni un
área huerfana que limpiar. Los identificadores de las vistas *Todas* y *Sin área*
empiezan por un espacio y las áreas se recortan antes de guardarse, de modo que
ningún área escrita por una persona puede suplantarlas.

### 4.4 Módulo del mural de notas

`notes/` reproduce la misma estructura de puertos y adaptadores:
`StickyNotesRepository` como contrato, con adaptador de Supabase y adaptador en
memoria, y `sticky-note.mapper.ts` como único punto de traducción entre el
dominio y las columnas `position_x` y `position_y`.

`StickyNotesService` decide dos cosas propias del mural:

- Al crear sin posición, escalona la nota con `nextNotePosition` para que no
  quede exactamente debajo de otra.
- Distingue el evento `moved` del evento `updated` según si el parche toca solo
  la posición, de modo que la interfaz puede reaccionar al arrastre sin
  confundirlo con una edición de texto.

La posición se guarda en **porcentaje**, no en pixeles: una nota colocada en el
teléfono aparece en el mismo lugar relativo en la computadora. El mapeador sanea
color y posición al leer, así que una fila corrupta o de una versión anterior del
esquema no rompe el renderizado.

### 4.5 Panel de administración

`admin/` reúne el informe agregado del producto. Tiene puerta propia:
`AdminGuard` corre **después** de `JwtAuthGuard` y compara el correo del token
con `ADMIN_EMAIL`. Si la variable no está definida, el panel responde 403 a
todo el mundo; un panel que se abre por olvidar una variable no es un panel.

La lectura global vive en un puerto aparte, `AdminRepository`, en lugar de
añadirse al de postulaciones. Ese filtra siempre por usuario, y meter aquí una
consulta sin ese filtro haría fácil saltárselo por accidente desde otro punto
del código.

El cálculo entero está en `buildAdminOverview`, función pura del paquete
compartido: recibe las postulaciones y la fecha de referencia y devuelve solo
recuentos. Nada de lo que produce identifica a una persona ni reproduce sus
notas o contactos, y una prueba de integración lo verifica sobre la respuesta
real del endpoint. Los porcentajes por empresa exigen un mínimo de muestras,
porque «100 % de contratación» sobre una sola postulación no dice nada.

### 4.6 Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Sonda publica de disponibilidad. |
| `GET` | `/api/applications` | Lista plana de las postulaciones del usuario. |
| `GET` | `/api/applications/board` | Tablero por columnas más perfil de juego. |
| `GET` | `/api/applications/:id` | Detalle de una postulación. |
| `POST` | `/api/applications` | Registra una postulación. |
| `PATCH` | `/api/applications/:id` | Actualiza campos parciales. |
| `PATCH` | `/api/applications/:id/move` | Cambia estado y posición. |
| `DELETE` | `/api/applications/:id` | Elimina una postulación. |
| `GET` | `/api/notes` | Notas del mural del usuario. |
| `POST` | `/api/notes` | Crea una nota. |
| `PATCH` | `/api/notes/:id` | Cambia texto, color o posición. |
| `DELETE` | `/api/notes/:id` | Elimina una nota. |
| `GET` | `/api/documents` | Archivos del usuario. Admite `kind` y `applicationId`. |
| `POST` | `/api/documents` | Registra un archivo ya subido al almacen. |
| `DELETE` | `/api/documents/:id` | Elimina la fila y su binario. |
| `GET` | `/api/gamification/profile` | Perfil de juego del usuario. |
| `GET` | `/api/admin/overview` | Informe agregado. Solo para `ADMIN_EMAIL`. |
| `POST` | `/api/support` | Envia un mensaje de contacto. Publico: no exige sesion. |
| `GET` | `/api/support` | Mensajes recibidos. Solo para `ADMIN_EMAIL`. |
| `PATCH` | `/api/support/:id/atendido` | Marca un mensaje como atendido. Solo `ADMIN_EMAIL`. |

Todas las rutas salvo `/health` exigen JWT. El `ValidationPipe` global aplica
`whitelist` y `forbidNonWhitelisted`, así que un cuerpo con propiedades
desconocidas se rechaza con 400.

### 4.7 Errores

`HttpExceptionFilter` normaliza cualquier fallo en un cuerpo único:

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
genérico al cliente, sin filtrar detalles internos.

### 4.8 Tiempo real

`BoardGateway` expone el namespace `/realtime`. En la conexión valida el token y
une al cliente a la sala `user:<id>`; si el token falta o es invalido, emite
`connection:rejected` y cierra el socket.

`BoardEventPublisher` es el puerto que usan los servicios; `BoardGateway` es su
implementación. Publica `board:changed` para el tablero y `note:changed` para el
mural sobre la **misma** sala, así que un dispositivo mantiene una sola conexión.
Gracias a esa indirección, los servicios se prueban con `RecordingEventPublisher`,
un doble que solo registra lo publicado.

Cada evento incluye `originId`, con el que el dispositivo emisor descarta su
propio eco y evita renderizados redundantes.

## 5. Interfaz (`@deska/web`)

### 5.1 Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Página de bienvenida (componente de servidor). |
| `/acceso` | Inicio de sesión. |
| `/registro` | Alta de cuenta. |
| `/tablero` | Tablero kanban, agenda de proximas citas y capa de juego. |
| `/tablero/[id]` | Ficha completa de una vacante: datos, notas largas, adjuntos y documentos enviados. |
| `/admin` | Informe agregado de uso, restringido a la cuenta administradora. |
| `/not-found` | Pantalla propia para direcciones inexistentes, con el tema activo. |
| `/terminos` | Terminos de servicio. |
| `/privacidad` | Politica de privacidad. |
| `/contacto` | Formulario de contacto, unico canal del proyecto. |
| `/robots.txt` y `/sitemap.xml` | Generados por Next; excluyen de los buscadores las pantallas con sesion. |

`layout.tsx` inyecta un script de arranque que aplica el tema guardado **antes**
de pintar, de modo que no hay parpadeo de colores al cargar.

### 5.2 Estado de la pantalla principal

La pantalla se compone de cuatro hooks con responsabilidades separadas:

| Hook | Responsabilidad |
| --- | --- |
| `useApiClient(accessToken)` | Crea el **único** `ApiClient` de la pantalla y fija el `originId` del dispositivo para toda la sesión. |
| `useBoard(client, originId)` | Estado del tablero: carga, columnas, área activa, mutaciones optimistas y perfil de juego. |
| `useNotes(client, originId)` | Estado del mural con el mismo patron de mutaciones optimistas. |
| `useRealtimeChannel(...)` | Abre **una** conexión y reparte los eventos entre tablero y mural. |

Compartir cliente y `originId` es lo que permite que ninguno de los dos reaccione
a su propio eco, y que un dispositivo no abra dos sockets para la misma sesión.

`useBoard` además:

1. Expone `status` (`loading`, `ready`, `error`) y traduce los fallos a
   `BoardFeedback` legible.
2. Deriva columnas, áreas y perfil de juego con `useMemo` a partir de una
   **única** lista plana de postulaciones. El filtro por área afecta al tablero,
   nunca a la capa de juego: el nivel es de la persona, no de un área.
3. Aplica los movimientos de forma optimista y los revierte si la petición falla.
4. Recarga automáticamente cuando vuelve la conexión tras un error.

La logica pura vive fuera de los hooks, en `lib/board-state.ts`
(`applyRemoteChange`, `replaceApplication`, `isOwnEcho`) y `lib/note-state.ts`
(`applyRemoteNoteChange`, `replaceNote`), lo que permite probarla sin renderizar.

### 5.3 Cliente HTTP

`ApiClient` centraliza el acceso a la API:

- Comprueba `navigator.onLine` antes de salir a la red y evita peticiones
  condenadas al fallo.
- Aborta la petición a los 10 segundos y la reporta como `timeout`.
- Traduce el código de respuesta a un `ApiError` con `kind` (`offline`,
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
produce el mismo movimiento. Es la vía preferente en pantallas táctiles.

El mural usa el mismo motor pero con arrastre **libre**: `NoteWall` monta su
propio `DndContext` con `useDraggable`, mide el mural al soltar y convierte el
desplazamiento en pixeles a porcentaje con `translateNotePosition`. La medida que
se pasa es el *recorrido útil* (el mural menos el tamaño de la nota, calculado en
`note-geometry.ts`), de modo que el cien por ciento deja la nota pegada al borde
y nunca fuera. El arrastre por teclado funciona igual, porque dnd-kit entrega el
mismo desplazamiento en ambos casos.

### 5.5 Temas e iconos

Los doce temas se declaran en `app/globals.css` como bloques `[data-theme='...']`
que redefinen el **mismo** conjunto de variables CSS (colores en canales RGB,
radios, sombras, tipografía). `tailwind.config.ts` mapea esas variables a nombres
semánticos (`bg-raised`, `text-primary`, `border-subtle`, `bg-interview`), así
que agregar un tema no exige tocar ningún componente.

Cada tema nace de una paleta de cinco colores, de la que se derivan las
superficies, los bordes y los estados. `themes.test.ts` lee la hoja de estilos
publicada y mide cada pareja de texto sobre fondo: una paleta nueva no entra en
el catálogo si no alcanza los mínimos de contraste de la WCAG. Los
identificadores anteriores se traducen con `resolveThemeId`, de modo que
actualizar el catálogo no borra la elección de quien ya tenía un tema guardado.

Las variables incluyen la **capa de profundidad**: `--color-sunken` para las
superficies hundidas, `--shadow-lifted` y `--shadow-sunken` para las sombras y
`--page-backdrop` para el fondo de la página. Cada tema define su propia versión,
de modo que un tema pixel usa sombras solidas desplazadas y uno claro, sombras
difusas. Los colores del mural son la excepción deliberada: son fijos en todos
los temas y llevan tinta oscura, para que el contraste de una nota no dependa del
tema elegido.

Los iconos son SVG en línea, sin emojis ni imagenes de mapa de bits. El catalogo
`icon-names.ts` declara los nombres disponibles y cada paquete los implementa
como `Record<IconName, ReactNode>`: el sistema de tipos impide publicar un
paquete incompleto. Las licencias están en
`src/components/icons/ICONS_LICENSE.md`.

`PreferencesProvider` guarda tema y paquete de iconos en `localStorage` con
lectura tolerante a fallos, porque el modo privado de algunos navegadores lanza
al acceder al almacenamiento.

El tema se resuelve en tres escalones: manda la elección guardada; si no la hay
o el valor está corrupto, se adopta la del sistema mediante
`prefers-color-scheme`; y solo si tampoco existe `matchMedia` se cae al tema
claro. El script de arranque del `layout` aplica exactamente ese mismo orden
antes de pintar, con las dos consultas en bloques `try` **separados**: si el
almacenamiento está bloqueado, la preferencia del sistema ya resuelta sigue en
pie en lugar de perderse con él. Que ambos caminos coincidan es lo que evita
que la hidratación cambie el tema recién pintado, y que un contexto restringido
degrade a un comportamiento predecible en vez de a una pantalla blanca.

## 6. Base de datos

`supabase/schema.sql` crea:

- Los tipos enumerados `application_status`, `work_mode` y `application_priority`.
- La tabla `public.job_applications` con restricciones de longitud y de rango,
  incluida el área libre `category`, la marca de avance `furthest_status` y el
  enlace de la videollamada `meeting_url`.
- La tabla `public.support_messages`, con la seguridad a nivel de fila activada
  y **ninguna politica**: asi la clave anonima no puede leer ni escribir en ella,
  y solo entra la API con la clave de servicio. Verificado sobre PostgreSQL real.
- La tabla `public.documents` con los metadatos de cada archivo; el binario vive
  en Supabase Storage. Su columna `application_id` es nula para lo que se
  reutiliza —currículums, cartas— y apunta a la vacante en los adjuntos, que se
  borran en cascada con ella.
- La tabla `public.sticky_notes`, con el color restringido al catalogo y la
  posición acotada entre 0 y 100.
- Indices por `(user_id, status, board_order)` para el tablero, por
  `(user_id, category)` para el filtro de áreas, por `(user_id, interview_at)`
  para las entrevistas agendadas, por `(user_id, created_at)` para el mural y por
  `(application_id, created_at)` para los adjuntos de una vacante.
- El disparador `touch_updated_at`, que mantiene `updated_at` coherente sin
  depender de la capa de aplicación.
- Politicas de **Row Level Security** que restringen cada operación a
  `auth.uid() = user_id`.

La RLS es una segunda línea de defensa: aunque la API ya filtra por usuario, la
base rechazaria por su cuenta cualquier acceso cruzado.

El archivo entero es idempotente y puede volver a ejecutarse sobre una base ya
creada: las columnas nuevas se añaden con `add column if not exists` y las
restricciones que cambian se recrean. `supabase/migrations/` guarda ademas cada
cambio por separado, para aplicar solo lo que falta. Ambas rutas se verifican
contra un PostgreSQL 16 real —base nueva, segunda pasada y migracion desde la
version anterior— antes de darlas por buenas.

## 7. Pruebas

| Paquete | Herramienta | Alcance |
| --- | --- | --- |
| `contracts` | Vitest | Reglas de dominio puras: niveles, logros, rachas, reordenamiento, áreas y posiciones del mural. |
| `api` | Jest y Supertest | Servicio con repositorio en memoria, ciclo HTTP completo y sincronización por WebSocket. |
| `web` | Vitest y Testing Library | Utilidades puras, componentes y flujo completo del tablero con API simulada. |

Ejecuta todo con `npm test` desde la raíz. El desglose de casos, restricciones y
resultados esperados esta en [`PLAN_DE_PRUEBAS.md`](PLAN_DE_PRUEBAS.md).

## 8. Convenciones

- **TypeScript estricto** en los tres paquetes; sin `any` implicito.
- **Nombres de dominio en la frontera**: los DTO y el modelo usan `camelCase`; la
  traducción a `snake_case` ocurre unicamente en el mapeador.
- **Funciones puras primero**: toda regla que pueda vivir sin framework se
  extrae a un módulo propio y se prueba de forma aislada.
- **Sin emojis** en código, comentarios ni interfaz.
- **Comentarios que explican el porque**, no el que; el código describe el
  comportamiento por si mismo.
- **Un solo lugar por regla**: si una logica se necesita en la API y en la web,
  vive en `@deska/contracts`.

## 9. Como extender el sistema

**Agregar un campo a la postulación**

1. Anadelo a `JobApplication` y a `CreateJobApplicationInput` en `contracts`.
2. Declara su validación en `CreateJobApplicationDto`.
3. Registra la columna en `job-application.mapper.ts` y en `schema.sql`.
4. Propaga el campo en `buildPatch` del servicio.
5. Añade el control al formulario y su regla en `lib/application-form.ts`.

**Agregar un estado al tablero**

1. Amplia `APPLICATION_STATUSES` y `STATUS_CATALOG` con orden y peso.
2. Agrega el valor al tipo enumerado de PostgreSQL.
3. Define su color en cada bloque de tema de `globals.css` y su clase en
   `BoardColumn`.

**Agregar un logro**

Añade la definicion a `ACHIEVEMENTS` en `gamification.ts`. La interfaz lo muestra
sin cambios adicionales, siempre que su `iconId` exista en el catalogo de iconos.

**Agregar un tema**

Añade el identificador a `THEME_IDS`, la entrada descriptiva a `THEMES` y el
bloque `[data-theme='...']` en `globals.css`. El selector lo listara solo.

## 10. Como entrar al panel de administracion

No hay una cuenta aparte ni una contrasena distinta: el panel reconoce a la
cuenta normal cuyo correo coincide con la variable `ADMIN_EMAIL` de la API.

1. En Render, en el servicio `jobtrack-api`, anadir la variable de entorno
   `ADMIN_EMAIL` con el correo con el que se inicia sesion en Deska. El
   Blueprint la declara con `sync: false`, asi que hay que darle valor a mano.
   Render reinicia el servicio al guardarla.
2. Comprobar que llego: `GET /api/health` devuelve `adminConfigured: true`. Es
   un booleano y nunca la direccion, para no confirmar correos a extranos.
3. Iniciar sesion en la aplicacion con ese mismo correo, por el metodo que sea.
   Si se entra con Google, el correo que cuenta es el de la cuenta de Google.
4. Abrir `/admin` escribiendo la direccion. No hay enlace en la interfaz a
   proposito: el panel no forma parte del producto que usa la gente.

La comparacion ignora mayusculas y espacios sobrantes, pero exige coincidencia
exacta del resto. Sin la variable el panel esta cerrado para todos, incluida la
cuenta que opera el proyecto, y el guarda responde lo mismo en los dos casos
para no revelar si existe administrador.
