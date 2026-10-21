import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import config from '../config/index.js';

/**
 * Security headers, CORS policy and compression.
 */
export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        // helmet enables this by default; in development it would rewrite
        // http://localhost asset requests to https and break them.
        'upgrade-insecure-requests': config.isProd ? [] : null,
      },
    },
    // frame-ancestors 'none' in the CSP is stricter and more modern than X-Frame-Options.
    frameGuard: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: config.isProd ? { maxAge: 15552000, includeSubDomains: true } : false,
  }),

  cors({
    origin: (origin, callback) => {
      const allowed = config.security.corsOrigins;
      if (!origin || allowed.includes('*') || allowed.includes(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400,
  }),

  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  }),
];

export default securityMiddleware;
