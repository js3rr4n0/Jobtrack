import Link from 'next/link';

import { AdminOverviewPanel } from '@/components/admin/AdminOverviewPanel';

export const metadata = {
  title: 'Panel de administración - Jobtrack',
};

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-primary">Panel de administración</h1>
          <p className="text-sm text-secondary">Cómo se está usando Jobtrack, en conjunto.</p>
        </div>
        <Link
          href="/tablero"
          className="focus-ring rounded-control border border-strong px-4 py-2 text-sm font-semibold text-primary hover:bg-accent-soft"
        >
          Volver al tablero
        </Link>
      </header>

      <AdminOverviewPanel />
    </main>
  );
}
