import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { MAX_NOTE_LENGTH, NOTE_COLORS, NoteColor } from '@deska/contracts';

const trimmed = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateStickyNoteDto {
  @Transform(trimmed)
  @IsString({ message: 'La nota debe ser texto.' })
  @MinLength(1, { message: 'La nota no puede estar vacía.' })
  @MaxLength(MAX_NOTE_LENGTH, {
    message: `La nota admite hasta ${MAX_NOTE_LENGTH} caracteres.`,
  })
  text: string;

  @IsOptional()
  @IsIn(NOTE_COLORS, { message: 'El color indicado no existe.' })
  color?: NoteColor;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsUUID('4', { message: 'La imagen elegida no es válida.' })
  imageId?: string | null;

  @IsOptional()
  @IsNumber({}, { message: 'La posición horizontal debe ser numérica.' })
  @Min(0, { message: 'La posición horizontal está fuera del mural.' })
  @Max(100, { message: 'La posición horizontal está fuera del mural.' })
  x?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La posición vertical debe ser numérica.' })
  @Min(0, { message: 'La posición vertical está fuera del mural.' })
  @Max(100, { message: 'La posición vertical está fuera del mural.' })
  y?: number;
}
