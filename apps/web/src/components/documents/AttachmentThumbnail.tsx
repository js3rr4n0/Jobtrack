'use client';

import { formatFileSize, isViewableImage, type StoredDocument } from '@deska/contracts';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { useDocumentUrl } from '@/hooks/use-document-url';
import { formatDate } from '@/lib/format';

export interface AttachmentThumbnailProps {
  document: StoredDocument;
  onRemove: (document: StoredDocument) => void;
}

/**
 * Un adjunto en grande. Las imagenes se ven aqui mismo, sin abrir nada: la
 * captura de un anuncio solo sirve si se lee, y obligar a descargarla para
 * mirarla la convierte en un archivo mas que nadie abre.
 */
export function AttachmentThumbnail({ document, onRemove }: AttachmentThumbnailProps) {
  const { iconPack } = usePreferences();
  const url = useDocumentUrl(document);
  const isImage = isViewableImage(document.mimeType);

  return (
    <figure className="surface-card layered flex flex-col overflow-hidden">
      <div className="flex min-h-[9rem] items-center justify-center bg-sunken">
        {isImage && url ? (
          // Es un enlace firmado que caduca solo, asi que no pasa por el
          // optimizador de imagenes: caducaria antes que su copia en cache.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={document.label}
            className="max-h-72 w-full object-contain"
            loading="lazy"
          />
        ) : (
          <Icon name={isImage ? 'layers' : 'notebook'} pack={iconPack} size={40} />
        )}
      </div>

      <figcaption className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-primary">{document.label}</p>
          <p className="text-xs text-secondary">
            {formatFileSize(document.sizeBytes)} · {formatDate(document.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              className="focus-ring rounded-control p-1.5 text-secondary hover:text-primary"
            >
              <Icon name="link" pack={iconPack} size={16} title={`Abrir ${document.label}`} />
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => onRemove(document)}
            className="focus-ring rounded-control p-1.5 text-secondary hover:text-danger"
          >
            <Icon name="trash" pack={iconPack} size={16} title={`Eliminar ${document.label}`} />
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
