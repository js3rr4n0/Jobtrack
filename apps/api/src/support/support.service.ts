import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupportMessage, rejectSupportMessage } from '@deska/contracts';

import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { SupportRepository } from './repositories/support.repository';

/**
 * Tope de mensajes por hora en todo el servicio. El formulario es publico y no
 * exige sesion —quien ya no puede entrar escribe justamente por eso—, asi que
 * necesita un freno. Se cuenta sobre el total y no por direccion IP para no
 * tener que guardar direcciones IP solo para esto.
 */
const MAX_MESSAGES_PER_HOUR = 60;

const HOUR_IN_MS = 3_600_000;

/** Cuantos mensajes recientes lee el panel de administracion. */
const RECENT_LIMIT = 100;

@Injectable()
export class SupportService {
  constructor(private readonly repository: SupportRepository) {}

  async submit(payload: CreateSupportMessageDto, userId: string | null): Promise<SupportMessage> {
    const rejection = rejectSupportMessage(payload);

    if (rejection) {
      throw new BadRequestException(rejection.message);
    }

    const recientes = await this.repository.countSince(new Date(Date.now() - HOUR_IN_MS));

    if (recientes >= MAX_MESSAGES_PER_HOUR) {
      throw new BadRequestException(
        'Estamos recibiendo demasiados mensajes ahora mismo. Intentalo de nuevo en una hora.',
      );
    }

    return this.repository.create({
      topic: payload.topic,
      replyTo: payload.replyTo?.trim() || null,
      body: payload.body.trim(),
      userId,
    });
  }

  listRecent(): Promise<SupportMessage[]> {
    return this.repository.findRecent(RECENT_LIMIT);
  }

  async markHandled(id: string): Promise<SupportMessage> {
    const updated = await this.repository.markHandled(id);

    if (!updated) {
      throw new NotFoundException('Ese mensaje no existe.');
    }

    return updated;
  }
}
