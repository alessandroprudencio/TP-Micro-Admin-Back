import { Injectable, InternalServerErrorException, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class MongoIdValidation implements PipeTransform {
  transform(value: any) {
    if (!isValidObjectId(value)) {
      throw new InternalServerErrorException(`The value id ${value} is incorrect`);
    }
    return value;
  }
}
