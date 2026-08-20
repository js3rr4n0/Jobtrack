import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SupportMessage } from '@deska/contracts';

import { AdminGuard } from '../admin/admin.guard';
import { AuthenticatedUser } from '../auth/authenticated-user';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { SupportService } from './support.service';

/** Lo que devuelve el envio: nada del mensaje, solo la confirmacion. */
export interface SupportReceipt {
  readonly received: true;
  readonly id: string;
}

@Controller('support')
export class SupportController {
  constructor(private readonly service: SupportService) {}

  /**
   * Envio publico. No exige sesion a proposito, porque el motivo mas urgente
   * para escribir es no poder entrar en la propia cuenta.
   */
  @Post()
  @UseGuards(OptionalJwtGuard)
  async submit(
    @Body() payload: CreateSupportMessageDto,
    @Req() request: Request & { user?: AuthenticatedUser },
  ): Promise<SupportReceipt> {
    const created = await this.service.submit(payload, request.user?.id ?? null);

    // No se devuelve el contenido: quien envia ya lo tiene, y el recibo solo
    // sirve para confirmar que llego.
    return { received: true, id: created.id };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  list(): Promise<SupportMessage[]> {
    return this.service.listRecent();
  }

  @Patch(':id/atendido')
  @UseGuards(JwtAuthGuard, AdminGuard)
  markHandled(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<SupportMessage> {
    return this.service.markHandled(id);
  }
}
