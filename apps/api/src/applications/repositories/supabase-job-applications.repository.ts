import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PostgrestError, SupabaseClient, createClient } from '@supabase/supabase-js';
import { ApplicationStatus, JobApplication } from '@jobtrack/contracts';

import { ApplicationConfig, CONFIG_TOKEN } from '../../config/environment';
import { JobApplicationRow, toDomain, toInsertRow, toUpdateRow } from './job-application.mapper';
import {
  JobApplicationPatch,
  JobApplicationsRepository,
  NewJobApplicationRecord,
} from './job-applications.repository';

const TABLE_NAME = 'job_applications';
const ROW_NOT_FOUND = 'PGRST116';

/** Adaptador de persistencia sobre PostgreSQL gestionado por Supabase. */
@Injectable()
export class SupabaseJobApplicationsRepository extends JobApplicationsRepository {
  private readonly client: SupabaseClient;

  constructor(@Inject(CONFIG_TOKEN) config: ApplicationConfig) {
    super();
    this.client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async findAllByUser(userId: string): Promise<JobApplication[]> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('status', { ascending: true })
      .order('board_order', { ascending: true });

    this.failOnError(error, 'No fue posible leer tus postulaciones.');
    return (data as JobApplicationRow[] | null)?.map(toDomain) ?? [];
  }

  async findById(userId: string, applicationId: string): Promise<JobApplication | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .eq('id', applicationId)
      .single();

    if (error?.code === ROW_NOT_FOUND) {
      return null;
    }

    this.failOnError(error, 'No fue posible leer la postulacion solicitada.');
    return data ? toDomain(data as JobApplicationRow) : null;
  }

  async create(record: NewJobApplicationRecord): Promise<JobApplication> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .insert(toInsertRow(record))
      .select('*')
      .single();

    this.failOnError(error, 'No fue posible guardar la postulacion.');
    return toDomain(data as JobApplicationRow);
  }

  async update(
    userId: string,
    applicationId: string,
    patch: JobApplicationPatch,
  ): Promise<JobApplication | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .update({ ...toUpdateRow(patch), updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', applicationId)
      .select('*')
      .single();

    if (error?.code === ROW_NOT_FOUND) {
      return null;
    }

    this.failOnError(error, 'No fue posible actualizar la postulacion.');
    return data ? toDomain(data as JobApplicationRow) : null;
  }

  async remove(userId: string, applicationId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('id', applicationId)
      .select('id');

    this.failOnError(error, 'No fue posible eliminar la postulacion.');
    return (data?.length ?? 0) > 0;
  }

  async countByStatus(userId: string, status: ApplicationStatus): Promise<number> {
    const { count, error } = await this.client
      .from(TABLE_NAME)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', status);

    this.failOnError(error, 'No fue posible contar tus postulaciones.');
    return count ?? 0;
  }

  /**
   * Convierte fallos del proveedor en un error HTTP legible en lugar de
   * propagar detalles internos al cliente.
   */
  private failOnError(error: PostgrestError | null, message: string): void {
    if (error) {
      throw new ServiceUnavailableException(`${message} Intentalo de nuevo en unos segundos.`);
    }
  }
}
