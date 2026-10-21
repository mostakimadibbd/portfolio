import { createApp } from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  logger.info(`Portfolio server ready`, {
    url: `http://localhost:${config.port}`,
    env: config.env,
  });
});

const shutdown = (signal) => {
  logger.info(`${signal} received — closing server`);
  server.close(() => {
    logger.info('Server closed cleanly');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger.error('Unhandled promise rejection', { reason: String(reason) }));
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { message: error.message, stack: error.stack });
  process.exit(1);
});

export default server;
