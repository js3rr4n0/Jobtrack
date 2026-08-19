import { Injectable } from '@nestjs/common';
import { AdminOverview, buildAdminOverview } from '@deska/contracts';

import { AdminRepository } from './repositories/admin.repository';

export interface AdminOverviewResponse extends AdminOverview {
  readonly generatedAt: string;
}

@Injectable()
export class AdminService {
  constructor(private readonly repository: AdminRepository) {}

  /**
   * Reúne el informe agregado. Todo el cálculo vive en `buildAdminOverview`,
   * una función pura del paquete compartido, así que este servicio solo se
   * ocupa de traer los datos y sellar la hora.
   */
  async getOverview(): Promise<AdminOverviewResponse> {
    const applications = await this.repository.findAllApplications();

    return {
      ...buildAdminOverview(applications, new Date()),
      generatedAt: new Date().toISOString(),
    };
  }
}
