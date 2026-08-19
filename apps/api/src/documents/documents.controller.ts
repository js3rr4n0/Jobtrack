import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DOCUMENT_KINDS, DocumentKind, StoredDocument, isDocumentKind } from '@deska/contracts';

import { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterDocumentDto } from './dto/register-document.dto';
import { DocumentsService } from './documents.service';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('kind') kind?: string,
  ): Promise<StoredDocument[]> {
    // Un filtro desconocido devuelve todo, en lugar de fallar: el listado es
    // una lectura y no merece un error por un parametro mal escrito.
    const filter: DocumentKind | undefined = isDocumentKind(kind) ? kind : undefined;

    return this.service.listByUser(user.id, filter);
  }

  @Post()
  register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: RegisterDocumentDto,
  ): Promise<StoredDocument> {
    return this.service.register(user.id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.service.remove(user.id, id);
  }
}

export { DOCUMENT_KINDS };
