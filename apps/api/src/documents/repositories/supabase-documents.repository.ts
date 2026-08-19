import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PostgrestError, SupabaseClient, createClient } from '@supabase/supabase-js';
import { DocumentKind, StoredDocument } from '@deska/contracts';

import { ApplicationConfig, CONFIG_TOKEN } from '../../config/environment';
import { DocumentsRepository, NewDocumentRecord } from './documents.repository';

const TABLE_NAME = 'documents';
const ROW_NOT_FOUND = 'PGRST116';

interface DocumentRow {
  id: string;
  user_id: string;
  kind: DocumentKind;
  label: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

const toDomain = (row: DocumentRow): StoredDocument => ({
  id: row.id,
  userId: row.user_id,
  kind: row.kind,
  label: row.label,
  storagePath: row.storage_path,
  mimeType: row.mime_type,
  sizeBytes: row.size_bytes,
  createdAt: row.created_at,
});

@Injectable()
export class SupabaseDocumentsRepository extends DocumentsRepository {
  private readonly client: SupabaseClient;

  constructor(@Inject(CONFIG_TOKEN) private readonly config: ApplicationConfig) {
    super();
    this.client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async findAllByUser(userId: string, kind?: DocumentKind): Promise<StoredDocument[]> {
    let query = this.client.from(TABLE_NAME).select('*').eq('user_id', userId);

    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    this.failOnError(error, 'No fue posible leer tus archivos.');
    return (data as DocumentRow[] | null)?.map(toDomain) ?? [];
  }

  async findById(userId: string, documentId: string): Promise<StoredDocument | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .eq('id', documentId)
      .single();

    if (error?.code === ROW_NOT_FOUND) {
      return null;
    }

    this.failOnError(error, 'No fue posible leer el archivo solicitado.');
    return data ? toDomain(data as DocumentRow) : null;
  }

  async create(record: NewDocumentRecord): Promise<StoredDocument> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .insert({
        user_id: record.userId,
        kind: record.kind,
        label: record.label,
        storage_path: record.storagePath,
        mime_type: record.mimeType,
        size_bytes: record.sizeBytes,
      })
      .select('*')
      .single();

    this.failOnError(error, 'No fue posible registrar el archivo.');
    return toDomain(data as DocumentRow);
  }

  /**
   * Borra la fila y, después, el binario. Si el binario fallara, la fila ya no
   * existe y el archivo queda huérfano en el almacén; es preferible a lo
   * contrario, que dejaría una fila apuntando a un archivo inexistente.
   */
  async remove(userId: string, documentId: string): Promise<StoredDocument | null> {
    const found = await this.findById(userId, documentId);

    if (!found) {
      return null;
    }

    const { error } = await this.client
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('id', documentId);

    this.failOnError(error, 'No fue posible eliminar el archivo.');
    await this.client.storage.from(this.config.documentsBucket).remove([found.storagePath]);

    return found;
  }

  private failOnError(error: PostgrestError | null, message: string): void {
    if (error) {
      throw new ServiceUnavailableException(`${message} Intentalo de nuevo en unos segundos.`);
    }
  }
}
