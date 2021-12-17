import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AwsCognitoService } from 'src/aws/aws-cognito.service';
import { AwsS3Service } from 'src/aws/aws-s3.service';
import { CategoriesService } from 'src/categories/categories.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { IPlayer } from './interfaces/player.interface';
import { Player, PlayerDocument } from './schemas/player.schema';

@Injectable()
export class PlayersService {
  constructor(
    private cognito: AwsCognitoService,

    private awsS3Service: AwsS3Service,

    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,

    private categoriesService: CategoriesService,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<IPlayer> {
    try {
      await this.categoriesService.findOne(String(createPlayerDto.category));

      return await this.playerModel.create(createPlayerDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<IPlayer> {
    const player = await this.foundPlayerById(id);

    return await this.playerModel.findByIdAndUpdate(player.id, updatePlayerDto, {
      returnOriginal: false,
    });
  }

  async findOne(id: string): Promise<IPlayer> {
    return this.foundPlayerById(id);
  }

  async findAll(email?: string): Promise<IPlayer[]> {
    if (email) return await this.playerModel.find({ email: email });

    return await this.playerModel.find().populate('category', '_id name description score');
  }

  async delete(id: string): Promise<void> {
    try {
      const player = await this.foundPlayerById(id);

      if (!player) throw new RpcException(`Player with id: ${id} not found`);

      // remove user from cognito
      if (player.cognitoId) await this.cognito.deleteFromAdmin(player.cognitoId);

      // remove avatar from s3
      const keyFile = player.avatar.replace(/^.*[\\\/]/, '');

      this.awsS3Service.deleteFile(keyFile);

      // remove user from db
      await this.playerModel.deleteOne({ _id: id });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async foundPlayerById(id: string): Promise<IPlayer> {
    try {
      return await this.playerModel.findById(id).populate('category', '_id name description');
    } catch (error) {
      console.log('entrou no erro');
      throw new BadRequestException(error.message);
    }
  }
}
