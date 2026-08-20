/**
 * Datos que encabezan los documentos legales. Viven en un solo sitio porque
 * aparecen repetidos en los terminos, en la politica y en el pie: tenerlos
 * duplicados es como acaban diciendo cosas distintas.
 */

/** Fecha de la ultima revision. Se actualiza al cambiar cualquiera de los dos textos. */
export const LEGAL_LAST_UPDATED = '20 de agosto de 2026';

/**
 * Pais cuyas leyes rigen los terminos y cuyos tribunales conocen de un
 * conflicto. Un contrato no puede regirse por "todo el mundo": lo que si es
 * mundial son las protecciones, escritas al nivel del RGPD europeo, que es el
 * estandar mas exigente y por tanto sirve en cualquier pais.
 *
 * CAMBIA ESTE VALOR si resides en otro pais antes de publicar.
 */
export const LEGAL_JURISDICTION = 'Guatemala';

/**
 * Canal de contacto. Es el repositorio publico del proyecto en lugar de una
 * direccion de correo, por decision expresa de quien opera el servicio.
 */
export const LEGAL_CONTACT_URL = 'https://github.com/js3rr4n0/Jobtrack/issues';
export const LEGAL_CONTACT_LABEL = 'las incidencias del repositorio del proyecto';

/**
 * Edad minima. Dieciseis es el umbral que fija el RGPD para que una persona
 * pueda consentir por si misma el tratamiento de sus datos.
 */
export const LEGAL_MINIMUM_AGE = 16;

/** Encargados del tratamiento, con lo que hace cada uno y por que hace falta. */
export interface ProcessorEntry {
  readonly name: string;
  readonly purpose: string;
}

export const LEGAL_PROCESSORS: readonly ProcessorEntry[] = [
  {
    name: 'Supabase',
    purpose:
      'Guarda la base de datos, gestiona el inicio de sesion y almacena los archivos que subes. Es donde vive tu tablero.',
  },
  {
    name: 'Render',
    purpose: 'Ejecuta la interfaz de programacion que atiende las peticiones de la aplicacion.',
  },
  {
    name: 'Vercel',
    purpose: 'Publica y entrega la pagina web que abres en el navegador.',
  },
  {
    name: 'Google',
    purpose:
      'Solo si eliges entrar con Google. En ese caso Google nos confirma tu correo, tu nombre y tu foto de perfil. Si entras con correo y contrasena, Google no interviene.',
  },
];
