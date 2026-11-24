import { Router } from 'express';
import { query } from '../db';
import { authenticateUser, requireAdmin, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

function formatOrder(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
    customer: typeof row.customer_info === 'string' ? JSON.parse(row.customer_info) : row.customer_info,
    customerId: row.customer_id || undefined,
    shippingAddress: typeof row.shipping_address === 'string' ? JSON.parse(row.shipping_address) : row.shipping_address,
    billingAddress: row.billing_address ? (typeof row.billing_address === 'string' ? JSON.parse(row.billing_address) : row.billing_address) : undefined,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
    subtotal: parseFloat(row.subtotal),
    shipping: parseFloat(row.shipping),
    tax: parseFloat(row.tax),
    discount: parseFloat(row.discount || '0'),
    discountCode: row.discount_code || undefined,
    total: parseFloat(row.total),
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    deliveryMethod: row.delivery_method,
    trackingNumber: row.tracking_number || undefined,
    carrier: row.carrier || undefined,
    estimatedDelivery: row.estimated_delivery || undefined,
    notes: row.notes || undefined,
  };
}

// GET /api/orders
router.get('/', authenticateUser, requireAdmin, async (_req, res) => {
  try {
    const result = await query(`SELECT * FROM orders ORDER BY date DESC`);
    res.json(result.rows.map(formatOrder));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/customer/:customerId
router.get('/customer/:customerId', authenticateUser, requireSelfOrAdmin('customerId'), async (req, res) => {
  try {
    const cid = req.params.customerId;
    const result = await query(
      `SELECT * FROM orders WHERE customer_id = $1 OR LOWER(customer_info->>'email') = LOWER($2) ORDER BY date DESC`,
      [cid, cid]
    );
    res.json(result.rows.map(formatOrder));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM orders WHERE LOWER(id) = LOWER($1)`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(formatOrder(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders (Create Order)
router.post('/', async (req, res) => {
  try {
    const { checkoutData, items, totals, customerId } = req.body;
    const configuredResult = await query<{ value: unknown }>(
      'SELECT value FROM store_settings WHERE key = $1',
      ['payment_methods'],
    );
    const configuredValue = configuredResult.rows[0]?.value;
    const configuredMethods = typeof configuredValue === 'string' ? JSON.parse(configuredValue) : configuredValue;
    const selectedMethod = Array.isArray(configuredMethods)
      ? configuredMethods.find((method: any) => method.id === checkoutData.paymentMethod)
      : undefined;
    if (!selectedMethod) {
      return res.status(400).json({ error: 'Select a payment method currently offered by the store.' });
    }

    const orderNumber = `${Date.now() % 100000}`.padStart(5, '0');
    const orderId = `MOS-2026-${orderNumber}`;
    const date = new Date().toISOString();

    const customerInfo = {
      firstName: checkoutData.firstName,
      lastName: checkoutData.lastName,
      email: checkoutData.email,
      phone: checkoutData.phone,
    };

    const shippingAddress = {
      id: `addr-${Date.now()}`,
      firstName: checkoutData.firstName,
      lastName: checkoutData.lastName,
      addressLine1: checkoutData.addressLine1,
      addressLine2: checkoutData.addressLine2 || '',
      city: checkoutData.city,
      state: checkoutData.state,
      district: checkoutData.district || '',
      postalCode: checkoutData.postalCode,
      country: checkoutData.country,
      phone: checkoutData.phone,
    };

    const paymentMethod = selectedMethod.label;

    const deliveryMethod =
      checkoutData.deliveryMethod === 'express'
        ? 'Express Courier (usually 1-3 working days; serviceability varies)'
        : checkoutData.deliveryMethod === 'overnight'
        ? 'Priority Courier (usually next working day in major cities; serviceability varies)'
        : 'Standard Pakistan Courier (usually 3-5 working days)';

    const trackingNumber = `MOSS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const carrier = 'Local courier partner';
    const workingDays = checkoutData.deliveryMethod === 'overnight' ? 1 : checkoutData.deliveryMethod === 'express' ? 3 : 5;
    const deliveryDate = new Date();
    let daysAdded = 0;
    while (daysAdded < workingDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) daysAdded += 1;
    }
    const estimatedDelivery = deliveryDate.toISOString().split('T')[0];

    // Find customer ID if not provided
    let finalCustomerId = customerId;
    if (!finalCustomerId && checkoutData.email) {
      const userRes = await query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [checkoutData.email]);
      if (userRes.rows.length > 0) {
        finalCustomerId = userRes.rows[0].id;
      }
    }

    await query(
      `INSERT INTO orders (
        id, date, customer_id, customer_info, shipping_address, billing_address,
        items, subtotal, shipping, tax, discount, discount_code, total, status,
        payment_method, payment_status, delivery_method, tracking_number, carrier,
        estimated_delivery, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        orderId,
        date,
        finalCustomerId || null,
        JSON.stringify(customerInfo),
        JSON.stringify(shippingAddress),
        null,
        JSON.stringify(items || []),
        totals.subtotal,
        totals.shipping,
        totals.tax,
        totals.discount || 0,
        checkoutData.discountCode || null,
        totals.total,
        'Processing',
        paymentMethod,
        'Paid',
        deliveryMethod,
        trackingNumber,
        carrier,
        estimatedDelivery,
        checkoutData.notes || null,
      ]
    );

    // Update stock for purchased products
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.product?.id) {
          await query(`UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2`, [item.quantity || 1, item.product.id]);
        }
      }
    }

    // Increment discount usage if discount code used
    if (checkoutData.discountCode) {
      await query(
        `UPDATE discounts SET usage_count = usage_count + 1 WHERE UPPER(code) = UPPER($1)`,
        [checkoutData.discountCode]
      );
    }

    const created = await query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    res.status(201).json(formatOrder(created.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { status, trackingNumber, carrier } = req.body;
    const existing = await query(`SELECT * FROM orders WHERE LOWER(id) = LOWER($1)`, [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const curr = existing.rows[0];

    await query(
      `UPDATE orders SET
        status = $1, tracking_number = $2, carrier = $3
       WHERE id = $4`,
      [
        status !== undefined ? status : curr.status,
        trackingNumber !== undefined ? trackingNumber : curr.tracking_number,
        carrier !== undefined ? carrier : curr.carrier,
        curr.id,
      ]
    );

    const updated = await query(`SELECT * FROM orders WHERE id = $1`, [curr.id]);
    res.json(formatOrder(updated.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const existing = await query(`SELECT * FROM orders WHERE LOWER(id) = LOWER($1)`, [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const curr = existing.rows[0];

    await query(
      `UPDATE orders SET status = 'Cancelled', payment_status = 'Refunded' WHERE id = $1`,
      [curr.id]
    );

    const updated = await query(`SELECT * FROM orders WHERE id = $1`, [curr.id]);
    res.json(formatOrder(updated.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
