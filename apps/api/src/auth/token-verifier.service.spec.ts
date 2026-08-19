import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';

import { ApplicationConfig, loadConfiguration } from '../config/environment';
import { KeySetFactory, TokenVerifierService } from './token-verifier.service';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const SHARED_SECRET = 'secreto-compartido-de-pruebas';

const configWith = (overrides: Partial<ApplicationConfig> = {}): ApplicationConfig => ({
  ...loadConfiguration({} as NodeJS.ProcessEnv),
  jwtSecret: SHARED_SECRET,
  ...overrides,
});

const signHs256 = (payload: Record<string, unknown>, expiration = '1h') =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(new TextEncoder().encode(SHARED_SECRET));

describe('TokenVerifierService', () => {
  const unusedFactory: KeySetFactory = () => {
    throw new Error('No debería consultarse el JWKS para un token HS256.');
  };

  describe('esquema heredado HS256', () => {
    it('acepta un token firmado con el secreto compartido', async () => {
      const verifier = new TokenVerifierService(configWith(), unusedFactory);

      const user = await verifier.verify(await signHs256({ sub: USER_ID, email: 'persona@ejemplo.test' }));

      expect(user).toEqual({ id: USER_ID, email: 'persona@ejemplo.test' });
    });

    it('acepta el token con el prefijo Bearer', async () => {
      const verifier = new TokenVerifierService(configWith(), unusedFactory);

      const user = await verifier.verify(`Bearer ${await signHs256({ sub: USER_ID })}`);

      expect(user?.id).toBe(USER_ID);
    });

    it('rechaza un token firmado con otro secreto', async () => {
      const verifier = new TokenVerifierService(configWith({ jwtSecret: 'otro-secreto' }), unusedFactory);

      expect(await verifier.verify(await signHs256({ sub: USER_ID }))).toBeNull();
    });

    it('rechaza un token expirado', async () => {
      const verifier = new TokenVerifierService(configWith(), unusedFactory);

      expect(await verifier.verify(await signHs256({ sub: USER_ID }, '-1s'))).toBeNull();
    });

    it('rechaza un token sin identificador de usuario', async () => {
      const verifier = new TokenVerifierService(configWith(), unusedFactory);

      expect(await verifier.verify(await signHs256({ email: 'sin@sujeto.test' }))).toBeNull();
    });
  });

  describe('esquema asimétrico con JWKS', () => {
    it('acepta un token ES256 validado contra las claves publicas del proyecto', async () => {
      const { publicKey, privateKey } = await generateKeyPair('ES256');
      const publicJwk = { ...(await exportJWK(publicKey)), kid: 'clave-actual', alg: 'ES256' };
      const keySet = createLocalJWKSet({ keys: [publicJwk] });

      const verifier = new TokenVerifierService(
        configWith({ supabaseUrl: 'https://proyecto.supabase.co' }),
        () => keySet,
      );

      const token = await new SignJWT({ email: 'persona@ejemplo.test' })
        .setProtectedHeader({ alg: 'ES256', kid: 'clave-actual' })
        .setSubject(USER_ID)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);

      expect(await verifier.verify(token)).toEqual({ id: USER_ID, email: 'persona@ejemplo.test' });
    });

    it('rechaza un token ES256 firmado con una clave ajena al proyecto', async () => {
      const projectKeys = await generateKeyPair('ES256');
      const intruderKeys = await generateKeyPair('ES256');
      const publicJwk = { ...(await exportJWK(projectKeys.publicKey)), kid: 'clave-actual', alg: 'ES256' };
      const keySet = createLocalJWKSet({ keys: [publicJwk] });

      const verifier = new TokenVerifierService(
        configWith({ supabaseUrl: 'https://proyecto.supabase.co' }),
        () => keySet,
      );

      const token = await new SignJWT({})
        .setProtectedHeader({ alg: 'ES256', kid: 'clave-actual' })
        .setSubject(USER_ID)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(intruderKeys.privateKey);

      expect(await verifier.verify(token)).toBeNull();
    });

    it('construye la ruta estándar del JWKS a partir de la URL del proyecto', async () => {
      const requestedUrls: string[] = [];
      const { publicKey, privateKey } = await generateKeyPair('ES256');
      const publicJwk = { ...(await exportJWK(publicKey)), kid: 'k', alg: 'ES256' };

      const verifier = new TokenVerifierService(
        configWith({ supabaseUrl: 'https://proyecto.supabase.co' }),
        (url) => {
          requestedUrls.push(url.toString());
          return createLocalJWKSet({ keys: [publicJwk] });
        },
      );

      const token = await new SignJWT({})
        .setProtectedHeader({ alg: 'ES256', kid: 'k' })
        .setSubject(USER_ID)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);

      await verifier.verify(token);
      await verifier.verify(token);

      expect(requestedUrls).toEqual(['https://proyecto.supabase.co/auth/v1/.well-known/jwks.json']);
    });

    it('rechaza un token asimétrico si el proyecto no está configurado', async () => {
      const { privateKey } = await generateKeyPair('ES256');
      const verifier = new TokenVerifierService(configWith({ supabaseUrl: '' }), unusedFactory);

      const token = await new SignJWT({})
        .setProtectedHeader({ alg: 'ES256' })
        .setSubject(USER_ID)
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(privateKey);

      expect(await verifier.verify(token)).toBeNull();
    });
  });

  describe('entradas invalidas', () => {
    it.each([undefined, '', '   ', 'Bearer ', 'no-es-un-token'])(
      'rechaza %p sin lanzar excepciones',
      async (value) => {
        const verifier = new TokenVerifierService(configWith(), unusedFactory);

        expect(await verifier.verify(value as string | undefined)).toBeNull();
      },
    );
  });
});
