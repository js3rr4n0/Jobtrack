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
