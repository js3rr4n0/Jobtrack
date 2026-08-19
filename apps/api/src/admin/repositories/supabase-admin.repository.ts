import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PostgrestError, SupabaseClient, createClient } from '@supabase/supabase-js';
import { JobApplication } from '@jobtrack/contracts';

import { JobApplicationRow, toDomain } from '../../applications/repositories/job-application.mapper';
import { ApplicationConfig, CONFIG_TOKEN } from '../../config/environment';
import { AdminRepository } from './admin.repository';

const TABLE_NAME = 'job_applications';

/** Tope de filas por lectura, para que el informe no crezca sin control. */
const MAX_ROWS = 20_000;

@Injectable()
export class SupabaseAdminRepository extends AdminRepository {
  private readonly client: SupabaseClient;

  constructor(@Inject(CONFIG_TOKEN) config: ApplicationConfig) {
    super();
    this.client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async findAllApplications(): Promise<JobApplication[]> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS);

    this.failOnError(error, 'No fue posible reunir las estadísticas.');
    return (data as JobApplicationRow[] | null)?.map(toDomain) ?? [];
  }

  private failOnError(error: PostgrestError | null, message: string): void {
    if (error) {
      throw new ServiceUnavailableException(`${message} Intentalo de nuevo en unos segundos.`);
    }
  }
}
