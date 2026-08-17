import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SignJWT } from 'jose';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/bootstrap';
import { ApplicationConfig, CONFIG_TOKEN, loadConfiguration } from '../src/config/environment';

export interface TestContext {
  readonly app: INestApplication;
  readonly config: ApplicationConfig;
  /** Emite un token HS256 equivalente al del esquema heredado de Supabase. */
  readonly issueToken: (userId: string, options?: { expiresIn?: string }) => Promise<string>;
}

/**
 * Levanta la aplicacion completa con el driver de datos en memoria, de modo que
 * las pruebas de integracion no dependen de una base de datos externa.
 */
export async function createTestApplication(): Promise<TestContext> {
  const config = loadConfiguration({ DATA_DRIVER: 'memory', NODE_ENV: 'test' } as NodeJS.ProcessEnv);

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(CONFIG_TOKEN)
    .useValue(config)
    .compile();

  const app = moduleRef.createNestApplication();
  configureApplication(app, config);
  await app.init();

  const secret = new TextEncoder().encode(config.jwtSecret);

  return {
    app,
    config,
    issueToken: (userId, options) =>
      new SignJWT({ email: `${userId}@ejemplo.test`, role: 'authenticated' })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(options?.expiresIn ?? '1h')
        .sign(secret),
  };
}
