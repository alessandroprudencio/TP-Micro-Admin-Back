import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config } from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

config();

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBIT_MQ_CONNECTION],
      queue: 'micro-admin-back',
      noAck: false,
    },
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen();
}
bootstrap();
