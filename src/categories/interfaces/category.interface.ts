import { Document } from 'mongoose';
// import { IPlayer } from 'src/players/interfaces/player.interface';

export interface ICategory extends Document {
  name: string;
  description: string;
  // events: Array<Event>;
  // players: Array<IPlayer>;
  score: number;
}

export interface IEvent extends Document {
  name: string;
  operation: string;
  value: number;
}
