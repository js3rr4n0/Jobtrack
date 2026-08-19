'use client';

import { useRef, useState } from 'react';
import {
  ACCEPTED_MIME_TYPES,
  type DocumentKind,
  formatFileSize,
  type StoredDocument,
} from '@deska/contracts';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { UploadProgress } from '@/components/documents/UploadProgress';
import type { UseDocumentsResult } from '@/hooks/use-documents';

export interface DocumentPickerProps {
  id: string;
  label: string;
  hint?: string;
  kind: DocumentKind;
  documents: UseDocumentsResult;
  /** Documento elegido, o cadena vacía si no hay ninguno. */
  value: string;
  onChange: (documentId: string) => void;
}

/** Nombre del archivo sin su extensión, como etiqueta inicial. */
function labelFromFile(file: File): string {
  return file.name.replace(/\.[^.]+$/, '').slice(0, 120) || file.name;
}

/**
 * Elige un archivo ya subido o sube uno nuevo sin salir del formulario. Las dos
 * vías conviven a propósito: quien ya tiene su currículum arriba lo escoge de
 * la lista, y quien lo acaba de exportar no tiene que ir a otra pantalla.
 */
export function DocumentPicker({
  id,
  label,
  hint,
  kind,
  documents,
  value,
  onChange,
}: DocumentPickerProps) {
  const { iconPack } = usePreferences();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const isBusy = documents.uploadState !== 'idle';

  const handleFile = async (file: File) => {
    setPendingFile(file);
    const uploaded = await documents.upload(file, labelFromFile(file));
    setPendingFile(null);

    if (uploaded) {
      onChange(uploaded.id);
    }

    // Se limpia para poder volver a elegir el mismo archivo si algo falló.
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const describe = (document: StoredDocument) =>
    `${document.label} (${formatFileSize(document.sizeBytes)})`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-primary">
        {label}
      </label>

      <select
        id={id}
        value={value}
        disabled={isBusy}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring w-full rounded-control border border-subtle bg-base px-3 py-2 text-sm text-primary disabled:opacity-60"
      >
        <option value="">Sin adjuntar</option>
        {documents.documents.map((document) => (
          <option key={document.id} value={document.id}>
            {describe(document)}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => fileInput.current?.click()}
          className="focus-ring inline-flex items-center gap-1.5 rounded-control border border-subtle px-3 py-1.5 text-xs font-semibold text-primary hover:border-strong disabled:opacity-60"
        >
          <Icon name="plus" pack={iconPack} size={14} />
          Subir uno nuevo
        </button>

        {value ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onChange('')}
            className="focus-ring rounded-control px-2 py-1.5 text-xs text-secondary hover:text-primary disabled:opacity-60"
          >
            Quitar
          </button>
        ) : null}
      </div>

      {/*
        El campo de archivo va oculto pero sigue siendo el que recibe el clic:
        asi el boton conserva el aspecto del resto de la interfaz sin perder el
        comportamiento nativo de seleccion.
      */}
      <input
        ref={fileInput}
        type="file"
        className="sr-only"
        accept={ACCEPTED_MIME_TYPES[kind].join(',')}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
        }}
      />

      {isBusy && pendingFile ? (
        <UploadProgress state={documents.uploadState} fileName={pendingFile.name} />
      ) : null}

      {documents.error ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {documents.error}
        </p>
      ) : null}

      {hint && !documents.error ? <p className="text-xs text-secondary">{hint}</p> : null}
    </div>
  );
}
