/**
 * Minimal, dependency-free leveled logger.
 * Human friendly in development, structured JSON in production.
 */
import config from '../config/index.js';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[process.env.LOG_LEVEL ?? (config.isProd ? 'info' : 'debug')];

const COLORS = {
  debug: '\u001b[90m',
  info: '\u001b[36m',
  warn: '\u001b[33m',
  error: '\u001b[31m',
  reset: '\u001b[0m',
};

const emit = (level, message, meta = {}) => {
  if (LEVELS[level] < threshold) return;

  if (config.isProd) {
    const payload = JSON.stringify({
      level,
      time: new Date().toISOString(),
      message,
      ...(Object.keys(meta).length ? { meta } : {}),
    });
    process.stdout.write(`${payload}\n`);
    return;
  }

  const time = new Date().toISOString().slice(11, 23);
  const color = COLORS[level] ?? '';
  const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  process.stdout.write(`${color}${time} ${level.toUpperCase().padEnd(5)}${COLORS.reset} ${message}${details}\n`);
};

export const logger = {
  debug: (message, meta) => emit('debug', message, meta),
  info: (message, meta) => emit('info', message, meta),
  warn: (message, meta) => emit('warn', message, meta),
  error: (message, meta) => emit('error', message, meta),
};

export default logger;
