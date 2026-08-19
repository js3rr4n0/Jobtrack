import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  DocumentKind,
  StoredDocument,
  isPathOwnedBy,
  normalizeDocumentLabel,
  rejectDocument,
} from '@deska/contracts';

import { JobApplicationsRepository } from '../applications/repositories/job-applications.repository';
import { RegisterDocumentDto } from './dto/register-document.dto';
import { DocumentsRepository } from './repositories/documents.repository';

const MISSING = 'El archivo no existe o no te pertenece.';
const MISSING_APPLICATION = 'La vacante a la que quieres adjuntarlo no existe o no es tuya.';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repository: DocumentsRepository,
    private readonly applications: JobApplicationsRepository,
  ) {}

  listByUser(
    userId: string,
    kind?: DocumentKind,
    applicationId?: string,
  ): Promise<StoredDocument[]> {
    return this.repository.findAllByUser(userId, kind, applicationId);
  }

  /**
   * Registra un archivo ya subido al almacén. El binario viaja del navegador a
   * Supabase Storage sin pasar por aquí, así que lo único que hace falta
   * comprobar —y se comprueba— es que la ruta declarada cuelgue de la carpeta
   * de quien la registra: de lo contrario alguien podría apuntar una fila suya
   * al archivo de otra persona.
   */
  async register(userId: string, payload: RegisterDocumentDto): Promise<StoredDocument> {
    if (!isPathOwnedBy(payload.storagePath, userId)) {
      throw new BadRequestException('La ruta del archivo no corresponde a tu cuenta.');
    }

    const rejection = rejectDocument(payload);

    if (rejection) {
      throw new BadRequestException(rejection.message);
    }

    // Adjuntar a una vacante ajena convertiria un identificador adivinado en
    // una via para colgar archivos del tablero de otra persona.
    if (payload.applicationId && !(await this.applications.findById(userId, payload.applicationId))) {
      throw new NotFoundException(MISSING_APPLICATION);
    }

    return this.repository.create({
      userId,
      kind: payload.kind,
      label: normalizeDocumentLabel(payload.label) ?? '',
      storagePath: payload.storagePath,
      mimeType: payload.mimeType,
      sizeBytes: payload.sizeBytes,
      applicationId: payload.applicationId ?? null,
    });
  }

  async remove(userId: string, documentId: string): Promise<void> {
    const removed = await this.repository.remove(userId, documentId);

    if (!removed) {
      throw new NotFoundException(MISSING);
    }
  }
}
