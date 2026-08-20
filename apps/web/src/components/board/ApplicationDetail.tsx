'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type JobApplication,
  PRIORITY_LABELS,
  STATUS_CATALOG,
  WORK_MODE_LABELS,
  isFollowUpDue,
} from '@deska/contracts';

import { ApplicationForm } from '@/components/board/ApplicationForm';
import { StageProgress } from '@/components/board/StageProgress';
import { AttachmentsPanel } from '@/components/documents/AttachmentsPanel';
import { DocumentPicker } from '@/components/documents/DocumentPicker';
import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextAreaField } from '@/components/ui/FormField';
import { useApiClient } from '@/hooks/use-api-client';
import { useBoard } from '@/hooks/use-board';
import { useDocuments } from '@/hooks/use-documents';
import { useRealtimeChannel } from '@/hooks/use-realtime-channel';
import { useSession } from '@/hooks/use-session';
import { fromApplication, toApplicationInput } from '@/lib/application-form';
import { formatDate, formatDateTime } from '@/lib/format';
import { MISSING_SUPABASE_MESSAGE, getSupabaseClient } from '@/lib/supabase/browser-client';

export interface ApplicationDetailProps {
  applicationId: string;
}

/** Un dato de la ficha. Se omite entero cuando no hay nada que enseñar. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  if (children === null || children === undefined || children === '') {
    return null;
  }

  return (
    <div className="rounded-control border border-subtle bg-sunken p-3">
      <dt className="text-xs uppercase tracking-wide text-secondary">{label}</dt>
      <dd className="mt-0.5 text-sm text-primary [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

/**
 * Ficha completa de una vacante. Existe porque una tarjeta de tablero tiene que
 * caber en una columna: ahí todo va truncado y en cuerpo pequeño. Aquí las
 * notas se leen enteras, las capturas se ven a tamaño real y los archivos
 * caben sin competir por el espacio con las otras cinco columnas.
 */
export function ApplicationDetail({ applicationId }: ApplicationDetailProps) {
  const router = useRouter();
  const { iconPack } = usePreferences();
  const { session, status: sessionStatus } = useSession();

  const accessToken = session?.access_token ?? null;
  const userId = session?.user?.id ?? null;

  const { client, originId } = useApiClient(accessToken);
  const board = useBoard(client, originId);
  const resumes = useDocuments(client, 'resume', userId);
  const coverLetters = useDocuments(client, 'cover-letter', userId);
  const attachments = useDocuments(client, 'attachment', userId, applicationId);

  useRealtimeChannel({ accessToken, onBoardChange: board.applyRemoteEvent });

  const application = board.applications.find((item) => item.id === applicationId) ?? null;

  const [notesDraft, setNotesDraft] = useState('');
  const [savedNotes, setSavedNotes] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /*
   * El borrador solo se rellena cuando llegan unas notas distintas a las que ya
   * se estan editando. Copiarlas en cada renderizado borraria lo que se este
   * escribiendo en cuanto entrara cualquier cambio por el canal en vivo.
   */
  const remoteNotes = application?.notes ?? '';

  useEffect(() => {
    setNotesDraft(remoteNotes);
  }, [remoteNotes]);

  useEffect(() => {
    if (sessionStatus === 'anonymous') {
      router.replace('/acceso');
    }
  }, [sessionStatus, router]);

  if (sessionStatus === 'unconfigured') {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-4">
        <StatusBanner tone="error" message={MISSING_SUPABASE_MESSAGE} />
      </main>
    );
  }

  if (sessionStatus === 'loading' || sessionStatus === 'anonymous' || board.status === 'loading') {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
        <p className="text-sm text-secondary">Cargando la vacante...</p>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-5 px-4 py-8">
        <StatusBanner
          tone="warning"
          message="Esta vacante ya no está en tu tablero."
          details={['Puede que la hayas eliminado desde otro dispositivo.']}
        />
        <Link
          href="/tablero"
          className="focus-ring inline-flex w-fit items-center gap-2 rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-inverse hover:bg-accent-strong"
        >
          Volver al tablero
        </Link>
      </main>
    );
  }

  const patchFrom = (changes: Partial<JobApplication>) =>
    toApplicationInput({ ...fromApplication({ ...application, ...changes }) });

  const save = async (changes: Partial<JobApplication>) => {
    setIsSaving(true);
    const succeeded = await board.updateApplication(application.id, patchFrom(changes));
    setIsSaving(false);
    return succeeded;
  };

  const saveNotes = async () => {
    const succeeded = await save({ notes: notesDraft.trim() || null });

    if (succeeded) {
      setSavedNotes(notesDraft);
    }
  };

  const removeApplication = async () => {
    setIsSaving(true);
    const succeeded = await board.deleteApplication(application.id);
    setIsSaving(false);

    if (succeeded) {
      router.replace('/tablero');
    }
  };

  const notesAreDirty = notesDraft !== remoteNotes;
  const stage = STATUS_CATALOG[application.status];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <Link
        href="/tablero"
        className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-control text-sm text-secondary hover:text-primary"
      >
        <Icon name="chevron" pack={iconPack} size={16} />
        Volver al tablero
      </Link>

      {board.feedback ? (
        <StatusBanner
          tone={board.feedback.tone}
          message={board.feedback.message}
          details={board.feedback.details}
          onDismiss={board.dismissFeedback}
        />
      ) : null}

      <header className="surface-card layered flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary sm:text-3xl [overflow-wrap:anywhere]">
              {application.position}
            </h1>
            <p className="text-base text-secondary [overflow-wrap:anywhere]">
              {application.company}
              {application.category ? ` · ${application.category}` : ''}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              <Icon name="edit" pack={iconPack} size={16} />
              Editar los datos
            </Button>
            <Button variant="danger" onClick={() => setIsDeleting(true)}>
              <Icon name="trash" pack={iconPack} size={16} />
              Eliminar
            </Button>
          </div>
        </div>

        <StageProgress status={application.status} />

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-secondary">
            Etapa
            <select
              value={application.status}
              disabled={isSaving}
              onChange={(event) =>
                void save({ status: event.target.value as ApplicationStatus })
              }
              className="focus-ring rounded-control border border-subtle bg-base px-3 py-1.5 text-sm text-primary"
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_CATALOG[status].label}
                </option>
              ))}
            </select>
          </label>

          <span className="text-sm text-secondary">{stage.description}</span>
        </div>
      </header>

      <section className="surface-card p-4" aria-label="Datos de la vacante">
        <h2 className="mb-3 font-display text-base font-bold text-primary">Datos</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Prioridad">{PRIORITY_LABELS[application.priority]}</Fact>
          <Fact label="Ubicación">
            {application.location
              ? `${application.location}${
                  application.workMode ? ` · ${WORK_MODE_LABELS[application.workMode]}` : ''
                }`
              : application.workMode
                ? WORK_MODE_LABELS[application.workMode]
                : ''}
          </Fact>
          <Fact label="Contacto">{application.contact}</Fact>
          <Fact label="Postulado el">{formatDate(application.appliedAt)}</Fact>
          <Fact label="Entrevista">{formatDateTime(application.interviewAt)}</Fact>
          <Fact label="Seguimiento">
            {application.followUpAt ? (
              <span className={isFollowUpDue(application) ? 'font-semibold text-warning' : ''}>
                {formatDate(application.followUpAt)}
                {isFollowUpDue(application) ? ' · toca escribir' : ''}
              </span>
            ) : (
              ''
            )}
          </Fact>
          <Fact label="Expectativa salarial">
            {application.salaryExpectation === null
              ? ''
              : application.salaryExpectation.toLocaleString('es-ES')}
          </Fact>
          <Fact label="Publicación">
            {application.sourceUrl ? (
              <a
                href={application.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="focus-ring underline decoration-dotted underline-offset-2"
              >
                Ver la oferta
              </a>
            ) : (
              ''
            )}
          </Fact>
        </dl>
      </section>

      <section className="surface-card flex flex-col gap-3 p-4" aria-label="Notas del proceso">
        <div>
          <h2 className="font-display text-base font-bold text-primary">Notas del proceso</h2>
          <p className="text-xs text-secondary">
            Lo que preguntaron, con quién hablaste, qué queda pendiente. Se guarda cuando pulsas.
          </p>
        </div>

        <TextAreaField
          id="notas-vacante"
          label="Notas"
          rows={10}
          value={notesDraft}
          placeholder="Escribe aquí todo lo que quieras recordar de este proceso."
          onChange={(event) => setNotesDraft(event.target.value)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={!notesAreDirty || isSaving} onClick={() => void saveNotes()}>
            {isSaving ? 'Guardando...' : 'Guardar las notas'}
          </Button>

          {notesAreDirty ? (
            <button
              type="button"
              onClick={() => setNotesDraft(remoteNotes)}
              className="focus-ring rounded-control text-sm text-secondary hover:text-primary"
            >
              Descartar los cambios
            </button>
          ) : savedNotes !== null ? (
            <span className="text-sm text-secondary">Notas guardadas.</span>
          ) : null}
        </div>
      </section>

      <AttachmentsPanel attachments={attachments} />

      <section className="surface-card grid gap-4 p-4 sm:grid-cols-2" aria-label="Lo que enviaste">
        <div className="sm:col-span-2">
          <h2 className="font-display text-base font-bold text-primary">Lo que enviaste</h2>
          <p className="text-xs text-secondary">
            Guardar la versión concreta evita presentarte con un currículum distinto del que leyeron.
          </p>
        </div>

        <DocumentPicker
          id="detalle-curriculum"
          label="Currículum enviado"
          kind="resume"
          documents={resumes}
          value={application.resumeId ?? ''}
          onChange={(resumeId) => void save({ resumeId: resumeId || null })}
        />

        <DocumentPicker
          id="detalle-carta"
          label="Carta de presentación"
          kind="cover-letter"
          documents={coverLetters}
          value={application.coverLetterId ?? ''}
          onChange={(coverLetterId) => void save({ coverLetterId: coverLetterId || null })}
        />
      </section>

      <Modal
        isOpen={isEditing}
        title="Editar la vacante"
        description="Cambia los datos del proceso."
        onClose={() => setIsEditing(false)}
      >
        <ApplicationForm
          resumes={resumes}
          coverLetters={coverLetters}
          initialValues={fromApplication(application)}
          knownCategories={board.categories.map((category) => category.name)}
          submitLabel="Guardar cambios"
          isSubmitting={isSaving}
          onSubmit={(input) => {
            setIsSaving(true);
            void board.updateApplication(application.id, input).then((succeeded) => {
              setIsSaving(false);

              if (succeeded) {
                setIsEditing(false);
              }
            });
          }}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>

      <Modal
        isOpen={isDeleting}
        title="Eliminar la vacante"
        description="Esta acción no se puede deshacer."
        onClose={() => setIsDeleting(false)}
      >
        <p className="text-sm text-secondary">
          Se eliminará {application.position} en {application.company}, con sus notas y sus
          archivos.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setIsDeleting(false)}>
            Conservar
          </Button>
          <Button variant="danger" disabled={isSaving} onClick={() => void removeApplication()}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </main>
  );
}
