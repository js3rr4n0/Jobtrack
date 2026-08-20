import type { MetadataRoute } from 'next';

/** Las pantallas publicas, que son las unicas que un buscador puede leer. */
export default function sitemap(): MetadataRoute.Sitemap {
  const revisado = new Date();

  return [
    { url: '/', lastModified: revisado, changeFrequency: 'monthly', priority: 1 },
    { url: '/registro', lastModified: revisado, changeFrequency: 'monthly', priority: 0.8 },
    { url: '/acceso', lastModified: revisado, changeFrequency: 'yearly', priority: 0.5 },
    { url: '/contacto', lastModified: revisado, changeFrequency: 'yearly', priority: 0.4 },
    { url: '/privacidad', lastModified: revisado, changeFrequency: 'yearly', priority: 0.3 },
    { url: '/terminos', lastModified: revisado, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
