'use client';

import { Icon, type IconName } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';

export type BannerTone = 'error' | 'success' | 'warning' | 'info';

const TONE_CLASSES: Record<BannerTone, string> = {
  error: 'border-danger text-danger',
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  info: 'border-subtle text-secondary',
};

const TONE_ICONS: Record<BannerTone, IconName> = {
  error: 'close',
  success: 'check',
  warning: 'offline',
  info: 'refresh',
};

export interface StatusBannerProps {
  tone: BannerTone;
  message: string;
  details?: readonly string[];
  onDismiss?: () => void;
}

/** Aviso persistente con mensaje legible y detalle opcional de validaciones. */
export function StatusBanner({ tone, message, details = [], onDismiss }: StatusBannerProps) {
  const { iconPack } = usePreferences();

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-card border bg-raised px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}
    >
      <Icon name={TONE_ICONS[tone]} pack={iconPack} size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {details.length > 0 ? (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="focus-ring rounded-control p-1 text-current opacity-70 hover:opacity-100"
        >
          <Icon name="close" pack={iconPack} size={14} title="Descartar el aviso" />
        </button>
      ) : null}
    </div>
  );
}
