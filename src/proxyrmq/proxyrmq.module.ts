import { Module } from '@nestjs/common';
import { ClientProxyRabbitMq } from './client-proxy';

@Module({
  imports: [ClientProxyRabbitMq],
  exports: [ClientProxyRabbitMq],
})
export class ProxyrmqModule {}
