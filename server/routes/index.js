import { Router } from 'express';
import config from '../config/index.js';
import projectRoutes from './projects.routes.js';
import profileRoutes from './profile.routes.js';
import contactRoutes from './contact.routes.js';
import siteRoutes from './site.routes.js';
import messageStore from '../store/messageStore.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData } from '../utils/response.js';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    sendData(res, {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: config.env,
      storedMessages: await messageStore.count(),
    });
  }),
);

router.use('/site', siteRoutes);
router.use('/profile', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/contact', contactRoutes);

export default router;
