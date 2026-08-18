import { Module } from '@nestjs/common';

import { JobApplicationsModule } from './applications/job-applications.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { GamificationModule } from './gamification/gamification.module';
import { HealthModule } from './health/health.module';
import { StickyNotesModule } from './notes/sticky-notes.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    RealtimeModule,
    JobApplicationsModule,
    StickyNotesModule,
    GamificationModule,
    HealthModule,
  ],
})
export class AppModule {}
