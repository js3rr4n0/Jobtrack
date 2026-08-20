import type { CSSProperties } from 'react';

/**
 * Logotipo de Deska, con la geometria del manual de marca.
 *
 * Existe como componente porque el manual prohibe expresamente teclear el
 * nombre con la tipografia del sistema: el logotipo lleva su peso y su
 * interletraje propios, y reescribirlo a mano produce otra cosa parecida.
 */

/** Ret&iacute;cula de construccion del simbolo. Todas las medidas salen de aqui. */
const REJILLA = 64;

/** Azul de marca. No cambia con el tema: es lo unico que no se repinta. */
const AZUL = '#2563EB';

export type LogoVariante = 'horizontal' | 'vertical' | 'simbolo';

/**
 * Sobre que fondo se dibuja. `claro` y `oscuro` mantienen el cuadrado azul;
 * `sobre-acento` lo invierte para que no desaparezca sobre el propio azul, y
 * `una-tinta` resuelve serigrafia y fondos con textura.
 */
export type LogoFondo = 'claro' | 'oscuro' | 'sobre-acento' | 'una-tinta';

export interface LogoProps {
  variante?: LogoVariante;
  fondo?: LogoFondo;
  /** Altura del simbolo en pixeles. El resto se deriva de ella. */
  size?: number;
  className?: string;
}

/** Minimos del manual, por debajo de los cuales el simbolo deja de leerse. */
export const TAMANO_MINIMO: Readonly<Record<LogoVariante, number>> = {
  horizontal: 24,
  vertical: 24,
  simbolo: 16,
};

interface Tintas {
  readonly fondoSimbolo: string;
  readonly barras: string;
  readonly palabra: string;
}

const TINTAS: Readonly<Record<LogoFondo, Tintas>> = {
  claro: { fondoSimbolo: AZUL, barras: '#FFFFFF', palabra: 'rgb(var(--color-text-primary))' },
  oscuro: { fondoSimbolo: AZUL, barras: '#FFFFFF', palabra: '#FFFFFF' },
  'sobre-acento': { fondoSimbolo: '#FFFFFF', barras: AZUL, palabra: '#FFFFFF' },
  'una-tinta': { fondoSimbolo: 'currentColor', barras: 'transparent', palabra: 'currentColor' },
};

/** Rectangulo redondeado como trazado, para poder calarlo con `evenodd`. */
function rect(x: number, y: number, ancho: number, alto: number, radio: number): string {
  const d = radio;
  return (
    `M${x + d},${y} H${x + ancho - d} A${d},${d} 0 0 1 ${x + ancho},${y + d} ` +
    `V${y + alto - d} A${d},${d} 0 0 1 ${x + ancho - d},${y + alto} ` +
    `H${x + d} A${d},${d} 0 0 1 ${x},${y + alto - d} ` +
    `V${y + d} A${d},${d} 0 0 1 ${x + d},${y} Z`
  );
}

/** Las tres barras, de la mas corta a la mas alta. Todas apoyan en y = 50. */
const BARRAS: readonly { x: number; y: number; alto: number; opacidad: number }[] = [
  { x: 14, y: 30, alto: 20, opacidad: 0.55 },
  { x: 27, y: 22, alto: 28, opacidad: 0.78 },
  { x: 40, y: 14, alto: 36, opacidad: 1 },
];

function Simbolo({ size, tintas }: { size: number; tintas: Tintas }) {
  const esUnaTinta = tintas.barras === 'transparent';

  return (
    <svg
      viewBox={`0 0 ${REJILLA} ${REJILLA}`}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {esUnaTinta ? (
        /*
          En una sola tinta las barras se calan en lugar de pintarse, de modo
          que dejan ver el fondo que haya detras. Un unico trazado con regla
          par-impar evita depender de una mascara con identificador, que
          chocaria si hubiera dos logotipos en la misma pagina.
        */
        <path
          fillRule="evenodd"
          fill={tintas.fondoSimbolo}
          d={[rect(0, 0, 64, 64, 14), ...BARRAS.map((b) => rect(b.x, b.y, 10, b.alto, 3))].join(' ')}
        />
      ) : (
        <>
          <rect width="64" height="64" rx="14" fill={tintas.fondoSimbolo} />
          {/*
            Tres barras que crecen. Se aclaran hacia atras para dar direccion a
            la lectura: el ojo va de lo tenue a lo solido, de izquierda a
            derecha, como avanza una tarjeta por el tablero.
          */}
          {BARRAS.map((barra) => (
            <rect
              key={barra.x}
              x={barra.x}
              y={barra.y}
              width="10"
              height={barra.alto}
              rx="3"
              fill={tintas.barras}
              opacity={barra.opacidad}
            />
          ))}
        </>
      )}
    </svg>
  );
}

/** Proporciones fijas del manual, relativas a la altura del simbolo. */
const SEPARACION_HORIZONTAL = 0.42;
const SEPARACION_VERTICAL = 0.3;
const CUERPO_PALABRA = 0.72;

export function Logo({
  variante = 'horizontal',
  fondo = 'claro',
  size = 32,
  className = '',
}: LogoProps) {
  const tintas = TINTAS[fondo];

  if (variante === 'simbolo') {
    return (
      <span className={className} role="img" aria-label="Deska">
        <Simbolo size={size} tintas={tintas} />
      </span>
    );
  }

  const esVertical = variante === 'vertical';

  const palabra: CSSProperties = {
    fontSize: size * CUERPO_PALABRA,
    // El interletraje apretado es parte del logotipo, no una preferencia.
    letterSpacing: '-0.035em',
    lineHeight: 1,
    color: tintas.palabra,
    fontWeight: 800,
  };

  const composicion: CSSProperties = {
    gap: size * (esVertical ? SEPARACION_VERTICAL : SEPARACION_HORIZONTAL),
  };

  return (
    <span
      role="img"
      aria-label="Deska"
      style={composicion}
      className={`inline-flex ${esVertical ? 'flex-col items-center' : 'items-center'} ${className}`}
    >
      <Simbolo size={size} tintas={tintas} />
      <span style={palabra} aria-hidden="true">
        Deska
      </span>
    </span>
  );
}
