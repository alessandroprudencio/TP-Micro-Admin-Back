import { Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { throwError } from 'rxjs';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown) {
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const error = exception instanceof HttpException ? exception.getResponse() : exception;

    this.logger.error(`Http Status: ${status} Error Message: ${JSON.stringify(error)}`);

    return throwError(() => error);
  }
}
