export interface TourStep {
  readonly id: string;
  /** Valor del atributo `data-tour` del elemento que se debe iluminar. */
  readonly target: string;
  readonly title: string;
  readonly description: string;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'create',
    target: 'nueva-postulacion',
    title: 'Registra tu primera oferta',
    description:
      'Pulsa aqui para guardar una vacante. Solo la empresa y el puesto son obligatorios; lo demas lo puedes completar despues.',
  },
  {
    id: 'board',
    target: 'tablero',
    title: 'Mueve las tarjetas entre columnas',
    description:
      'Cada columna es una etapa del proceso. Arrastra una tarjeta o usa el selector de estado que lleva dentro.',
  },
  {
    id: 'level',
    target: 'nivel',
    title: 'Cada avance suma experiencia',
    description:
      'Registrar, agendar entrevistas y avanzar de etapa te dan puntos, suben tu nivel y mantienen viva tu racha.',
  },
  {
    id: 'account',
    target: 'cuenta',
    title: 'Tu cuenta y la apariencia',
    description:
      'Aqui ves con que cuenta entraste y eliges entre ocho temas, dos estilos de iconos y la musica de fondo.',
  },
];

export const TOUR_STORAGE_KEY = 'jobtrack.tourCompletado';

/**
 * El tutorial solo aparece la primera vez y mientras el tablero este vacio:
 * quien ya tiene postulaciones no necesita que le expliquen la pantalla.
 */
export function shouldShowTour(applicationCount: number, wasCompleted: boolean): boolean {
  return applicationCount === 0 && !wasCompleted;
}

export function readTourCompleted(storage: Storage | undefined): boolean {
  if (!storage) {
    return true;
  }

  try {
    return storage.getItem(TOUR_STORAGE_KEY) === 'true';
  } catch {
    return true;
  }
}

export function writeTourCompleted(storage: Storage | undefined): void {
  try {
    storage?.setItem(TOUR_STORAGE_KEY, 'true');
  } catch {
    // Sin almacenamiento el tutorial reaparecera; es preferible a fallar.
  }
}

export interface SpotlightRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

/** Agranda el recorte para que el elemento no quede pegado al borde del foco. */
export function padRect(rect: SpotlightRect, padding: number): SpotlightRect {
  return {
    top: Math.max(rect.top - padding, 0),
    left: Math.max(rect.left - padding, 0),
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}
