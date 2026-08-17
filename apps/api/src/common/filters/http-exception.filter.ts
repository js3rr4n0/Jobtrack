import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponseBody {
  statusCode: number;
  message: string;
  details: string[];
  path: string;
  timestamp: string;
}

/**
 * Normaliza cualquier fallo en una respuesta con mensajes legibles y sin
 * filtrar trazas internas al cliente.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, details } = this.describe(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${request.method} ${request.url}`, describeStack(exception));
    }

    const body: ErrorResponseBody = {
      statusCode,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }

  private describe(exception: unknown): { message: string; details: string[] } {
    if (!(exception instanceof HttpException)) {
      return {
        message: 'Ocurrio un error inesperado. Intentalo de nuevo en unos momentos.',
        details: [],
      };
    }

    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { message: payload, details: [] };
    }

    const record = payload as { message?: string | string[]; error?: string };

    if (Array.isArray(record.message)) {
      return {
        message: 'Revisa los datos ingresados.',
        details: record.message,
      };
    }

    return { message: record.message ?? exception.message, details: [] };
  }
}

function describeStack(exception: unknown): string {
  return exception instanceof Error ? (exception.stack ?? exception.message) : String(exception);
}
