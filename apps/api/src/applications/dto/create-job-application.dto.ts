import { Transform } from 'class-transformer';
import {
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  PRIORITIES,
  Priority,
  WORK_MODES,
  WorkMode,
} from '@deska/contracts';

/** Convierte cadenas vacías en `null` para no guardar basura en la base de datos. */
const emptyToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim().length === 0 ? null : value;

const trimmed = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateJobApplicationDto {
  @Transform(trimmed)
  @IsString({ message: 'La empresa debe ser texto.' })
  @MinLength(1, { message: 'La empresa es obligatoria.' })
  @MaxLength(120, { message: 'La empresa admite hasta 120 caracteres.' })
  company: string;

  @Transform(trimmed)
  @IsString({ message: 'El puesto debe ser texto.' })
  @MinLength(1, { message: 'El puesto es obligatorio.' })
  @MaxLength(120, { message: 'El puesto admite hasta 120 caracteres.' })
  position: string;

  @IsOptional()
  @IsIn(APPLICATION_STATUSES, { message: 'El estado indicado no existe.' })
  status?: ApplicationStatus;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString({ message: 'La ubicación debe ser texto.' })
  @MaxLength(120, { message: 'La ubicación admite hasta 120 caracteres.' })
  location?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsIn(WORK_MODES, { message: 'La modalidad indicada no existe.' })
  workMode?: WorkMode | null;

  @IsOptional()
  @IsIn(PRIORITIES, { message: 'La prioridad indicada no existe.' })
  priority?: Priority;

  @IsOptional()
  @Transform(emptyToNull)
  @IsInt({ message: 'La expectativa salarial debe ser un número entero.' })
  @Min(0, { message: 'La expectativa salarial no puede ser negativa.' })
  @Max(100_000_000, { message: 'La expectativa salarial excede el máximo permitido.' })
  salaryExpectation?: number | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsUrl({ require_protocol: true }, { message: 'El enlace debe ser una URL válida con protocolo.' })
  sourceUrl?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString({ message: 'Las notas deben ser texto.' })
  @MaxLength(4000, { message: 'Las notas admiten hasta 4000 caracteres.' })
  notes?: string | null;

  @IsOptional()
  @Transform(trimmed)
  @Transform(emptyToNull)
  @IsString({ message: 'El área debe ser texto.' })
  @MaxLength(60, { message: 'El área admite hasta 60 caracteres.' })
  category?: string | null;

  @IsOptional()
  @Transform(trimmed)
  @Transform(emptyToNull)
  @IsString({ message: 'El contacto debe ser texto.' })
  @MaxLength(160, { message: 'El contacto admite hasta 160 caracteres.' })
  contact?: string | null;

  @IsOptional()
  @Transform(trimmed)
  @Transform(emptyToNull)
  @IsString({ message: 'La versión del currículum debe ser texto.' })
  @MaxLength(80, { message: 'La versión del currículum admite hasta 80 caracteres.' })
  resumeVersion?: string | null;

  @IsOptional()
  @Transform(trimmed)
  @Transform(emptyToNull)
  @IsString({ message: 'La versión de la carta debe ser texto.' })
  @MaxLength(80, { message: 'La versión de la carta admite hasta 80 caracteres.' })
  coverLetterVersion?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsISO8601({}, { message: 'La fecha de entrevista debe tener formato ISO 8601.' })
  interviewAt?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsISO8601({}, { message: 'La fecha de seguimiento debe tener formato ISO 8601.' })
  followUpAt?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsISO8601({}, { message: 'La fecha de postulación debe tener formato ISO 8601.' })
  appliedAt?: string | null;
}
