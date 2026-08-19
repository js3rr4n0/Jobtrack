import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApplicationStatus, JobApplication } from '@deska/contracts';

import {
  JobApplicationPatch,
  JobApplicationsRepository,
  NewJobApplicationRecord,
} from './job-applications.repository';

/**
 * Implementación en memoria usada en desarrollo local y en las pruebas de
 * integracion. Mantiene la misma semántica que el adaptador de Supabase.
 */
@Injectable()
export class InMemoryJobApplicationsRepository extends JobApplicationsRepository {
  private readonly applications = new Map<string, JobApplication>();

  async findAllByUser(userId: string): Promise<JobApplication[]> {
    return this.snapshotOf(userId).sort(compareByBoardPosition);
  }

  async findById(userId: string, applicationId: string): Promise<JobApplication | null> {
    const application = this.applications.get(applicationId);
    return application && application.userId === userId ? application : null;
  }

  async create(record: NewJobApplicationRecord): Promise<JobApplication> {
    const now = new Date().toISOString();
    const application: JobApplication = {
      ...record,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this.applications.set(application.id, application);
    return application;
  }

  async update(
    userId: string,
    applicationId: string,
    patch: JobApplicationPatch,
  ): Promise<JobApplication | null> {
    const existing = await this.findById(userId, applicationId);
    if (!existing) {
      return null;
    }

    const updated: JobApplication = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.applications.set(applicationId, updated);
    return updated;
  }

  async remove(userId: string, applicationId: string): Promise<boolean> {
    const existing = await this.findById(userId, applicationId);
    if (!existing) {
      return false;
    }

    this.applications.delete(applicationId);
    return true;
  }

  async countByStatus(userId: string, status: ApplicationStatus): Promise<number> {
    return this.snapshotOf(userId).filter((application) => application.status === status).length;
  }

  /** Utilidad para pruebas: vacía el almacenamiento entre casos. */
  clear(): void {
    this.applications.clear();
  }

  /**
   * Lectura sin filtrar por usuario. La usa solo el panel de administración
   * para sus recuentos agregados; el resto del código pasa por `findAllByUser`.
   */
  async findAllAcrossUsers(): Promise<JobApplication[]> {
    return Array.from(this.applications.values());
  }

  private snapshotOf(userId: string): JobApplication[] {
    return Array.from(this.applications.values()).filter(
      (application) => application.userId === userId,
    );
  }
}

function compareByBoardPosition(first: JobApplication, second: JobApplication): number {
  if (first.status !== second.status) {
    return first.status.localeCompare(second.status);
  }

  if (first.boardOrder !== second.boardOrder) {
    return first.boardOrder - second.boardOrder;
  }

  return first.createdAt.localeCompare(second.createdAt);
}
