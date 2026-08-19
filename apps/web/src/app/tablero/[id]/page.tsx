import type { Metadata } from 'next';

import { ApplicationDetail } from '@/components/board/ApplicationDetail';

export const metadata: Metadata = {
  title: 'Vacante - Deska',
};

/**
 * Ficha de una vacante. Es una dirección propia, no una ventana emergente: se
 * puede abrir en otra pestaña, guardar en marcadores y compartir consigo mismo
 * de un dispositivo a otro.
 */
export default function ApplicationPage({ params }: { params: { id: string } }) {
  return <ApplicationDetail applicationId={params.id} />;
}
