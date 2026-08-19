'use client';

import { useState } from 'react';
import {
  DEFAULT_NOTE_COLOR,
  MAX_NOTE_LENGTH,
  NOTE_COLORS,
  type NoteColor,
  normalizeNoteText,
} from '@deska/contracts';

import { Button } from '@/components/ui/Button';
import { TextAreaField } from '@/components/ui/FormField';

export interface NoteFormValues {
  readonly text: string;
  readonly color: NoteColor;
}

export interface NoteFormProps {
  initialValues?: NoteFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: NoteFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const EMPTY_NOTE_MESSAGE = 'Escribe algo antes de guardar la nota.';

const COLOR_LABELS: Record<NoteColor, string> = {
  amarillo: 'Amarillo',
  rosa: 'Rosa',
  azul: 'Azul',
  verde: 'Verde',
  lila: 'Lila',
};

/** Formulario de una nota: texto y color, con validación antes de enviar. */
export function NoteForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  onDelete,
}: NoteFormProps) {
  const [text, setText] = useState(initialValues?.text ?? '');
  const [color, setColor] = useState<NoteColor>(initialValues?.color ?? DEFAULT_NOTE_COLOR);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeNoteText(text);

    if (!normalized) {
      setError(EMPTY_NOTE_MESSAGE);
      return;
    }

    setError(null);
    onSubmit({ text: normalized, color });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <TextAreaField
        id="nota-texto"
        label="Nota"
        rows={4}
        maxLength={MAX_NOTE_LENGTH}
        value={text}
        error={error ?? undefined}
        hint={`Hasta ${MAX_NOTE_LENGTH} caracteres.`}
        onChange={(event) => setText(event.target.value)}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-primary">Color</legend>
        <div className="flex flex-wrap gap-2">
          {NOTE_COLORS.map((option) => (
            <label
              key={option}
              data-color={option}
              className={`sticky-note focus-within:ring-2 focus-within:ring-accent-strong flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-medium ${
                option === color ? 'ring-2 ring-accent-strong' : ''
              }`}
            >
              <input
                type="radio"
                name="color-de-nota"
                value={option}
                checked={option === color}
                onChange={() => setColor(option)}
                className="sr-only"
              />
              {COLOR_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onDelete ? (
          <Button type="button" variant="danger" disabled={isSubmitting} onClick={onDelete}>
            Eliminar
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
