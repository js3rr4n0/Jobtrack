import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import { AuthenticatedUser } from './authenticated-user';
import { TokenVerifierService } from './token-verifier.service';

/** Exige un token de sesion valido y deja el usuario resuelto en la peticion. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenVerifier: TokenVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = await this.tokenVerifier.verify(request.headers.authorization);

    if (!user) {
      throw new UnauthorizedException('Tu sesion no es valida o expiro. Inicia sesion de nuevo.');
    }

    request.user = user;
    return true;
  }
}
