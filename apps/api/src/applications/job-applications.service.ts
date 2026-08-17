import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApplicationStatus,
  BoardChangeEvent,
  BoardChangeKind,
  BoardColumn,
  GamificationProfile,
  JobApplication,
  buildGamificationProfile,
  diffBoardPositions,
  groupIntoColumns,
  reorderBoard,
} from '@jobtrack/contracts';

import { BoardEventPublisher } from '../realtime/board-event.publisher';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { MoveJobApplicationDto } from './dto/move-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import {
  JobApplicationPatch,
  JobApplicationsRepository,
} from './repositories/job-applications.repository';

export interface BoardSnapshot {
  readonly columns: readonly BoardColumn[];
  readonly gamification: GamificationProfile;
  readonly generatedAt: string;
}

@Injectable()
export class JobApplicationsService {
  constructor(
    private readonly repository: JobApplicationsRepository,
    private readonly eventPublisher: BoardEventPublisher,
  ) {}

  async listByUser(userId: string): Promise<JobApplication[]> {
    return this.repository.findAllByUser(userId);
  }

  /** Devuelve el tablero completo junto al perfil de gamificacion derivado. */
  async getBoard(userId: string): Promise<BoardSnapshot> {
    const applications = await this.repository.findAllByUser(userId);

    return {
      columns: groupIntoColumns(applications),
      gamification: buildGamificationProfile(applications),
      generatedAt: new Date().toISOString(),
    };
  }

  async getById(userId: string, applicationId: string): Promise<JobApplication> {
    const application = await this.repository.findById(userId, applicationId);

    if (!application) {
      throw new NotFoundException('La postulacion no existe o no te pertenece.');
    }

    return application;
  }

  async create(
    userId: string,
    payload: CreateJobApplicationDto,
    originId: string | null,
  ): Promise<JobApplication> {
    const status = payload.status ?? 'wishlist';
    const boardOrder = await this.repository.countByStatus(userId, status);

    const created = await this.repository.create({
      userId,
      company: payload.company,
      position: payload.position,
      status,
      location: payload.location ?? null,
      workMode: payload.workMode ?? null,
      priority: payload.priority ?? 'medium',
      salaryExpectation: payload.salaryExpectation ?? null,
      sourceUrl: payload.sourceUrl ?? null,
      notes: payload.notes ?? null,
      interviewAt: payload.interviewAt ?? null,
      appliedAt: payload.appliedAt ?? this.defaultAppliedAt(status),
      boardOrder,
    });

    this.notify(userId, 'created', created.id, created, originId);
    return created;
  }

  async update(
    userId: string,
    applicationId: string,
    payload: UpdateJobApplicationDto,
    originId: string | null,
  ): Promise<JobApplication> {
    const patch = buildPatch(payload);
    const updated = await this.repository.update(userId, applicationId, patch);

    if (!updated) {
      throw new NotFoundException('La postulacion no existe o no te pertenece.');
    }

    this.notify(userId, 'updated', updated.id, updated, originId);
    return updated;
  }

  /**
   * Mueve una tarjeta a una columna y posicion concretas, renumerando las
   * columnas afectadas para que el orden sea identico en todos los dispositivos.
   */
  async move(
    userId: string,
    applicationId: string,
    payload: MoveJobApplicationDto,
    originId: string | null,
  ): Promise<JobApplication> {
    await this.getById(userId, applicationId);

    const applications = await this.repository.findAllByUser(userId);
    const reordered = reorderBoard(applications, applicationId, payload.status, payload.boardOrder);

    await Promise.all(
      diffBoardPositions(applications, reordered).map((application) =>
        this.repository.update(userId, application.id, {
          status: application.status,
          boardOrder: application.boardOrder,
        }),
      ),
    );

    const moved = await this.repository.findById(userId, applicationId);

    if (!moved) {
      throw new NotFoundException('La postulacion no existe o no te pertenece.');
    }

    this.notify(userId, 'moved', moved.id, moved, originId);
    return moved;
  }

  async remove(userId: string, applicationId: string, originId: string | null): Promise<void> {
    const wasRemoved = await this.repository.remove(userId, applicationId);

    if (!wasRemoved) {
      throw new NotFoundException('La postulacion no existe o no te pertenece.');
    }

    this.notify(userId, 'deleted', applicationId, null, originId);
  }

  private defaultAppliedAt(status: ApplicationStatus): string | null {
    return status === 'wishlist' ? null : new Date().toISOString();
  }

  private notify(
    userId: string,
    kind: BoardChangeKind,
    applicationId: string,
    application: JobApplication | null,
    originId: string | null,
  ): void {
    const event: BoardChangeEvent = {
      kind,
      applicationId,
      application,
      emittedAt: new Date().toISOString(),
      originId,
    };

    this.eventPublisher.publish(userId, event);
  }
}

/** Traduce el DTO en un parche que solo contiene los campos enviados. */
function buildPatch(payload: UpdateJobApplicationDto): JobApplicationPatch {
  const patch: JobApplicationPatch = {};

  const assignIfPresent = <Key extends keyof UpdateJobApplicationDto>(key: Key) => {
    if (payload[key] !== undefined) {
      Object.assign(patch, { [key]: payload[key] });
    }
  };

  assignIfPresent('company');
  assignIfPresent('position');
  assignIfPresent('status');
  assignIfPresent('location');
  assignIfPresent('workMode');
  assignIfPresent('priority');
  assignIfPresent('salaryExpectation');
  assignIfPresent('sourceUrl');
  assignIfPresent('notes');
  assignIfPresent('interviewAt');
  assignIfPresent('appliedAt');
  assignIfPresent('boardOrder');

  return patch;
}
