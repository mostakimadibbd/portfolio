import { Router } from 'express';
import { contactSchema, submitContactMessage } from '../services/contact.service.js';
import { validate } from '../middleware/validate.js';
import { contactLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/response.js';

const router = Router();

router.post(
  '/',
  contactLimiter,
  validate('body', contactSchema),
  asyncHandler(async (req, res) => {
    const { company, ...payload } = req.body;

    // Honeypot tripped — pretend everything is fine, store nothing.
    if (company) {
      return sendCreated(res, { received: true, message: 'Thanks — your message has been received.' });
    }

    const { record, delivery } = await submitContactMessage(payload);

    sendCreated(res, {
      id: record.id,
      received: true,
      delivered: delivery.delivered,
      message: 'Thanks — your message has been received. I reply to every enquiry within two business days.',
    });
  }),
);

export default router;
