import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/bootstrap';
import { ApplicationConfig, CONFIG_TOKEN, loadConfiguration } from '../src/config/environment';

export interface TestContext {
  readonly app: INestApplication;
  readonly config: ApplicationConfig;
  /** Emite un token equivalente al que produce Supabase Auth. */
  readonly issueToken: (userId: string, options?: { expiresIn?: string }) => string;
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

  const jwtService = app.get(JwtService);

  return {
    app,
    config,
    issueToken: (userId, options) =>
      jwtService.sign(
        { sub: userId, email: `${userId}@ejemplo.test`, role: 'authenticated' },
        { secret: config.jwtSecret, expiresIn: options?.expiresIn ?? '1h' },
      ),
  };
}
