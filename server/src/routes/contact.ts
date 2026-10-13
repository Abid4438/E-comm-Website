import { Router } from 'express';

const router = Router();

const CONTACT_TOPICS: Record<string, string> = {
  orders: 'Order Status & Tracking',
  sizing: 'Product Sizing & Materials',
  returns: 'Returns & Exchanges',
  trade: 'Trade, Architecture & Hospitality',
  press: 'Press & Editorial Inquiries',
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Public contact form: send the inquiry to the configured MOSS inbox using Resend.
router.post('/', async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const topic = typeof body.topic === 'string' ? body.topic : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !topic || !message) {
    return res.status(400).json({ code: 'CONTACT_FIELDS_REQUIRED', error: 'Please provide your name, email, topic, and message.' });
  }
  if (name.length > 120 || email.length > 254 || message.length < 3 || message.length > 5000 || !isValidEmail(email)) {
    return res.status(400).json({ code: 'CONTACT_FIELDS_INVALID', error: 'Please check your email address and message length, then try again.' });
  }

  const topicLabel = CONTACT_TOPICS[topic];
  if (!topicLabel) {
    return res.status(400).json({ code: 'CONTACT_TOPIC_INVALID', error: 'Please select a valid contact topic.' });
  }

  const apiKey = (process.env.RESEND_API_KEY || process.env.RESEND_API_TOKEN || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.EMAIL_FROM_ADDRESS || '').trim();
  const recipient = (process.env.CONTACT_TO_EMAIL || 'Abidaliaslam282@gmail.com').trim();

  if (!apiKey || !from || !recipient) {
    console.error('[Contact Form] Email configuration is missing.');
    return res.status(503).json({
      code: 'CONTACT_EMAIL_NOT_CONFIGURED',
      error: 'The contact email service is not configured yet. Please try again later.',
    });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: email,
        subject: '[MOSS Contact Form] ' + topicLabel,
        text: [
          'New message received from the MOSS contact form.',
          '',
          'Name: ' + name,
          'Email: ' + email,
          'Topic: ' + topicLabel,
          '',
          'Message:',
          message,
        ].join('\n'),
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      console.error('[Contact Form Resend Error]', response.status, details.slice(0, 500));
      return res.status(502).json({
        code: 'CONTACT_EMAIL_SEND_FAILED',
        error: 'Your message could not be emailed right now. Please try again shortly.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Your message was sent to the MOSS support inbox.',
    });
  } catch (error) {
    console.error('[Contact Form Email Error]', error);
    return res.status(502).json({
      code: 'CONTACT_EMAIL_SEND_FAILED',
      error: 'Your message could not be emailed right now. Please try again shortly.',
    });
  }
});

export default router;
