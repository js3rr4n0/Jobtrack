import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';
import { AuthenticatedUser, SupabaseJwtPayload } from './authenticated-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(CONFIG_TOKEN) config: ApplicationConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  validate(payload: SupabaseJwtPayload): AuthenticatedUser {
    if (!payload?.sub) {
      throw new UnauthorizedException('El token no contiene un identificador de usuario.');
    }

    return { id: payload.sub, email: payload.email ?? null };
  }
}
