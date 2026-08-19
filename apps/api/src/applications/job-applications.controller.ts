import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JobApplication } from '@deska/contracts';

import { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { MoveJobApplicationDto } from './dto/move-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { BoardSnapshot, JobApplicationsService } from './job-applications.service';

/** Cabecera opcional que identifica al dispositivo emisor del cambio. */
const ORIGIN_HEADER = 'x-deska-origin';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class JobApplicationsController {
  constructor(private readonly service: JobApplicationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<JobApplication[]> {
    return this.service.listByUser(user.id);
  }

  @Get('board')
  board(@CurrentUser() user: AuthenticatedUser): Promise<BoardSnapshot> {
    return this.service.getBoard(user.id);
  }

  @Get(':id')
  detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<JobApplication> {
    return this.service.getById(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateJobApplicationDto,
    @Headers(ORIGIN_HEADER) originId?: string,
  ): Promise<JobApplication> {
    return this.service.create(user.id, payload, originId ?? null);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() payload: UpdateJobApplicationDto,
    @Headers(ORIGIN_HEADER) originId?: string,
  ): Promise<JobApplication> {
    return this.service.update(user.id, id, payload, originId ?? null);
  }

  @Patch(':id/move')
  move(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() payload: MoveJobApplicationDto,
    @Headers(ORIGIN_HEADER) originId?: string,
  ): Promise<JobApplication> {
    return this.service.move(user.id, id, payload, originId ?? null);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Headers(ORIGIN_HEADER) originId?: string,
  ): Promise<void> {
    return this.service.remove(user.id, id, originId ?? null);
  }
}
