import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, Min } from 'class-validator';

import { CreateJobApplicationDto } from './create-job-application.dto';

export class UpdateJobApplicationDto extends PartialType(CreateJobApplicationDto) {
  @IsOptional()
  @IsInt({ message: 'La posicion en el tablero debe ser un numero entero.' })
  @Min(0, { message: 'La posicion en el tablero no puede ser negativa.' })
  boardOrder?: number;
}
