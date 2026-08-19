'use client';

import { useState } from 'react';
import {
  DEFAULT_NOTE_COLOR,
  MAX_NOTE_LENGTH,
  NOTE_COLORS,
  type NoteColor,
  normalizeNoteText,
} from '@deska/contracts';

import { DocumentPicker } from '@/components/documents/DocumentPicker';
import { Button } from '@/components/ui/Button';
import type { UseDocumentsResult } from '@/hooks/use-documents';
import { CharacterCounter, TextAreaField } from '@/components/ui/FormField';

export interface NoteFormValues {
  readonly text: string;
  readonly color: NoteColor;
  /** Captura adjunta, o cadena vacía si la nota no lleva ninguna. */
  readonly imageId: string;
}

export interface NoteFormProps {
  initialValues?: NoteFormValues;
  /** Capturas ya subidas, para elegir o añadir una nueva. */
  images: UseDocumentsResult;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: NoteFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const EMPTY_NOTE_MESSAGE = 'Escribe algo antes de guardar la nota.';

/** Aviso cuando el texto se pasa del tope, con lo que sobra ya contado. */
function tooLongMessage(excess: number): string {
  return excess === 1
    ? 'La nota se pasa por un carácter. Quítalo para poder guardarla.'
    : `La nota se pasa por ${excess} caracteres. Quítalos para poder guardarla.`;
}

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
  images,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  onDelete,
}: NoteFormProps) {
  const [text, setText] = useState(initialValues?.text ?? '');
  const [color, setColor] = useState<NoteColor>(initialValues?.color ?? DEFAULT_NOTE_COLOR);
  const [imageId, setImageId] = useState(initialValues?.imageId ?? '');
  const [error, setError] = useState<string | null>(null);

  const excess = text.trim().length - MAX_NOTE_LENGTH;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (excess > 0) {
      setError(tooLongMessage(excess));
      return;
    }

    const normalized = normalizeNoteText(text);

    if (!normalized) {
      setError(EMPTY_NOTE_MESSAGE);
      return;
    }

    setError(null);
    onSubmit({ text: normalized, color, imageId });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      {/*
        El campo no recorta al escribir ni al pegar: cortar en silencio un texto
        pegado hace perder lo que ya no se ve. En su lugar deja pasarse, lo
        cuenta a la vista y avisa de cuanto sobra antes de guardar.
      */}
      <TextAreaField
        id="nota-texto"
        label="Nota"
        rows={4}
        value={text}
        error={error ?? (excess > 0 ? tooLongMessage(excess) : undefined)}
        hint={`Hasta ${MAX_NOTE_LENGTH} caracteres.`}
        counter={<CharacterCounter length={text.trim().length} limit={MAX_NOTE_LENGTH} />}
        onChange={(event) => {
          setText(event.target.value);
          setError(null);
        }}
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

      <DocumentPicker
        id="nota-imagen"
        label="Captura adjunta"
        kind="note-image"
        documents={images}
        value={imageId}
        hint="Una imagen de la oferta, del correo o de lo que quieras recordar."
        onChange={setImageId}
      />

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
