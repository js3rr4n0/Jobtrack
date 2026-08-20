import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  MAX_SUPPORT_BODY_LENGTH,
  MAX_SUPPORT_EMAIL_LENGTH,
  MIN_SUPPORT_BODY_LENGTH,
  SUPPORT_TOPICS,
  SupportTopic,
} from '@deska/contracts';

const trimmedOrNull = ({ value }: { value: unknown }) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' ? null : trimmed;
};

export class CreateSupportMessageDto {
  @IsIn(SUPPORT_TOPICS, { message: 'Elige un motivo para el mensaje.' })
  topic: SupportTopic;

  @IsOptional()
  @Transform(trimmedOrNull)
  @IsString({ message: 'El correo debe ser texto.' })
  @MaxLength(MAX_SUPPORT_EMAIL_LENGTH, { message: 'El correo es demasiado largo.' })
  replyTo?: string | null;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El mensaje debe ser texto.' })
  @MinLength(MIN_SUPPORT_BODY_LENGTH, { message: 'Cuéntanos un poco más para poder ayudarte.' })
  @MaxLength(MAX_SUPPORT_BODY_LENGTH, {
    message: `El mensaje admite hasta ${MAX_SUPPORT_BODY_LENGTH} caracteres.`,
  })
  body: string;
}
