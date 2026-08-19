import { Injectable } from '@nestjs/common';
import { GamificationProfile, buildGamificationProfile } from '@deska/contracts';

import { JobApplicationsRepository } from '../applications/repositories/job-applications.repository';

@Injectable()
export class GamificationService {
  constructor(private readonly repository: JobApplicationsRepository) {}

  /**
   * El perfil se recalcula a partir del estado actual del tablero, por lo que
   * nunca queda desincronizado con las postulaciones del usuario.
   */
  async getProfile(userId: string): Promise<GamificationProfile> {
    const applications = await this.repository.findAllByUser(userId);
    return buildGamificationProfile(applications);
  }
}
