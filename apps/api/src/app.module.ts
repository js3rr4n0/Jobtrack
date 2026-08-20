import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';
import { JobApplicationsModule } from './applications/job-applications.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { DocumentsModule } from './documents/documents.module';
import { GamificationModule } from './gamification/gamification.module';
import { HealthModule } from './health/health.module';
import { StickyNotesModule } from './notes/sticky-notes.module';
import { SupportModule } from './support/support.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    RealtimeModule,
    JobApplicationsModule,
    StickyNotesModule,
    DocumentsModule,
    GamificationModule,
    AdminModule,
    SupportModule,
    HealthModule,
  ],
})
export class AppModule {}
