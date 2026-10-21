import 'dotenv/config';

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

export const config = {
  env,
  isProd: env === 'production',
  isTest: env === 'test',
  port: toInt(process.env.PORT, 3000),
  host: process.env.HOST ?? '0.0.0.0',
  siteUrl: process.env.SITE_URL ?? 'http://localhost:3000',
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
    messagesFile: process.env.MESSAGES_FILE ?? new URL('../../var/messages.json', import.meta.url).pathname,
    maxMessages: toInt(process.env.MAX_STORED_MESSAGES, 500),
  },
};

export default config;
