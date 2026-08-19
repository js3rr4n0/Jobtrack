'use client';

import { useState } from 'react';
import type { StickyNote } from '@deska/contracts';

import { Icon } from '@/components/icons';
import { NoteForm, type NoteFormValues } from '@/components/notes/NoteForm';
import { NoteWall } from '@/components/notes/NoteWall';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBanner } from '@/components/ui/StatusBanner';
import type { UseNotesResult } from '@/hooks/use-notes';

export interface NotesPanelProps {
  notes: UseNotesResult;
}

type EditorState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; note: StickyNote };

/** Mural completo: cabecera, notas arrastrables y el editor de una nota. */
export function NotesPanel({ notes }: NotesPanelProps) {
  const { iconPack } = usePreferences();
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeEditor = () => setEditor({ mode: 'closed' });

  const runAndClose = async (action: () => Promise<boolean>) => {
    setIsSubmitting(true);
    const succeeded = await action();
    setIsSubmitting(false);

    if (succeeded) {
      closeEditor();
    }
  };

  const handleSubmit = (values: NoteFormValues) => {
    if (editor.mode === 'edit') {
      void runAndClose(() => notes.updateNote(editor.note.id, values));
      return;
    }

    void runAndClose(() => notes.createNote(values));
  };

  return (
    <section data-tour="notas" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-bold text-primary">Mural de notas</h2>
          <p className="text-xs text-secondary">
            Recordatorios sueltos que puedes arrastrar por el mural.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setEditor({ mode: 'create' })}>
          <Icon name="plus" pack={iconPack} size={16} />
          Nueva nota
        </Button>
      </div>

      {/* La falta de conexión ya se anuncia una vez en la cabecera de la
          pantalla; repetirla aquí solo aniade ruido. */}
      {notes.error && notes.error.kind !== 'offline' ? (
        <StatusBanner tone="error" message={notes.error.message} details={notes.error.details} />
      ) : null}

      <NoteWall
        notes={notes.notes}
        onMove={(id, x, y) => void notes.moveNote(id, x, y)}
        onEdit={(note) => setEditor({ mode: 'edit', note })}
      />

      <Modal
        isOpen={editor.mode !== 'closed'}
        title={editor.mode === 'edit' ? 'Editar nota' : 'Nueva nota'}
        description="Las notas se sincronizan con tus demás dispositivos."
        onClose={closeEditor}
      >
        {editor.mode !== 'closed' ? (
          <NoteForm
            // Al cambiar de nota se monta un formulario nuevo, de modo que
            // nunca quedan en pantalla los valores de la nota anterior.
            key={editor.mode === 'edit' ? editor.note.id : 'nueva'}
            initialValues={
              editor.mode === 'edit'
                ? { text: editor.note.text, color: editor.note.color }
                : undefined
            }
            submitLabel={editor.mode === 'edit' ? 'Guardar cambios' : 'Crear nota'}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={closeEditor}
            onDelete={
              editor.mode === 'edit'
                ? () => void runAndClose(() => notes.deleteNote(editor.note.id))
                : undefined
            }
          />
        ) : null}
      </Modal>
    </section>
  );
}
