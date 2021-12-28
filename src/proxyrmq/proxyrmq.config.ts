import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProxyRmqConfig {
  constructor(private configService: ConfigService) {
    this.configService = configService;
  }

  public hostname: string = this.configService.get<string>('RABBIT_MQ_HOST');

  public port: number = this.configService.get<number>('RABBIT_MQ_PORT');

  public username: string = this.configService.get<string>('RABBIT_MQ_USERNAME');

  public password: string = this.configService.get<string>('RABBIT_MQ_PASSWORD');

  public vhost: string = this.configService.get<string>('RABBIT_MQ_VHOST');
}
