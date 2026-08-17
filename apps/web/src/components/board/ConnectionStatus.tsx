'use client';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import type { RealtimeStatus } from '@/lib/realtime-client';

export interface ConnectionStatusProps {
  isOnline: boolean;
  realtimeStatus: RealtimeStatus;
}

/** Indica de un vistazo si el tablero esta recibiendo cambios en vivo. */
export function ConnectionStatus({ isOnline, realtimeStatus }: ConnectionStatusProps) {
  const { iconPack } = usePreferences();

  const descriptor = !isOnline
    ? { label: 'Sin conexion', tone: 'text-danger', icon: 'offline' as const }
    : realtimeStatus === 'connected'
      ? { label: 'Sincronizado', tone: 'text-success', icon: 'check' as const }
      : { label: 'Reconectando', tone: 'text-warning', icon: 'refresh' as const };

  return (
    <p
      role="status"
      aria-live="polite"
      className={`flex items-center gap-1.5 text-xs font-medium ${descriptor.tone}`}
    >
      <Icon name={descriptor.icon} pack={iconPack} size={14} />
      {descriptor.label}
    </p>
  );
}
