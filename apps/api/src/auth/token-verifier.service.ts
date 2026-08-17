import { Inject, Injectable } from '@nestjs/common';
import {
  type JWTVerifyGetKey,
  type JWTPayload,
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
} from 'jose';

import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';
import { AuthenticatedUser } from './authenticated-user';

/** Fabrica del conjunto de claves publicas; se sustituye en las pruebas. */
export type KeySetFactory = (jwksUrl: URL) => JWTVerifyGetKey;

export const KEY_SET_FACTORY = 'JWKS_KEY_SET_FACTORY';

const BEARER_PREFIX = 'Bearer ';

/**
 * Verifica los tokens de sesion emitidos por Supabase Auth.
 *
 * Supabase firma con claves asimetricas (ES256 o RS256) publicadas en el JWKS
 * del proyecto, y mantiene el secreto compartido HS256 heredado durante la
 * migracion. Esta clase resuelve el metodo a partir del encabezado del propio
 * token, de modo que ambos esquemas conviven sin configuracion adicional.
 */
@Injectable()
export class TokenVerifierService {
  private cachedKeySet: JWTVerifyGetKey | null = null;

  constructor(
    @Inject(CONFIG_TOKEN) private readonly config: ApplicationConfig,
    @Inject(KEY_SET_FACTORY) private readonly keySetFactory: KeySetFactory,
  ) {}

  async verify(token: string | undefined): Promise<AuthenticatedUser | null> {
    const normalizedToken = normalize(token);

    if (!normalizedToken) {
      return null;
    }

    try {
      const payload = await this.decode(normalizedToken);
      return payload?.sub ? { id: payload.sub, email: readEmail(payload) } : null;
    } catch {
      return null;
    }
  }

  private async decode(token: string): Promise<JWTPayload | null> {
    const usesSharedSecret = decodeProtectedHeader(token).alg === 'HS256';

    if (usesSharedSecret) {
      const secret = new TextEncoder().encode(this.config.jwtSecret);
      const { payload } = await jwtVerify(token, secret);
      return payload;
    }

    const keySet = this.resolveKeySet();

    if (!keySet) {
      return null;
    }

    const { payload } = await jwtVerify(token, keySet);
    return payload;
  }

  /** El conjunto de claves se cachea: `jose` renueva y almacena el JWKS por su cuenta. */
  private resolveKeySet(): JWTVerifyGetKey | null {
    if (this.cachedKeySet) {
      return this.cachedKeySet;
    }

    if (!this.config.supabaseUrl) {
      return null;
    }

    const jwksUrl = new URL('/auth/v1/.well-known/jwks.json', this.config.supabaseUrl);
    this.cachedKeySet = this.keySetFactory(jwksUrl);
    return this.cachedKeySet;
  }
}

export const defaultKeySetFactory: KeySetFactory = (jwksUrl) => createRemoteJWKSet(jwksUrl);

function normalize(token: string | undefined): string | null {
  if (!token) {
    return null;
  }

  const value = token.startsWith(BEARER_PREFIX) ? token.slice(BEARER_PREFIX.length) : token;
  return value.trim().length > 0 ? value.trim() : null;
}

function readEmail(payload: JWTPayload): string | null {
  return typeof payload.email === 'string' ? payload.email : null;
}
