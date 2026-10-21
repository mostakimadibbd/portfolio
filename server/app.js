import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config/index.js';
import { securityMiddleware } from './middleware/security.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';
import pageRoutes from './routes/pages.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  if (config.isProd) app.set('trust proxy', 1);

  app.use(securityMiddleware);
  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));

  if (!config.isTest) app.use(requestLogger);

  // Server-rendered pages come before static assets so "/" always wins.
  app.use('/', pageRoutes);

  // Static assets — long-lived caching with revalidation for HTML.
  app.use(
    express.static(publicDir, {
      etag: true,
      lastModified: true,
      maxAge: config.isProd ? '7d' : 0,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
      },
    }),
  );

  app.use(config.apiPrefix, apiLimiter, apiRoutes);

  app.get('/healthz', (_req, res) => res.redirect(`${config.apiPrefix}/health`));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
