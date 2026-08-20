/**
 * Mensajes que llegan por el formulario de contacto.
 *
 * Existe porque un servicio que trata datos personales necesita un canal por
 * el que se pueda ejercer los derechos sobre ellos, y quien opera Deska no
 * publica una direccion de correo. Los mensajes viajan a la base de datos del
 * proyecto y solo los lee la cuenta que lo administra.
 */

export const SUPPORT_TOPICS = ['soporte', 'privacidad', 'legal', 'otro'] as const;
export type SupportTopic = (typeof SUPPORT_TOPICS)[number];

export const SUPPORT_TOPIC_LABELS: Readonly<Record<SupportTopic, string>> = {
  soporte: 'Algo no funciona',
  privacidad: 'Mis datos personales',
  legal: 'Términos o aviso legal',
  otro: 'Otra cosa',
};

/** Explica para que sirve cada motivo, para elegir sin tener que adivinar. */
export const SUPPORT_TOPIC_HINTS: Readonly<Record<SupportTopic, string>> = {
  soporte: 'Un error, algo que se ve mal o una duda de uso.',
  privacidad: 'Acceder a tus datos, corregirlos, llevártelos o borrarlos.',
  legal: 'Dudas sobre los términos o la política de privacidad.',
  otro: 'Cualquier asunto que no encaje en los anteriores.',
};

export const MAX_SUPPORT_BODY_LENGTH = 2000;
export const MAX_SUPPORT_EMAIL_LENGTH = 160;

/** Minimo util: por debajo de esto no hay nada que atender. */
export const MIN_SUPPORT_BODY_LENGTH = 10;

export interface SupportMessage {
  readonly id: string;
  readonly topic: SupportTopic;
  /** Correo de respuesta. Es opcional: se puede escribir sin dejar ninguno. */
  readonly replyTo: string | null;
  readonly body: string;
  /** Cuenta que lo envio, si habia sesion abierta. Nulo si no la habia. */
  readonly userId: string | null;
  readonly createdAt: string;
  readonly handledAt: string | null;
}

export interface CreateSupportMessageInput {
  readonly topic: SupportTopic;
  readonly replyTo?: string | null;
  readonly body: string;
}

export function isSupportTopic(value: unknown): value is SupportTopic {
  return typeof value === 'string' && (SUPPORT_TOPICS as readonly string[]).includes(value);
}

export interface SupportRejection {
  readonly field: 'topic' | 'replyTo' | 'body';
  readonly message: string;
}

/**
 * Comprobacion sencilla del correo. No pretende validar que exista: solo que
 * tenga la forma de una direccion, para avisar de una errata antes de enviar.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Las mismas reglas en el navegador y en el servidor. El navegador las aplica
 * para avisar antes de enviar; el servidor vuelve a aplicarlas porque nunca
 * puede fiarse de lo que llega.
 */
export function rejectSupportMessage(input: {
  topic: unknown;
  replyTo?: string | null;
  body?: string | null;
}): SupportRejection | null {
  if (!isSupportTopic(input.topic)) {
    return { field: 'topic', message: 'Elige un motivo para el mensaje.' };
  }

  const replyTo = input.replyTo?.trim();

  if (replyTo) {
    if (replyTo.length > MAX_SUPPORT_EMAIL_LENGTH) {
      return { field: 'replyTo', message: 'El correo es demasiado largo.' };
    }

    if (!EMAIL_PATTERN.test(replyTo)) {
      return { field: 'replyTo', message: 'Revisa el correo: no tiene forma de dirección.' };
    }
  }

  const body = input.body?.trim() ?? '';

  if (body.length < MIN_SUPPORT_BODY_LENGTH) {
    return { field: 'body', message: 'Cuéntanos un poco más para poder ayudarte.' };
  }

  if (body.length > MAX_SUPPORT_BODY_LENGTH) {
    return {
      field: 'body',
      message: `El mensaje admite hasta ${MAX_SUPPORT_BODY_LENGTH} caracteres.`,
    };
  }

  return null;
}
