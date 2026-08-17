import { Controller, Get, Inject } from '@nestjs/common';

import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';

export interface HealthResponse {
  status: 'ok';
  dataDriver: ApplicationConfig['dataDriver'];
  realtime: boolean;
  checkedAt: string;
}

/** Endpoint publico usado por la web para detectar perdida de conexion. */
@Controller('health')
export class HealthController {
  constructor(@Inject(CONFIG_TOKEN) private readonly config: ApplicationConfig) {}

  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      dataDriver: this.config.dataDriver,
      realtime: true,
      checkedAt: new Date().toISOString(),
    };
  }
}
