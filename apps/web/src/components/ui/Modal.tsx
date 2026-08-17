'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

/** Dialogo accesible: cierra con Escape, atrapa el foco inicial y bloquea el fondo. */
export function Modal({ isOpen, title, description, onClose, children }: ModalProps) {
  const { iconPack } = usePreferences();
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar el dialogo"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-card border border-subtle bg-overlay p-5 shadow-raised sm:max-w-xl sm:rounded-card"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-primary">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-secondary">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="focus-ring rounded-control p-1.5 text-secondary hover:text-primary"
          >
            <Icon name="close" pack={iconPack} size={18} title="Cerrar" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
