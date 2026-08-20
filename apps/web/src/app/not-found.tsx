import Link from 'next/link';

import { Logo } from '@/components/brand/Logo';
import { AppearanceMenu } from '@/components/theme/AppearanceMenu';

export const metadata = {
  title: 'Página no encontrada · Deska',
};

/**
 * Pantalla para las direcciones que no existen. Hereda el tema activo como
 * cualquier otra página y ofrece una salida clara: quedarse sin camino de
 * vuelta es peor que el propio error.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="focus-ring rounded-control">
          <Logo size={30} />
        </Link>
        <AppearanceMenu />
      </header>

      <section className="surface-card flex flex-col gap-4 p-6">
        <p className="font-display text-5xl font-extrabold tracking-tight text-accent">404</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary">
          Esta página no existe
        </h1>
        <p className="text-sm text-secondary">
          La dirección que abriste no corresponde a ninguna pantalla de Deska. Puede que el enlace
          esté incompleto o que la sección haya cambiado de sitio.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/tablero"
            className="focus-ring inline-flex items-center justify-center rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-inverse hover:bg-accent-strong"
          >
            Ir a mi tablero
          </Link>
          <Link
            href="/"
            className="focus-ring inline-flex items-center justify-center rounded-control border border-strong px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-soft"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
