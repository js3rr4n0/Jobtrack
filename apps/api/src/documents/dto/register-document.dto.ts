import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import {
  DOCUMENT_KINDS,
  DocumentKind,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_LABEL_LENGTH,
} from '@deska/contracts';

const trimmed = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDocumentDto {
  @IsIn(DOCUMENT_KINDS, { message: 'Ese tipo de archivo no existe.' })
  kind: DocumentKind;

  @Transform(trimmed)
  @IsString({ message: 'El nombre debe ser texto.' })
  @MinLength(1, { message: 'Ponle un nombre al archivo para reconocerlo después.' })
  @MaxLength(MAX_DOCUMENT_LABEL_LENGTH, {
    message: `El nombre admite hasta ${MAX_DOCUMENT_LABEL_LENGTH} caracteres.`,
  })
  label: string;

  @Transform(trimmed)
  @IsString({ message: 'La ruta del archivo debe ser texto.' })
  @MinLength(1, { message: 'Falta la ruta del archivo subido.' })
  @MaxLength(400, { message: 'La ruta del archivo es demasiado larga.' })
  storagePath: string;

  @Transform(trimmed)
  @IsString({ message: 'El tipo del archivo debe ser texto.' })
  @MinLength(1, { message: 'Falta el tipo del archivo.' })
  mimeType: string;

  @IsInt({ message: 'El tamaño debe ser un número entero de bytes.' })
  @Min(1, { message: 'El archivo está vacío.' })
  @Max(MAX_DOCUMENT_BYTES, { message: 'El archivo supera el tamaño permitido.' })
  sizeBytes: number;
}
