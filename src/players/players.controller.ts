import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext, RpcException } from '@nestjs/microservices';
import { generate } from 'generate-password';
import { AwsCognitoService } from 'src/aws/aws-cognito.service';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { ClientProxyRabbitMq } from 'src/proxyrmq/client-proxy';
import { CreatePlayerDto } from './dto/create-player.dto';
import { IPlayer } from './interfaces/player.interface';
import { PlayersService } from './players.service';

const ackErrors: string[] = ['E11000'];

@Controller('api/v1/players')
export class PlayersController {
  private clientRabbitMQChallenge = this.clientProxy.getClientProxyRabbitmq('micro-challenge-back');

  constructor(
    private cognito: AwsCognitoService,
    private playerService: PlayersService,
    private awsS3Service: AwsS3Service,
    private clientProxy: ClientProxyRabbitMq,
  ) {}

  @MessagePattern('find-all-player')
  async findAll(@Payload() name: string, @Ctx() context: RmqContext): Promise<IPlayer[]> {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      return await this.playerService.findAll(name);
    } catch (error) {
      throw new RpcException(error.message);
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('create-user-player')
  async create(@Payload() createPlayerDto: CreatePlayerDto, @Ctx() context: RmqContext): Promise<IPlayer> {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      /*
        IF NO PASSWORD IS BEING CREATED BY AN ADMIN, THEN WILL NOT BE CREATED USER ONLY ONE PLAYER
      */

      const password = generate({
        length: 12,
        numbers: true,
        uppercase: true,
      });

      const authRegisterDto = {
        name: createPlayerDto.name,
        email: createPlayerDto.email,
        password: createPlayerDto.password || password,
        phoneNumber: createPlayerDto.phoneNumber,
      };

      const userCognito = await this.cognito.register(authRegisterDto);

      createPlayerDto.cognitoId = userCognito.userSub;

      const avatar = createPlayerDto.avatar;

      delete createPlayerDto.avatar;

      const resp = await this.playerService.create(createPlayerDto);

      await channel.ack(originalMsg);

      // if you created player then you must create it on the other microservice too
      if (resp._id) {
        this.clientRabbitMQChallenge.emit('create-player', resp);
      }

      if (avatar) {
        const upload = await this.awsS3Service.uploadFile(avatar);

        if (upload) {
          const player = await this.playerService.update(resp._id, { avatar: upload.Location });

          return player;
        }
      }

      return resp;
    } catch (error) {
      const filterAckErrors = ackErrors.filter((ackError) => error.message.includes(ackError));

      if (filterAckErrors) {
        await channel.ack(originalMsg);
      }

      throw new RpcException(error.message);
    }
  }

  @MessagePattern('find-one-player')
  async findOne(@Payload() id: string, @Ctx() context: RmqContext): Promise<IPlayer> {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      return await this.playerService.findOne(id);
    } catch (error) {
      throw new RpcException(error.message);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @MessagePattern('update-player')
  async update(@Payload() updatePlayer: any, @Ctx() context: RmqContext): Promise<IPlayer> {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      const id: string = updatePlayer.id;

      const player: IPlayer = updatePlayer.player;

      const avatar = updatePlayer.avatar;

      delete updatePlayer.avatar;

      const resp = await this.playerService.update(id, player);

      if (resp.avatar) {
        // remove avatar from s3
        const keyFile = resp.avatar.replace(/^.*[\\\/]/, '');

        await this.awsS3Service.deleteFile(keyFile);
      }

      if (avatar) {
        const upload = await this.awsS3Service.uploadFile(avatar);

        if (upload) {
          const player = await this.playerService.update(resp._id, { avatar: upload.Location });

          await channel.ack(originalMsg);

          return player;
        }
      }

      await channel.ack(originalMsg);

      return resp;
    } catch (error) {
      const filterAckErrors = ackErrors.filter((ackError) => error.message.includes(ackError));

      if (filterAckErrors) {
        await channel.ack(originalMsg);
      }

      throw new RpcException(error.message);
    }
  }

  @EventPattern('delete-player')
  async remove(@Payload() id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      await this.playerService.delete(id);
    } catch (error) {
      throw new RpcException(error.message);
    } finally {
      await channel.ack(originalMsg);
    }
  }
  @EventPattern('upload-avatar')
  async uploadAvatar(@Payload() updatePlayer: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      const { id, avatar } = updatePlayer;
      const upload = await this.awsS3Service.uploadFile(avatar);

      if (upload) {
        await this.playerService.update(id, { avatar: upload.Location });
      }
    } catch (error) {
      throw new RpcException(error.message);
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('update-positions-rankings')
  async updatePositionRanking(@Payload() updatePositionsRankigs: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      for await (const iterator of updatePositionsRankigs) {
        const { _id, score, positionRanking } = iterator;

        await this.playerService.update(_id, { score, positionRanking });
      }

      await channel.ack(originalMsg);
    } catch (error) {
      const filterAckErrors = ackErrors.filter((ackError) => error.message.includes(ackError));

      if (filterAckErrors) {
        await channel.ack(originalMsg);
      }

      throw new RpcException(error.message);
    }
  }
}
