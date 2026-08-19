import { JobApplication } from '@deska/contracts';

/**
 * Puerto de lectura global. Existe aparte del repositorio de postulaciones a
 * propósito: aquel filtra siempre por usuario, y mezclar aquí una consulta sin
 * ese filtro haría fácil saltárselo por accidente desde el resto del código.
 */
export abstract class AdminRepository {
  abstract findAllApplications(): Promise<JobApplication[]>;
}
