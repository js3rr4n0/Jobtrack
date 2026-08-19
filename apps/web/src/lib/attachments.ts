import { MAX_DOCUMENT_LABEL_LENGTH } from '@deska/contracts';

/**
 * Nombre con el que se reconoce un archivo adjunto. Se guarda sin la extension
 * porque el tipo ya se muestra aparte, y recortado al tope que acepta la API.
 */
export function labelFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '').trim();
  const label = withoutExtension || fileName.trim();

  return label.slice(0, MAX_DOCUMENT_LABEL_LENGTH);
}

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Etiqueta de una captura pegada desde el portapapeles. Llega sin nombre util
 * —el navegador la llama "image.png"—, asi que se firma con el momento en que
 * se pego para poder distinguir una de otra en la lista.
 */
export function labelForPastedImage(moment: Date): string {
  const day = `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}`;
  const time = `${pad(moment.getHours())}.${pad(moment.getMinutes())}`;

  return `Captura ${day} ${time}`;
}
