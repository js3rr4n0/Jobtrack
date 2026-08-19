'use client';

import { useRef, useState } from 'react';
import { ACCEPTED_MIME_TYPES, type StoredDocument } from '@deska/contracts';

import { AttachmentThumbnail } from '@/components/documents/AttachmentThumbnail';
import { UploadProgress } from '@/components/documents/UploadProgress';
import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Button } from '@/components/ui/Button';
import type { UseDocumentsResult } from '@/hooks/use-documents';
import { labelForPastedImage, labelFromFileName } from '@/lib/attachments';

export interface AttachmentsPanelProps {
  attachments: UseDocumentsResult;
}

/**
 * Archivos de una vacante: capturas del anuncio, correos, pruebas tecnicas.
 *
 * Acepta el pegado directo porque asi es como llega una captura de pantalla:
 * se recorta y se pega. Obligar a guardarla primero en el disco y buscarla
 * despues en un selector convierte un gesto en tres.
 */
export function AttachmentsPanel({ attachments }: AttachmentsPanelProps) {
  const { iconPack } = usePreferences();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const isBusy = attachments.uploadState !== 'idle';

  const send = async (file: File, label: string) => {
    setPendingName(file.name || label);
    await attachments.upload(file, label);
    setPendingName(null);

    // Se limpia para poder reintentar con el mismo archivo si algo fallo.
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const sendMany = async (files: readonly File[]) => {
    for (const file of files) {
      await send(file, labelFromFileName(file.name));
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLElement>) => {
    const pasted = Array.from(event.clipboardData.files);

    if (pasted.length === 0) {
      return;
    }

    event.preventDefault();

    // Una captura del portapapeles llega sin nombre util, asi que se etiqueta
    // con la fecha para poder distinguirla de las demas mas adelante.
    void (async () => {
      for (const file of pasted) {
        await send(file, file.name ? labelFromFileName(file.name) : labelForPastedImage(new Date()));
      }
    })();
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDropTarget(false);
    void sendMany(Array.from(event.dataTransfer.files));
  };

  return (
    <section
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDropTarget(true);
      }}
      onDragLeave={() => setIsDropTarget(false)}
      className={`surface-card flex flex-col gap-4 p-4 transition-colors ${
        isDropTarget ? 'border-accent bg-accent-soft' : ''
      }`}
      aria-label="Archivos de esta vacante"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-bold text-primary">Archivos y capturas</h2>
          <p className="text-xs text-secondary">
            Pega una captura con Ctrl+V, arrastra archivos aquí o elígelos a mano.
          </p>
        </div>

        <Button variant="secondary" disabled={isBusy} onClick={() => fileInput.current?.click()}>
          <Icon name="plus" pack={iconPack} size={16} />
          Añadir archivo
        </Button>
      </div>

      <input
        ref={fileInput}
        type="file"
        multiple
        className="sr-only"
        accept={ACCEPTED_MIME_TYPES.attachment.join(',')}
        onChange={(event) => {
          const chosen = Array.from(event.target.files ?? []);

          if (chosen.length > 0) {
            void sendMany(chosen);
          }
        }}
      />

      {isBusy && pendingName ? (
        <UploadProgress state={attachments.uploadState} fileName={pendingName} />
      ) : null}

      {attachments.error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {attachments.error}
        </p>
      ) : null}

      {attachments.documents.length === 0 ? (
        <p className="rounded-control border border-dashed border-subtle p-6 text-center text-sm text-secondary">
          Todavía no has guardado nada aquí. Una captura del anuncio o del correo de respuesta te
          ahorra volver a buscarlos más adelante.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {attachments.documents.map((document: StoredDocument) => (
            <AttachmentThumbnail
              key={document.id}
              document={document}
              onRemove={(target) => void attachments.remove(target.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
