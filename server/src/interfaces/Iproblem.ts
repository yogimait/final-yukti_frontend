import { Document } from 'mongoose';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ITestCase {
  input: string;
  output: string;
}

export interface IStarterCode {
  cpp: string;
  java: string;
  python: string;
  javascript: string;
}

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: Difficulty;
  topics: string[];         // 👈 Added this
  inputFormat: string;      // 👈 Added this
  outputFormat: string;     // 👈 Added this
  sampleInput: string;      // 👈 Added this
  sampleOutput: string;     // 👈 Added this
  starterCode: IStarterCode;
  testCases: ITestCase[];
  timeLimit: number;   
  memoryLimit: number; 
  createdAt: Date;
  updatedAt: Date;
}