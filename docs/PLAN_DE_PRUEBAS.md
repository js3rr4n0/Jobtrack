# Plan de pruebas

Estrategia de verificacion de Jobtrack. Cada seccion declara el objetivo, las
restricciones bajo las que se ejercita el sistema, el resultado esperado y el
resultado que se considera inaceptable.

## 1. Como ejecutar

```bash
npm test                  # todas las suites
npm run test:unit         # solo pruebas unitarias
npm run test:integration  # solo pruebas de integracion
```

Por paquete:

```bash
npm test --workspace @jobtrack/contracts
npm test --workspace @jobtrack/api
npm test --workspace @jobtrack/web
```

## 2. Inventario de suites

| Paquete | Archivo | Tipo | Casos |
| --- | --- | --- | --- |
| contracts | `src/gamification.spec.ts` | Unitaria | 17 |
| contracts | `src/analytics.spec.ts` | Unitaria | 15 |
| contracts | `src/board.spec.ts` | Unitaria | 20 |
| contracts | `src/sticky-note.spec.ts` | Unitaria | 22 |
| api | `src/config/environment.spec.ts` | Unitaria | 6 |
| api | `src/auth/token-verifier.service.spec.ts` | Unitaria | 14 |
| api | `src/applications/job-applications.service.spec.ts` | Unitaria | 18 |
| api | `src/notes/sticky-notes.service.spec.ts` | Unitaria | 13 |
| api | `test/applications.e2e-spec.ts` | Integracion | 15 |
| api | `test/notes.e2e-spec.ts` | Integracion | 10 |
| api | `test/realtime.e2e-spec.ts` | Integracion | 5 |
| web | `src/lib/application-form.test.ts` | Unitaria | 19 |
| web | `src/lib/api-client.test.ts` | Unitaria | 14 |
| web | `src/lib/board-state.test.ts` | Unitaria | 9 |
| web | `src/lib/note-state.test.ts` | Unitaria | 7 |
| web | `src/lib/auth-form.test.ts` | Unitaria | 11 |
| web | `src/lib/auth-providers.test.ts` | Unitaria | 5 |
| web | `src/lib/user-profile.test.ts` | Unitaria | 6 |
| web | `src/lib/auth-callback.test.ts` | Unitaria | 12 |
| web | `src/lib/drag-and-drop.test.ts` | Unitaria | 8 |
| web | `src/lib/preferences.test.ts` | Unitaria | 8 |
| web | `src/lib/guided-tour.test.ts` | Unitaria | 10 |
| web | `src/lib/ambient-music.test.ts` | Unitaria | 12 |
| web | `src/components/notes/note-geometry.test.ts` | Unitaria | 4 |
| web | `src/components/board/ApplicationForm.test.tsx` | Componente | 6 |
| web | `src/components/board/CategoryTabs.test.tsx` | Componente | 5 |
| web | `src/components/icons/Icon.test.tsx` | Componente | 5 |
| web | `src/components/gamification/LevelMeter.test.tsx` | Componente | 4 |
| web | `tests/integration/board-workspace.test.tsx` | Integracion | 14 |

**Total: 314 casos.**

---

## 3. Pruebas unitarias

**Objetivo.** Validar el funcionamiento individual de cada componente: entradas
de datos y estados visuales.

**Restricciones aplicadas.** Ausencia de conexion a internet, valores nulos,
cadenas vacias, textos con solo espacios, numeros invalidos, fechas ilegibles,
almacenamiento del navegador bloqueado y catalogos vacios.

**Resultado esperado.** Manejo de errores legible y validaciones correctas.

**Resultado no aceptado.** Cuelgues de la aplicacion o datos corruptos.

### 3.1 Entradas de datos

| Caso | Restriccion | Resultado esperado | Donde |
| --- | --- | --- | --- |
| Formulario vacio | Valores vacios | "Escribe el nombre de la empresa." y "Escribe el puesto al que postulas."; no se llama a la API | `application-form.test.ts`, `ApplicationForm.test.tsx` |
| Campos con solo espacios | Texto en blanco | Se tratan como vacios y se rechazan | `application-form.test.ts` |
| Salario no numerico | `"mucho"` | "Usa solo numeros enteros, sin puntos ni comas."; el envio se bloquea | `application-form.test.ts`, `ApplicationForm.test.tsx` |
| Salario negativo | `-100` | "La expectativa salarial no puede ser negativa." | `application-form.test.ts` |
| Enlace sin protocolo | `empresa.com` | Mensaje con ejemplo de URL valida | `application-form.test.ts` |
| Fecha ilegible | `"30 de febrero"` | "Revisa la fecha y hora de la entrevista." | `application-form.test.ts` |
| Texto sobre el limite | 121 caracteres | Mensaje que indica el maximo permitido | `application-form.test.ts` |
| Campos opcionales vacios | Cadenas vacias | Se envian como `null`, nunca como `""` | `application-form.test.ts` |
| Conversion de fechas | Nulo y valor corrupto | Devuelve cadena vacia sin lanzar; la conversion es reversible | `application-form.test.ts` |
| Credenciales invalidas | Correo sin arroba, clave corta | Mensajes especificos por campo | `auth-form.test.ts` |
| Cuerpo con campos desconocidos | Propiedad inventada | La API responde 400 | `applications.e2e-spec.ts` |
| Identificador no UUID | `"no-es-uuid"` | La API responde 400 antes de tocar la base | `applications.e2e-spec.ts` |
| Valores nulos en campos obligatorios | `null` | 400 con detalle y **ninguna fila creada** | `applications.e2e-spec.ts` |

### 3.2 Sin conexion a internet

| Caso | Restriccion | Resultado esperado | Donde |
| --- | --- | --- | --- |
| Peticion con red caida | `navigator.onLine` falso | No se invoca `fetch`; error de tipo `offline` con mensaje accionable | `api-client.test.ts` |
| Fallo de red durante la peticion | `TypeError: Failed to fetch` | Se convierte en `ApiError` legible, no se propaga el error crudo | `api-client.test.ts` |
| Tiempo de espera agotado | `AbortError` | Error de tipo `timeout` con mensaje propio | `api-client.test.ts` |
| Respuesta de error que no es JSON | HTML en el cuerpo | Se maneja como error de servidor sin excepcion | `api-client.test.ts` |
| Autenticacion sin red | Error de red del proveedor | "No hay conexion con el servicio de autenticacion." | `auth-form.test.ts` |

### 3.3 Estados visuales

| Caso | Restriccion | Resultado esperado | Donde |
| --- | --- | --- | --- |
| Catalogo de iconos completo | Ambos paquetes, todos los nombres | Cada combinacion renderiza formas; ninguna queda vacia | `Icon.test.tsx` |
| Icono decorativo | Sin texto alternativo | `aria-hidden="true"` | `Icon.test.tsx` |
| Icono informativo | Con titulo | Expuesto como `img` con nombre accesible | `Icon.test.tsx` |
| Estilo por paquete | Contorno y pixel | Trazo en uno, relleno en el otro | `Icon.test.tsx` |
| Nivel inicial | Cero experiencia | "Nivel 1" y rango "Aspirante" | `LevelMeter.test.tsx` |
| Barra de progreso | 100 puntos | `role="progressbar"` con `aria-valuenow` correcto | `LevelMeter.test.tsx` |
| Racha en singular y plural | 1 dia y 5 dias | "1 dia" y "5 dias" | `LevelMeter.test.tsx` |
| Envio en curso | `isSubmitting` activo | El boton se deshabilita y muestra "Guardando..." | `ApplicationForm.test.tsx` |
| Correccion de un campo | Escribir tras el error | El mensaje desaparece de inmediato | `ApplicationForm.test.tsx` |

### 3.4 Reglas de dominio

| Caso | Restriccion | Resultado esperado | Donde |
| --- | --- | --- | --- |
| Experiencia con valores invalidos | `NaN`, `Infinity`, negativos, `undefined` | Se normalizan a cero; nivel 1 sin lanzar | `gamification.spec.ts` |
| Umbral exacto de nivel | 50, 149, 150 puntos | El nivel cambia solo al alcanzar el umbral | `gamification.spec.ts` |
| Titulo fuera de rango | Nivel 999 y nivel negativo | Devuelve un titulo del catalogo, nunca `undefined` | `gamification.spec.ts` |
| Retroceso de etapa | Entrevista a Postulado | Cero puntos, nunca negativos | `gamification.spec.ts` |
| Logros sin actividad | Estadisticas vacias | Todos bloqueados con progreso cero | `gamification.spec.ts` |
| Progreso de logro excedido | 40 de 10 postulaciones | El progreso se acota al objetivo | `gamification.spec.ts` |
| Rachas con fechas invalidas | `"no-es-una-fecha"`, cadena vacia | Se ignoran; racha cero sin excepcion | `analytics.spec.ts` |
| Actividad repetida el mismo dia | Dos marcas el mismo dia | Cuenta un solo dia | `analytics.spec.ts` |
| Racha interrumpida | Ultima actividad hace 9 dias | Racha actual cero, racha mas larga conservada | `analytics.spec.ts` |
| Notas en blanco | `"   "` | No cuentan como nota escrita | `analytics.spec.ts` |
| Determinismo de la experiencia | Mismo estado dos veces | Mismo total en ambas llamadas | `analytics.spec.ts` |
| Tablero vacio | Sin postulaciones | Seis columnas presentes y perfil coherente | `board.spec.ts`, `analytics.spec.ts` |
| Reordenar con indice fuera de rango | Indice 50 y -5 | Se acota al final o al inicio | `board.spec.ts` |
| Mover tarjeta inexistente | Identificador desconocido | El tablero se devuelve intacto | `board.spec.ts` |
| Movimiento entre columnas | Cambio de estado | Ambas columnas quedan numeradas sin huecos y no se pierde ninguna tarjeta | `board.spec.ts` |
| Tablero sin areas | Ninguna postulacion clasificada | No se propone ningun area; el selector no aparece | `board.spec.ts`, `CategoryTabs.test.tsx` |
| Areas con espacios sobrantes | `"Diseno"` y `"  Diseno  "` | Se cuentan como una sola area | `board.spec.ts` |
| Area en blanco | `"   "` | Se descarta como area y la postulacion cuenta como sin clasificar | `board.spec.ts` |
| Area inexistente | Filtro por un area sin postulaciones | Tablero vacio, sin excepcion | `board.spec.ts` |
| Suplantacion de las vistas especiales | Area escrita igual que "Todas" o "Sin area" | Los identificadores empiezan por espacio y las areas se recortan, asi que no colisionan | `board.spec.ts` |
| Posicion de nota corrupta | `null`, `NaN`, `Infinity`, texto | Se convierte al origen del mural en lugar de romper el dibujado | `sticky-note.spec.ts` |
| Posicion de nota fuera del mural | -40 y 180 | Se acota entre 0 y 100 | `sticky-note.spec.ts` |
| Texto de nota en blanco | `"   "`, `null`, `undefined` | Se descarta; nunca se guarda una nota vacia | `sticky-note.spec.ts` |
| Texto de nota sobre el limite | 330 caracteres | Se recorta al maximo permitido | `sticky-note.spec.ts` |
| Color de nota desconocido | `"turquesa"` | Se rechaza; al leer de la base se sustituye por el color por defecto | `sticky-note.spec.ts` |
| Orden del mural | Notas con la misma fecha de creacion | Desempate por identificador, igual en todos los dispositivos | `sticky-note.spec.ts` |
| Mover una nota inexistente | Identificador desconocido | El mural se devuelve intacto | `sticky-note.spec.ts` |
| Mural aun sin tamano | Recorrido de 0 pixeles | La nota conserva su posicion en lugar de saltar al origen | `sticky-note.spec.ts`, `note-geometry.test.ts` |
| Entorno mal configurado | Puerto no numerico, URL invalida, credenciales ausentes | El arranque falla con un mensaje que enumera cada problema | `environment.spec.ts` |
| Preferencias corruptas | Tema inexistente en `localStorage` | Se descarta y se usa el valor por defecto | `preferences.test.ts` |
| Almacenamiento bloqueado | `localStorage` que lanza | Lectura y escritura toleran el fallo sin romper la app | `preferences.test.ts` |

### 3.5 Servicio de postulaciones

| Caso | Resultado esperado | Donde |
| --- | --- | --- |
| Alta con datos minimos | Estado `wishlist`, prioridad media, posicion 0, opcionales en `null` | `job-applications.service.spec.ts` |
| Fecha de postulacion automatica | Solo se fija cuando el estado no es `wishlist` | `job-applications.service.spec.ts` |
| Actualizacion parcial | Los campos no enviados conservan su valor | `job-applications.service.spec.ts` |
| Acceso cruzado entre cuentas | `NotFoundException` al leer, actualizar o eliminar lo ajeno | `job-applications.service.spec.ts` |
| Reordenamiento | La columna queda numerada 0, 1, 2 sin huecos | `job-applications.service.spec.ts` |
| Publicacion de eventos | Cada alta, cambio, movimiento y baja emite su evento con el dispositivo de origen | `job-applications.service.spec.ts` |

### 3.6 Servicio del mural de notas

| Caso | Resultado esperado | Donde |
| --- | --- | --- |
| Alta sin posicion | La nota se escalona respecto a las existentes y no queda tapada | `sticky-notes.service.spec.ts` |
| Alta sin color | Toma el color por defecto | `sticky-notes.service.spec.ts` |
| Posicion fuera del mural | Se acota entre 0 y 100 antes de guardarse | `sticky-notes.service.spec.ts` |
| Edicion parcial | Los campos no enviados conservan su valor | `sticky-notes.service.spec.ts` |
| Distincion de eventos | Un cambio que solo toca la posicion se anuncia como `moved`; el resto, como `updated` | `sticky-notes.service.spec.ts` |
| Acceso cruzado entre cuentas | `NotFoundException` al editar o eliminar notas ajenas | `sticky-notes.service.spec.ts` |
| Orden de lectura | De la mas antigua a la mas reciente, solo las propias | `sticky-notes.service.spec.ts` |

---

## 4. Pruebas de integracion

**Objetivo.** Verificar la conexion correcta entre la interfaz, la base de datos
y la sincronizacion.

**Restricciones aplicadas.** Retrasos y cortes de red, tokens ausentes,
manipulados o expirados, y dos dispositivos conectados a la vez.

**Resultado esperado.** Actualizacion en tiempo real.

**Resultado no aceptado.** Desincronizacion entre dispositivos.

### 4.1 Interfaz contra la API

Ejecutadas sobre `BoardWorkspace` con la API simulada a nivel de `fetch`, el
canal de tiempo real interceptado y la sesion de Supabase sustituida.

| Caso | Resultado esperado |
| --- | --- |
| Carga inicial | El tablero pide `/applications/board` y pinta las postulaciones guardadas |
| Estructura del tablero | Las seis columnas se renderizan como regiones con nombre accesible |
| Indicador de progreso | El nivel y la barra reflejan la experiencia derivada del tablero |
| Alta de postulacion | La peticion `POST` viaja con los datos correctos y la tarjeta aparece en su columna |
| Rechazo del servidor | El detalle "La empresa es obligatoria." se muestra al usuario y la app sigue operativa |
| Movimiento de columna | La tarjeta cambia de region y se envia `PATCH /:id/move` |
| Eliminacion | Tras confirmar el dialogo se envia `DELETE` y la tarjeta desaparece |
| Alta de nota | La peticion `POST /notes` viaja con el texto y la nota aparece en el mural |
| Nota vacia | El formulario avisa y **no se emite ninguna peticion** |
| Baja de nota | Al eliminarla desde su editor desaparece del mural |

### 4.2 Sincronizacion en tiempo real

| Caso | Resultado esperado | Donde |
| --- | --- | --- |
| Alta en otro dispositivo | La tarjeta aparece en la columna correcta sin recargar | `board-workspace.test.tsx` |
| Baja en otro dispositivo | La tarjeta desaparece del tablero local | `board-workspace.test.tsx` |
| Nota creada en otro dispositivo | La nota aparece en el mural local sin recargar | `board-workspace.test.tsx` |
| Alta replicada por WebSocket | El segundo dispositivo recibe el evento con la postulacion completa y el dispositivo de origen | `realtime.e2e-spec.ts` |
| Movimiento replicado | El segundo dispositivo recibe el nuevo estado de la tarjeta | `realtime.e2e-spec.ts` |
| Aislamiento entre cuentas | Un dispositivo de otra cuenta no recibe ningun evento | `realtime.e2e-spec.ts` |
| Conexion sin token | El servidor rechaza el socket con un motivo explicito | `realtime.e2e-spec.ts` |
| Conexion con token manipulado | El servidor rechaza el socket | `realtime.e2e-spec.ts` |

Las pruebas de tiempo real levantan la API en un puerto real y usan clientes
`socket.io` autenticos, por lo que ejercitan el handshake completo. Cada espera
tiene un limite de 5 segundos y falla con un mensaje explicito, de modo que un
retraso de red se reporta como tal y no como un cuelgue silencioso.

### 4.3 Ciclo HTTP completo

| Caso | Resultado esperado | Donde |
| --- | --- | --- |
| Peticion sin token | 401 | `applications.e2e-spec.ts` |
| Token con firma invalida | 401 | `applications.e2e-spec.ts` |
| Token expirado | 401 | `applications.e2e-spec.ts` |
| Sonda de salud | 200 sin autenticacion | `applications.e2e-spec.ts` |
| Ciclo de vida | Alta, consulta, actualizacion, movimiento y baja encadenados | `applications.e2e-spec.ts` |
| Normalizacion de entrada | Los espacios se recortan y las cadenas vacias se guardan como `null` | `applications.e2e-spec.ts` |
| Aislamiento entre cuentas | 404 al leer, actualizar o eliminar datos ajenos | `applications.e2e-spec.ts` |
| Coherencia del perfil | `/gamification/profile` y el tablero reportan la misma experiencia | `applications.e2e-spec.ts` |
| Mural sin token | 401 | `notes.e2e-spec.ts` |
| Ciclo de vida de una nota | Alta, listado, movimiento y baja encadenados | `notes.e2e-spec.ts` |
| Nota vacia, demasiado larga o de color inexistente | 400 con detalle legible | `notes.e2e-spec.ts` |
| Posicion fuera del mural | 400 antes de tocar la base | `notes.e2e-spec.ts` |
| Aislamiento entre cuentas | Las notas ajenas no se listan y devuelven 404 al editarlas | `notes.e2e-spec.ts` |
| Identificador de nota no UUID | 400 | `notes.e2e-spec.ts` |

---

## 5. Comportamiento sin conexion en la interfaz

| Caso | Resultado esperado | Donde |
| --- | --- | --- |
| Red caida al abrir el tablero | Aviso amarillo explicando que se puede consultar pero no guardar | `board-workspace.test.tsx` |
| Intento de guardar sin red | Mensaje "Sin conexion a internet..."; **no se emite ninguna peticion**; el formulario conserva lo escrito | `board-workspace.test.tsx` |
| Movimiento fallido | La tarjeta regresa a su posicion original para no mostrar un estado que no esta guardado | `use-board.ts`, verificado por el reintegro optimista |
| Recuperacion de la red | El tablero se recarga automaticamente tras un error | `use-board.ts` |

---

## 6. Criterios de aceptacion

La entrega se considera correcta cuando:

1. `npm test` termina sin fallos en los tres paquetes.
2. `npm run lint` no reporta advertencias ni errores.
3. `npm run build` compila el paquete compartido, la API y la web.
4. Ninguna prueba deja procesos abiertos ni depende de servicios externos.

Estado actual: **314 casos, todos en verde**, sin dependencias de red externas.

## 7. Verificacion manual complementaria

Aspectos que conviene revisar a mano antes de publicar una version:

- Recorrer los ocho temas comprobando contraste de texto sobre fondo y
  visibilidad del anillo de foco.
- Arrastrar una tarjeta con el raton, con el dedo y con el teclado.
- Arrastrar una nota del mural de las tres formas y confirmar que se queda dentro
  del mural al soltarla junto a un borde.
- Abrir la aplicacion en dos dispositivos con la misma cuenta y confirmar que un
  movimiento en uno se refleja en el otro sin recargar.
- Activar el modo avion a mitad de una edicion y comprobar que el aviso aparece
  y que el texto escrito no se pierde.
