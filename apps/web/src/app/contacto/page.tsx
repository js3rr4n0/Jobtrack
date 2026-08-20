import type { Metadata } from 'next';
import Link from 'next/link';

import { Logo } from '@/components/brand/Logo';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ContactForm } from '@/components/support/ContactForm';
import { AppearanceMenu } from '@/components/theme/AppearanceMenu';

export const metadata: Metadata = {
  title: 'Contacto y soporte',
  description:
    'Escríbenos si algo no funciona, si tienes una duda sobre tus datos o sobre los términos de Deska.',
};

export default function ContactoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="focus-ring rounded-control">
            <Logo size={30} />
          </Link>
          <AppearanceMenu />
        </header>

        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary">
            Contacto y soporte
          </h1>
          <p className="mt-2 text-base text-secondary">
            Este formulario es la forma de escribirnos. Llega directamente a quien mantiene Deska y
            no hace falta tener la sesión abierta: si escribes porque no puedes entrar en tu cuenta,
            este es el sitio.
          </p>
        </div>

        <ContactForm />

        <p className="text-xs text-secondary">
          Lo que escribas aquí se guarda para poder atenderte. Puedes leer cómo lo tratamos en la{' '}
          <Link
            href="/privacidad"
            className="focus-ring rounded-control text-primary underline decoration-dotted underline-offset-2"
          >
            política de privacidad
          </Link>
          .
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
