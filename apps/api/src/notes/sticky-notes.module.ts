import { Module, Provider } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';
import { RealtimeModule } from '../realtime/realtime.module';
import { InMemoryStickyNotesRepository } from './repositories/in-memory-sticky-notes.repository';
import { StickyNotesRepository } from './repositories/sticky-notes.repository';
import { SupabaseStickyNotesRepository } from './repositories/supabase-sticky-notes.repository';
import { StickyNotesController } from './sticky-notes.controller';
import { StickyNotesService } from './sticky-notes.service';

/** Selecciona el adaptador de persistencia declarado en la configuración. */
const repositoryProvider: Provider = {
  provide: StickyNotesRepository,
  inject: [CONFIG_TOKEN],
  useFactory: (config: ApplicationConfig): StickyNotesRepository =>
    config.dataDriver === 'supabase'
      ? new SupabaseStickyNotesRepository(config)
      : new InMemoryStickyNotesRepository(),
};

@Module({
  imports: [AuthModule, RealtimeModule],
  controllers: [StickyNotesController],
  providers: [StickyNotesService, repositoryProvider],
  exports: [StickyNotesService, StickyNotesRepository],
})
export class StickyNotesModule {}
