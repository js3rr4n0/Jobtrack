import { Controller, Get, Inject } from '@nestjs/common';

import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';

export interface HealthResponse {
  status: 'ok';
  dataDriver: ApplicationConfig['dataDriver'];
  realtime: boolean;
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
      checkedAt: new Date().toISOString(),
    };
  }
}
