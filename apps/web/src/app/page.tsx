import Link from 'next/link';

import { AuthResultForwarder } from '@/components/auth/AuthResultForwarder';
import { LandingHighlights } from '@/components/landing/LandingHighlights';
import { ThemedBoardShot } from '@/components/landing/ThemedBoardShot';
import { AppearanceMenu } from '@/components/theme/AppearanceMenu';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <AuthResultForwarder />
      <header className="flex items-center justify-between gap-4">
        <p className="font-display text-lg font-semibold tracking-tight text-primary">Deska</p>
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

        {/*
          Apoyo del boton principal. Las dos afirmaciones son comprobables en el
          propio producto: no hay ningun cobro en ninguna parte, y el acceso con
          Google no manda correo de confirmacion.
        */}
        <p className="text-sm text-secondary">
          Gratis y sin tarjeta. Con Google entras en un clic, sin correo de confirmación.
        </p>
      </section>

      <ThemedBoardShot />

      <ul className="grid gap-3 sm:grid-cols-3">
        {[
          { dato: '6', titulo: 'etapas ya definidas', apoyo: 'De «me interesa» a «contratado».' },
          { dato: '1', titulo: 'sitio para todo', apoyo: 'Fechas, contactos, notas y enlaces.' },
          { dato: '0', titulo: 'planillas que mantener', apoyo: 'Las cuentas se calculan solas.' },
        ].map((item) => (
          <li key={item.titulo} className="rounded-card border border-subtle bg-raised p-4 shadow-card">
            <p className="font-display text-2xl font-bold text-accent">{item.dato}</p>
            <p className="text-sm font-semibold text-primary">{item.titulo}</p>
            <p className="text-xs text-secondary">{item.apoyo}</p>
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-primary">Qué ganas usando Deska</h2>
        <ul className="flex flex-col gap-2 text-sm text-secondary">
          <li>
            <strong className="text-primary">Dejas de perder el hilo.</strong> Cada oferta guarda su
            enlace, su contacto, el currículum que enviaste y lo que hablaste, en la misma tarjeta.
          </li>
          <li>
            <strong className="text-primary">Sabes qué te falta hacer hoy.</strong> Marcas el día en
            que toca insistir y el tablero te avisa cuando llega, sin que tengas que repasar la
            lista entera.
          </li>
          <li>
            <strong className="text-primary">Ves dónde se te frena la búsqueda.</strong> Si diez
            postulaciones llevan un mes en la misma columna, el problema no es el volumen y el
            tablero te lo enseña.
          </li>
          <li>
            <strong className="text-primary">Mides si estás mejorando.</strong> Cuántas entrevistas
            conseguiste y cuántas ofertas siguen vivas, contadas solas a partir de tu tablero.
          </li>
        </ul>
      </section>

      <LandingHighlights />

      <p className="text-sm text-secondary">
        Además: doce temas visuales, dos estilos de iconos y un tutorial
        que te guía la primera vez.
      </p>

      <footer className="mt-auto border-t border-subtle pt-4 text-xs text-secondary">
        Deska sincroniza tus postulaciones mediante Supabase y una API propia. Consulta el manual
        de usuario en la carpeta docs del repositorio.
      </footer>
    </main>
  );
}
