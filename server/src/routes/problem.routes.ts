import express from 'express';
import { createProblem, getAllProblems, getProblemById } from '../controllers/problem.controller.js';
// import { protect } from '../middlewares/authMiddleware'; // Future use

const router = express.Router();

router.route('/')
    .get(getAllProblems)
    .post(createProblem); 

router.route('/:id')
    .get(getProblemById);

export default router;