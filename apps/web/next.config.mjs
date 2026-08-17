/**
 * Las variables `NEXT_PUBLIC_*` se incrustan en el paquete durante la
 * compilacion, no se leen al arrancar. Si faltan aqui, la aplicacion se publica
 * sin poder autenticar, asi que el build lo deja escrito en el registro en
 * lugar de fallar en silencio.
 */
function reportPublicConfiguration() {
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const missing = required.filter((name) => !process.env[name]);

  for (const name of required) {
    const value = process.env[name];
    const state = value ? `presente (${value.length} caracteres)` : 'AUSENTE';
    console.log(`[jobtrack] ${name}: ${state}`);
  }

  if (missing.length > 0) {
    console.warn(
      `[jobtrack] Faltan ${missing.join(' y ')}. La aplicacion se publicara sin inicio de sesion.`,
    );
  }
}

reportPublicConfiguration();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    dirs: ['src', 'tests'],
  },
};

export default nextConfig;
