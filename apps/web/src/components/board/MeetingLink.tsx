'use client';

import { useEffect, useState } from 'react';
import {
  JOIN_OPENS_MINUTES_BEFORE,
  MEETING_PLATFORM_CATALOG,
  type MeetingPlatform,
  isJoinWindowOpen,
} from '@deska/contracts';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { currentTimeZone, formatMeetingTime } from '@/lib/format';

export interface MeetingLinkProps {
  meetingUrl: string;
  platform: MeetingPlatform;
  /** Momento de la entrevista, para saber cuando toca abrir la sala. */
  interviewAt: string | null;
  /** Compacta para la agenda; completa para la ficha de la vacante. */
  variant?: 'compacta' | 'completa';
}

/**
 * Cada cuanto se vuelve a mirar el reloj. Un minuto basta: la ventana para
 * unirse dura una hora larga, y comprobarlo mas a menudo solo gastaria
 * bateria sin que nadie note la diferencia.
 */
const LATIDO_MS = 60_000;

/**
 * Marca de la plataforma. Se dibuja con el icono de videollamada del paquete
 * activo, tenido con el color de la plataforma: el color y el nombre bastan
 * para reconocerla de un vistazo, y asi la marca ajena no se reproduce mal
 * dibujada ni desentona con los doce temas.
 */
function Distintivo({ platform, size }: { platform: MeetingPlatform; size: number }) {
  const { iconPack } = usePreferences();
  const definicion = MEETING_PLATFORM_CATALOG[platform];

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-control"
      style={{
        backgroundColor: `${definicion.color}1F`,
        color: definicion.color,
        width: size,
        height: size,
      }}
    >
      <Icon name="video" pack={iconPack} size={Math.round(size * 0.6)} />
    </span>
  );
}

/**
 * Enlace de la videollamada de una entrevista.
 *
 * Muestra a que plataforma lleva y la hora en la zona horaria de quien mira,
 * que es lo que evita el fallo caro: quien agendo la entrevista pudo decir la
 * hora en otro huso, y una hora sin zona no hay forma de comprobarla. Cuando
 * llega el momento, el enlace pasa a ser un boton de unirse destacado.
 */
export function MeetingLink({
  meetingUrl,
  platform,
  interviewAt,
  variant = 'compacta',
}: MeetingLinkProps) {
  const { iconPack } = usePreferences();
  const definicion = MEETING_PLATFORM_CATALOG[platform];

  /*
   * La ventana se calcula tras montar y se refresca sola. Decidirlo durante el
   * renderizado en el servidor daria un resultado con la hora del servidor, que
   * es otra zona horaria y otro instante.
   */
  const [puedeUnirse, setPuedeUnirse] = useState(false);

  useEffect(() => {
    const comprobar = () => setPuedeUnirse(isJoinWindowOpen(interviewAt));

    comprobar();
    const reloj = window.setInterval(comprobar, LATIDO_MS);

    return () => window.clearInterval(reloj);
  }, [interviewAt]);

  const etiqueta = puedeUnirse ? `Unirse por ${definicion.label}` : `Abrir ${definicion.label}`;

  if (variant === 'compacta') {
    return (
      <a
        href={meetingUrl}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={etiqueta}
        className={`focus-ring inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-xs font-medium ${
          puedeUnirse
            ? 'bg-accent text-inverse hover:bg-accent-strong'
            : 'border border-subtle text-primary hover:border-strong'
        }`}
      >
        {puedeUnirse ? null : <Distintivo platform={platform} size={16} />}
        {puedeUnirse ? 'Unirse ahora' : definicion.label}
      </a>
    );
  }

  const zona = currentTimeZone();

  return (
    <div className="surface-card flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <Distintivo platform={platform} size={40} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">{definicion.label}</p>
          <p className="truncate text-xs text-secondary">{meetingUrl}</p>
        </div>
      </div>

      {interviewAt ? (
        <div>
          <p className="text-sm text-primary">{formatMeetingTime(interviewAt)}</p>
          {/*
            Se nombra la zona horaria a proposito. La hora que se ve es la del
            dispositivo, y decirlo evita presentarse con una hora de diferencia
            cuando la entrevista se acordo en otro pais.
          */}
          {zona.label ? (
            <p className="text-xs text-secondary" title={zona.id}>
              Hora de {zona.label}, tu zona horaria.
            </p>
          ) : null}
        </div>
      ) : null}

      <a
        href={meetingUrl}
        target="_blank"
        rel="noreferrer noopener"
        className={`focus-ring inline-flex w-fit items-center gap-2 rounded-control px-4 py-2 text-sm font-semibold ${
          puedeUnirse
            ? 'bg-accent text-inverse hover:bg-accent-strong'
            : 'border border-strong text-primary hover:bg-accent-soft'
        }`}
      >
        <Icon name="video" pack={iconPack} size={16} />
        {puedeUnirse ? 'Unirse a la reunión' : 'Abrir la sala'}
      </a>

      {!puedeUnirse && interviewAt ? (
        <p className="text-xs text-secondary">
          El botón se destaca {JOIN_OPENS_MINUTES_BEFORE} minutos antes de la hora. Puedes entrar
          igualmente para comprobar la cámara.
        </p>
      ) : null}
    </div>
  );
}
