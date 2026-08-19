import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import { AuthenticatedUser } from './authenticated-user';
import { TokenVerifierService } from './token-verifier.service';

/** Exige un token de sesión válido y deja el usuario resuelto en la petición. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenVerifier: TokenVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = await this.tokenVerifier.verify(request.headers.authorization);

    if (!user) {
      throw new UnauthorizedException('Tu sesión no es válida o expiró. Inicia sesión de nuevo.');
    }

    request.user = user;
    return true;
  }
}
