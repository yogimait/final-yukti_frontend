import mongoose, { Schema, Model } from 'mongoose';
import type { IUser } from "../interfaces/Iuser.js";
const userSchema: Schema<IUser> = new Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true 
    },
    password: { 
      type: String, 
      required: true,
      select: false
    },
    rating: { 
      type: Number, 
      default: 1200,
      index: true // Indexing for faster matchmaking queries
    },
    college: {
      type: String,
      default: ''
    },
    matchesPlayed: { type: Number, default: 0 },
    matchesWon: { type: Number, default: 0 }
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);