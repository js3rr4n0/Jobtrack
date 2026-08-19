'use client';

import { useState } from 'react';

import { Icon } from '@/components/icons';
import { AppearanceSettings } from '@/components/theme/AppearanceSettings';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { UserProfile } from '@/lib/user-profile';

export interface UserMenuProps {
  profile: UserProfile;
  onSignOut: () => void;
}

/** Foto del proveedor, o la inicial del nombre cuando no hay ninguna. */
function Avatar({ profile, size }: { profile: UserProfile; size: number }) {
  if (profile.avatarUrl) {
    return (
      // Se usa una imagen simple: la foto vive en el dominio del proveedor y no
      // se conocen de antemano todos los servidores posibles.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatarUrl}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="rounded-full border border-subtle object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-accent font-semibold text-inverse"
    >
      {profile.initial}
    </span>
  );
}

/**
 * Punto único de la cuenta: identifica quién está dentro, reúne los ajustes de
 * apariencia y permite cerrar sesión, en lugar de repartirlo en varios botones.
 */
export function UserMenu({ profile, onSignOut }: UserMenuProps) {
  const { iconPack } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        data-tour="cuenta"
        onClick={() => setIsOpen(true)}
        aria-label={`Cuenta de ${profile.name}, apariencia y cierre de sesión`}
        className="focus-ring flex items-center gap-2 rounded-control border border-subtle bg-raised py-1.5 pl-1.5 pr-3 text-sm text-primary hover:border-strong"
      >
        <Avatar profile={profile} size={28} />
        <span className="hidden max-w-[9rem] truncate sm:inline">{profile.name}</span>
        <Icon name="chevron" pack={iconPack} size={14} className="shrink-0 text-secondary" />
      </button>

      <Modal
        isOpen={isOpen}
        title="Tu cuenta"
        onClose={() => setIsOpen(false)}
      >
        <div className="flex flex-col gap-6">
          <section className="flex items-center gap-3 rounded-card border border-subtle bg-base p-4">
            <Avatar profile={profile} size={52} />
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-primary">
                {profile.name}
              </p>
              {profile.email ? (
                <p className="truncate text-sm text-secondary">{profile.email}</p>
              ) : null}
            </div>
          </section>

          <AppearanceSettings />

          <Button variant="danger" className="w-full" onClick={onSignOut}>
            <Icon name="logout" pack={iconPack} size={16} />
            Cerrar sesión
          </Button>
        </div>
      </Modal>
    </>
  );
}
