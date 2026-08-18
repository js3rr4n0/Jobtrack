import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StickyNote } from '@jobtrack/contracts';

import { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateStickyNoteDto } from './dto/create-sticky-note.dto';
import { UpdateStickyNoteDto } from './dto/update-sticky-note.dto';
import { StickyNotesService } from './sticky-notes.service';

/** Cabecera opcional que identifica al dispositivo emisor del cambio. */
const ORIGIN_HEADER = 'x-jobtrack-origin';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class StickyNotesController {
  constructor(private readonly service: StickyNotesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<StickyNote[]> {
    return this.service.listByUser(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateStickyNoteDto,
    @Headers(ORIGIN_HEADER) originId?: string,
  ): Promise<StickyNote> {
    return this.service.create(user.id, payload, originId ?? null);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() payload: UpdateStickyNoteDto,
    @Headers(ORIGIN_HEADER) originId?: string,
  ): Promise<StickyNote> {
    return this.service.update(user.id, id, payload, originId ?? null);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Headers(ORIGIN_HEADER) originId?: string,
  ): Promise<void> {
    return this.service.remove(user.id, id, originId ?? null);
  }
}
