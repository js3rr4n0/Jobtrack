import Link from 'next/link';

import { Logo } from '@/components/brand/Logo';
import { LEGAL_CONTACT_URL } from '@/lib/legal';

const ENLACES: readonly { href: string; label: string }[] = [
  { href: '/terminos', label: 'Términos de servicio' },
  { href: '/privacidad', label: 'Política de privacidad' },
  { href: LEGAL_CONTACT_URL, label: 'Contacto y soporte' },
];

/**
 * Pie comun de las pantallas publicas. Los enlaces legales tienen que poder
 * alcanzarse desde cualquier pagina antes de crear una cuenta: si solo
 * aparecieran despues de registrarse, el consentimiento se habria dado sin
 * poder leer a que.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-subtle">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-1">
          <Logo size={22} />
          <p className="text-xs text-secondary">
            Gratis, sin anuncios y sin vender tus datos.
          </p>
        </div>

        <nav aria-label="Enlaces legales">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {ENLACES.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className="focus-ring rounded-control text-xs text-secondary underline decoration-dotted underline-offset-4 hover:text-primary"
                >
                  {enlace.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
