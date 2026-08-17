# Manual de usuario

Guia paso a paso para usar Jobtrack, el tablero que convierte tu busqueda de
empleo en una partida con niveles, rachas y logros.

## Indice

1. [Crear tu cuenta](#1-crear-tu-cuenta)
2. [Conocer la pantalla principal](#2-conocer-la-pantalla-principal)
3. [Registrar una oferta de empleo](#3-registrar-una-oferta-de-empleo)
4. [Actualizar el estado de una postulacion](#4-actualizar-el-estado-de-una-postulacion)
5. [Editar y eliminar postulaciones](#5-editar-y-eliminar-postulaciones)
6. [Entender la capa de juego](#6-entender-la-capa-de-juego)
7. [Personalizar la apariencia](#7-personalizar-la-apariencia)
8. [Usar Jobtrack en el telefono](#8-usar-jobtrack-en-el-telefono)
9. [Sincronizacion entre dispositivos](#9-sincronizacion-entre-dispositivos)
10. [Que pasa si te quedas sin conexion](#10-que-pasa-si-te-quedas-sin-conexion)
11. [Preguntas frecuentes](#11-preguntas-frecuentes)

---

## 1. Crear tu cuenta

1. Abre Jobtrack. La pagina de bienvenida describe el tablero y ofrece dos
   botones: **Crear una cuenta** y **Ya tengo cuenta**.
2. Pulsa **Crear una cuenta**.
3. Escribe tu correo electronico y una contrasena de al menos **8 caracteres**.
4. Pulsa **Registrarme**.
   - Si el proyecto pide confirmacion por correo, veras el aviso
     "Cuenta creada. Revisa tu correo para confirmarla y despues inicia sesion".
     Abre el enlace que recibiste y vuelve a la pagina de acceso.
   - Si la confirmacion no es obligatoria, entraras directo al tablero.
5. Para volver mas tarde, usa **Ya tengo cuenta**, escribe tus credenciales y
   pulsa **Entrar**.

**Errores comunes y que significan**

| Mensaje | Que hacer |
| --- | --- |
| El correo no tiene un formato valido. | Revisa que incluya `@` y un dominio. |
| La contrasena necesita al menos 8 caracteres. | Alarga la contrasena. |
| El correo o la contrasena no coinciden. | Verifica ambos datos. |
| Ese correo ya tiene una cuenta. | Usa **Ya tengo una cuenta** para entrar. |
| No hay conexion con el servicio de autenticacion. | Revisa tu red y reintenta. |

---

## 2. Conocer la pantalla principal

Al entrar veras el tablero dividido en dos zonas.

**El tablero kanban** ocupa la mayor parte de la pantalla y tiene seis columnas:

| Columna | Que significa |
| --- | --- |
| **Interesa** | Vacantes guardadas que todavia no has postulado. |
| **Postulado** | Ya enviaste tu candidatura y esperas respuesta. |
| **Entrevista** | Tienes al menos un proceso de entrevista en curso. |
| **Oferta** | Recibiste una propuesta formal de contratacion. |
| **Contratado** | Aceptaste la oferta y cerraste el proceso con exito. |
| **Descartado** | El proceso termino sin oferta. |

Cada columna muestra un contador con el numero de tarjetas que contiene.

**El panel lateral** reune tu progreso: nivel actual, racha, resumen numerico y
logros. En pantallas pequenas aparece arriba del tablero.

En la cabecera encontraras:

- **Nueva postulacion**: abre el formulario de registro.
- **Actualizar**: vuelve a pedir el tablero al servidor.
- **Apariencia**: temas visuales y estilo de iconos.
- **Salir**: cierra la sesion.

Debajo del titulo "Tu tablero" hay un indicador de conexion con tres estados:
**Sincronizado**, **Reconectando** y **Sin conexion**.

---

## 3. Registrar una oferta de empleo

1. Pulsa **Nueva postulacion**.
2. Completa el formulario. Solo **Empresa** y **Puesto** son obligatorios:

   | Campo | Para que sirve |
   | --- | --- |
   | Empresa | Nombre de la organizacion (hasta 120 caracteres). |
   | Puesto | Titulo de la vacante (hasta 120 caracteres). |
   | Estado | Columna donde nacera la tarjeta. Por defecto **Interesa**. |
   | Prioridad | Baja, Media o Alta. Se muestra en la esquina de la tarjeta. |
   | Ubicacion | Ciudad o pais. |
   | Modalidad | Presencial, Hibrido o Remoto. |
   | Expectativa salarial | Solo numeros enteros, sin puntos ni comas. |
   | Enlace de la vacante | Direccion completa, por ejemplo `https://empresa.com/vacante`. |
   | Fecha de postulacion | Dia en que enviaste la candidatura. |
   | Fecha de entrevista | Dia y hora de la entrevista agendada. |
   | Notas | Contactos, preguntas o siguientes pasos (hasta 4000 caracteres). |

3. Pulsa **Guardar postulacion**.

La tarjeta aparece al final de la columna elegida y el panel lateral suma la
experiencia ganada.

**Si algo esta mal**, el campo afectado se marca en rojo con una explicacion
concreta; corrige el dato y vuelve a enviar. El formulario nunca se pierde.

---

## 4. Actualizar el estado de una postulacion

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
estados. Elige el nuevo estado y la tarjeta viaja sola a esa columna. Es la via
mas comoda en telefonos.

---

## 5. Editar y eliminar postulaciones

**Editar**: pulsa el icono de lapiz de la tarjeta. Se abre el formulario con los
datos ya cargados; cambia lo que necesites y pulsa **Guardar cambios**. Es el
lugar habitual para agregar notas despues de una llamada o registrar la fecha de
una entrevista recien agendada.

**Eliminar**: pulsa el icono de papelera. Aparece un dialogo de confirmacion que
nombra la postulacion. Pulsa **Eliminar** para borrarla o **Conservar** para
volver atras. La eliminacion no se puede deshacer.

---

## 6. Entender la capa de juego

**Experiencia**. Cada accion suma puntos:

| Accion | Puntos |
| --- | --- |
| Registrar una postulacion | 10 |
| Escribir notas en una postulacion | 5 |
| Agendar una entrevista | 20 |
| Avanzar de etapa | 15 mas 10 por cada escalon ganado |
| Recibir una oferta | 60 |
| Cerrar como contratado | 150 |
| Registrar un descarte | 8 |

Retroceder una tarjeta nunca resta puntos: la experiencia refleja el esfuerzo
acumulado, no el resultado.

**Niveles**. La barra del panel indica cuanto falta para el siguiente nivel.
Cada nivel otorga un rango, de **Aspirante** a **Leyenda del empleo**. Al subir
aparece un aviso de felicitacion que puedes cerrar con **Continuar**.

**Racha**. Cuenta los dias consecutivos con actividad en el tablero. Se mantiene
viva si tu ultimo movimiento fue hoy o ayer.

**Logros**. Son ocho metas concretas (primera postulacion, primera entrevista,
primera oferta, contrato firmado, resiliencia, memoria de acero, constancia
semanal y sembrando oportunidades). Cada tarjeta muestra su progreso actual y la
bonificacion que otorga al desbloquearse.

---

## 7. Personalizar la apariencia

Pulsa **Apariencia** en la cabecera.

**Temas** agrupados en tres familias:

- *Basicos*: Claro, Oscuro, Minimalista.
- *Pixel*: Pixel rosa, Pixel azul (bordes duros y tipografia monoespaciada).
- *Creativos*: Gaming, Anime, Galaxy.

**Iconos**: elige entre **Contorno** (trazo fino y neutro) y **Pixel** (bloques
solidos de estilo retro). La vista previa muestra tres iconos de ejemplo.

Ambas preferencias se guardan en el dispositivo y se aplican al instante, sin
recargar la pagina. Si mueves el tema en la computadora, el telefono conserva el
suyo: es una preferencia por dispositivo, no por cuenta.

---

## 8. Usar Jobtrack en el telefono

La interfaz se adapta sola:

- Las columnas se apilan una debajo de otra y se recorren deslizando.
- El panel de progreso pasa a la parte superior.
- Los formularios se abren como hojas a pantalla completa.
- Los botones de la cabecera muestran solo el icono para ahorrar espacio.

Para mover tarjetas en pantallas tactiles, el selector de estado de cada tarjeta
suele ser mas comodo que el arrastre.

---

## 9. Sincronizacion entre dispositivos

Tus postulaciones viven en la nube, asociadas a tu cuenta. Al iniciar sesion en
otro dispositivo veras exactamente el mismo tablero.

Mientras el indicador diga **Sincronizado**, los cambios que hagas en un
dispositivo aparecen en el otro en cuestion de segundos, sin recargar: si mueves
una tarjeta en la computadora, la veras moverse en el telefono.

Si el indicador dice **Reconectando**, la aplicacion sigue funcionando y
restablece el canal por su cuenta. Puedes pulsar **Actualizar** en cualquier
momento para pedir el tablero completo.

---

## 10. Que pasa si te quedas sin conexion

Jobtrack detecta la perdida de red y muestra un aviso amarillo:
"Estas sin conexion. Puedes seguir consultando el tablero, pero los cambios no se
guardaran hasta que vuelva la senal".

Durante ese tiempo:

- Puedes **consultar** todas las tarjetas ya cargadas.
- Si intentas guardar algo, veras el mensaje "Sin conexion a internet. Tus
  cambios no se guardaron; vuelve a intentarlo cuando recuperes la senal". El
  formulario conserva lo que escribiste.
- Si arrastras una tarjeta y la peticion falla, la tarjeta **regresa a su
  posicion original** para que el tablero nunca muestre algo distinto de lo que
  esta guardado.

Al recuperar la senal, la aplicacion vuelve a pedir el tablero automaticamente.

---

## 11. Preguntas frecuentes

**Puedo ver las postulaciones de otra persona.**
No. Cada cuenta solo alcanza sus propios datos, tanto en la interfaz como en la
base de datos.

**Perdi la sesion mientras trabajaba.**
Veras el aviso "Tu sesion expiro. Inicia sesion de nuevo para continuar". Vuelve
a entrar; ningun dato se pierde.

**Puedo dejar campos vacios.**
Si, salvo empresa y puesto. Los campos vacios se guardan como "sin dato" y no
afectan el calculo de experiencia.

**Que pasa si me descartan de un proceso.**
Mueve la tarjeta a **Descartado**. Sumas 8 puntos de experiencia y avanzas hacia
el logro *Resiliencia*. Registrar los descartes tambien mantiene viva tu racha.

**Como cierro sesion.**
Pulsa **Salir** en la cabecera del tablero.
