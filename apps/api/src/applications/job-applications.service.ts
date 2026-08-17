import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApplicationStatus,
  BoardChangeEvent,
  BoardChangeKind,
  GamificationProfile,
  JobApplication,
  ORDERED_STATUSES,
  buildGamificationProfile,
} from '@jobtrack/contracts';

import { BoardEventPublisher } from '../realtime/board-event.publisher';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { MoveJobApplicationDto } from './dto/move-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import {
  JobApplicationPatch,
  JobApplicationsRepository,
} from './repositories/job-applications.repository';

export interface BoardColumn {
  readonly status: ApplicationStatus;
  readonly label: string;
  readonly description: string;
  readonly applications: readonly JobApplication[];
}

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
      columns: ORDERED_STATUSES.map((definition) => ({
        status: definition.id,
        label: definition.label,
        description: definition.description,
        applications: applications
          .filter((application) => application.status === definition.id)
          .sort((first, second) => first.boardOrder - second.boardOrder),
      })),
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
    const current = await this.getById(userId, applicationId);
    const applications = await this.repository.findAllByUser(userId);

    const destination = applications
      .filter(
        (application) =>
          application.status === payload.status && application.id !== applicationId,
      )
      .sort((first, second) => first.boardOrder - second.boardOrder);

    const insertIndex = clamp(payload.boardOrder, 0, destination.length);
    destination.splice(insertIndex, 0, { ...current, status: payload.status });

    await this.persistColumnOrder(userId, destination, applicationId, payload.status);

    if (current.status !== payload.status) {
      const origin = applications
        .filter(
          (application) =>
            application.status === current.status && application.id !== applicationId,
        )
        .sort((first, second) => first.boardOrder - second.boardOrder);
      await this.persistColumnOrder(userId, origin, applicationId, current.status);
    }

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

  /** Escribe la numeracion secuencial de una columna evitando escrituras inutiles. */
  private async persistColumnOrder(
    userId: string,
    column: readonly JobApplication[],
    movedApplicationId: string,
    status: ApplicationStatus,
  ): Promise<void> {
    const writes = column.map((application, index) => {
      const needsStatusChange = application.id === movedApplicationId;
      const alreadyPositioned = application.boardOrder === index && !needsStatusChange;

      if (alreadyPositioned) {
        return null;
      }

      const patch: JobApplicationPatch = needsStatusChange
        ? { status, boardOrder: index }
        : { boardOrder: index };

      return this.repository.update(userId, application.id, patch);
    });

    await Promise.all(writes.filter((write): write is Promise<JobApplication | null> => write !== null));
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

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
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
