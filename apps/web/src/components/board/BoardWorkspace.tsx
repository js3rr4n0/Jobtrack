'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type {
  ApplicationStatus,
  CreateJobApplicationInput,
  JobApplication,
} from '@jobtrack/contracts';

import { ApplicationForm } from '@/components/board/ApplicationForm';
import { ConnectionStatus } from '@/components/board/ConnectionStatus';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { AchievementGrid } from '@/components/gamification/AchievementGrid';
import { LevelMeter } from '@/components/gamification/LevelMeter';
import { LevelUpNotice } from '@/components/gamification/LevelUpNotice';
import { StatsSummary } from '@/components/gamification/StatsSummary';
import { Icon } from '@/components/icons';
import { AppearanceMenu } from '@/components/theme/AppearanceMenu';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { useBoard } from '@/hooks/use-board';
import { useSession } from '@/hooks/use-session';
import { fromApplication } from '@/lib/application-form';
import { MISSING_SUPABASE_MESSAGE, getSupabaseClient } from '@/lib/supabase/browser-client';

type EditorState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; application: JobApplication };

/** Pantalla principal: tablero kanban, capa de juego y edicion de postulaciones. */
export function BoardWorkspace() {
  const router = useRouter();
  const { iconPack } = usePreferences();
  const { session, status: sessionStatus } = useSession();

  const accessToken = session?.access_token ?? null;
  const board = useBoard(accessToken);

  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' });
  const [pendingDeletion, setPendingDeletion] = useState<JobApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'anonymous') {
      router.replace('/acceso');
    }
  }, [sessionStatus, router]);

  const closeEditor = useCallback(() => setEditor({ mode: 'closed' }), []);

  const handleCreate = async (input: CreateJobApplicationInput) => {
    setIsSubmitting(true);
    const succeeded = await board.createApplication(input);
    setIsSubmitting(false);

    if (succeeded) {
      closeEditor();
    }
  };

  const handleUpdate = async (application: JobApplication, input: CreateJobApplicationInput) => {
    setIsSubmitting(true);
    const succeeded = await board.updateApplication(application.id, input);
    setIsSubmitting(false);

    if (succeeded) {
      closeEditor();
    }
  };

  const handleStatusChange = (application: JobApplication, status: ApplicationStatus) => {
    if (status !== application.status) {
      const targetColumn = board.columns.find((column) => column.status === status);
      void board.moveApplication(application.id, status, targetColumn?.applications.length ?? 0);
    }
  };

  const confirmDeletion = async () => {
    if (!pendingDeletion) {
      return;
    }

    setIsSubmitting(true);
    await board.deleteApplication(pendingDeletion.id);
    setIsSubmitting(false);
    setPendingDeletion(null);
  };

  const signOut = async () => {
    await getSupabaseClient()?.auth.signOut();
    router.replace('/acceso');
  };

  if (sessionStatus === 'unconfigured') {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center px-4">
        <StatusBanner tone="error" message={MISSING_SUPABASE_MESSAGE} />
      </main>
    );
  }

  if (sessionStatus === 'loading' || sessionStatus === 'anonymous') {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
        <p className="text-sm text-secondary">Cargando tu sesion...</p>
      </main>
    );
  }

  return (
    // Sin tope de ancho: un tablero de seis columnas aprovecha toda la pantalla
    // en monitores grandes y conserva el desplazamiento horizontal en los chicos.
    <main className="mx-auto flex min-h-screen w-full flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-primary">Tu tablero</h1>
          <ConnectionStatus isOnline={board.isOnline} realtimeStatus={board.realtimeStatus} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setEditor({ mode: 'create' })}>
            <Icon name="plus" pack={iconPack} size={16} />
            Nueva postulacion
          </Button>
          <Button variant="secondary" onClick={() => void board.reload()}>
            <Icon name="refresh" pack={iconPack} size={16} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          <AppearanceMenu />
          <Button variant="ghost" onClick={() => void signOut()}>
            <Icon name="logout" pack={iconPack} size={16} />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </header>

      {!board.isOnline ? (
        <StatusBanner
          tone="warning"
          message="Estas sin conexion. Puedes seguir consultando el tablero, pero los cambios no se guardaran hasta que vuelva la senal."
        />
      ) : null}

      {board.feedback ? (
        <StatusBanner
          tone={board.feedback.tone}
          message={board.feedback.message}
          details={board.feedback.details}
          onDismiss={board.dismissFeedback}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 order-2 lg:order-1">
          {board.status === 'loading' ? (
            <p className="text-sm text-secondary">Cargando tus postulaciones...</p>
          ) : (
            <KanbanBoard
              columns={board.columns}
              onMove={(id, status, boardOrder) => void board.moveApplication(id, status, boardOrder)}
              onEdit={(application) => setEditor({ mode: 'edit', application })}
              onDelete={setPendingDeletion}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>

        <aside className="order-1 flex flex-col gap-4 lg:order-2">
          <LevelMeter
            progress={board.gamification.progress}
            currentStreakDays={board.gamification.stats.currentStreakDays}
          />
          <StatsSummary stats={board.gamification.stats} />
          <AchievementGrid achievements={board.gamification.achievements} />
        </aside>
      </div>

      <Modal
        isOpen={editor.mode === 'create'}
        title="Nueva postulacion"
        description="Registra la oferta con los datos que ya tengas. Podras completarla despues."
        onClose={closeEditor}
      >
        <ApplicationForm
          submitLabel="Guardar postulacion"
          isSubmitting={isSubmitting}
          onSubmit={(input) => void handleCreate(input)}
          onCancel={closeEditor}
        />
      </Modal>

      <Modal
        isOpen={editor.mode === 'edit'}
        title="Editar postulacion"
        description="Actualiza notas, fechas o el estado del proceso."
        onClose={closeEditor}
      >
        {editor.mode === 'edit' ? (
          <ApplicationForm
            initialValues={fromApplication(editor.application)}
            submitLabel="Guardar cambios"
            isSubmitting={isSubmitting}
            onSubmit={(input) => void handleUpdate(editor.application, input)}
            onCancel={closeEditor}
          />
        ) : null}
      </Modal>

      <Modal
        isOpen={pendingDeletion !== null}
        title="Eliminar postulacion"
        description="Esta accion no se puede deshacer."
        onClose={() => setPendingDeletion(null)}
      >
        <p className="text-sm text-secondary">
          Se eliminara {pendingDeletion?.position} en {pendingDeletion?.company}.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setPendingDeletion(null)}>
            Conservar
          </Button>
          <Button variant="danger" disabled={isSubmitting} onClick={() => void confirmDeletion()}>
            Eliminar
          </Button>
        </div>
      </Modal>

      {board.celebratedLevel !== null ? (
        <LevelUpNotice
          level={board.celebratedLevel}
          title={board.gamification.progress.title}
          onDismiss={board.dismissCelebration}
        />
      ) : null}
    </main>
  );
}
