import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AwsModule } from 'src/aws/aws.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { ClientProxyRabbitMq } from 'src/proxyrmq/client-proxy';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player, PlayerSchema } from './schemas/player.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]), CategoriesModule, AwsModule],
  controllers: [PlayersController],
  providers: [PlayersService, ClientProxyRabbitMq],
  exports: [PlayersService],
})
export class PlayersModule {}
