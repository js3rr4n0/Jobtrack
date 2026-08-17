import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ApplicationConfig } from './config/environment';

export const API_PREFIX = 'api';

/**
 * Configuracion transversal de la aplicacion. Vive aparte del arranque para que
 * las pruebas de integracion ejerciten exactamente la misma cadena de middleware.
 */
export function configureApplication(app: INestApplication, config: ApplicationConfig): void {
  app.use(helmet());
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Jobtrack-Origin'],
    credentials: true,
    maxAge: 86_400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
}
