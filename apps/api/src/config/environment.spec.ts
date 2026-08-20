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
      CORS_ORIGINS: 'https://deska.app, https://www.deska.app ,',
    } as NodeJS.ProcessEnv);

    expect(config.corsOrigins).toEqual(['https://deska.app', 'https://www.deska.app']);
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

describe('ADMIN_EMAIL no puede tumbar la API', () => {
  const base = {
    DATA_DRIVER: 'supabase',
    SUPABASE_URL: 'https://proyecto.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'clave',
  } as NodeJS.ProcessEnv;

  /**
   * El caso real que motiva estas pruebas: pegar el correo en el panel de la
   * nube deja un espacio al final y el proceso moria al arrancar, dejando la
   * API en un bucle de reinicios por un ajuste de una pantalla interna.
   */
  it('acepta un correo con espacios sobrantes al pegarlo', () => {
    const config = loadConfiguration({ ...base, ADMIN_EMAIL: '  Persona@Ejemplo.com \n' });

    expect(config.adminEmail).toBe('persona@ejemplo.com');
  });

  it('no detiene el arranque si el correo esta mal escrito', () => {
    const aviso = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const config = loadConfiguration({ ...base, ADMIN_EMAIL: 'esto-no-es-un-correo' });

    // El panel queda cerrado, que es el fallo seguro, pero la API arranca.
    expect(config.adminEmail).toBeNull();
    expect(aviso).toHaveBeenCalled();
    aviso.mockRestore();
  });

  it('trata un valor vacio como si no estuviera', () => {
    expect(loadConfiguration({ ...base, ADMIN_EMAIL: '' }).adminEmail).toBeNull();
    expect(loadConfiguration({ ...base, ADMIN_EMAIL: '   ' }).adminEmail).toBeNull();
  });

  it('sigue deteniendo el arranque si falta lo que si es imprescindible', () => {
    // Sin base de datos no hay servicio que prestar: eso si debe fallar.
    expect(() => loadConfiguration({ DATA_DRIVER: 'supabase' } as NodeJS.ProcessEnv)).toThrow();
  });
});
