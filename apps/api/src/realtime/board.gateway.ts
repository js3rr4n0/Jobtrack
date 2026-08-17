import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BOARD_EVENT, BoardChangeEvent } from '@jobtrack/contracts';

import { TokenVerifierService } from '../auth/token-verifier.service';
import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';
import { BoardEventPublisher } from './board-event.publisher';

/** Cada usuario recibe sus eventos en una sala propia, aislada del resto. */
const roomForUser = (userId: string): string => `user:${userId}`;

@Injectable()
@WebSocketGateway({ namespace: '/realtime', cors: { origin: true, credentials: true } })
export class BoardGateway
  extends BoardEventPublisher
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(BoardGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly tokenVerifier: TokenVerifierService,
    @Inject(CONFIG_TOKEN) private readonly config: ApplicationConfig,
  ) {
    super();
  }

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractToken(client);
    const user = await this.tokenVerifier.verify(token);

    if (!user) {
      client.emit('connection:rejected', { reason: 'Token de sesion invalido o ausente.' });
      client.disconnect(true);
      return;
    }

    client.join(roomForUser(user.id));
    client.emit('connection:ready', { userId: user.id });
  }

  handleDisconnect(client: Socket): void {
    if (this.config.nodeEnv === 'development') {
      this.logger.debug(`Cliente desconectado: ${client.id}`);
    }
  }

  publish(userId: string, event: BoardChangeEvent): void {
    this.server?.to(roomForUser(userId)).emit(BOARD_EVENT, event);
  }

  private extractToken(client: Socket): string | undefined {
    const fromAuth = client.handshake.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.length > 0) {
      return fromAuth;
    }

    const fromHeader = client.handshake.headers.authorization;
    return typeof fromHeader === 'string' ? fromHeader : undefined;
  }
}
