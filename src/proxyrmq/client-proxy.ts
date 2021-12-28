import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ProxyRmqConfig } from './proxyrmq.config';

@Injectable()
export class ClientProxyRabbitMq {
  private configProxyRmq: ProxyRmqConfig;

  constructor(configService: ConfigService) {
    this.configProxyRmq = new ProxyRmqConfig(configService);
  }

  getClientProxyRabbitmq(queue: string): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [{ ...this.configProxyRmq }],
        queue: queue,
      },
    });
  }
}
