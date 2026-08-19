import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const CONTROL_CLASSES =
  'focus-ring w-full rounded-control border border-subtle bg-base px-3 py-2 text-sm text-primary placeholder:text-secondary';

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Indicador opcional a la derecha de la etiqueta, como un contador. */
  counter?: ReactNode;
  children: ReactNode;
}

function FieldShell({ id, label, hint, error, counter, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-primary">
          {label}
        </label>
        {counter}
      </div>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-secondary">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface CharacterCounterProps {
  length: number;
  limit: number;
}

/**
 * Cuenta lo escrito frente al limite. Se muestra siempre, no solo al pasarse:
 * enterarse del tope justo cuando el texto ya se ha cortado llega tarde.
 */
export function CharacterCounter({ length, limit }: CharacterCounterProps) {
  const isOver = length > limit;

  return (
    <span
      aria-live="polite"
      className={`text-xs tabular-nums ${isOver ? 'font-semibold text-danger' : 'text-secondary'}`}
    >
      {length} / {limit}
    </span>
  );
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ id, label, hint, error, ...props }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className={CONTROL_CLASSES}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
    </FieldShell>
  );
}

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  counter?: ReactNode;
}

export function TextAreaField({ id, label, hint, error, counter, ...props }: TextAreaFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} counter={counter}>
      <textarea
        id={id}
        rows={3}
        className={`${CONTROL_CLASSES} resize-y`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
    </FieldShell>
  );
}

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  options: readonly SelectFieldOption[];
}

export function SelectField({ id, label, hint, error, options, ...props }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        className={CONTROL_CLASSES}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
