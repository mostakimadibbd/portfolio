import { Router } from 'express';
import { z } from 'zod';
import { queryProjects, getProjectBySlug, getAllTags, getProjectStats } from '../services/projects.service.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

const listQuerySchema = z.object({
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  tag: z.string().trim().min(1).max(60).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

router.get(
  '/',
  validate('query', listQuerySchema),
  asyncHandler(async (req, res) => {
    const { items, meta } = queryProjects(req.validatedQuery);
    sendData(res, items, { meta });
  }),
);

router.get(
  '/tags',
  asyncHandler(async (_req, res) => {
    sendData(res, getAllTags());
  }),
);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    sendData(res, getProjectStats());
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const project = getProjectBySlug(req.params.slug);
    if (!project) throw ApiError.notFound(`No project found with slug "${req.params.slug}"`);
    sendData(res, project);
  }),
);

export default router;
