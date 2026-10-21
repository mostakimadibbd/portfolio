import { Router } from 'express';
import { renderHome } from '../views/render.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const router = Router();

let cachedHtml = null;
let cachedAt = 0;
const CACHE_TTL = 60 * 1000;

/**
 * Server-rendered home page.
 *
 * Rendering happens on the server so the first paint needs no client
 * JavaScript, the HTML is fully crawlable, and the content is always in
 * sync with the data layer. The result is memoised for a short window.
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const now = Date.now();

    if (!cachedHtml || now - cachedAt > CACHE_TTL) {
      cachedHtml = await renderHome();
      cachedAt = now;
      logger.debug('Home page re-rendered');
    }

    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.type('html').send(cachedHtml);
  }),
);

export default router;
