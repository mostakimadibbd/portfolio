import { Router } from 'express';
import { renderHome, renderProjectsPage, renderProjectPage, renderSitemap } from '../views/render.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';
import config from '../config/index.js';

const router = Router();

let cachedHtml = null;
let cachedAt = 0;
const CACHE_TTL = 60 * 1000;

const sendPage = (res, html) => {
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.type('html').send(html);
};

router.get('/sitemap.xml', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.type('application/xml').send(renderSitemap());
});

router.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${config.siteUrl.replace(/\/$/, '')}/sitemap.xml
`);
});

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

    sendPage(res, cachedHtml);
  }),
);

router.get(
  '/projects',
  asyncHandler(async (_req, res) => {
    sendPage(res, await renderProjectsPage());
  }),
);

router.get(
  '/projects/:slug',
  asyncHandler(async (req, res) => {
    const html = await renderProjectPage(req.params.slug);
    if (!html) throw ApiError.notFound(`No project found with slug "${req.params.slug}"`);
    sendPage(res, html);
  }),
);

export default router;
