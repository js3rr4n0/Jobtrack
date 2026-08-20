'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { Logo } from '@/components/brand/Logo';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Icon } from '@/components/icons';
import { AppearanceMenu } from '@/components/theme/AppearanceMenu';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/FormField';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { useNetworkStatus } from '@/hooks/use-network-status';
import {
  type CredentialsErrors,
  type CredentialsValues,
  MINIMUM_PASSWORD_LENGTH,
  describeAuthError,
  validateCredentials,
} from '@/lib/auth-form';
import { OAUTH_PROVIDERS, type OAuthProviderOption } from '@/lib/auth-providers';
import { MISSING_SUPABASE_MESSAGE, getSupabaseClient } from '@/lib/supabase/browser-client';

export type AuthMode = 'signIn' | 'signUp';

const COPY: Record<AuthMode, { title: string; subtitle: string; submit: string; alternateHref: string; alternateLabel: string }> = {
  signIn: {
    title: 'Inicia sesión',
    subtitle: 'Recupera tu tablero y continua donde lo dejaste.',
    submit: 'Entrar',
    alternateHref: '/registro',
    alternateLabel: 'No tengo cuenta todavía',
  },
  signUp: {
    title: 'Crea tu cuenta',
    subtitle: 'En menos de un minuto tienes tu primer tablero en marcha.',
    submit: 'Crear mi cuenta gratis',
    alternateHref: '/acceso',
    alternateLabel: 'Ya tengo una cuenta',
  },
};

/**
 * Los mismos beneficios que promete la portada, dichos en una linea.
 *
 * El registro es donde se cierra la decision, y llegar ahi para encontrar un
 * formulario generico obliga a recordar por que se vino. Repetirlos aqui
 * cuesta tres lineas y evita esa desconexion.
 */
const BENEFICIOS: readonly string[] = [
  'No se te pasa ninguna entrevista',
  'Ves dónde se te frena la búsqueda',
  'El mismo tablero en la computadora y en el teléfono',
];

/** Objeciones habituales antes de dar un correo, respondidas por adelantado. */
const GARANTIAS: readonly string[] = ['Gratis', 'Sin tarjeta', 'Menos de un minuto'];

const OFFLINE_MESSAGE =
  'Sin conexión a internet. Conectate a una red para iniciar sesión o registrarte.';

const CONFIRMATION_MESSAGE =
  'Cuenta creada. Revisa tu correo para confirmarla y después inicia sesión.';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isOnline = useNetworkStatus();
  const copy = COPY[mode];
  const isSignUp = mode === 'signUp';
  const { iconPack } = usePreferences();

  const [values, setValues] = useState<CredentialsValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<CredentialsErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);

  const updateField = (field: keyof CredentialsValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  /**
   * Los proveedores externos verifican el correo por su cuenta, de modo que
   * esta vía evita el envío de mensajes de confirmación y sus límites de tasa.
   */
  const handleProvider = async (provider: OAuthProviderOption) => {
    setFormError(null);
    setNotice(null);

    if (!isOnline) {
      setFormError(OFFLINE_MESSAGE);
      return;
    }

    const client = getSupabaseClient();

    if (!client) {
      setFormError(MISSING_SUPABASE_MESSAGE);
      return;
    }

    setRedirectingTo(provider.id);

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: provider.id,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        setFormError(describeAuthError(error.message));
        setRedirectingTo(null);
      }
    } catch (error) {
      setFormError(describeAuthError(error instanceof Error ? error.message : null));
      setRedirectingTo(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setNotice(null);

    const validationErrors = validateCredentials(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!isOnline) {
      setFormError(OFFLINE_MESSAGE);
      return;
    }

    const client = getSupabaseClient();

    if (!client) {
      setFormError(MISSING_SUPABASE_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    try {
      const credentials = { email: values.email.trim(), password: values.password };
      const { data, error } =
        mode === 'signIn'
          ? await client.auth.signInWithPassword(credentials)
          : await client.auth.signUp({
              ...credentials,
              // El enlace del correo debe volver a esta misma aplicación, no al
              // dominio configurado por defecto en el proyecto de Supabase.
              options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });

      if (error) {
        setFormError(describeAuthError(error.message));
        return;
      }

      if (data.session) {
        router.push('/tablero');
        return;
      }

      setNotice(CONFIRMATION_MESSAGE);
    } catch (error) {
      setFormError(describeAuthError(error instanceof Error ? error.message : null));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="focus-ring rounded-control">
            <Logo size={30} />
          </Link>
          <AppearanceMenu />
        </div>

        <div className="surface-card layered p-6">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary">{copy.title}</h1>
          <p className="mt-1 text-sm text-secondary">{copy.subtitle}</p>

          {isSignUp ? (
            <>
              <ul className="mt-4 flex flex-col gap-1.5">
                {BENEFICIOS.map((beneficio) => (
                  <li key={beneficio} className="flex items-start gap-2 text-sm text-secondary">
                    <Icon
                      name="check"
                      pack={iconPack}
                      size={16}
                      className="mt-0.5 shrink-0 text-success"
                    />
                    {beneficio}
                  </li>
                ))}
              </ul>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {GARANTIAS.map((garantia) => (
                  <li
                    key={garantia}
                    className="rounded-control bg-accent-soft px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {garantia}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {!isOnline ? (
            <div className="mt-4">
              <StatusBanner tone="warning" message={OFFLINE_MESSAGE} />
            </div>
          ) : null}

          {formError ? (
            <div className="mt-4">
              <StatusBanner tone="error" message={formError} onDismiss={() => setFormError(null)} />
            </div>
          ) : null}

          {notice ? (
            <div className="mt-4">
              <StatusBanner tone="success" message={notice} />
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-2">
            {OAUTH_PROVIDERS.map((provider) => (
              <Button
                key={provider.id}
                type="button"
                variant="secondary"
                className="w-full"
                disabled={redirectingTo !== null}
                onClick={() => void handleProvider(provider)}
              >
                {redirectingTo === provider.id ? 'Abriendo...' : provider.label}
              </Button>
            ))}
          </div>

          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-subtle" />
            <span className="text-xs uppercase tracking-wide text-secondary">o con tu correo</span>
            <span className="h-px flex-1 bg-subtle" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <TextField
              id="email"
              name="email"
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              error={errors.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
            <TextField
              id="password"
              name="password"
              label="Contraseña"
              type="password"
              required
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              value={values.password}
              error={errors.password}
              hint={mode === 'signUp' ? `Mínimo ${MINIMUM_PASSWORD_LENGTH} caracteres.` : undefined}
              onChange={(event) => updateField('password', event.target.value)}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : copy.submit}
            </Button>

            {/*
              El consentimiento va a la vista y junto al boton que lo otorga. Un
              aviso escondido en un pie es precisamente el que una autoridad de
              proteccion de datos considera no prestado.
            */}
            {isSignUp ? (
              <p className="text-xs text-secondary">
                Al crear la cuenta aceptas los{' '}
                <Link
                  href="/terminos"
                  className="focus-ring rounded-control text-primary underline decoration-dotted underline-offset-2"
                >
                  términos de servicio
                </Link>{' '}
                y la{' '}
                <Link
                  href="/privacidad"
                  className="focus-ring rounded-control text-primary underline decoration-dotted underline-offset-2"
                >
                  política de privacidad
                </Link>
                . No vendemos tus datos ni mostramos anuncios.
              </p>
            ) : null}
          </form>

          <p className="mt-4 text-center text-sm text-secondary">
            <Link href={copy.alternateHref} className="focus-ring underline underline-offset-4">
              {copy.alternateLabel}
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
