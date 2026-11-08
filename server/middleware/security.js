import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { randomBytes } from 'node:crypto';
import config from '../config/index.js';

const createNonce = (_req, res, next) => {
  res.locals.cspNonce = randomBytes(18).toString('base64');
  next();
};

const setContentSecurityPolicy = (_req, res, next) => {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "object-src 'none'",
    `script-src 'self' 'nonce-${res.locals.cspNonce}'`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
  ];
  if (config.isProd) directives.push('upgrade-insecure-requests');
  res.setHeader('Content-Security-Policy', directives.join('; '));
  next();
};

/**
 * Security headers, CORS policy and compression.
 */
export const securityMiddleware = [
  createNonce,
  helmet({
    contentSecurityPolicy: false,
    // frame-ancestors 'none' in the CSP is stricter and more modern than X-Frame-Options.
    frameGuard: false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: config.isProd ? { maxAge: 15552000, includeSubDomains: true } : false,
  }),
  setContentSecurityPolicy,

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
