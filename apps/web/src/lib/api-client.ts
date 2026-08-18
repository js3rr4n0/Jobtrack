import type {
  CreateJobApplicationInput,
  CreateStickyNoteInput,
  GamificationProfile,
  JobApplication,
  MoveJobApplicationInput,
  StickyNote,
  UpdateJobApplicationInput,
  UpdateStickyNoteInput,
} from '@jobtrack/contracts';

export interface BoardColumnResponse {
  status: JobApplication['status'];
  label: string;
  description: string;
  applications: JobApplication[];
}

export interface BoardSnapshot {
  columns: BoardColumnResponse[];
  gamification: GamificationProfile;
  generatedAt: string;
}

/** Motivo del fallo, usado por la interfaz para elegir el mensaje al usuario. */
export type ApiErrorKind =
  | 'offline'
  | 'unreachable'
  | 'timeout'
  | 'unauthorized'
  | 'validation'
  | 'server';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly details: string[];
  readonly statusCode: number | null;

  constructor(kind: ApiErrorKind, message: string, details: string[] = [], statusCode: number | null = null) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.details = details;
    this.statusCode = statusCode;
  }
}

const REQUEST_TIMEOUT_MS = 15_000;
/**
 * Los alojamientos de plan gratuito suspenden el proceso tras un rato sin
 * trafico y tardan casi un minuto en despertar. Las lecturas, al ser
 * idempotentes, se reintentan una vez con un margen mucho mayor.
 */
const COLD_START_TIMEOUT_MS = 60_000;

const OFFLINE_MESSAGE =
  'Sin conexion a internet. Tus cambios no se guardaron; vuelve a intentarlo cuando recuperes la senal.';
const UNREACHABLE_MESSAGE =
  'No se pudo contactar con el servidor de Jobtrack. Revisa que la API este desplegada y que NEXT_PUBLIC_API_URL apunte a ella.';
const TIMEOUT_MESSAGE =
  'El servidor tardo demasiado en responder. Si esta alojado en un plan gratuito puede estar despertando; vuelve a intentarlo en un minuto.';

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly accessToken: string | null;
  /** Identifica al dispositivo para descartar el eco de sus propios cambios. */
  readonly originId: string;
  readonly fetchImplementation?: typeof fetch;
  readonly isOnline?: () => boolean;
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
}

/** Cliente HTTP de la API de Jobtrack con errores traducidos a lenguaje claro. */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly accessToken: string | null;
  private readonly originId: string;
  private readonly fetchImplementation: typeof fetch;
  private readonly isOnline: () => boolean;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.accessToken = options.accessToken;
    this.originId = options.originId;
    this.fetchImplementation = options.fetchImplementation ?? globalThis.fetch.bind(globalThis);
    this.isOnline = options.isOnline ?? (() => navigator.onLine);
  }

  getBoard(): Promise<BoardSnapshot> {
    return this.request<BoardSnapshot>({ method: 'GET', path: '/applications/board' });
  }

  getGamificationProfile(): Promise<GamificationProfile> {
    return this.request<GamificationProfile>({ method: 'GET', path: '/gamification/profile' });
  }

  createApplication(input: CreateJobApplicationInput): Promise<JobApplication> {
    return this.request<JobApplication>({ method: 'POST', path: '/applications', body: input });
  }

  updateApplication(id: string, input: UpdateJobApplicationInput): Promise<JobApplication> {
    return this.request<JobApplication>({ method: 'PATCH', path: `/applications/${id}`, body: input });
  }

  moveApplication(id: string, input: MoveJobApplicationInput): Promise<JobApplication> {
    return this.request<JobApplication>({
      method: 'PATCH',
      path: `/applications/${id}/move`,
      body: input,
    });
  }

  async deleteApplication(id: string): Promise<void> {
    await this.request<null>({ method: 'DELETE', path: `/applications/${id}` });
  }

  getNotes(): Promise<StickyNote[]> {
    return this.request<StickyNote[]>({ method: 'GET', path: '/notes' });
  }

  createNote(input: CreateStickyNoteInput): Promise<StickyNote> {
    return this.request<StickyNote>({ method: 'POST', path: '/notes', body: input });
  }

  updateNote(id: string, input: UpdateStickyNoteInput): Promise<StickyNote> {
    return this.request<StickyNote>({ method: 'PATCH', path: `/notes/${id}`, body: input });
  }

  async deleteNote(id: string): Promise<void> {
    await this.request<null>({ method: 'DELETE', path: `/notes/${id}` });
  }

  private async request<TResponse>(options: RequestOptions): Promise<TResponse> {
    if (!this.isOnline()) {
      throw new ApiError('offline', OFFLINE_MESSAGE);
    }

    try {
      return await this.attempt<TResponse>(options, REQUEST_TIMEOUT_MS);
    } catch (error) {
      const isReadTimeout = error instanceof ApiError && error.kind === 'timeout' && options.method === 'GET';

      if (!isReadTimeout) {
        throw error;
      }

      return this.attempt<TResponse>(options, COLD_START_TIMEOUT_MS);
    }
  }

  private async attempt<TResponse>(
    { method, path, body }: RequestOptions,
    timeoutMs: number,
  ): Promise<TResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
        method,
        headers: this.buildHeaders(body !== undefined),
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await this.describeFailure(response);
      }

      return response.status === 204 ? (null as TResponse) : ((await response.json()) as TResponse);
    } catch (error) {
      throw this.normalizeError(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildHeaders(hasBody: boolean): HeadersInit {
    const headers: Record<string, string> = { 'X-Jobtrack-Origin': this.originId };

    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private async describeFailure(response: Response): Promise<ApiError> {
    const payload = await response.json().catch(() => null);
    const message = typeof payload?.message === 'string' ? payload.message : null;
    const details = Array.isArray(payload?.details) ? (payload.details as string[]) : [];

    if (response.status === 401 || response.status === 403) {
      return new ApiError(
        'unauthorized',
        'Tu sesion expiro. Inicia sesion de nuevo para continuar.',
        details,
        response.status,
      );
    }

    if (response.status === 400 || response.status === 422) {
      return new ApiError(
        'validation',
        message ?? 'Revisa los datos ingresados.',
        details,
        response.status,
      );
    }

    return new ApiError(
      'server',
      message ?? 'El servidor no pudo completar la operacion. Intentalo de nuevo.',
      details,
      response.status,
    );
  }

  private normalizeError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return new ApiError('timeout', TIMEOUT_MESSAGE);
    }

    // Con red disponible, un fallo de transporte significa que el servidor no
    // responde, no que el dispositivo este sin conexion.
    return this.isOnline()
      ? new ApiError('unreachable', UNREACHABLE_MESSAGE)
      : new ApiError('offline', OFFLINE_MESSAGE);
  }
}
