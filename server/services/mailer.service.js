import config from '../config/index.js';
import logger from '../utils/logger.js';
import messageStore from '../store/messageStore.js';

/**
 * Delivers a contact message to a configured JSON mail relay.
 */
export const sendContactEmail = async ({ name, email, subject, message }) => {
  const { endpoint, apiKey, from, to } = config.mail;

  if (!endpoint) {
    logger.info('Contact message received (no mail relay configured)', { name, email, subject });
    return { delivered: false, reason: 'not_configured' };
  }
  if (!from || !to) {
    throw new Error('MAIL_FROM and MAIL_TO are required when MAIL_ENDPOINT is configured');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: subject || `New portfolio enquiry from ${name}`,
      text: `${name} (${email}) wrote:\n\n${message}`,
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Mail relay responded with ${response.status}`);
  }

  return { delivered: true };
};

export const saveMessage = (payload) => messageStore.add(payload);

export default { sendContactEmail, saveMessage };
