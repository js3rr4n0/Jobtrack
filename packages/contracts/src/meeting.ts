/**
 * Enlace de la videollamada de una entrevista.
 *
 * Es un dato distinto del enlace de la vacante: uno lleva al anuncio y otro a
 * la sala donde hay que estar a una hora concreta. Reconocer la plataforma
 * permite ensenarla con su color y su nombre, de modo que se distinga de un
 * vistazo entre varias entrevistas del mismo dia.
 */

export const MEETING_PLATFORMS = [
  'zoom',
  'meet',
  'teams',
  'whereby',
  'jitsi',
  'skype',
  'webex',
  'discord',
  'otra',
] as const;

export type MeetingPlatform = (typeof MEETING_PLATFORMS)[number];

export interface MeetingPlatformDefinition {
  readonly id: MeetingPlatform;
  readonly label: string;
  /** Color de la plataforma, para reconocerla antes de leer el nombre. */
  readonly color: string;
}

export const MEETING_PLATFORM_CATALOG: Readonly<
  Record<MeetingPlatform, MeetingPlatformDefinition>
> = {
  zoom: { id: 'zoom', label: 'Zoom', color: '#2D8CFF' },
  meet: { id: 'meet', label: 'Google Meet', color: '#00832D' },
  teams: { id: 'teams', label: 'Microsoft Teams', color: '#5059C9' },
  whereby: { id: 'whereby', label: 'Whereby', color: '#F45B4B' },
  jitsi: { id: 'jitsi', label: 'Jitsi Meet', color: '#1D76BA' },
  skype: { id: 'skype', label: 'Skype', color: '#0078D4' },
  webex: { id: 'webex', label: 'Webex', color: '#0B7A75' },
  discord: { id: 'discord', label: 'Discord', color: '#5865F2' },
  otra: { id: 'otra', label: 'Videollamada', color: '#475569' },
};

/**
 * Dominios de cada plataforma. Se compara por sufijo sobre el nombre de host,
 * nunca sobre la direccion entera: buscar "zoom" dentro del texto daria por
 * buena una direccion como `zoom.empresa-falsa.com`.
 */
const HOSTS: readonly { readonly platform: MeetingPlatform; readonly hosts: readonly string[] }[] = [
  { platform: 'zoom', hosts: ['zoom.us', 'zoom.com', 'zoomgov.com'] },
  { platform: 'meet', hosts: ['meet.google.com'] },
  { platform: 'teams', hosts: ['teams.microsoft.com', 'teams.live.com'] },
  { platform: 'whereby', hosts: ['whereby.com'] },
  { platform: 'jitsi', hosts: ['meet.jit.si', 'jitsi.org'] },
  { platform: 'skype', hosts: ['skype.com', 'join.skype.com'] },
  { platform: 'webex', hosts: ['webex.com'] },
  { platform: 'discord', hosts: ['discord.gg', 'discord.com'] },
];

/** Cierto cuando el host es el dominio indicado o un subdominio suyo. */
function matchesHost(hostname: string, dominio: string): boolean {
  return hostname === dominio || hostname.endsWith(`.${dominio}`);
}

/**
 * Direccion utilizable para abrir una reunion, o `null`. Solo se aceptan
 * `http` y `https`: cualquier otro esquema abierto desde un enlace es una via
 * para lanzar algo que quien pulsa no espera.
 */
export function normalizeMeetingUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Plataforma a la que apunta el enlace, o `null` si no hay enlace valido. */
export function detectMeetingPlatform(url: string | null | undefined): MeetingPlatform | null {
  const normalized = normalizeMeetingUrl(url);

  if (!normalized) {
    return null;
  }

  const hostname = new URL(normalized).hostname.toLowerCase().replace(/^www\./, '');
  const found = HOSTS.find((entry) => entry.hosts.some((host) => matchesHost(hostname, host)));

  // Una plataforma desconocida sigue siendo una videollamada: se muestra como
  // "otra" en lugar de esconder el enlace.
  return found ? found.platform : 'otra';
}

/**
 * Minutos antes de la hora a los que aparece el boton de unirse. Quince es el
 * margen con el que la gente entra a una sala sin sentir que llega tarde.
 */
export const JOIN_OPENS_MINUTES_BEFORE = 15;

/**
 * Minutos despues de la hora durante los que sigue disponible. Una entrevista
 * que empezo hace media hora sigue en marcha, y esconder el boton justo cuando
 * alguien vuelve de una desconexion seria el peor momento posible.
 */
export const JOIN_CLOSES_MINUTES_AFTER = 60;

const MINUTE_IN_MS = 60_000;

/**
 * Cierto durante la ventana en la que tiene sentido entrar a la sala. Se
 * calcula sobre el instante, no sobre el dia, porque una videollamada ocurre a
 * una hora concreta en cualquier huso.
 */
export function isJoinWindowOpen(
  interviewAt: string | null | undefined,
  referenceDate: Date = new Date(),
): boolean {
  if (!interviewAt) {
    return false;
  }

  const start = new Date(interviewAt).getTime();

  if (Number.isNaN(start)) {
    return false;
  }

  const now = referenceDate.getTime();

  return (
    now >= start - JOIN_OPENS_MINUTES_BEFORE * MINUTE_IN_MS &&
    now <= start + JOIN_CLOSES_MINUTES_AFTER * MINUTE_IN_MS
  );
}
