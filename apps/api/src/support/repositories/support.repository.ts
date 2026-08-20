import { SupportMessage } from '@deska/contracts';

export type NewSupportMessage = Omit<SupportMessage, 'id' | 'createdAt' | 'handledAt'>;

/** Puerto de persistencia de los mensajes de contacto. */
export abstract class SupportRepository {
  abstract create(message: NewSupportMessage): Promise<SupportMessage>;
  abstract findRecent(limit: number): Promise<SupportMessage[]>;
  abstract markHandled(id: string): Promise<SupportMessage | null>;
  /** Mensajes recibidos desde un instante dado, para frenar el abuso. */
  abstract countSince(since: Date): Promise<number>;
}
