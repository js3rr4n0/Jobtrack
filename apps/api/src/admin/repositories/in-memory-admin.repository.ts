import { Injectable } from '@nestjs/common';
import { JobApplication } from '@deska/contracts';

import { InMemoryJobApplicationsRepository } from '../../applications/repositories/in-memory-job-applications.repository';
import { AdminRepository } from './admin.repository';

/** Lectura global sobre el almacén en memoria, para desarrollo y pruebas. */
@Injectable()
export class InMemoryAdminRepository extends AdminRepository {
  constructor(private readonly applications: InMemoryJobApplicationsRepository) {
    super();
  }

  async findAllApplications(): Promise<JobApplication[]> {
    return this.applications.findAllAcrossUsers();
  }
}
