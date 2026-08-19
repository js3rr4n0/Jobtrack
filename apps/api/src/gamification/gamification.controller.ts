import { Controller, Get, UseGuards } from '@nestjs/common';
import { GamificationProfile } from '@deska/contracts';

import { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GamificationService } from './gamification.service';

@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly service: GamificationService) {}

  @Get('profile')
  profile(@CurrentUser() user: AuthenticatedUser): Promise<GamificationProfile> {
    return this.service.getProfile(user.id);
  }
}
