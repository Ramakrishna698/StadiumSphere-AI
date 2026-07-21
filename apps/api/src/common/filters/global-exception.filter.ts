import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  readonly correlationId: string;
  readonly message: string;
  readonly statusCode: number;
  readonly timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('[GlobalExceptionFilter] Unhandled exception:', exception);
    }

    const responseBody: ErrorResponseBody = {
      correlationId: request.correlationId ?? 'unavailable',
      message: this.getMessage(exception),
      statusCode,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(responseBody);
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return exceptionResponse;
      }

      if ('message' in exceptionResponse) {
        const { message } = exceptionResponse;
        return Array.isArray(message) ? message.join(', ') : String(message);
      }
    }

    return 'An unexpected platform error occurred.';
  }
}
