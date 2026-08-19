import { Module, Provider } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentsRepository } from './repositories/documents.repository';
import { InMemoryDocumentsRepository } from './repositories/in-memory-documents.repository';
import { SupabaseDocumentsRepository } from './repositories/supabase-documents.repository';

const repositoryProvider: Provider = {
  provide: DocumentsRepository,
  inject: [CONFIG_TOKEN],
  useFactory: (config: ApplicationConfig): DocumentsRepository =>
    config.dataDriver === 'supabase'
      ? new SupabaseDocumentsRepository(config)
      : new InMemoryDocumentsRepository(),
};

@Module({
  imports: [AuthModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, repositoryProvider],
  exports: [DocumentsService, DocumentsRepository],
})
export class DocumentsModule {}
