import Image from 'next/image';
import Link from 'next/link';

import { AuthResultForwarder } from '@/components/auth/AuthResultForwarder';
import { LandingHighlights } from '@/components/landing/LandingHighlights';
import { AppearanceMenu } from '@/components/theme/AppearanceMenu';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <AuthResultForwarder />
      <header className="flex items-center justify-between gap-4">
        <p className="font-display text-lg font-semibold tracking-tight text-primary">Jobtrack</p>
        <AppearanceMenu />
      </header>

      <section className="flex flex-col gap-5">
        <h1 className="font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">
          Organiza tus postulaciones y convierte tu búsqueda en progreso visible
        </h1>
        <p className="max-w-2xl text-base text-secondary">
          Cada oferta es una tarjeta que avanza por seis etapas, de «me interesa» a «contratado». De
          un vistazo ves en qué punto está cada proceso, cuándo es la próxima entrevista y cuántas
          llevas. El mismo tablero en la computadora y en el teléfono.
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

        <p className="text-sm text-secondary">
          Sin plantillas que armar ni fórmulas que mantener: las etapas y las cuentas ya vienen
          hechas.
        </p>
      </section>

      {/*
        Prueba visual del producto antes del pliegue: el tablero real, con sus
        columnas, sus areas y el panel de progreso, pesa mas que cualquier
        descripcion. La imagen es decorativa respecto al texto que la rodea, asi
        que su alternativa resume lo que se ve sin repetir el titular.
      */}
      <figure className="flex flex-col gap-2">
        <div className="overflow-hidden rounded-card border border-subtle bg-raised shadow-lifted">
          <Image
            src="/tablero.jpg"
            alt="El tablero de Jobtrack con sus seis columnas, las pestañas de área y el panel de nivel, entrevistas y ofertas"
            width={1280}
            height={742}
            className="h-auto w-full"
            priority
          />
        </div>
        <figcaption className="text-xs text-secondary">
          Un tablero con nueve postulaciones repartidas en tres áreas.
        </figcaption>
      </figure>

      <LandingHighlights />

      <p className="text-sm text-secondary">
        Además: doce temas visuales, dos estilos de iconos, música ambiental opcional y un tutorial
        que te guía la primera vez.
      </p>

      <footer className="mt-auto border-t border-subtle pt-4 text-xs text-secondary">
        Jobtrack sincroniza tus postulaciones mediante Supabase y una API propia. Consulta el manual
        de usuario en la carpeta docs del repositorio.
      </footer>
    </main>
  );
}
