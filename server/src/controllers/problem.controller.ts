import type { Request, Response } from 'express';
import { Problem } from '../models/Problem.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Create a new problem (Admin usage or Postman)
// @route   POST /api/problems
export const createProblem = asyncHandler(async (req: Request, res: Response) => {
    // 👇 Updated destructuring based on New Schema
    const { 
        title, description, difficulty, topics, 
        inputFormat, outputFormat, sampleInput, sampleOutput,
        starterCode, testCases, timeLimit, memoryLimit 
    } = req.body;

    // Basic Validation
    if (!title || !description || !testCases || testCases.length === 0) {
        throw new ApiError(400, "Title, Description and at least one Test Case are required");
    }

    const problem = await Problem.create({
        title,
        description,
        difficulty,
        topics: topics || [], // Default empty array
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        starterCode, 
        testCases,   
        timeLimit,
        memoryLimit
    });

    if (!problem) {
        throw new ApiError(500, "Failed to create problem");
    }

    return res.status(201).json(
        new ApiResponse(201, problem, "Problem created successfully")
    );
});

// @desc    Get all problems (For Practice Section)
// @route   GET /api/problems
export const getAllProblems = asyncHandler(async (req: Request, res: Response) => {
    // 👇 'tags' ko hata kar 'topics' kar diya
    // 'testCases' aur 'starterCode' ko hataya taaki response fast ho
    const problems = await Problem.find()
        .select('title difficulty topics inputFormat') 
        .select('-testCases -starterCode'); 

    return res.status(200).json(
        new ApiResponse(200, problems, "Problems fetched successfully")
    );
});

// @desc    Get single problem by ID (For the Arena)
// @route   GET /api/problems/:id
export const getProblemById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // 👇 testCases ko hide karna zaroori hai (Cheating prevent karne ke liye)
    // Frontend ko sirf 'sampleInput/Output' milna chahiye, hidden test cases nahi.
    const problem = await Problem.findById(id).select('-testCases'); 

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    return res.status(200).json(
        new ApiResponse(200, problem, "Problem details fetched successfully")
    );
});

// 🆕 NEW: Random Problem for Matchmaking
// @desc    Get a random problem (filtered by difficulty)
// @route   GET /api/problems/random?difficulty=Medium
export const getRandomProblem = asyncHandler(async (req: Request, res: Response) => {
    const { difficulty } = req.query;

    const matchStage: any = {};
    if (difficulty) {
        matchStage.difficulty = difficulty;
    }

    // MongoDB Aggregation to pick 1 random document
    const problems = await Problem.aggregate([
        { $match: matchStage }, // Filter by difficulty (Optional)
        { $sample: { size: 1 } }, // Pick 1 random
        { $project: { testCases: 0 } } // Exclude hidden test cases
    ]);

    if (!problems.length) {
        throw new ApiError(404, "No problems found");
    }

    return res.status(200).json(
        new ApiResponse(200, problems[0], "Random problem fetched")
    );
});