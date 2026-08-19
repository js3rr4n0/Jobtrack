import { JobApplication } from '@jobtrack/contracts';

/** Datos persistibles de una postulación, sin campos calculados por la capa de dominio. */
export type JobApplicationRecord = Omit<JobApplication, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type NewJobApplicationRecord = Omit<JobApplicationRecord, 'id' | 'createdAt' | 'updatedAt'>;

export type JobApplicationPatch = Partial<Omit<JobApplicationRecord, 'id' | 'userId' | 'createdAt'>>;

/**
 * Puerto de persistencia. La capa de dominio depende de esta abstraccion y no
 * del proveedor concreto, de modo que Supabase puede sustituirse en pruebas.
 */
export abstract class JobApplicationsRepository {
  abstract findAllByUser(userId: string): Promise<JobApplication[]>;
  abstract findById(userId: string, applicationId: string): Promise<JobApplication | null>;
  abstract create(record: NewJobApplicationRecord): Promise<JobApplication>;
  abstract update(
    userId: string,
    applicationId: string,
    patch: JobApplicationPatch,
  ): Promise<JobApplication | null>;
  abstract remove(userId: string, applicationId: string): Promise<boolean>;
  abstract countByStatus(userId: string, status: JobApplication['status']): Promise<number>;
}
