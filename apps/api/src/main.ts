import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApplication } from './bootstrap';
import { ApplicationConfig, CONFIG_TOKEN } from './config/environment';

/**
 * Las plataformas gestionadas enrutan el trafico hacia la interfaz IPv4 del
 * contenedor, así que el enlace se declara de forma explicita en lugar de dejar
 * que Node elija `::`.
 */
const BIND_ADDRESS = '0.0.0.0';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ApplicationConfig>(CONFIG_TOKEN);

  configureApplication(app, config);
  app.enableShutdownHooks();

  await app.listen(config.port, BIND_ADDRESS);

  const logger = new Logger('Bootstrap');
  logger.log(`API escuchando en ${BIND_ADDRESS}:${config.port}`);
  logger.log(`Driver de datos: ${config.dataDriver}`);
  logger.log(`Origenes CORS permitidos: ${config.corsOrigins.join(', ') || 'ninguno'}`);
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`No fue posible iniciar la API: ${message}\n`);
  process.exit(1);
});
