import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config } from 'dotenv';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ProxyRmqConfig } from './proxyrmq/proxyrmq.config';

config();

async function bootstrap() {
  const configService = new ConfigService();

  const configProxyRmq = new ProxyRmqConfig(configService);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [
        {
          hostname: configProxyRmq.hostname,
          port: configProxyRmq.port,
          username: configProxyRmq.username,
          password: configProxyRmq.password,
          vhost: configProxyRmq.vhost,
        },
      ],
      queue: 'micro-admin-back',
      noAck: false,
    },
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen();
}
bootstrap();
