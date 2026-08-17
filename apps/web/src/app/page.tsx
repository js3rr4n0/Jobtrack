import Link from 'next/link';

import { LandingHighlights } from '@/components/landing/LandingHighlights';
import { AppearanceMenu } from '@/components/theme/AppearanceMenu';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center justify-between gap-4">
        <p className="font-display text-lg font-semibold tracking-tight text-primary">Jobtrack</p>
        <AppearanceMenu />
      </header>

      <section className="flex flex-col gap-5">
        <h1 className="font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">
          Convierte tu busqueda de empleo en una partida que puedes ganar
        </h1>
        <p className="max-w-2xl text-base text-secondary">
          Registra cada oferta, arrastra las tarjetas entre columnas y observa como suben tu nivel,
          tu racha y tus logros. Tus datos viajan contigo: el mismo tablero en la computadora y en
          el telefono.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/registro"
            className="focus-ring inline-flex items-center justify-center rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-inverse hover:bg-accent-strong"
          >
            Crear una cuenta
          </Link>
          <Link
            href="/acceso"
            className="focus-ring inline-flex items-center justify-center rounded-control border border-strong px-5 py-2.5 text-sm font-semibold text-primary hover:bg-accent-soft"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <LandingHighlights />

      <footer className="mt-auto border-t border-subtle pt-4 text-xs text-secondary">
        Jobtrack sincroniza tus postulaciones mediante Supabase y una API propia. Consulta el manual
        de usuario en la carpeta docs del repositorio.
      </footer>
    </main>
  );
}
