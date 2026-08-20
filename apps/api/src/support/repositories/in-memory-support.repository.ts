import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { SupportMessage } from '@deska/contracts';

import { NewSupportMessage, SupportRepository } from './support.repository';

/** Almacen en memoria para desarrollo local y pruebas de integracion. */
@Injectable()
export class InMemorySupportRepository extends SupportRepository {
  private readonly messages: SupportMessage[] = [];

  async create(message: NewSupportMessage): Promise<SupportMessage> {
    const stored: SupportMessage = {
      ...message,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      handledAt: null,
    };

    this.messages.unshift(stored);
    return stored;
  }

  async findRecent(limit: number): Promise<SupportMessage[]> {
    return this.messages.slice(0, limit);
  }

  async markHandled(id: string): Promise<SupportMessage | null> {
    const index = this.messages.findIndex((message) => message.id === id);

    if (index === -1) {
      return null;
    }

    const updated = { ...this.messages[index], handledAt: new Date().toISOString() };
    this.messages[index] = updated;
    return updated;
  }

  async countSince(since: Date): Promise<number> {
    return this.messages.filter((message) => new Date(message.createdAt) >= since).length;
  }
}
