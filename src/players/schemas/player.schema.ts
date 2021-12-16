import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { ICategory } from 'src/categories/interfaces/category.interface';

export type PlayerDocument = Player & Document;

@Schema({ timestamps: true, collection: 'players' })
export class Player {
  @Prop({ required: true, maxlength: 250 })
  name: string;

  @Prop({ required: true, maxlength: 15 })
  phoneNumber: string;

  @Prop({ required: true, maxlength: 250, unique: true })
  email: string;

  @Prop()
  ranking: string;

  @Prop({ maxlength: 250 })
  avatar: string;

  @Prop()
  positionRanking: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: ICategory;

  @Prop({ required: true })
  cognitoId: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
