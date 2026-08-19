import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PostgrestError, SupabaseClient, createClient } from '@supabase/supabase-js';
import { StickyNote } from '@deska/contracts';

import { ApplicationConfig, CONFIG_TOKEN } from '../../config/environment';
import { StickyNoteRow, toDomain, toInsertRow, toUpdateRow } from './sticky-note.mapper';
import {
  NewStickyNoteRecord,
  StickyNotePatch,
  StickyNotesRepository,
} from './sticky-notes.repository';

const TABLE_NAME = 'sticky_notes';
const ROW_NOT_FOUND = 'PGRST116';

/** Adaptador de persistencia del mural sobre PostgreSQL gestionado por Supabase. */
@Injectable()
export class SupabaseStickyNotesRepository extends StickyNotesRepository {
  private readonly client: SupabaseClient;

  constructor(@Inject(CONFIG_TOKEN) config: ApplicationConfig) {
    super();
    this.client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async findAllByUser(userId: string): Promise<StickyNote[]> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    this.failOnError(error, 'No fue posible leer tus notas.');
    return (data as StickyNoteRow[] | null)?.map(toDomain) ?? [];
  }

  async findById(userId: string, noteId: string): Promise<StickyNote | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .eq('id', noteId)
      .single();

    if (error?.code === ROW_NOT_FOUND) {
      return null;
    }

    this.failOnError(error, 'No fue posible leer la nota solicitada.');
    return data ? toDomain(data as StickyNoteRow) : null;
  }

  async create(record: NewStickyNoteRecord): Promise<StickyNote> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .insert(toInsertRow(record))
      .select('*')
      .single();

    this.failOnError(error, 'No fue posible guardar la nota.');
    return toDomain(data as StickyNoteRow);
  }

  async update(userId: string, noteId: string, patch: StickyNotePatch): Promise<StickyNote | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .update({ ...toUpdateRow(patch), updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('id', noteId)
      .select('*')
      .single();

    if (error?.code === ROW_NOT_FOUND) {
      return null;
    }

    this.failOnError(error, 'No fue posible actualizar la nota.');
    return data ? toDomain(data as StickyNoteRow) : null;
  }

  async remove(userId: string, noteId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('id', noteId)
      .select('id');

    this.failOnError(error, 'No fue posible eliminar la nota.');
    return (data?.length ?? 0) > 0;
  }

  private failOnError(error: PostgrestError | null, message: string): void {
    if (error) {
      throw new ServiceUnavailableException(`${message} Intentalo de nuevo en unos segundos.`);
    }
  }
}
