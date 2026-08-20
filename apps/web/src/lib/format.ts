const LOCALE = 'es-ES';

/** Formatea una fecha ISO en texto corto; devuelve una cadena vacía si es invalida. */
export function formatDate(isoDate: string | null): string {
  if (!isoDate) {
    return '';
  }

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(isoDate: string | null): string {
  if (!isoDate) {
    return '';
  }

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleString(LOCALE, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Hora de la entrevista con su zona horaria dicha en claro.
 *
 * Es el dato que evita el fallo mas caro de una entrevista: quien la agendo
 * pudo decir la hora en otro huso, y una hora sin zona no se puede comprobar.
 * Mostrar siempre la del propio navegador convierte una duda en una lectura.
 */
export function formatMeetingTime(isoDate: string | null): string {
  if (!isoDate) {
    return '';
  }

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleString(LOCALE, {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Zona horaria del navegador en identificador y en nombre legible.
 *
 * El identificador de la IANA —`America/Guatemala`— es exacto pero se lee mal
 * en una frase, asi que se acompana de la ciudad sola. Devuelve cadenas vacias
 * si el navegador no la expone, en lugar de inventarse una.
 */
export interface TimeZoneLabel {
  /** Identificador completo, p. ej. `America/Guatemala`. */
  readonly id: string;
  /** Nombre para leer, p. ej. `Guatemala`. */
  readonly label: string;
}

export function currentTimeZone(): TimeZoneLabel {
  try {
    const id = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    const ciudad = id.split('/').pop() ?? '';

    return { id, label: ciudad.replace(/_/g, ' ') };
  } catch {
    return { id: '', label: '' };
  }
}
