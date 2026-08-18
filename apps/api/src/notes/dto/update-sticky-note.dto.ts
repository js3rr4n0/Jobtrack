import { PartialType } from '@nestjs/mapped-types';

import { CreateStickyNoteDto } from './create-sticky-note.dto';

/** Todos los campos son opcionales: se actualiza solo lo que se envia. */
export class UpdateStickyNoteDto extends PartialType(CreateStickyNoteDto) {}
