import { Controller, InternalServerErrorException } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ICategory } from './interfaces/category.interface';

const ackErrors: string[] = ['E11000'];

@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private categoryService: CategoriesService) {}

  @MessagePattern('find-all-category')
  async findAll(@Payload() name: string, @Ctx() context: RmqContext): Promise<ICategory[]> {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      return await this.categoryService.findAll(name);
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @MessagePattern('create-category')
  async create(@Payload() createCategoryDto: CreateCategoryDto, @Ctx() context: RmqContext): Promise<ICategory> {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      const resp = await this.categoryService.create(createCategoryDto);

      await channel.ack(originalMsg);

      return resp;
    } catch (error) {
      const filterAckErrors = ackErrors.filter((ackError) => error.message.includes(ackError));

      if (filterAckErrors) {
        await channel.ack(originalMsg);
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  @MessagePattern('find-one-category')
  async findOne(@Payload() id: string, @Ctx() context: RmqContext): Promise<ICategory> {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      return await this.categoryService.findOne(id);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @MessagePattern('update-category')
  async update(@Payload() updateCategory: any, @Ctx() context: RmqContext): Promise<ICategory> {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      const id: string = updateCategory.id;

      const category: ICategory = updateCategory.category;

      const resp = await this.categoryService.update(id, category);

      await channel.ack(originalMsg);

      return resp;
    } catch (error) {
      const filterAckErrors = ackErrors.filter((ackError) => error.message.includes(ackError));

      if (filterAckErrors) {
        await channel.ack(originalMsg);
      }
    }
  }

  @EventPattern('delete-category')
  async remove(@Payload() id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      await this.categoryService.delete(id);
    } finally {
      await channel.ack(originalMsg);
    }
  }
}
