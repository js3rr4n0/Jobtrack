import type { MetadataRoute } from 'next';

/**
 * El tablero y el panel de administracion quedan fuera de los buscadores: son
 * pantallas con sesion que un rastreador solo veria como una redireccion al
 * acceso, y no aportan nada a un resultado de busqueda.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/tablero', '/tablero/', '/admin', '/auth/'] },
  };
}
