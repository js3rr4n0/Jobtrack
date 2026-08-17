# Licencias de los iconos

Jobtrack no incrusta imagenes de mapa de bits ni emojis: toda la iconografia es
SVG vectorial declarada en este directorio.

## Paquete "Contorno" (`outline-pack.tsx`)

La geometria de trazo esta basada en **Feather Icons**, publicado bajo licencia
MIT por Cole Bemis.

- Sitio del proyecto: https://feathericons.com
- Repositorio: https://github.com/feathericons/feather
- Licencia: MIT

```
The MIT License (MIT)

Copyright (c) 2013-2023 Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## Paquete "Pixel" (`pixel-pack.tsx`)

Set original creado para este proyecto sobre una reticula de 24 unidades y
distribuido bajo la misma licencia MIT del repositorio. No deriva de assets de
terceros.

## Como agregar un icono

1. Anade el nombre en `icon-names.ts`.
2. Declara su forma en **ambos** paquetes; el tipo `Record<IconName, ReactNode>`
   obliga a cubrir el catalogo completo y el proyecto no compilara si falta uno.
