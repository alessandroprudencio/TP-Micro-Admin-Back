import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class ClientProxyRabbitMq {
  getClientProxyAdmin(queue: string): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://user:6wPe3X60QqRs@54.145.139.174:5672/tennis-player'],
        queue: queue,
      },
    });
  }
}
