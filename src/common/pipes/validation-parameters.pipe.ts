import { ArgumentMetadata, Injectable, InternalServerErrorException, PipeTransform } from '@nestjs/common';

@Injectable()
export class PlayersValidationParameterPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value === '' && metadata.type === 'query') {
      throw new InternalServerErrorException(`The value from ${metadata.data} is required`);
    }

    return value;
  }
}
