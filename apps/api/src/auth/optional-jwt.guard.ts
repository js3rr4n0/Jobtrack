import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { AuthenticatedUser } from './authenticated-user';
import { TokenVerifierService } from './token-verifier.service';

/**
 * Resuelve la sesion si la hay y deja pasar si no la hay.
 *
 * Lo necesita el formulario de contacto: quien escribe por no poder entrar en
 * su cuenta es justamente quien no tiene sesion, y exigirsela cerraria el
 * unico canal por el que puede pedir que borren sus datos. Cuando si hay
 * sesion, saberlo ayuda a atender el mensaje.
 */
@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(private readonly tokenVerifier: TokenVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = await this.tokenVerifier.verify(request.headers.authorization);

    if (user) {
      request.user = user;
    }

    return true;
  }
}
