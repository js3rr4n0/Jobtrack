import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, Min } from 'class-validator';

import { CreateJobApplicationDto } from './create-job-application.dto';

export class UpdateJobApplicationDto extends PartialType(CreateJobApplicationDto) {
  @IsOptional()
  @IsInt({ message: 'La posición en el tablero debe ser un número entero.' })
  @Min(0, { message: 'La posición en el tablero no puede ser negativa.' })
  boardOrder?: number;
}
