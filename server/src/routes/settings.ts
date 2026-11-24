import { Router } from 'express';
import { query } from '../db';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/payment-methods', async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const result = await query<{ value: unknown }>(
      'SELECT value FROM store_settings WHERE key = $1',
      ['payment_methods'],
    );
    const value = result.rows[0]?.value;
    const methods = typeof value === 'string' ? JSON.parse(value) : value;
    res.json(Array.isArray(methods) ? methods : []);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Unable to load payment methods' });
  }
});

router.get('/delivery-methods', async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const result = await query<{ value: unknown }>(
      'SELECT value FROM store_settings WHERE key = $1',
      ['delivery_methods'],
    );
    const value = result.rows[0]?.value;
    const methods = typeof value === 'string' ? JSON.parse(value) : value;
    res.json(Array.isArray(methods) ? methods : []);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Unable to load delivery methods' });
  }
});

router.put('/payment-methods', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const incoming = req.body?.paymentMethods;
    if (!Array.isArray(incoming) || incoming.length > 20) {
      return res.status(400).json({ error: 'Add no more than 20 payment methods.' });
    }

    const paymentMethods = incoming.map((method: any) => ({
      id: typeof method?.id === 'string' ? method.id.trim() : '',
      label: typeof method?.label === 'string' ? method.label.trim() : '',
    }));
    const ids = paymentMethods.map((method) => method.id.toLowerCase());
    const labels = paymentMethods.map((method) => method.label.toLowerCase());
    if (
      paymentMethods.some((method) => !/^[a-z0-9_-]{1,80}$/i.test(method.id) || !method.label || method.label.length > 50)
      || new Set(ids).size !== ids.length
      || new Set(labels).size !== labels.length
    ) {
      return res.status(400).json({ error: 'Payment methods need unique IDs and labels of up to 50 characters.' });
    }

    await query(
      `INSERT INTO store_settings (key, value, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      ['payment_methods', JSON.stringify(paymentMethods)],
    );
    return res.json(paymentMethods);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unable to save payment methods' });
  }
});

router.put('/delivery-methods', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const incoming = req.body?.deliveryMethods;
    if (!Array.isArray(incoming) || incoming.length > 20) {
      return res.status(400).json({ error: 'Add no more than 20 delivery methods.' });
    }
    const deliveryMethods = incoming.map((method: any) => ({
      id: typeof method?.id === 'string' ? method.id.trim() : '',
      label: typeof method?.label === 'string' ? method.label.trim() : '',
      timing: typeof method?.timing === 'string' ? method.timing.trim() : '',
      fee: Number(method?.fee),
    }));
    const ids = deliveryMethods.map((method) => method.id.toLowerCase());
    const labels = deliveryMethods.map((method) => method.label.toLowerCase());
    if (
      deliveryMethods.some((method) => !/^[a-z0-9_-]{1,80}$/i.test(method.id)
        || !method.label || method.label.length > 50
        || method.timing.length > 100 || !Number.isFinite(method.fee) || method.fee < 0 || method.fee > 10000000)
      || new Set(ids).size !== ids.length
      || new Set(labels).size !== labels.length
    ) {
      return res.status(400).json({ error: 'Delivery methods need unique IDs and labels, valid timing, and a fee from 0 to 10000000.' });
    }
    await query(
      `INSERT INTO store_settings (key, value, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      ['delivery_methods', JSON.stringify(deliveryMethods)],
    );
    return res.json(deliveryMethods);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unable to save delivery methods' });
  }
});

export default router;
