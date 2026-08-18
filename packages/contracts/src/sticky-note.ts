/**
 * Notas adhesivas del mural. Son independientes de las postulaciones: sirven
 * para recordatorios sueltos ("preparar portafolio", "llamar el martes") que no
 * pertenecen a ninguna oferta concreta.
 */

export const NOTE_COLORS = ['amarillo', 'rosa', 'azul', 'verde', 'lila'] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export const DEFAULT_NOTE_COLOR: NoteColor = 'amarillo';

/** Longitud maxima del texto de una nota, compartida por la web y la API. */
export const MAX_NOTE_LENGTH = 280;

/**
 * La posicion se guarda en porcentaje del mural, no en pixeles: asi una nota
 * colocada en el telefono aparece en el mismo sitio relativo en la computadora.
 */
export interface NotePosition {
  readonly x: number;
  readonly y: number;
}

export interface StickyNote extends NotePosition {
  readonly id: string;
  readonly userId: string;
  readonly text: string;
  readonly color: NoteColor;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateStickyNoteInput {
  readonly text: string;
  readonly color?: NoteColor;
  readonly x?: number;
  readonly y?: number;
}

export interface UpdateStickyNoteInput {
  readonly text?: string;
  readonly color?: NoteColor;
  readonly x?: number;
  readonly y?: number;
}

export function isNoteColor(value: unknown): value is NoteColor {
  return typeof value === 'string' && (NOTE_COLORS as readonly string[]).includes(value);
}

/** Texto util de una nota, o `null` si solo tiene espacios. */
export function normalizeNoteText(text: string | null | undefined): string | null {
  const trimmed = text?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.slice(0, MAX_NOTE_LENGTH) : null;
}

const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Encierra una posicion dentro del mural. Acepta cualquier entrada, incluidos
 * valores nulos o infinitos, porque proviene de gestos de arrastre y de datos
 * remotos que pueden llegar corruptos: una nota nunca debe quedar fuera de la
 * vista ni romper el renderizado.
 */
export function clampNotePosition(x: unknown, y: unknown): NotePosition {
  return { x: clampCoordinate(x), y: clampCoordinate(y) };
}

function clampCoordinate(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return round(Math.min(Math.max(numeric, 0), 100));
}

/** Orden estable del mural: la mas antigua primero, con el id como desempate. */
export function sortNotes(notes: readonly StickyNote[]): StickyNote[] {
  return [...notes].sort((first, second) =>
    first.createdAt === second.createdAt
      ? first.id.localeCompare(second.id)
      : first.createdAt.localeCompare(second.createdAt),
  );
}

const CASCADE_STEP = 6;
const CASCADE_LIMIT = 60;

/**
 * Sitio para una nota nueva: una cascada diagonal que se reinicia al llegar al
 * limite, de modo que las notas recien creadas no se apilen exactamente encima
 * unas de otras y siempre quede visible la ultima.
 */
export function nextNotePosition(notes: readonly StickyNote[]): NotePosition {
  const offset = (notes.length * CASCADE_STEP) % CASCADE_LIMIT;
  return clampNotePosition(4 + offset, 4 + offset);
}

/**
 * Reubica una nota. La usan por igual el arrastre optimista del navegador y el
 * servidor al persistir, asi que ambos extremos no pueden discrepar.
 */
export function applyNoteMove(
  notes: readonly StickyNote[],
  noteId: string,
  x: unknown,
  y: unknown,
  movedAt: string,
): StickyNote[] {
  const position = clampNotePosition(x, y);

  return sortNotes(
    notes.map((note) =>
      note.id === noteId ? { ...note, ...position, updatedAt: movedAt } : note,
    ),
  );
}

/**
 * Traduce un desplazamiento en pixeles a la nueva posicion porcentual. Las
 * medidas son las del recorrido util del mural, es decir, su tamano menos el de
 * la propia nota: asi el 100 por ciento deja la nota pegada al borde y nunca
 * fuera. Un recorrido sin tamano (mural aun no montado) deja la nota donde
 * estaba en lugar de mandarla al origen.
 */
export function translateNotePosition(
  position: NotePosition,
  deltaXPixels: number,
  deltaYPixels: number,
  trackWidthPixels: number,
  trackHeightPixels: number,
): NotePosition {
  if (trackWidthPixels <= 0 || trackHeightPixels <= 0) {
    return clampNotePosition(position.x, position.y);
  }

  return clampNotePosition(
    position.x + (deltaXPixels / trackWidthPixels) * 100,
    position.y + (deltaYPixels / trackHeightPixels) * 100,
  );
}
