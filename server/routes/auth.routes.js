import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getCurrentUser } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();
const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

router.get('/me', syncLimiter, requireAuth, getCurrentUser);

export default router;
