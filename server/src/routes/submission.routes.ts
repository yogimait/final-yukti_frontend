import { Router } from 'express';
import { runCode } from '../controllers/submission.controller.js';

const router = Router();

router.post('/run', runCode);

export default router;