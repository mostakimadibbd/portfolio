import { Router } from 'express';
import { z } from 'zod';
import profile from '../data/profile.js';
import skills from '../data/skills.js';
import experience from '../data/experience.js';
import { certifications, education, speaking } from '../data/certifications.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData } from '../utils/response.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    sendData(res, profile);
  }),
);

router.get(
  '/skills',
  asyncHandler(async (_req, res) => {
    sendData(res, skills);
  }),
);

router.get(
  '/experience',
  asyncHandler(async (_req, res) => {
    sendData(res, experience);
  }),
);

router.get(
  '/credentials',
  asyncHandler(async (_req, res) => {
    sendData(res, { certifications, education, speaking });
  }),
);

export default router;
