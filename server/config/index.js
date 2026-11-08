import 'dotenv/config';
import { fileURLToPath } from 'node:url';

const toList = (value, fallback = []) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : fallback;

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = process.env.NODE_ENV ?? 'development';
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;

export const config = {
  env,
  isProd: env === 'production',
  isTest: env === 'test',
  isServerless:
    env !== 'test' &&
    (process.env.SERVERLESS === 'true' ||
      Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTIONS_WORKER_RUNTIME)),
  port: toInt(process.env.PORT, 3000),
  host: process.env.HOST ?? '0.0.0.0',
  siteUrl: (process.env.SITE_URL ?? vercelUrl ?? 'http://localhost:3000').replace(/\/$/, ''),
  apiPrefix: '/api/v1',

  security: {
    corsOrigins: toList(process.env.CORS_ORIGINS, ['*']),
    rateLimit: {
      windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: toInt(process.env.RATE_LIMIT_MAX, 300),
    },
    contactRateLimit: {
      windowMs: toInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000),
      max: toInt(process.env.CONTACT_RATE_LIMIT_MAX, 5),
    },
  },

  mail: {
    // Any HTTP mail relay that accepts a JSON POST (Resend, Postmark, SMTP-webhooks...).
    endpoint: process.env.MAIL_ENDPOINT ?? null,
    apiKey: process.env.MAIL_API_KEY ?? null,
    from: process.env.MAIL_FROM ?? 'Portfolio <onboarding@resend.dev>',
    to: process.env.MAIL_TO ?? null,
  },

  storage: {
    messagesFile:
      process.env.MESSAGES_FILE ?? fileURLToPath(new URL('../../var/messages.json', import.meta.url)),
    maxMessages: toInt(process.env.MAX_STORED_MESSAGES, 500),
  },
};

export default config;
