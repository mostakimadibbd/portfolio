import { Router } from 'express';
import {
  renderAboutPage,
  renderContactPage,
  renderHome,
  renderNotFound,
  renderNowPage,
  renderProjectPage,
  renderProjectsPage,
  renderResumePage,
  renderRss,
  renderSitemap,
  renderUsesPage,
  renderWritingPage,
  renderWritingPost,
} from '../views/render.js';
import { getGithubSnapshot } from '../services/github.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

const router = Router();

let cachedHomeHtml = null;
let cachedAt = 0;
const CACHE_TTL = 60 * 1000;

const sendPage = (res, html, status = 200) => {
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.status(status).type('html').send(html.replaceAll('{{CSP_NONCE}}', res.locals.cspNonce));
};

router.get(
  '/sitemap.xml',
  asyncHandler(async (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.type('application/xml').send(await renderSitemap());
  }),
);

router.get(
  '/rss.xml',
  asyncHandler(async (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.type('application/rss+xml').send(await renderRss());
  }),
);

router.get('/robots.txt', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${config.siteUrl}/sitemap.xml
`);
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const now = Date.now();
    if (!cachedHomeHtml || now - cachedAt > CACHE_TTL) {
      cachedHomeHtml = await renderHome(await getGithubSnapshot());
      cachedAt = now;
      logger.debug('Home page re-rendered');
    }
    sendPage(res, cachedHomeHtml);
  }),
);

router.get(
  '/projects',
  asyncHandler(async (_req, res) => sendPage(res, await renderProjectsPage())),
);

router.get(
  '/projects/:slug',
  asyncHandler(async (req, res) => {
    const html = await renderProjectPage(req.params.slug);
    if (!html) return sendPage(res, await renderNotFound(), 404);
    sendPage(res, html);
  }),
);

router.get(
  '/about',
  asyncHandler(async (_req, res) => sendPage(res, await renderAboutPage())),
);

router.get(
  '/uses',
  asyncHandler(async (_req, res) => sendPage(res, await renderUsesPage())),
);

router.get(
  '/now',
  asyncHandler(async (_req, res) => sendPage(res, await renderNowPage())),
);

router.get(
  '/writing',
  asyncHandler(async (_req, res) => sendPage(res, await renderWritingPage())),
);

router.get(
  '/writing/:slug',
  asyncHandler(async (req, res) => {
    const html = await renderWritingPost(req.params.slug);
    if (!html) return sendPage(res, await renderNotFound(), 404);
    sendPage(res, html);
  }),
);

router.get(
  '/contact',
  asyncHandler(async (_req, res) => sendPage(res, await renderContactPage())),
);

router.get(
  '/resume',
  asyncHandler(async (_req, res) => sendPage(res, await renderResumePage())),
);

export default router;
