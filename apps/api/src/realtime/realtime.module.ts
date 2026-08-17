import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { BoardEventPublisher } from './board-event.publisher';
import { BoardGateway } from './board.gateway';

@Module({
  imports: [AuthModule],
  providers: [BoardGateway, { provide: BoardEventPublisher, useExisting: BoardGateway }],
  exports: [BoardEventPublisher],
})
export class RealtimeModule {}
