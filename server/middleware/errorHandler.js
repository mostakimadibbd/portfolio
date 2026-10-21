import config from '../config/index.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * 404 handler for unmatched routes.
 */
export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found`, { code: 'NOT_FOUND' }));
};

/**
 * Centralised error handler. Produces a consistent, client-safe payload and
 * never leaks stack traces outside development.
 */
export const errorHandler = (error, req, res, _next) => {
  const isApi = req.originalUrl.startsWith(config.apiPrefix) || req.path.startsWith('/api');

  let statusCode = error.statusCode ?? 500;
  let code = error.code ?? 'INTERNAL_ERROR';
  let message = error.message ?? 'Something went wrong';
  let details = error.details ?? null;

  if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Request body is not valid JSON';
  }

  if (code === 'INTERNAL_ERROR') {
    logger.error('Unhandled error', { path: req.originalUrl, message: error.message, stack: error.stack });
    if (config.isProd) message = 'An unexpected error occurred. Please try again later.';
  } else {
    logger.warn('Request rejected', { path: req.originalUrl, code, message });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(config.isProd ? {} : { stack: error.stack }),
    },
  });
};

export default errorHandler;
