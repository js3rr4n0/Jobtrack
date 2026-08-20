import Link from 'next/link';
import type { ReactNode } from 'react';

import { Logo } from '@/components/brand/Logo';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AppearanceMenu } from '@/components/theme/AppearanceMenu';
import { LEGAL_LAST_UPDATED } from '@/lib/legal';

export interface LegalLayoutProps {
  title: string;
  /** Resumen en lenguaje llano, antes del texto formal. */
  summary: ReactNode;
  children: ReactNode;
}

/**
 * Armazon de los documentos legales.
 *
 * Cada uno abre con un resumen en lenguaje llano porque un texto que nadie
 * entiende no informa a nadie, y un consentimiento que no se ha entendido es
 * precisamente el que una autoridad de proteccion de datos declara invalido.
 * El resumen no sustituye al texto: lo precede.
 */
export function LegalLayout({ title, summary, children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="focus-ring rounded-control">
            <Logo size={30} />
          </Link>
          <AppearanceMenu />
        </header>

        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-secondary">
            Última actualización: {LEGAL_LAST_UPDATED}
          </p>
        </div>

        <section className="surface-card layered p-5" aria-label="Resumen en lenguaje llano">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
            En resumen
          </h2>
          <div className="mt-3 flex flex-col gap-2 text-sm text-secondary">{summary}</div>
        </section>

        <article className="flex flex-col gap-7">{children}</article>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Apartado numerado del documento. */
export function LegalSection({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  const anchor = `apartado-${number}`;

  return (
    <section id={anchor} className="flex flex-col gap-2 scroll-mt-6">
      <h2 className="font-display text-xl font-extrabold tracking-tight text-primary">
        <span className="text-accent">{number}.</span> {title}
      </h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-secondary">{children}</div>
    </section>
  );
}

/** Lista de puntos dentro de un apartado. */
export function LegalList({ items }: { items: readonly ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
