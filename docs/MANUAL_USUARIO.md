# Manual de usuario

Guia paso a paso para usar Deska, el tablero que convierte tu búsqueda de
empleo en una partida con niveles, rachas y logros.

## Indice

1. [Crear tu cuenta](#1-crear-tu-cuenta)
2. [Conocer la pantalla principal](#2-conocer-la-pantalla-principal)
3. [Registrar una oferta de empleo](#3-registrar-una-oferta-de-empleo)
4. [Actualizar el estado de una postulación](#4-actualizar-el-estado-de-una-postulación)
5. [Editar y eliminar postulaciones](#5-editar-y-eliminar-postulaciones)
5.1. [La ficha completa de una vacante](#51-la-ficha-completa-de-una-vacante)
5.2. [Lo que viene: entrevistas, seguimientos y videollamadas](#52-lo-que-viene-entrevistas-y-seguimientos)
6. [Separar el tablero por áreas](#6-separar-el-tablero-por-áreas)
7. [El mural de notas](#7-el-mural-de-notas)
8. [Entender la capa de juego](#8-entender-la-capa-de-juego)
9. [Personalizar la apariencia](#9-personalizar-la-apariencia)
10. [Usar Deska en el teléfono](#10-usar-deska-en-el-teléfono)
11. [Sincronización entre dispositivos](#11-sincronización-entre-dispositivos)
12. [Que pasa si te quedas sin conexión](#12-que-pasa-si-te-quedas-sin-conexión)
13. [Preguntas frecuentes](#13-preguntas-frecuentes)

---

## 1. Crear tu cuenta

Hay dos formas de entrar. La más rápida es **Continuar con Google**: un solo
clic, sin contraseña que recordar y sin correo de confirmación, porque el
proveedor ya verifico tu dirección.

Si prefieres correo y contraseña:

1. Abre Deska. La página de bienvenida describe el tablero y ofrece dos
   botones: **Crear una cuenta** y **Ya tengo cuenta**.
2. Pulsa **Crear una cuenta**.
3. Escribe tu correo electronico y una contraseña de al menos **8 caracteres**.
4. Pulsa **Registrarme**.
   - Si el proyecto pide confirmación por correo, verás el aviso
     "Cuenta creada. Revisa tu correo para confirmarla y después inicia sesión".
     Abre el enlace que recibiste y vuelve a la página de acceso.
   - Si la confirmación no es obligatoria, entraras directo al tablero.
5. Para volver más tarde, usa **Ya tengo cuenta**, escribe tus credenciales y
   pulsa **Entrar**.

**Errores comunes y que significan**

| Mensaje | Que hacer |
| --- | --- |
| El correo no tiene un formato valido. | Revisa que incluya `@` y un dominio. |
| La contraseña necesita al menos 8 caracteres. | Alarga la contraseña. |
| El correo o la contraseña no coinciden. | Verifica ambos datos. |
| Ese correo ya tiene una cuenta. | Usa **Ya tengo una cuenta** para entrar. |
| No hay conexión con el servicio de autenticación. | Revisa tu red y reintenta. |

---

## 2. Conocer la pantalla principal

Al entrar verás el tablero dividido en dos zonas.

**El tablero kanban** ocupa la mayor parte de la pantalla y tiene seis columnas:

| Columna | Que significa |
| --- | --- |
| **Interesa** | Vacantes guardadas que todavia no has postulado. |
| **Postulado** | Ya enviaste tu candidatura y esperas respuesta. |
| **Entrevista** | Tienes al menos un proceso de entrevista en curso. |
| **Oferta** | Recibiste una propuesta formal de contratacion. |
| **Contratado** | Aceptaste la oferta y cerraste el proceso con éxito. |
| **Descartado** | El proceso termino sin oferta. |

Cada columna muestra un contador con el número de tarjetas que contiene.

Debajo del tablero esta el **mural de notas**, para recordatorios sueltos que no
pertenecen a ninguna vacante concreta.

**El panel lateral** reúne tu progreso: nivel actual, racha, resumen numérico y
logros. En el resumen, **Seguimientos** cuenta los procesos vivos a los que ya
les tocaba respuesta, y se pone en color de aviso mientras quede alguno. En
pantallas pequeñas este panel aparece arriba del tablero.

En la cabecera encontraras:

- **Nueva postulación**: abre el formulario de registro.
- **Actualizar**: vuelve a pedir el tablero al servidor.
- **Tu cuenta**: el boton con tu foto y tu nombre. Reúne los temas visuales, el
  estilo de iconos, la música de fondo y el cierre de sesión.

Debajo del título "Tu tablero" hay un indicador de conexión con tres estados:
**Sincronizado**, **Reconectando** y **Sin conexión**.

---

## 3. Registrar una oferta de empleo

1. Pulsa **Nueva postulación**.
2. Completa el formulario. Solo **Empresa** y **Puesto** son obligatorios:

   | Campo | Para que sirve |
   | --- | --- |
   | Empresa | Nombre de la organización (hasta 120 caracteres). |
   | Puesto | Título de la vacante (hasta 120 caracteres). |
   | Estado | Columna donde nacera la tarjeta. Por defecto **Interesa**. |
   | Prioridad | Baja, Media o Alta. Se muestra en la esquina de la tarjeta. |
   | Ubicación | Ciudad o pais. |
   | Modalidad | Presencial, Hibrido o Remoto. |
   | Expectativa salarial | Solo números enteros, sin puntos ni comas. |
   | Enlace de la vacante | Dirección completa, por ejemplo `https://empresa.com/vacante`. |
   | Fecha de postulación | Día en que enviaste la candidatura. |
   | Fecha de entrevista | Día y hora de la entrevista agendada. |
   | Área del tablero | El campo al que pertenece la vacante, por ejemplo *Desarrollo* o *Marketing* (hasta 60 caracteres). |
   | Contacto | Quién lleva el proceso dentro de la empresa, con su correo o teléfono. |
   | Versión del currículum | Cuál de tus CV enviaste, por ejemplo *CV backend v3*. Así sabes cuál defender en la entrevista. |
   | Versión de la carta | Igual, para la carta de presentación, si enviaste alguna. |
   | Fecha de seguimiento | El día que toca volver a escribir si no hay respuesta. |
   | Notas | Preguntas de la entrevista, impresiones y siguientes pasos (hasta 4000 caracteres). |

3. Pulsa **Guardar postulación**.

La tarjeta aparece al final de la columna elegida y el panel lateral suma la
experiencia ganada.

**Si algo esta mal**, el campo afectado se marca en rojo con una explicacion
concreta; corrige el dato y vuelve a enviar. El formulario nunca se pierde.

---

## 4. Actualizar el estado de una postulación

Hay tres formas de mover una tarjeta, todas con el mismo efecto.

**A. Arrastrando con el raton o el dedo**

1. Manten pulsado el icono de agarre (las seis marcas) en la esquina superior
   izquierda de la tarjeta.
2. Arrastra la tarjeta hacia otra columna. La columna de destino se resalta.
3. Suelta. El cambio se guarda de inmediato.

**B. Con el teclado**

1. Tabula hasta el icono de agarre de la tarjeta.
2. Pulsa **Espacio** o **Enter** para levantarla.
3. Usa las **flechas** para moverla entre columnas y posiciones.
4. Pulsa **Espacio** o **Enter** para soltarla, o **Escape** para cancelar.

**C. Con el selector de estado**

En la parte inferior de cada tarjeta hay una lista desplegable con los seis
estados. Elige el nuevo estado y la tarjeta viaja sola a esa columna. Es la vía
más comoda en telefonos.

---

## 5. Editar y eliminar postulaciones

Para cambios rapidos desde el propio tablero:

**Editar**: pulsa el icono de lapiz de la tarjeta. Se abre el formulario con los
datos ya cargados; cambia lo que necesites y pulsa **Guardar cambios**. Es el
lugar habitual para agregar notas después de una llamada o registrar la fecha de
una entrevista recien agendada.

**Eliminar**: pulsa el icono de papelera. Aparece un dialogo de confirmación que
nombra la postulación. Pulsa **Eliminar** para borrarla o **Conservar** para
volver atras. La eliminacion no se puede deshacer.

---

## 5.1 La ficha completa de una vacante

Una tarjeta del tablero tiene que caber en una columna, asi que ahi todo va
recortado. **Pulsa el titulo de la tarjeta** —o el icono de capas de la fila de
abajo— y se abre la ficha completa de esa vacante, en su propia dirección: puedes
abrirla en otra pestaña, guardarla en marcadores o mandartela de la computadora
al teléfono.

En la ficha caben las cosas que en la tarjeta no:

- **Los datos, en grande.** Prioridad, ubicación, contacto, fechas, expectativa
  salarial y el enlace a la publicación, cada uno en su recuadro y sin recortar.
- **Las notas del proceso.** Un campo de diez lineas para lo que preguntaron, con
  quien hablaste y que queda pendiente. Escribe y pulsa **Guardar las notas**; si
  te arrepientes, **Descartar los cambios** vuelve a lo que habia.
- **Archivos y capturas.** Todo lo que acompaña a esa vacante: la captura del
  anuncio, el correo de respuesta, la prueba tecnica en PDF. Hay tres formas de
  añadir uno, y todas valen:
  - **Pegar con Ctrl+V** (Cmd+V en Mac) una captura que acabas de recortar.
  - **Arrastrar** los archivos sobre el panel.
  - Pulsar **Añadir archivo** y elegirlos a mano.

  Las imagenes se ven ahi mismo, sin descargarlas. Se aceptan PNG, JPG, WebP y
  PDF, hasta 5 MB por archivo. Al eliminar la vacante, sus archivos se van con
  ella.
- **Lo que enviaste.** El currículum y la carta concretos que mandaste a esta
  oferta, elegidos de los que ya subiste o subiendo uno nuevo sin salir de la
  pantalla. Guardarlo evita presentarte a la entrevista con una version distinta
  de la que leyeron.

También puedes cambiar la etapa desde aqui, editar el resto de los datos y
eliminar la vacante. **Volver al tablero**, arriba del todo, te devuelve.

---

## 5.2 Lo que viene: entrevistas y seguimientos

Tus fechas viven repartidas por seis columnas, asi que para saber si hay algo
mañana habria que repasar el tablero entero. El apartado **Lo que viene** las
reune todas en una lista: cada entrevista agendada y cada fecha de seguimiento de
los procesos que siguen abiertos.

- Está ordenado de lo más urgente a lo más lejano, y abarca los próximos treinta
  días.
- Lo vencido va primero y en color de aviso, con el recuento arriba a la derecha:
  es lo único que ya deberia estar hecho.
- Cada linea dice cuando es en lenguaje normal —*hoy*, *mañana*, *en 4 días*,
  *hace 3 días*— y lleva a la ficha de esa vacante de un clic.
- Los procesos cerrados, contratados o descartados, no aparecen: ya no piden
  nada.

En el teléfono es lo primero que ves al abrir Deska, antes incluso del tablero.
En pantalla ancha vive arriba de la columna derecha.

### El enlace de la videollamada

Al registrar una entrevista puedes pegar el **enlace de la reunión** —Zoom,
Meet, Teams, Whereby o el que use la empresa—. Es un campo distinto del enlace
de la vacante: uno lleva al anuncio y el otro a la sala.

Cuando lo guardas, la entrevista aparece con el nombre y el color de su
plataforma, tanto en la agenda como en la ficha de la vacante, para que
distingas dos entrevistas del mismo día de un vistazo.

Dos cosas están pensadas para que no falles:

- **La hora sale en tu zona horaria, y se dice cuál es.** Quien agendó la
  entrevista pudo darte la hora en otro país, y una hora sin zona no hay forma
  de comprobarla. Debajo del día verás algo como *Hora de Guatemala, tu zona
  horaria*.
- **Quince minutos antes, el enlace se convierte en un botón de unirse**
  destacado, y sigue así durante la hora siguiente por si te desconectas y
  tienes que volver a entrar. Antes de eso el enlace también funciona: puedes
  abrir la sala cuando quieras para probar la cámara.

---

## 6. Separar el tablero por áreas

Si buscas en más de un campo a la vez, puedes separar el tablero por **áreas**.
Un área es simplemente un nombre que tu eliges: *Desarrollo de software*,
*Marketing*, *Diseño*, lo que necesites.

1. Al registrar o editar una postulación, escribe el área en **Área del tablero**.
   El campo sugiere las áreas que ya usaste, para que no acabes con *Marketing* y
   *marketing* como si fueran distintas.
2. En cuanto exista al menos un área, aparece una fila de pestañas sobre el
   tablero: **Todas**, una por cada área y **Sin área** si aun te queda alguna
   postulación sin clasificar. Cada pestaña muestra cuántas postulaciones tiene.
3. Pulsa una pestaña para que el tablero muestre solo esa área.

El filtro cambia lo que ves en el tablero, **no** tu progreso: el nivel, la racha
y los logros siempre cuentan toda tu búsqueda, porque el nivel es tuyo y no de un
área.

---

## 7. El mural de notas

Debajo del tablero hay un mural para lo que no cabe en una tarjeta: *preparar el
portafolio*, *llamar el martes*, *pedir carta de recomendacion*.

**Crear una nota**

1. Pulsa **Nueva nota**.
2. Escribe el texto (hasta 280 caracteres) y elige uno de los cinco colores.
3. Pulsa **Crear nota**.

La nota aparece en el mural, ligeramente desplazada respecto a las anteriores
para que nunca quede una escondida debajo de otra.

**Mover una nota**

Arrastrala por el icono de agarre de su esquina superior izquierda. También
funciona con el teclado: pulsa `Tab` hasta llegar a ese icono, luego la barra
espaciadora y muevela con las flechas.

La posición se guarda como una proporcion del mural, así que una nota que dejaste
arriba a la derecha en la computadora sigue arriba a la derecha en el teléfono.

**Editar o eliminar**

Pulsa el icono del lapiz de la nota. Se abre el mismo editor, donde puedes
cambiar el texto, cambiar el color o pulsar **Eliminar**.

---

## 8. Entender la capa de juego

**Experiencia**. Cada acción suma puntos:

| Acción | Puntos |
| --- | --- |
| Registrar una postulación | 10 |
| Escribir notas en una postulación | 5 |
| Agendar una entrevista | 20 |
| Avanzar de etapa | 15 más 10 por cada escalon ganado |
| Recibir una oferta | 60 |
| Cerrar como contratado | 150 |
| Registrar un descarte | 8 |

Retroceder una tarjeta nunca resta puntos. Cada postulación recuerda la etapa
más adelantada por la que ha pasado, y es desde ahi desde donde se cuenta: si
llevaste una oferta hasta *Contratado* y despues la mueves a otra columna,
conservas los 150 puntos y el logro. Mover una tarjeta corrige donde está, no
borra que llegaste hasta ahi. Avanzar de verdad sigue sumando; reorganizar el
tablero no resta.

**Niveles**. La barra del panel indica cuanto falta para el siguiente nivel.
Cada nivel otorga un rango, de **Aspirante** a **Leyenda del empleo**. Al subir
aparece un aviso de felicitacion que puedes cerrar con **Continuar**.

**Racha**. Cuenta los días consecutivos con actividad en el tablero. Se mantiene
viva si tu último movimiento fue hoy o ayer.

**Logros**. Son ocho metas concretas (primera postulación, primera entrevista,
primera oferta, contrato firmado, resiliencia, memoria de acero, constancia
semanal y sembrando oportunidades). Cada tarjeta muestra su progreso actual y la
bonificacion que otorga al desbloquearse. Como los puntos, se miden por las
etapas alcanzadas: un logro desbloqueado no se pierde al reordenar el tablero.
La lista vive plegada; el encabezado muestra cuantos llevas sin necesidad de
abrirla.

---

## 8.1 El tutorial de bienvenida

La primera vez que entras, y mientras no tengas ninguna postulación, aparece un
recorrido de cuatro pasos. La pantalla se atenua y se desenfoca salvo el
elemento del que se habla, que queda nitido y enmarcado.

- **Siguiente** avanza al paso siguiente.
- **Saltar** cierra el tutorial de inmediato. La tecla **Escape** hace lo mismo.

Una vez completado o saltado no vuelve a mostrarse, y tampoco aparece si ya
tienes postulaciones registradas.

## 9. Personalizar la apariencia

Pulsa el boton de **tu cuenta** en la cabecera, el que muestra tu foto y tu nombre.

**Temas** agrupados en tres familias:

- *Básicos*: Claro, Oscuro, Minimalista.
- *Pixel*: Pixel rosa, Pixel azul (bordes duros y tipografía monoespaciada).
- *Creativos*: Gaming, Anime, Galaxy.

**Iconos**: elige entre **Contorno** (trazo fino y neutro) y **Pixel** (bloques
solidos de estilo retro). La vista previa muestra tres iconos de ejemplo.

**Música de fondo**: al final del panel hay un interruptor para reproducir un
una pieza breve que se repite. Cada una tiene melodia y bajo propios, se genera
en tu navegador a volumen bajo, y cambia con el tema:

| Temas | Pieza |
| --- | --- |
| Claro, oscuro, minimalista | Jingle sereno |
| Pixel rosa y azul | Jingle de arcade |
| Gaming | Jingle neon |
| Anime | Jingle luminoso |
| Galaxy | Jingle estelar |

Empieza siempre apagada y solo suena si tu la activas.

Estas preferencias se guardan en el dispositivo y se aplican al instante, sin
recargar la página. Si mueves el tema en la computadora, el teléfono conserva el
suyo: es una preferencia por dispositivo, no por cuenta.

---

## 10. Usar Deska en el teléfono

La interfaz se adapta sola:

- Las columnas se reparten en varias filas y se recorren desplazando la página hacia abajo; nunca hay que desplazarse en horizontal.
- El orden vertical pone delante lo que hay que hacer: primero **Lo que viene**, después el tablero, y el nivel, el resumen y los logros al final, donde se consultan de vez en cuando.
- Los logros vienen plegados; el encabezado dice cuántos llevas.
- Los formularios se abren como hojas a pantalla completa.
- Los botones de la cabecera muestran solo el icono para ahorrar espacio.

Para mover tarjetas en pantallas táctiles, el selector de estado de cada tarjeta
suele ser más comodo que el arrastre.

---

## 11. Sincronización entre dispositivos

Tus postulaciones viven en la nube, asociadas a tu cuenta. Al iniciar sesión en
otro dispositivo verás exactamente el mismo tablero.

Mientras el indicador diga **Sincronizado**, los cambios que hagas en un
dispositivo aparecen en el otro en cuestion de segundos, sin recargar: si mueves
una tarjeta en la computadora, la verás moverse en el teléfono. El mural de notas
viaja por el mismo canal, así que una nota que arrastras en un sitio se recoloca
en el otro.

Si el indicador dice **Reconectando**, la aplicación sigue funcionando y
restablece el canal por su cuenta. Puedes pulsar **Actualizar** en cualquier
momento para pedir el tablero completo.

---

## 12. Que pasa si te quedas sin conexión

Deska detecta la pérdida de red y muestra un aviso amarillo:
"Estas sin conexión. Puedes seguir consultando el tablero, pero los cambios no se
guardarán hasta que vuelva la señal".

Durante ese tiempo:

- Puedes **consultar** todas las tarjetas ya cargadas.
- Si intentas guardar algo, verás el mensaje "Sin conexión a internet. Tus
  cambios no se guardaron; vuelve a intentarlo cuando recuperes la señal". El
  formulario conserva lo que escribiste.
- Si arrastras una tarjeta y la petición falla, la tarjeta **regresa a su
  posición original** para que el tablero nunca muestre algo distinto de lo que
  esta guardado.

Al recuperar la señal, la aplicación vuelve a pedir el tablero automáticamente.

---

## 12.1 El panel de administración

Si eres quien administra el proyecto, `/admin` resume cómo se está usando
Deska en conjunto: cuánta gente lo usa, en qué etapa está todo, qué empresas
reciben más postulaciones, cuáles contratan y cuáles descartan más, y cuántos
procesos llevan un mes parados.

El acceso lo decide la variable `ADMIN_EMAIL` de la API, y solo esa cuenta
entra. El informe está hecho **solo de recuentos**: no muestra las notas, los
contactos ni la identidad de nadie.

---

## 13. Preguntas frecuentes

**Puedo ver las postulaciones de otra persona.**
No. Cada cuenta solo alcanza sus propios datos, tanto en la interfaz como en la
base de datos.

**Perdi la sesión mientras trabajaba.**
Verás el aviso "Tu sesión expiró. Inicia sesión de nuevo para continuar". Vuelve
a entrar; ningún dato se pierde.

**Puedo dejar campos vacíos.**
Si, salvo empresa y puesto. Los campos vacíos se guardan como "sin dato" y no
afectan el calculo de experiencia.

**Que pasa si me descartan de un proceso.**
Mueve la tarjeta a **Descartado**. Sumas 8 puntos de experiencia y avanzas hacia
el logro *Resiliencia*. Registrar los descartes también mantiene viva tu racha.

**Como cierro sesión.**
Pulsa **Salir** en la cabecera del tablero.
