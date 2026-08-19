'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export interface PopoverProps {
  isOpen: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Panel anclado al elemento que lo abre. Se distingue de un diálogo en que no
 * bloquea la pantalla ni exige una decisión: se cierra al pulsar fuera o con
 * Escape, y quien lo abrió sigue viendo el resto de la interfaz detrás.
 *
 * Debe montarse dentro de un contenedor `relative`, que es el que le da su
 * punto de anclaje.
 */
export function Popover({ isOpen, label, onClose, children }: PopoverProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    /**
     * Se escucha en la fase de captura para que el cierre ocurra antes de que
     * el clic llegue al botón que abre el panel; de lo contrario ese mismo
     * clic volvería a abrirlo justo después de cerrarse.
     */
    const handlePointerDown = (event: MouseEvent) => {
      if (panel.current && !panel.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={panel}
      role="dialog"
      aria-label={label}
      // En pantallas estrechas ocupa el ancho disponible desde el borde
      // derecho; a partir de ahi se comporta como un panel anclado al boton.
      className="absolute right-0 z-30 mt-2 max-h-[80vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-card border border-subtle bg-overlay p-4 shadow-raised"
    >
      {children}
    </div>
  );
}
