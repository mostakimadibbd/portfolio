import config from '../config/index.js';
import logger from '../utils/logger.js';

const COLORS = { method: '\u001b[35m', url: '\u001b[36m', status: '\u001b[32m', ms: '\u001b[90m', reset: '\u001b[0m' };

const statusColor = (status) => {
  if (status >= 500) return '\u001b[31m';
  if (status >= 400) return '\u001b[33m';
  return '\u001b[32m';
};

/**
 * Compact request logger. Health checks are skipped to keep output readable.
 * Production emits structured JSON through the shared logger; development
 * prints a colourised single line.
 */
export const requestLogger = (req, res, next) => {
  if (req.path === `${config.apiPrefix}/health`) return next();

  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    if (config.isProd) {
      logger.info('request', {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: Number(durationMs.toFixed(1)),
      });
      return;
    }

    const line = `${COLORS.method}${req.method.padEnd(6)}${COLORS.reset} ${COLORS.url}${req.originalUrl}${COLORS.reset} ${statusColor(res.statusCode)}${res.statusCode}${COLORS.reset} ${COLORS.ms}${durationMs.toFixed(1)}ms${COLORS.reset}`;
    process.stdout.write(`${line}\n`);
  });

  next();
};

export default requestLogger;
