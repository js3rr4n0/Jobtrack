import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';
import { AuthenticatedUser, SupabaseJwtPayload } from './authenticated-user';

/**
 * Verificacion de tokens para transportes que no pasan por el guard HTTP,
 * como el gateway de WebSockets.
 */
@Injectable()
export class TokenVerifierService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CONFIG_TOKEN) private readonly config: ApplicationConfig,
  ) {}

  verify(token: string | undefined): AuthenticatedUser | null {
    if (!token) {
      return null;
    }

    const normalizedToken = token.startsWith('Bearer ') ? token.slice('Bearer '.length) : token;

    try {
      const payload = this.jwtService.verify<SupabaseJwtPayload>(normalizedToken, {
        secret: this.config.jwtSecret,
      });

      return payload.sub ? { id: payload.sub, email: payload.email ?? null } : null;
    } catch {
      return null;
    }
  }
}
