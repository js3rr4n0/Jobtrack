import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApplication } from './bootstrap';
import { ApplicationConfig, CONFIG_TOKEN } from './config/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ApplicationConfig>(CONFIG_TOKEN);

  configureApplication(app, config);
  app.enableShutdownHooks();

  await app.listen(config.port);
  new Logger('Bootstrap').log(`API disponible en el puerto ${config.port}`);
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`No fue posible iniciar la API: ${message}\n`);
  process.exit(1);
});
