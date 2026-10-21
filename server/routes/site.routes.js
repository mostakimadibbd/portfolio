import { Router } from 'express';
import profile from '../data/profile.js';
import skills from '../data/skills.js';
import experience from '../data/experience.js';
import { certifications, education, speaking } from '../data/certifications.js';
import { getAllTags, getProjectStats } from '../services/projects.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData } from '../utils/response.js';

const router = Router();

/**
 * Aggregate payload — the frontend fetches the entire site in a single
 * round-trip, which removes a waterfall of requests on first paint.
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    sendData(res, {
      profile,
      skills,
      experience,
      credentials: { certifications, education, speaking },
      projectStats: getProjectStats(),
      tags: getAllTags(),
    });
  }),
);

export default router;
