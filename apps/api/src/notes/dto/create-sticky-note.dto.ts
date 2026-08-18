import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { MAX_NOTE_LENGTH, NOTE_COLORS, NoteColor } from '@jobtrack/contracts';

const trimmed = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateStickyNoteDto {
  @Transform(trimmed)
  @IsString({ message: 'La nota debe ser texto.' })
  @MinLength(1, { message: 'La nota no puede estar vacia.' })
  @MaxLength(MAX_NOTE_LENGTH, {
    message: `La nota admite hasta ${MAX_NOTE_LENGTH} caracteres.`,
  })
  text: string;

  @IsOptional()
  @IsIn(NOTE_COLORS, { message: 'El color indicado no existe.' })
  color?: NoteColor;

  @IsOptional()
  @IsNumber({}, { message: 'La posicion horizontal debe ser numerica.' })
  @Min(0, { message: 'La posicion horizontal esta fuera del mural.' })
  @Max(100, { message: 'La posicion horizontal esta fuera del mural.' })
  x?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La posicion vertical debe ser numerica.' })
  @Min(0, { message: 'La posicion vertical esta fuera del mural.' })
  @Max(100, { message: 'La posicion vertical esta fuera del mural.' })
  y?: number;
}
