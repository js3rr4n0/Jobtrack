/**
 * Archivos que sube cada persona: currículums, cartas de presentación y las
 * capturas que acompañan a una nota. Comparten tabla y almacén porque el
 * problema es el mismo —un binario privado con su etiqueta— y separarlos
 * obligaría a triplicar reglas de acceso que deben ser idénticas.
 */

export const DOCUMENT_KINDS = ['resume', 'cover-letter', 'note-image', 'attachment'] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const DOCUMENT_KIND_LABELS: Readonly<Record<DocumentKind, string>> = {
  resume: 'Currículum',
  'cover-letter': 'Carta de presentación',
  'note-image': 'Imagen de nota',
  attachment: 'Adjunto de la vacante',
};

/** Tipos aceptados por cada clase de archivo. */
export const ACCEPTED_MIME_TYPES: Readonly<Record<DocumentKind, readonly string[]>> = {
  resume: ['application/pdf'],
  'cover-letter': ['application/pdf'],
  'note-image': ['image/png', 'image/jpeg', 'image/webp'],
  // Lo que se guarda junto a una vacante es de todo: la captura del anuncio,
  // el correo de respuesta, la prueba tecnica en PDF.
  attachment: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
};

/**
 * Tope por archivo. Un currículum que pese más de cinco megas casi siempre es
 * un escaneo sin comprimir, y aceptarlo sale caro en almacenamiento y en la
 * espera de quien lo sube desde el teléfono.
 */
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

export const MAX_DOCUMENT_LABEL_LENGTH = 120;

export interface StoredDocument {
  readonly id: string;
  readonly userId: string;
  readonly kind: DocumentKind;
  /** Nombre con el que la persona reconoce el archivo. */
  readonly label: string;
  /** Ruta dentro del almacén, siempre bajo la carpeta de su dueño. */
  readonly storagePath: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  /**
   * Vacante a la que acompaña el archivo, o `null` si vive suelto en la
   * cuenta. Un curriculum se reutiliza en muchas postulaciones y por eso no
   * lleva ninguna; la captura de un anuncio concreto, si.
   */
  readonly applicationId: string | null;
  readonly createdAt: string;
}

export interface RegisterDocumentInput {
  readonly kind: DocumentKind;
  readonly label: string;
  readonly storagePath: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly applicationId?: string | null;
}

export function isDocumentKind(value: unknown): value is DocumentKind {
  return typeof value === 'string' && (DOCUMENT_KINDS as readonly string[]).includes(value);
}

/** Etiqueta utilizable, o `null` si solo trae espacios. */
export function normalizeDocumentLabel(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.slice(0, MAX_DOCUMENT_LABEL_LENGTH) : null;
}

export function isAcceptedMimeType(kind: DocumentKind, mimeType: string): boolean {
  return ACCEPTED_MIME_TYPES[kind].includes(mimeType);
}

/** Extensión que corresponde a cada tipo aceptado. */
const EXTENSION_BY_MIME: Readonly<Record<string, string>> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export function extensionForMimeType(mimeType: string): string {
  return EXTENSION_BY_MIME[mimeType] ?? 'bin';
}

/**
 * Ruta donde vive un archivo dentro del almacén. La primera carpeta es siempre
 * el identificador de su dueño: de ahí cuelgan las reglas de acceso, así que
 * componerla en un único sitio evita que una ruta mal formada acabe siendo una
 * ruta de otra persona.
 */
export function buildStoragePath(
  userId: string,
  kind: DocumentKind,
  fileId: string,
  mimeType: string,
): string {
  return `${userId}/${kind}/${fileId}.${extensionForMimeType(mimeType)}`;
}

/** Comprueba que una ruta pertenece a quien dice. */
export function isPathOwnedBy(storagePath: string, userId: string): boolean {
  return storagePath.startsWith(`${userId}/`) && !storagePath.includes('..');
}

/** Formatos admitidos por cada clase, en el lenguaje del aviso. */
const ACCEPTED_FORMAT_LABELS: Readonly<Record<DocumentKind, string>> = {
  resume: 'PDF',
  'cover-letter': 'PDF',
  'note-image': 'PNG, JPG o WebP',
  attachment: 'PDF, PNG, JPG o WebP',
};

export interface DocumentRejection {
  readonly reason: 'kind' | 'mimeType' | 'size' | 'label';
  readonly message: string;
}

/**
 * Reglas de aceptación, compartidas por el navegador y el servidor. El
 * navegador las aplica para avisar antes de subir nada; el servidor vuelve a
 * aplicarlas porque nunca puede fiarse de lo que llega.
 */
export function rejectDocument(input: {
  kind: string;
  label: string | null | undefined;
  mimeType: string;
  sizeBytes: number;
}): DocumentRejection | null {
  if (!isDocumentKind(input.kind)) {
    return { reason: 'kind', message: 'Ese tipo de archivo no existe.' };
  }

  if (!normalizeDocumentLabel(input.label)) {
    return { reason: 'label', message: 'Ponle un nombre al archivo para reconocerlo después.' };
  }

  if (!isAcceptedMimeType(input.kind, input.mimeType)) {
    const aceptados = ACCEPTED_FORMAT_LABELS[input.kind];
    return { reason: 'mimeType', message: `Solo se aceptan archivos ${aceptados}.` };
  }

  if (input.sizeBytes <= 0 || input.sizeBytes > MAX_DOCUMENT_BYTES) {
    const megas = Math.round(MAX_DOCUMENT_BYTES / (1024 * 1024));
    return { reason: 'size', message: `El archivo debe pesar entre 1 byte y ${megas} MB.` };
  }

  return null;
}

/** Cierto cuando el archivo puede mostrarse tal cual en la pantalla. */
export function isViewableImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/** Tamaño legible, para mostrarlo junto al nombre del archivo. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  return kilobytes < 1024
    ? `${Math.round(kilobytes)} kB`
    : `${Math.round((kilobytes / 1024) * 10) / 10} MB`;
}
