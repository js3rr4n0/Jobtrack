import { DocumentKind, StoredDocument } from '@deska/contracts';

export type NewDocumentRecord = Omit<StoredDocument, 'id' | 'createdAt'>;

/** Puerto de persistencia de los metadatos de archivo. */
export abstract class DocumentsRepository {
  abstract findAllByUser(userId: string, kind?: DocumentKind): Promise<StoredDocument[]>;
  abstract findById(userId: string, documentId: string): Promise<StoredDocument | null>;
  abstract create(record: NewDocumentRecord): Promise<StoredDocument>;
  abstract remove(userId: string, documentId: string): Promise<StoredDocument | null>;
}
