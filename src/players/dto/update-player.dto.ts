import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @IsOptional()
  score?: number;

  @IsOptional()
  positionRanking?: number;

  @IsString()
  @IsOptional()
  cognitoId?: string;

  @IsString()
  @IsOptional()
  pushToken?: string;
}
