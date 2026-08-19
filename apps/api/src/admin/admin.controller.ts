import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminOverviewResponse, AdminService } from './admin.service';

/**
 * El orden de los guardas importa: primero se resuelve la identidad y solo
 * después se comprueba si es la del administrador.
 */
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('overview')
  overview(): Promise<AdminOverviewResponse> {
    return this.service.getOverview();
  }
}
