'use client';

import type { UploadState } from '@/hooks/use-documents';

export interface UploadProgressProps {
  state: UploadState;
  fileName: string;
}

/**
 * Avance de una subida. El navegador no informa del porcentaje real al subir a
 * Supabase Storage, así que en lugar de inventar una cifra se muestran las dos
 * fases por las que pasa de verdad: primero viaja el archivo, después se
 * registra. Prometer un 47 % que nadie mide sería mentir con precisión.
 */
const STEPS: readonly { id: UploadState; label: string }[] = [
  { id: 'uploading', label: 'Subiendo el archivo' },
  { id: 'registering', label: 'Guardándolo en tu cuenta' },
];

export function UploadProgress({ state, fileName }: UploadProgressProps) {
  if (state === 'idle') {
    return null;
  }

  const current = STEPS.findIndex((step) => step.id === state);
  const step = STEPS[current];

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-control border border-subtle bg-sunken p-2.5"
    >
      <p className="truncate text-xs font-medium text-primary">{fileName}</p>
      <p className="text-xs text-secondary">
        {step.label} ({current + 1} de {STEPS.length})
      </p>

      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={current + 1}
        aria-label={step.label}
        className="mt-1.5 flex gap-1"
      >
        {STEPS.map((item, index) => (
          <span
            key={item.id}
            className={`h-1 flex-1 rounded-full ${
              index <= current ? 'animate-pulse bg-accent' : 'bg-base'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
