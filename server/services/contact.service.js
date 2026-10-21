import { z } from 'zod';
import { sendContactEmail, saveMessage } from './mailer.service.js';
import logger from '../utils/logger.js';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be 80 characters or fewer'),
  email: z.string().trim().email('Please provide a valid email address').max(120),
  subject: z.string().trim().max(140).optional().default('Portfolio enquiry'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(4000, 'Message must be 4000 characters or fewer'),
  // Honeypot — bots fill hidden fields, humans never see them. The route
  // absorbs a filled value silently instead of storing it.
  company: z.string().max(200).optional().default(''),
});

/**
 * Persists the enquiry and attempts delivery. Delivery failures never block
 * the request: the message is safely stored regardless.
 */
export const submitContactMessage = async (payload) => {
  const { name, email, subject, message } = payload;

  const record = await saveMessage({ name, email, subject, message });

  try {
    const delivery = await sendContactEmail({ name, email, subject, message });
    return { record, delivery };
  } catch (error) {
    logger.error('Contact delivery failed (message stored)', { message: error.message });
    return { record, delivery: { delivered: false, reason: 'delivery_error' } };
  }
};

export default submitContactMessage;
