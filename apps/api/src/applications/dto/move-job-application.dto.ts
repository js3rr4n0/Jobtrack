import { IsIn, IsInt, Min } from 'class-validator';
import { APPLICATION_STATUSES, ApplicationStatus } from '@jobtrack/contracts';

/** Cuerpo del movimiento de una tarjeta dentro del tablero kanban. */
export class MoveJobApplicationDto {
  @IsIn(APPLICATION_STATUSES, { message: 'El estado destino no existe.' })
  status: ApplicationStatus;

  @IsInt({ message: 'La posición destino debe ser un número entero.' })
  @Min(0, { message: 'La posición destino no puede ser negativa.' })
  boardOrder: number;
}
