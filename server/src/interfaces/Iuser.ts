import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Optional kyunki query mein exclude kar sakte hain
  rating: number;
  college?: string;
  matchesPlayed: number;
  matchesWon: number;
  createdAt: Date;
  updatedAt: Date;
}