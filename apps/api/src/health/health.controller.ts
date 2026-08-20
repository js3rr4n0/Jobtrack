import { Controller, Get, Inject } from '@nestjs/common';

import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';

export interface HealthResponse {
  status: 'ok';
  dataDriver: ApplicationConfig['dataDriver'];
  realtime: boolean;
  /**
   * Si hay una cuenta administradora configurada. Es un booleano y nunca la
   * direccion: quien opera el servicio necesita poder comprobar que la variable
   * llego, y el guarda calla a proposito para no confirmar correos a extranos.
   */
  adminConfigured: boolean;
  checkedAt: string;
}

/** Endpoint público usado por la web para detectar pérdida de conexión. */
@Controller('health')
export class HealthController {
  constructor(@Inject(CONFIG_TOKEN) private readonly config: ApplicationConfig) {}

  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      dataDriver: this.config.dataDriver,
      realtime: true,
      adminConfigured: this.config.adminEmail !== null,
      checkedAt: new Date().toISOString(),
    };
  }
}
