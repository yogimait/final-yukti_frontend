import type { Request, Response } from 'express';
import { Problem } from '../models/Problem.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Create a new problem (Admin only ideally)
// @route   POST /api/problems
export const createProblem = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, difficulty, starterCode, testCases, timeLimit, memoryLimit } = req.body;

    // Basic Validation
    if (!title || !description || !testCases || testCases.length === 0) {
        throw new ApiError(400, "Title, Description and at least one Test Case are required");
    }

    const problem = await Problem.create({
        title,
        description,
        difficulty,
        starterCode, // Object { cpp: "", python: "" }
        testCases,   // Array of { input, output }
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

// @desc    Get all problems (List view for Lobby)
// @route   GET /api/problems
export const getAllProblems = asyncHandler(async (req: Request, res: Response) => {
    // Select specific fields only (exclude testCases and starterCode to save bandwidth)
    const problems = await Problem.find()
        .select('title difficulty acceptance tags') 
        .select('-testCases'); // Explicitly exclude testCases

    return res.status(200).json(
        new ApiResponse(200, problems, "Problems fetched successfully")
    );
});

// @desc    Get single problem by ID (For the Arena)
// @route   GET /api/problems/:id
export const getProblemById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const problem = await Problem.findById(id).select('-testCases'); // SECURITY: Don't send hidden cases!

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    return res.status(200).json(
        new ApiResponse(200, problem, "Problem details fetched successfully")
    );
});