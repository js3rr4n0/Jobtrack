'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  MAX_SUPPORT_BODY_LENGTH,
  SUPPORT_TOPICS,
  SUPPORT_TOPIC_HINTS,
  SUPPORT_TOPIC_LABELS,
  type SupportTopic,
  rejectSupportMessage,
} from '@deska/contracts';

import { Button } from '@/components/ui/Button';
import { CharacterCounter, SelectField, TextAreaField, TextField } from '@/components/ui/FormField';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { useApiClient } from '@/hooks/use-api-client';
import { useSession } from '@/hooks/use-session';
import { ApiError } from '@/lib/api-client';

type Estado = 'escribiendo' | 'enviando' | 'enviado';

const OPCIONES = SUPPORT_TOPICS.map((topic) => ({
  value: topic,
  label: SUPPORT_TOPIC_LABELS[topic],
}));

/**
 * Formulario de contacto.
 *
 * Es el unico canal del proyecto: no se publica ninguna direccion de correo ni
 * ningun perfil personal. Funciona sin haber iniciado sesion a proposito,
 * porque el motivo mas urgente para escribir es no poder entrar en la propia
 * cuenta.
 */
export function ContactForm() {
  const { session } = useSession();
  const { client } = useApiClient(session?.access_token ?? null);

  const [topic, setTopic] = useState<SupportTopic>('soporte');
  const [replyTo, setReplyTo] = useState('');
  const [body, setBody] = useState('');
  const [estado, setEstado] = useState<Estado>('escribiendo');
  const [error, setError] = useState<string | null>(null);

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Las mismas reglas que aplica el servidor, para avisar antes de enviar.
    const rechazo = rejectSupportMessage({ topic, replyTo, body });

    if (rechazo) {
      setError(rechazo.message);
      return;
    }

    if (!client) {
      setError('No fue posible contactar con el servidor. Intentalo de nuevo en un minuto.');
      return;
    }

    setEstado('enviando');
    setError(null);

    try {
      await client.sendSupportMessage({ topic, replyTo: replyTo.trim() || null, body: body.trim() });
      setEstado('enviado');
    } catch (fallo) {
      setEstado('escribiendo');
      setError(fallo instanceof ApiError ? fallo.message : 'No fue posible enviar el mensaje.');
    }
  };

  if (estado === 'enviado') {
    return (
      <div className="surface-card layered flex flex-col gap-3 p-5">
        <h2 className="font-display text-base font-bold text-primary">Mensaje recibido</h2>
        <p className="text-sm text-secondary">
          Gracias por escribir.{' '}
          {replyTo.trim() ? (
            <>
              Te responderemos a <strong className="text-primary">{replyTo.trim()}</strong>.
            </>
          ) : (
            <>
              No dejaste un correo, así que no podremos responderte; si esperabas respuesta, vuelve
              a escribir añadiendo uno.
            </>
          )}
        </p>
        {topic === 'privacidad' ? (
          <p className="text-sm text-secondary">
            Las solicitudes sobre datos personales se atienden en un plazo máximo de un mes.
          </p>
        ) : null}
        <Button
          variant="secondary"
          className="w-fit"
          onClick={() => {
            setBody('');
            setEstado('escribiendo');
          }}
        >
          Escribir otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="surface-card layered flex flex-col gap-4 p-5">
      {error ? <StatusBanner tone="error" message={error} onDismiss={() => setError(null)} /> : null}

      <SelectField
        id="motivo"
        name="motivo"
        label="Motivo"
        options={OPCIONES}
        value={topic}
        hint={SUPPORT_TOPIC_HINTS[topic]}
        onChange={(event) => setTopic(event.target.value as SupportTopic)}
      />

      <TextField
        id="correo"
        name="correo"
        type="email"
        label="Tu correo, si quieres respuesta"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        value={replyTo}
        hint="Es opcional. Sin él podemos leerte, pero no contestarte."
        onChange={(event) => setReplyTo(event.target.value)}
      />

      <TextAreaField
        id="mensaje"
        name="mensaje"
        label="Tu mensaje"
        rows={7}
        value={body}
        placeholder="Cuéntanos qué necesitas."
        counter={<CharacterCounter length={body.trim().length} limit={MAX_SUPPORT_BODY_LENGTH} />}
        onChange={(event) => setBody(event.target.value)}
      />

      <Button type="submit" className="w-fit" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Enviando...' : 'Enviar mensaje'}
      </Button>
    </form>
  );
}
