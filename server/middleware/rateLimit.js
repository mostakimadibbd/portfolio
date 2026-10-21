import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';

const handler = (_req, _res, next) => next(ApiError.tooMany('Too many requests. Please try again shortly.'));

/** Broad protection applied to the whole API surface. */
export const apiLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler,
});

/** Tight limit for the contact endpoint, which triggers outbound email. */
export const contactLimiter = rateLimit({
  windowMs: config.security.contactRateLimit.windowMs,
  max: config.security.contactRateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler,
  skip: () => config.isTest,
});

export default { apiLimiter, contactLimiter };
