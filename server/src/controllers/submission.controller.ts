import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { executeCode } from '../services/judge0.service.js';
import { getLanguageId } from '../utils/constants.js';

// @desc    Run code locally (Test Run)
// @route   POST /api/submissions/run
export const runCode = asyncHandler(async (req: Request, res: Response) => {
    const { language, code, stdin } = req.body;

    if (!language || !code) {
        throw new ApiError(400, "Language and Source Code are required");
    }

    // 1. Convert lang string (e.g., 'python') to ID (e.g., 71)
    let langId;
    try {
        langId = getLanguageId(language);
    } catch (error) {
        throw new ApiError(400, "Unsupported Language");
    }

    // 2. Call Judge0 Service
    const result = await executeCode(langId, code, stdin);

    // 3. Response Format
    // Judge0 result returns: { stdout, stderr, compile_output, time, memory, status: { id, description } }
    
    return res.status(200).json(
        new ApiResponse(200, result, "Code Executed Successfully")
    );
});