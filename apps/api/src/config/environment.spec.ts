import { loadConfiguration } from './environment';

describe('loadConfiguration', () => {
  it('aplica valores por defecto seguros para desarrollo', () => {
    const config = loadConfiguration({} as NodeJS.ProcessEnv);

    expect(config.nodeEnv).toBe('development');
    expect(config.port).toBe(4000);
    expect(config.dataDriver).toBe('memory');
    expect(config.corsOrigins).toEqual(['http://localhost:3000']);
  });

  it('convierte la lista de origenes CORS en un arreglo sin espacios', () => {
    const config = loadConfiguration({
      CORS_ORIGINS: 'https://jobtrack.app, https://www.jobtrack.app ,',
    } as NodeJS.ProcessEnv);

    expect(config.corsOrigins).toEqual(['https://jobtrack.app', 'https://www.jobtrack.app']);
  });

  it('rechaza un puerto no numérico con un mensaje legible', () => {
    expect(() => loadConfiguration({ PORT: 'ocho mil' } as NodeJS.ProcessEnv)).toThrow(
      /Configuración de entorno invalida/,
    );
  });

  it('exige credenciales de Supabase cuando el driver es supabase', () => {
    expect(() => loadConfiguration({ DATA_DRIVER: 'supabase' } as NodeJS.ProcessEnv)).toThrow(
      /SUPABASE_URL/,
    );
  });

  it('acepta el driver supabase cuando las credenciales están completas', () => {
    const config = loadConfiguration({
      DATA_DRIVER: 'supabase',
      SUPABASE_URL: 'https://proyecto.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'clave-de-servicio',
      SUPABASE_JWT_SECRET: 'secreto-de-firma',
    } as NodeJS.ProcessEnv);

    expect(config.dataDriver).toBe('supabase');
    expect(config.jwtSecret).toBe('secreto-de-firma');
  });

  it('rechaza una URL de Supabase mal formada', () => {
    expect(() =>
      loadConfiguration({
        DATA_DRIVER: 'supabase',
        SUPABASE_URL: 'proyecto-sin-protocolo',
        SUPABASE_SERVICE_ROLE_KEY: 'clave',
      } as NodeJS.ProcessEnv),
    ).toThrow(/SUPABASE_URL/);
  });
});
