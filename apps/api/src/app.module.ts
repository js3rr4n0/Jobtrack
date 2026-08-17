import { Module } from '@nestjs/common';

import { JobApplicationsModule } from './applications/job-applications.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { GamificationModule } from './gamification/gamification.module';
import { HealthModule } from './health/health.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    RealtimeModule,
    JobApplicationsModule,
    GamificationModule,
    HealthModule,
  ],
})
export class AppModule {}
