import { Module } from '@nestjs/common';

import { JobApplicationsModule } from '../applications/job-applications.module';
import { AuthModule } from '../auth/auth.module';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

@Module({
  imports: [AuthModule, JobApplicationsModule],
  controllers: [GamificationController],
  providers: [GamificationService],
})
export class GamificationModule {}
