import { Module, Provider } from '@nestjs/common';

import { JobApplicationsModule } from '../applications/job-applications.module';
import { InMemoryJobApplicationsRepository } from '../applications/repositories/in-memory-job-applications.repository';
import { JobApplicationsRepository } from '../applications/repositories/job-applications.repository';
import { AuthModule } from '../auth/auth.module';
import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './repositories/admin.repository';
import { InMemoryAdminRepository } from './repositories/in-memory-admin.repository';
import { SupabaseAdminRepository } from './repositories/supabase-admin.repository';

/**
 * En memoria, el panel comparte la misma instancia del almacén que el resto de
 * la aplicación; de lo contrario leería un almacén vacío y siempre informaría
 * de cero.
 */
const repositoryProvider: Provider = {
  provide: AdminRepository,
  inject: [CONFIG_TOKEN, JobApplicationsRepository],
  useFactory: (config: ApplicationConfig, applications: JobApplicationsRepository): AdminRepository =>
    config.dataDriver === 'supabase'
      ? new SupabaseAdminRepository(config)
      : new InMemoryAdminRepository(applications as InMemoryJobApplicationsRepository),
};

@Module({
  imports: [AuthModule, JobApplicationsModule],
  controllers: [AdminController],
  providers: [AdminService, repositoryProvider],
})
export class AdminModule {}
