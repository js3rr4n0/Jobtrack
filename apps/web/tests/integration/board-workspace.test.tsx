import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BoardChangeEvent, NoteChangeEvent, JobApplication, StickyNote } from '@jobtrack/contracts';
import { buildJobApplication, buildStickyNote, groupIntoColumns } from '@jobtrack/contracts';

import { renderWithPreferences } from '../render-helpers';

const routerReplace = vi.fn();
const routerPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: routerReplace, push: routerPush }),
}));

const signOut = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/browser-client', () => ({
  MISSING_SUPABASE_MESSAGE: 'Falta configurar Supabase.',
  getSupabaseClient: () => ({
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: { access_token: 'token-de-prueba' } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
      signOut,
    },
  }),
}));

/** Captura los manejadores remotos para simular un segundo dispositivo. */
let emitRemoteChange: ((event: BoardChangeEvent) => void) | null = null;
let emitRemoteNoteChange: ((event: NoteChangeEvent) => void) | null = null;

vi.mock('@/lib/realtime-client', () => ({
  subscribeToBoardChanges: (options: {
    onChange: (event: BoardChangeEvent) => void;
    onNoteChange?: (event: NoteChangeEvent) => void;
    onStatusChange: (status: string) => void;
  }) => {
    emitRemoteChange = options.onChange;
    emitRemoteNoteChange = options.onNoteChange ?? null;
    options.onStatusChange('connected');
    return { close: () => undefined };
  },
}));

const { BoardWorkspace } = await import('@/components/board/BoardWorkspace');

interface RequestRecord {
  url: string;
  method: string;
  body: Record<string, unknown> | null;
}

let storedApplications: JobApplication[] = [];
let storedNotes: StickyNote[] = [];
let requests: RequestRecord[] = [];
let failNextMutation = false;

const boardPayload = () => ({
  columns: groupIntoColumns(storedApplications),
  gamification: null,
  generatedAt: new Date().toISOString(),
});

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function createFakeApi(): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    const body = init?.body ? JSON.parse(String(init.body)) : null;

    requests.push({ url, method, body });

    if (failNextMutation && method !== 'GET') {
      failNextMutation = false;
      return jsonResponse(400, {
        message: 'Revisa los datos ingresados.',
        details: ['La empresa es obligatoria.'],
      });
    }

    if (method === 'GET' && url.endsWith('/applications/board')) {
      return jsonResponse(200, boardPayload());
    }

    if (method === 'GET' && url.endsWith('/notes')) {
      return jsonResponse(200, storedNotes);
    }

    if (method === 'POST' && url.endsWith('/notes')) {
      const created = buildStickyNote({
        id: `nota-${storedNotes.length + 1}`,
        text: body.text,
        color: body.color,
        createdAt: `2026-01-1${storedNotes.length}T12:00:00.000Z`,
      });
      storedNotes = [...storedNotes, created];
      return jsonResponse(201, created);
    }

    if (method === 'PATCH' && url.includes('/notes/')) {
      const id = url.split('/notes/')[1];
      storedNotes = storedNotes.map((note) => (note.id === id ? { ...note, ...body } : note));
      return jsonResponse(200, storedNotes.find((note) => note.id === id));
    }

    if (method === 'DELETE' && url.includes('/notes/')) {
      const id = url.split('/notes/')[1];
      storedNotes = storedNotes.filter((note) => note.id !== id);
      return new Response(null, { status: 204 });
    }

    if (method === 'POST' && url.endsWith('/applications')) {
      const created = buildJobApplication({
        id: `generada-${storedApplications.length + 1}`,
        company: body.company,
        position: body.position,
        status: body.status ?? 'wishlist',
        boardOrder: storedApplications.length,
      });
      storedApplications = [...storedApplications, created];
      return jsonResponse(201, created);
    }

    if (method === 'PATCH' && url.includes('/move')) {
      const id = url.split('/applications/')[1].replace('/move', '');
      const moved = storedApplications.map((application) =>
        application.id === id
          ? { ...application, status: body.status, boardOrder: body.boardOrder }
          : application,
      );
      storedApplications = moved;
      return jsonResponse(200, moved.find((application) => application.id === id));
    }

    if (method === 'DELETE') {
      const id = url.split('/applications/')[1];
      storedApplications = storedApplications.filter((application) => application.id !== id);
      return new Response(null, { status: 204 });
    }

    return jsonResponse(404, { message: 'Ruta no encontrada.' });
  }) as typeof fetch;
}

describe('BoardWorkspace (integracion)', () => {
  beforeEach(() => {
    storedApplications = [
      buildJobApplication({
        id: 'existente-1',
        company: 'Estudio Pixel',
        position: 'Desarrollador Frontend',
        status: 'applied',
        boardOrder: 0,
      }),
    ];
    storedNotes = [];
    requests = [];
    failNextMutation = false;
    emitRemoteChange = null;
    emitRemoteNoteChange = null;
    vi.stubGlobal('fetch', createFakeApi());
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('carga el tablero desde la API y muestra las postulaciones guardadas', async () => {
    renderWithPreferences(<BoardWorkspace />);

    expect(await screen.findByText('Desarrollador Frontend')).toBeInTheDocument();
    expect(screen.getByText('Estudio Pixel')).toBeInTheDocument();
    expect(requests.some((request) => request.url.endsWith('/applications/board'))).toBe(true);
  });

  it('renderiza las seis columnas de seguimiento', async () => {
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');

    for (const label of ['Interesa', 'Postulado', 'Entrevista', 'Oferta', 'Contratado', 'Descartado']) {
      expect(screen.getByRole('region', { name: `Columna ${label}` })).toBeInTheDocument();
    }
  });

  it('refleja la experiencia ganada en el indicador de nivel', async () => {
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/Nivel \d+/)).toBeInTheDocument();
  });

  it('registra una nueva postulación y la muestra en su columna', async () => {
    const user = userEvent.setup();
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');
    await user.click(screen.getByRole('button', { name: /Nueva postulación/ }));

    await user.type(screen.getByLabelText('Empresa'), 'Galaxy Labs');
    await user.type(screen.getByLabelText('Puesto'), 'Ingeniero de Datos');
    await user.click(screen.getByRole('button', { name: 'Guardar postulación' }));

    expect(await screen.findByText('Ingeniero de Datos')).toBeInTheDocument();
    expect(
      requests.some((request) => request.method === 'POST' && request.body?.company === 'Galaxy Labs'),
    ).toBe(true);
  });

  it('muestra el detalle de validación cuando el servidor rechaza los datos', async () => {
    const user = userEvent.setup();
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');
    failNextMutation = true;

    await user.click(screen.getByRole('button', { name: /Nueva postulación/ }));
    await user.type(screen.getByLabelText('Empresa'), 'Empresa');
    await user.type(screen.getByLabelText('Puesto'), 'Puesto');
    await user.click(screen.getByRole('button', { name: 'Guardar postulación' }));

    expect(await screen.findByText('La empresa es obligatoria.')).toBeInTheDocument();
  });

  it('avisa sin bloquear la aplicación cuando no hay conexión', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    renderWithPreferences(<BoardWorkspace />);

    expect(await screen.findByText(/Estas sin conexión/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Nueva postulación/ }));
    await user.type(screen.getByLabelText('Empresa'), 'Empresa Sin Red');
    await user.type(screen.getByLabelText('Puesto'), 'Puesto');
    await user.click(screen.getByRole('button', { name: 'Guardar postulación' }));

    expect(await screen.findByText(/Sin conexión a internet/)).toBeInTheDocument();
    expect(requests.some((request) => request.method === 'POST')).toBe(false);
  });

  it('crea una nota en el mural y la muestra', async () => {
    const user = userEvent.setup();
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');
    expect(screen.getByText(/Aun no tienes notas/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Nueva nota/ }));
    await user.type(screen.getByLabelText('Nota'), 'Preparar portafolio');
    await user.click(screen.getByRole('button', { name: 'Crear nota' }));

    expect(await screen.findByRole('article', { name: /Preparar portafolio/ })).toBeInTheDocument();
    expect(requests.some((request) => request.method === 'POST' && request.url.endsWith('/notes'))).toBe(
      true,
    );
  });

  it('no guarda una nota vacía', async () => {
    const user = userEvent.setup();
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');
    await user.click(screen.getByRole('button', { name: /Nueva nota/ }));
    await user.type(screen.getByLabelText('Nota'), '   ');
    await user.click(screen.getByRole('button', { name: 'Crear nota' }));

    expect(await screen.findByText(/Escribe algo antes de guardar/)).toBeInTheDocument();
    expect(requests.some((request) => request.method === 'POST' && request.url.endsWith('/notes'))).toBe(
      false,
    );
  });

  it('elimina una nota desde su editor', async () => {
    const user = userEvent.setup();
    storedNotes = [buildStickyNote({ id: 'nota-1', text: 'Llamar el martes' })];

    renderWithPreferences(<BoardWorkspace />);

    await user.click(await screen.findByRole('button', { name: /Editar la nota: Llamar el martes/ }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(screen.queryByRole('article', { name: /Llamar el martes/ })).not.toBeInTheDocument(),
    );
  });

  it('incorpora en vivo una nota creada desde otro dispositivo', async () => {
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');
    expect(emitRemoteNoteChange).not.toBeNull();

    const remoteNote = buildStickyNote({ id: 'nota-remota', text: 'Nota de otro equipo' });

    act(() =>
      emitRemoteNoteChange?.({
        kind: 'created',
        noteId: remoteNote.id,
        note: remoteNote,
        emittedAt: new Date().toISOString(),
        originId: 'otro-dispositivo',
      }),
    );

    expect(await screen.findByRole('article', { name: /Nota de otro equipo/ })).toBeInTheDocument();
  });

  it('incorpora en vivo un cambio hecho desde otro dispositivo', async () => {
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');
    expect(emitRemoteChange).not.toBeNull();

    act(() =>
      emitRemoteChange?.({
        kind: 'created',
        applicationId: 'remota-1',
        application: buildJobApplication({
          id: 'remota-1',
          company: 'Empresa Remota',
          position: 'Analista de Datos',
          status: 'interview',
        }),
        emittedAt: new Date().toISOString(),
        originId: 'otro-dispositivo',
      }),
    );

    const interviewColumn = await screen.findByRole('region', { name: 'Columna Entrevista' });
    expect(await within(interviewColumn).findByText('Analista de Datos')).toBeInTheDocument();
  });

  it('retira en vivo una postulación eliminada en otro dispositivo', async () => {
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');

    act(() =>
      emitRemoteChange?.({
        kind: 'deleted',
        applicationId: 'existente-1',
        application: null,
        emittedAt: new Date().toISOString(),
        originId: 'otro-dispositivo',
      }),
    );

    await waitFor(() =>
      expect(screen.queryByText('Desarrollador Frontend')).not.toBeInTheDocument(),
    );
  });

  it('mueve una tarjeta de columna desde el selector de estado', async () => {
    const user = userEvent.setup();
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');

    await user.selectOptions(
      screen.getByLabelText('Mover Desarrollador Frontend a otra columna'),
      'interview',
    );

    const interviewColumn = await screen.findByRole('region', { name: 'Columna Entrevista' });
    expect(await within(interviewColumn).findByText('Desarrollador Frontend')).toBeInTheDocument();
    expect(requests.some((request) => request.url.includes('/move'))).toBe(true);
  });

  it('elimina una postulación tras confirmar el dialogo', async () => {
    const user = userEvent.setup();
    renderWithPreferences(<BoardWorkspace />);

    await screen.findByText('Desarrollador Frontend');

    await user.click(screen.getByRole('img', { name: 'Eliminar Desarrollador Frontend' }));
    await user.click(await screen.findByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(screen.queryByText('Desarrollador Frontend')).not.toBeInTheDocument(),
    );
    expect(requests.some((request) => request.method === 'DELETE')).toBe(true);
  });
});
