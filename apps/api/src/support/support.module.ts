import { Module, Provider } from '@nestjs/common';

import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';
import { InMemorySupportRepository } from './repositories/in-memory-support.repository';
import { SupabaseSupportRepository } from './repositories/supabase-support.repository';
import { SupportRepository } from './repositories/support.repository';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

const repositoryProvider: Provider = {
  provide: SupportRepository,
  inject: [CONFIG_TOKEN],
  useFactory: (config: ApplicationConfig): SupportRepository =>
    config.dataDriver === 'supabase'
      ? new SupabaseSupportRepository(config)
      : new InMemorySupportRepository(),
};

@Module({
  imports: [AuthModule, AdminModule],
  controllers: [SupportController],
  providers: [SupportService, repositoryProvider],
})
export class SupportModule {}
