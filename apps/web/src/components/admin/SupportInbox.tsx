'use client';

import { useCallback, useEffect, useState } from 'react';
import { SUPPORT_TOPIC_LABELS, type SupportMessage } from '@deska/contracts';

import { Button } from '@/components/ui/Button';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { useApiClient } from '@/hooks/use-api-client';
import { useSession } from '@/hooks/use-session';
import { ApiError } from '@/lib/api-client';
import { formatDateTime } from '@/lib/format';

/**
 * Mensajes recibidos por el formulario de contacto.
 *
 * Es la otra mitad del canal: prometer una via de contacto y no leerla seria
 * peor que no ofrecerla. Vive dentro del panel de administracion porque solo
 * la cuenta que lo administra puede abrirlo.
 */
export function SupportInbox() {
  const { session } = useSession();
  const { client } = useApiClient(session?.access_token ?? null);
  const [mensajes, setMensajes] = useState<SupportMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!client) {
      return;
    }

    try {
      setMensajes(await client.getSupportMessages());
      setError(null);
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No fue posible leer los mensajes.');
    }
  }, [client]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const atender = async (id: string) => {
    if (!client) {
      return;
    }

    await client.markSupportHandled(id);
    void cargar();
  };

  if (error) {
    return <StatusBanner tone="error" message={error} />;
  }

  const pendientes = mensajes?.filter((mensaje) => mensaje.handledAt === null) ?? [];

  return (
    <section className="surface-card p-4" aria-label="Mensajes de contacto">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
          Mensajes recibidos
        </h2>
        {pendientes.length > 0 ? (
          <span className="text-xs font-semibold text-warning">
            {pendientes.length === 1 ? '1 sin atender' : `${pendientes.length} sin atender`}
          </span>
        ) : null}
      </div>

      {mensajes === null ? (
        <p className="text-sm text-secondary">Cargando los mensajes...</p>
      ) : mensajes.length === 0 ? (
        <p className="text-sm text-secondary">No hay mensajes todavía.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {mensajes.map((mensaje) => (
            <li
              key={mensaje.id}
              className={`rounded-control border p-3 ${
                mensaje.handledAt ? 'border-subtle opacity-60' : 'border-strong'
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-primary">
                  {SUPPORT_TOPIC_LABELS[mensaje.topic]}
                </span>
                <span className="text-xs text-secondary">{formatDateTime(mensaje.createdAt)}</span>
              </div>

              <p className="mt-1.5 whitespace-pre-wrap text-sm text-secondary [overflow-wrap:anywhere]">
                {mensaje.body}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-secondary [overflow-wrap:anywhere]">
                  {mensaje.replyTo ? `Responder a ${mensaje.replyTo}` : 'Sin correo de respuesta'}
                  {mensaje.userId ? ' · con sesión iniciada' : ''}
                </span>

                {mensaje.handledAt ? (
                  <span className="text-xs text-success">Atendido</span>
                ) : (
                  <Button variant="secondary" onClick={() => void atender(mensaje.id)}>
                    Marcar atendido
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
