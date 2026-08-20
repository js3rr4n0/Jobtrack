import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { PreferencesProvider } from '@/components/theme/PreferencesProvider';
import { THEME_BOOTSTRAP_SCRIPT } from '@/lib/preferences';
import { DEFAULT_THEME } from '@/lib/themes';

import './globals.css';

/**
 * Direccion publica del sitio. Las etiquetas para redes necesitan direcciones
 * absolutas, y en despliegue Vercel la expone por su cuenta.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'https://deska.app';

const DESCRIPCION =
  'Organiza tus postulaciones de empleo en un tablero, no se te pasa ninguna entrevista y ves ' +
  'dónde se te frena la búsqueda. Gratis, sin tarjeta y sincronizado entre tu computadora y tu teléfono.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  /*
   * La plantilla deja que cada pantalla ponga su nombre delante y conserve la
   * marca detras, sin repetirla a mano en cada archivo.
   */
  title: {
    default: 'Deska · Organiza tus postulaciones de empleo y consigue trabajo más rápido',
    template: '%s · Deska',
  },
  description: DESCRIPCION,
  applicationName: 'Deska',
  keywords: [
    'buscar trabajo',
    'organizar postulaciones',
    'seguimiento de candidaturas',
    'tablero de empleo',
    'entrevistas de trabajo',
    'búsqueda de empleo',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Deska',
    locale: 'es_ES',
    url: SITE_URL,
    title: 'Deska · Organiza tus postulaciones de empleo y consigue trabajo más rápido',
    description: DESCRIPCION,
    images: [
      {
        url: '/tablero-light.jpg',
        width: 3840,
        height: 1400,
        alt: 'El tablero de Deska con sus seis columnas, de «me interesa» a «contratado»',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deska · Organiza tus postulaciones de empleo',
    description: DESCRIPCION,
    images: ['/tablero-light.jpg'],
  },
  robots: { index: true, follow: true },
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
