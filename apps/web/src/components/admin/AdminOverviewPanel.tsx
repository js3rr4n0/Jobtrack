'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { STATUS_CATALOG, type ApplicationStatus, type CompanyStat } from '@jobtrack/contracts';

import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Button } from '@/components/ui/Button';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { Icon } from '@/components/icons';
import { useApiClient } from '@/hooks/use-api-client';
import { useSession } from '@/hooks/use-session';
import { ApiError, type AdminOverviewResponse } from '@/lib/api-client';
import { formatDateTime } from '@/lib/format';
import { MISSING_SUPABASE_MESSAGE } from '@/lib/supabase/browser-client';

type PanelState =
  | { kind: 'loading' }
  | { kind: 'ready'; overview: AdminOverviewResponse }
  | { kind: 'denied' }
  | { kind: 'error'; message: string };

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-control border border-subtle bg-sunken p-3 shadow-sunken">
      <p className="text-xs text-secondary [overflow-wrap:anywhere]">{label}</p>
      <p className="font-display text-2xl font-semibold text-primary">{value}</p>
      {hint ? <p className="text-xs text-secondary">{hint}</p> : null}
    </div>
  );
}

/** Tabla de empresas con su recuento y, si procede, su porcentaje. */
function CompanyTable({
  title,
  description,
  rows,
  rate,
}: {
  title: string;
  description: string;
  rows: readonly CompanyStat[];
  rate?: 'hiredRate' | 'rejectedRate';
}) {
  return (
    <section className="surface-card p-4">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
        {title}
      </h2>
      <p className="mb-3 text-xs text-secondary">{description}</p>

      {rows.length === 0 ? (
        <p className="text-sm text-secondary">Todavía no hay datos suficientes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-secondary">
                <th scope="col" className="pb-2 font-medium">
                  Empresa
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  Postulaciones
                </th>
                {rate ? (
                  <th scope="col" className="pb-2 text-right font-medium">
                    {rate === 'hiredRate' ? 'Contrata' : 'Descarta'}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.company} className="border-t border-subtle">
                  <td className="py-2 pr-3 text-primary">{row.company}</td>
                  <td className="py-2 text-right text-secondary">{row.total}</td>
                  {rate ? (
                    <td className="py-2 text-right font-semibold text-primary">{row[rate]} %</td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/**
 * Panel de administración. Solo muestra recuentos agregados: ninguna nota,
 * ningún contacto y ningún identificador de persona sale de la API, de modo
 * que medir el uso del producto no obliga a leer la búsqueda de nadie.
 */
export function AdminOverviewPanel() {
  const router = useRouter();
  const { iconPack } = usePreferences();
  const { session, status: sessionStatus } = useSession();
  const { client } = useApiClient(session?.access_token ?? null);
  const [state, setState] = useState<PanelState>({ kind: 'loading' });

  const load = useCallback(async () => {
    if (!client) {
      return;
    }

    setState({ kind: 'loading' });

    try {
      setState({ kind: 'ready', overview: await client.getAdminOverview() });
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 403) {
        setState({ kind: 'denied' });
        return;
      }

      setState({
        kind: 'error',
        message: error instanceof ApiError ? error.message : 'No fue posible cargar el informe.',
      });
    }
  }, [client]);

  useEffect(() => {
    if (sessionStatus === 'anonymous') {
      router.replace('/acceso');
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (sessionStatus === 'unconfigured') {
    return <StatusBanner tone="error" message={MISSING_SUPABASE_MESSAGE} />;
  }

  if (sessionStatus === 'loading' || sessionStatus === 'anonymous') {
    return <p className="text-sm text-secondary">Cargando tu sesión...</p>;
  }

  if (state.kind === 'denied') {
    return (
      <StatusBanner
        tone="warning"
        message="Este panel es solo para la cuenta administradora del proyecto."
        details={['Si crees que deberías tener acceso, revisa la variable ADMIN_EMAIL de la API.']}
      />
    );
  }

  if (state.kind === 'error') {
    return <StatusBanner tone="error" message={state.message} />;
  }

  if (state.kind === 'loading') {
    return <p className="text-sm text-secondary">Reuniendo las estadísticas...</p>;
  }

  const { overview } = state;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-secondary">
          Datos al {formatDateTime(overview.generatedAt)}
        </p>
        <Button variant="secondary" onClick={() => void load()}>
          <Icon name="refresh" pack={iconPack} size={16} />
          Actualizar
        </Button>
      </div>

      <section aria-label="Uso general">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Personas registradas" value={overview.totalUsers} />
          <Tile
            label="Activas este mes"
            value={overview.activeUsers}
            hint="Con algún movimiento en 30 días"
          />
          <Tile label="Postulaciones" value={overview.totalApplications} />
          <Tile
            label="Media por persona"
            value={overview.averagePerUser}
            hint={`${overview.stalledApplications} sin mover en 30 días`}
          />
        </div>
      </section>

      <section className="surface-card p-4" aria-label="Reparto por etapa">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-primary">
          En qué etapa está todo
        </h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(Object.keys(overview.byStatus) as ApplicationStatus[]).map((status) => (
            <div key={status} className="rounded-control border border-subtle bg-sunken p-3">
              <dt className="text-xs text-secondary">{STATUS_CATALOG[status].label}</dt>
              <dd className="font-display text-xl font-semibold text-primary">
                {overview.byStatus[status]}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <CompanyTable
          title="Las más solicitadas"
          description="Dónde se postula más gente."
          rows={overview.mostApplied}
        />
        <CompanyTable
          title="Áreas más usadas"
          description="Los campos que la gente escribe en sus tableros."
          rows={overview.topAreas.map((area) => ({
            company: area.name,
            total: area.total,
            hired: 0,
            rejected: 0,
            hiredRate: 0,
            rejectedRate: 0,
          }))}
        />
        <CompanyTable
          title="Las que más contratan"
          description="Porcentaje de procesos que acaban en contratación."
          rows={overview.bestHiring}
          rate="hiredRate"
        />
        <CompanyTable
          title="Las que más descartan"
          description="Porcentaje de procesos que acaban en descarte."
          rows={overview.worstHiring}
          rate="rejectedRate"
        />
      </div>

      <p className="text-xs text-secondary">
        El informe solo contiene recuentos. Las notas, los contactos y la identidad de cada persona
        no salen de su propia cuenta.
      </p>
    </div>
  );
}
