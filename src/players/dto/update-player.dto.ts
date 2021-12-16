import { IsNotEmpty, IsString } from 'class-validator';
import { ICategory } from 'src/categories/interfaces/category.interface';

export class UpdatePlayerDto {
  // @IsMobilePhone('pt-BR')
  // phoneNumber?: string;

  // @IsNotEmpty()
  // @IsString()
  // name?: string;

  @IsString()
  avatar?: string;

  @IsNotEmpty()
  category?: ICategory;
}
