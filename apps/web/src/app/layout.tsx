import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { PreferencesProvider } from '@/components/theme/PreferencesProvider';
import { THEME_BOOTSTRAP_SCRIPT } from '@/lib/preferences';
import { DEFAULT_THEME } from '@/lib/themes';

import './globals.css';

export const metadata: Metadata = {
  title: 'Jobtrack',
  description:
    'Tablero gamificado para registrar tus postulaciones de empleo y seguir su avance desde cualquier dispositivo.',
  applicationName: 'Jobtrack',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        {/* Aplica el tema guardado antes de pintar para evitar un parpadeo de colores. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
