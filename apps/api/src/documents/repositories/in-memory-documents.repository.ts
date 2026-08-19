import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DocumentKind, StoredDocument } from '@deska/contracts';

import { DocumentsRepository, NewDocumentRecord } from './documents.repository';

/** Almacén en memoria para desarrollo local y pruebas de integración. */
@Injectable()
export class InMemoryDocumentsRepository extends DocumentsRepository {
  private readonly documents = new Map<string, StoredDocument>();

  async findAllByUser(
    userId: string,
    kind?: DocumentKind,
    applicationId?: string,
  ): Promise<StoredDocument[]> {
    return Array.from(this.documents.values())
      .filter(
        (item) =>
          item.userId === userId &&
          (!kind || item.kind === kind) &&
          (!applicationId || item.applicationId === applicationId),
      )
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }

  async findById(userId: string, documentId: string): Promise<StoredDocument | null> {
    const found = this.documents.get(documentId);
    return found && found.userId === userId ? found : null;
  }

  async create(record: NewDocumentRecord): Promise<StoredDocument> {
    const document: StoredDocument = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    this.documents.set(document.id, document);
    return document;
  }

  async remove(userId: string, documentId: string): Promise<StoredDocument | null> {
    const found = await this.findById(userId, documentId);

    if (!found) {
      return null;
    }

    this.documents.delete(documentId);
    return found;
  }
}
