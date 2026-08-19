'use client';

import { useId } from 'react';

export interface ToggleSwitchProps {
  checked: boolean;
  label: string;
  description?: string;
  onChange: (checked: boolean) => void;
}

/**
 * Interruptor de dos estados opuestos: encendido o apagado. Se apoya en un
 * `button` con `role="switch"`, no en una casilla, porque el cambio surte
 * efecto de inmediato y no espera a que se envíe ningún formulario.
 *
 * El área pulsable abarca la etiqueta entera, no solo la pastilla: cuanto más
 * grande es el destino, menos cuesta acertarlo.
 */
export function ToggleSwitch({ checked, label, description, onChange }: ToggleSwitchProps) {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={() => onChange(!checked)}
      className="focus-ring flex w-full items-start gap-3 rounded-control border border-subtle bg-raised p-3 text-left hover:border-strong"
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? 'bg-accent' : 'bg-sunken ring-1 ring-inset ring-strong'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-raised shadow-card transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>

      <span className="min-w-0">
        <span id={labelId} className="block text-sm font-semibold text-primary">
          {label}
        </span>
        {description ? (
          <span id={descriptionId} className="block text-xs text-secondary">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
