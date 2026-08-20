import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PostgrestError, SupabaseClient, createClient } from '@supabase/supabase-js';
import { SupportMessage, SupportTopic } from '@deska/contracts';

import { ApplicationConfig, CONFIG_TOKEN } from '../../config/environment';
import { NewSupportMessage, SupportRepository } from './support.repository';

const TABLE_NAME = 'support_messages';
const ROW_NOT_FOUND = 'PGRST116';

interface SupportRow {
  id: string;
  topic: SupportTopic;
  reply_to: string | null;
  body: string;
  user_id: string | null;
  created_at: string;
  handled_at: string | null;
}

const toDomain = (row: SupportRow): SupportMessage => ({
  id: row.id,
  topic: row.topic,
  replyTo: row.reply_to,
  body: row.body,
  userId: row.user_id,
  createdAt: row.created_at,
  handledAt: row.handled_at,
});

@Injectable()
export class SupabaseSupportRepository extends SupportRepository {
  private readonly client: SupabaseClient;

  constructor(@Inject(CONFIG_TOKEN) config: ApplicationConfig) {
    super();
    this.client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async create(message: NewSupportMessage): Promise<SupportMessage> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .insert({
        topic: message.topic,
        reply_to: message.replyTo,
        body: message.body,
        user_id: message.userId,
      })
      .select('*')
      .single();

    this.failOnError(error, 'No fue posible enviar tu mensaje.');
    return toDomain(data as SupportRow);
  }

  async findRecent(limit: number): Promise<SupportMessage[]> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    this.failOnError(error, 'No fue posible leer los mensajes.');
    return (data as SupportRow[] | null)?.map(toDomain) ?? [];
  }

  async markHandled(id: string): Promise<SupportMessage | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .update({ handled_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error?.code === ROW_NOT_FOUND) {
      return null;
    }

    this.failOnError(error, 'No fue posible marcar el mensaje.');
    return data ? toDomain(data as SupportRow) : null;
  }

  async countSince(since: Date): Promise<number> {
    const { count, error } = await this.client
      .from(TABLE_NAME)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since.toISOString());

    this.failOnError(error, 'No fue posible comprobar el limite de envios.');
    return count ?? 0;
  }

  private failOnError(error: PostgrestError | null, message: string): void {
    if (error) {
      throw new ServiceUnavailableException(`${message} Intentalo de nuevo en unos segundos.`);
    }
  }
}
