'use client';

import Image from 'next/image';

import { usePreferences } from '@/components/theme/PreferencesProvider';
import { findTheme } from '@/lib/themes';

/**
 * Captura real del tablero, en el mismo tema que la persona está viendo. Cada
 * imagen se genera a 3840 px de ancho desde la aplicación de verdad; `next/image`
 * entrega después el tamaño que corresponda a cada pantalla, de modo que un
 * teléfono no descarga la versión de escritorio.
 *
 * Cambiar de tema cambia la imagen: una portada clara con una captura oscura
 * incrustada se lee como un pegote, no como el producto.
 */
export function ThemedBoardShot() {
  const { theme } = usePreferences();
  const definition = findTheme(theme);

  return (
    <figure className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-card border border-subtle bg-raised shadow-lifted">
        <Image
          key={theme}
          src={`/tablero-${theme}.jpg`}
          alt={`El tablero de Deska en el tema ${definition.label}, con sus seis columnas, las pestañas de área y el panel de nivel`}
          width={3840}
          height={1400}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
          className="h-auto w-full"
          priority
        />
      </div>
      <figcaption className="text-xs text-secondary">
        El tablero en el tema {definition.label}. Cambia de tema arriba y la vista cambia contigo.
      </figcaption>
    </figure>
  );
}
