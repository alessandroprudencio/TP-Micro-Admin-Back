import { IsEmail, IsMobilePhone, IsNotEmpty, IsObject, IsOptional, IsString, Matches } from 'class-validator';
import { ICategory } from 'src/categories/interfaces/category.interface';
import { Express } from 'express';

export class CreatePlayerDto {
  @IsMobilePhone('pt-BR')
  phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsOptional()
  avatar: Express.Multer.File;

  @IsNotEmpty()
  category: ICategory;

  @IsOptional()
  @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8})$/, {
    message: 'A senha deve conter 8 caracteres entre números, letras maiúsculas e  letras minúsculas',
  })
  password: string;

  @IsString()
  @IsOptional()
  cognitoId: string;
}
