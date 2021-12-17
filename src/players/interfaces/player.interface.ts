import { Document } from 'mongoose';
import { ICategory } from 'src/categories/interfaces/category.interface';

export interface IPlayer extends Document {
  phoneNumber: string;
  email: string;
  name: string;
  avatar: string;
  category: ICategory;
  cognitoId?: string;
  score: number;
  positionRanking: number;
}
