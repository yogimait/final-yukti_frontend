import mongoose, { Schema, Model } from 'mongoose';
import type { IProblem } from "../interfaces/Iproblem.js";

const testCaseSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true }
}, { _id: false }); // Test cases ko alag ID ki zarurat nahi hai

const problemSchema: Schema<IProblem> = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String, 
      required: true 
    },
    difficulty: { 
      type: String, 
      enum: ['Easy', 'Medium', 'Hard'], 
      default: 'Easy',
      index: true // Helps in filtering problems efficiently
    },
    starterCode: {
      cpp: { type: String, default: '' },
      java: { type: String, default: '' },
      python: { type: String, default: '' },
      javascript: { type: String, default: '' }
    },
    testCases: [testCaseSchema],
    timeLimit: { type: Number, default: 2.0 },
    memoryLimit: { type: Number, default: 256 }
  },
  { 
    timestamps: true 
  }
);

export const Problem: Model<IProblem> = mongoose.model<IProblem>('Problem', problemSchema);