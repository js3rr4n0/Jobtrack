import { z } from 'zod';

const csvToArray = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    /** Origenes permitidos por CORS, separados por coma. */
    CORS_ORIGINS: z.string().default('http://localhost:3000'),
    /** Secreto HS256 con el que Supabase firma los JWT de sesion. */
    SUPABASE_JWT_SECRET: z.string().min(1).optional(),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    /**
     * `supabase` persiste en PostgreSQL; `memory` mantiene los datos en proceso
     * y se usa para desarrollo local y para las pruebas de integracion.
     */
    DATA_DRIVER: z.enum(['supabase', 'memory']).default('memory'),
  })
  .superRefine((environment, context) => {
    if (environment.DATA_DRIVER !== 'supabase') {
      return;
    }

    const requiredKeys = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;
    for (const key of requiredKeys) {
      if (!environment[key]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} es obligatorio cuando DATA_DRIVER es "supabase".`,
        });
      }
    }
  });

export type RawEnvironment = z.infer<typeof environmentSchema>;

export interface ApplicationConfig {
  readonly nodeEnv: RawEnvironment['NODE_ENV'];
  readonly port: number;
  readonly corsOrigins: string[];
  readonly jwtSecret: string;
  readonly supabaseUrl: string;
  readonly supabaseServiceRoleKey: string;
  readonly dataDriver: RawEnvironment['DATA_DRIVER'];
}

/** Secreto usado unicamente cuando el driver de datos es `memory`. */
const DEVELOPMENT_JWT_SECRET = 'jobtrack-local-development-secret';

/**
 * Valida el entorno una sola vez al arrancar. Un fallo aqui detiene el proceso
 * con un mensaje legible en lugar de producir errores difusos en runtime.
 */
export function loadConfiguration(source: NodeJS.ProcessEnv = process.env): ApplicationConfig {
  const parsed = environmentSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || 'entorno'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Configuracion de entorno invalida:\n${details}`);
  }

  const environment = parsed.data;

  return {
    nodeEnv: environment.NODE_ENV,
    port: environment.PORT,
    corsOrigins: csvToArray(environment.CORS_ORIGINS),
    jwtSecret: environment.SUPABASE_JWT_SECRET ?? DEVELOPMENT_JWT_SECRET,
    supabaseUrl: environment.SUPABASE_URL ?? '',
    supabaseServiceRoleKey: environment.SUPABASE_SERVICE_ROLE_KEY ?? '',
    dataDriver: environment.DATA_DRIVER,
  };
}

export const CONFIG_TOKEN = 'APPLICATION_CONFIG';
