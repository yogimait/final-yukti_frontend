import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';    
import { ApiResponse } from '../utils/ApiResponse.js';  

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '7d',
  });
};

// Wrapped with asyncHandler
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      // Throw error instead of res.status...
      throw new ApiError(400, "All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(409, "User with email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Send Standard Response
    return res.status(201).json(
        new ApiResponse(201, { user: createdUser, token: generateToken(user.id) }, "User registered successfully")
    );
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Username and password is required");
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const loggedInUser = await User.findById(user._id).select("-password");

    return res.status(200).json(
        new ApiResponse(200, { user: loggedInUser, token: generateToken(user.id) }, "User logged In Successfully")
    );
});