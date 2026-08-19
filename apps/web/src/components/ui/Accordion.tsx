'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';

export interface AccordionProps {
  title: string;
  /** Dato corto que resume el contenido sin necesidad de desplegarlo. */
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Sección plegable. Guarda una lista larga detrás de una sola línea, de modo
 * que la pantalla muestra menos cosas a la vez y quien mira decide qué abrir.
 *
 * La insignia del encabezado existe para que plegarlo no esconda la
 * información importante: el recuento sigue a la vista con la sección cerrada.
 */
export function Accordion({ title, badge, defaultOpen = false, children }: AccordionProps) {
  const { iconPack } = usePreferences();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();
  const headerId = useId();

  return (
    <div>
      <h3>
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((current) => !current)}
          className="focus-ring flex w-full items-center justify-between gap-3 rounded-control px-1 py-2 text-left hover:bg-accent-soft"
        >
          <span className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
            {title}
          </span>
          <span className="flex items-center gap-2">
            {badge ? <span className="text-xs text-secondary">{badge}</span> : null}
            <Icon
              name="chevron"
              pack={iconPack}
              size={16}
              className={`shrink-0 text-secondary transition-transform ${isOpen ? '' : '-rotate-90'}`}
            />
          </span>
        </button>
      </h3>

      {/*
        El panel se desmonta al plegarse en lugar de ocultarse con CSS: asi su
        contenido tampoco llega a los lectores de pantalla ni al recorrido con
        el tabulador, que es lo que espera quien lo cerro.
      */}
      {isOpen ? (
        <div id={panelId} role="region" aria-labelledby={headerId} className="pt-1">
          {children}
        </div>
      ) : null}
    </div>
  );
}
