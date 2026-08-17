import { Module, Provider } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';
import { RealtimeModule } from '../realtime/realtime.module';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';
import { InMemoryJobApplicationsRepository } from './repositories/in-memory-job-applications.repository';
import { JobApplicationsRepository } from './repositories/job-applications.repository';
import { SupabaseJobApplicationsRepository } from './repositories/supabase-job-applications.repository';

/** Selecciona el adaptador de persistencia declarado en la configuracion. */
const repositoryProvider: Provider = {
  provide: JobApplicationsRepository,
  inject: [CONFIG_TOKEN],
  useFactory: (config: ApplicationConfig): JobApplicationsRepository =>
    config.dataDriver === 'supabase'
      ? new SupabaseJobApplicationsRepository(config)
      : new InMemoryJobApplicationsRepository(),
};

@Module({
  imports: [AuthModule, RealtimeModule],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService, repositoryProvider],
  exports: [JobApplicationsService, JobApplicationsRepository],
})
export class JobApplicationsModule {}
