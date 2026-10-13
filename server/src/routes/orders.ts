import { Router, Request, Response } from 'express';
import { query } from '../db.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getJwtSecret, requireAdmin as requireAdminGuard, requireUserOrAdmin } from '../security.js';

const router = Router();
const JWT_SECRET = getJwtSecret();

async function saveCheckoutCustomerDetails(customerId: string, checkoutData: any) {
  const firstName = String(checkoutData.firstName || '').trim();
  const lastName = String(checkoutData.lastName || '').trim();
  const phone = String(checkoutData.phone || '').trim();

  await query(
    `UPDATE users SET
       first_name = COALESCE(NULLIF($1, ''), first_name),
       last_name = COALESCE(NULLIF($2, ''), last_name),
       phone = COALESCE(NULLIF($3, ''), phone)
     WHERE id = $4`,
    [firstName, lastName, phone, customerId]
  );

  const addressLine1 = String(checkoutData.addressLine1 || '').trim();
  const city = String(checkoutData.city || '').trim();
  const state = String(checkoutData.state || '').trim();
  const postalCode = String(checkoutData.postalCode || '').trim();
  const country = String(checkoutData.country || '').trim();
  if (!addressLine1 || !city || !state || !postalCode || !country) return;

  const addressLine2 = String(checkoutData.addressLine2 || '').trim();
  const existing = await query(
    `SELECT id FROM addresses
     WHERE user_id = $1
       AND LOWER(TRIM(address_line1)) = LOWER(TRIM($2))
       AND LOWER(TRIM(COALESCE(address_line2, ''))) = LOWER(TRIM($3))
       AND LOWER(TRIM(city)) = LOWER(TRIM($4))
       AND LOWER(TRIM(state)) = LOWER(TRIM($5))
       AND LOWER(TRIM(postal_code)) = LOWER(TRIM($6))
       AND LOWER(TRIM(country)) = LOWER(TRIM($7))
     LIMIT 1`,
    [customerId, addressLine1, addressLine2, city, state, postalCode, country]
  );

  if (existing.rows.length) {
    await query(
      'UPDATE addresses SET first_name = $1, last_name = $2, phone = $3 WHERE id = $4 AND user_id = $5',
      [firstName, lastName, phone, existing.rows[0].id, customerId]
    );
    return;
  }

  const count = await query('SELECT COUNT(*)::int AS total FROM addresses WHERE user_id = $1', [customerId]);
  const isDefault = Number(count.rows[0]?.total || 0) === 0;
  const addressId = 'addr-' + crypto.randomUUID();
  await query(
    `INSERT INTO addresses (
      id, user_id, first_name, last_name, company, address_line1, address_line2,
      city, state, postal_code, country, phone, is_default
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [addressId, customerId, firstName, lastName, null, addressLine1, addressLine2 || null,
      city, state, postalCode, country, phone, isDefault]
  );
  if (isDefault) {
    await query('UPDATE users SET default_address_id = $1 WHERE id = $2', [addressId, customerId]);
  }
}

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
router.get('/', async (req, res) => {
  try {
    if (!(await requireAdminGuard(req, res))) return;
    const result = await query(`SELECT * FROM orders ORDER BY date DESC`);
    res.json(result.rows.map(formatOrder));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/customer/:customerId
router.get('/customer/:customerId', async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Sign in to view customer orders.' });
    }

    let claims: any;
    try {
      claims = jwt.verify(authorization.slice(7), JWT_SECRET) as any;
    } catch {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }

    const cid = req.params.customerId;
    if (String(claims.id) !== cid && claims.role !== 'admin') {
      return res.status(403).json({ error: 'You can only view your own orders.' });
    }

    const customerRes = await query('SELECT id, email FROM users WHERE id = $1', [cid]);
    if (!customerRes.rows.length) return res.status(404).json({ error: 'Customer not found.' });
    const email = customerRes.rows[0].email;

    const result = await query(
      `SELECT * FROM orders
       WHERE customer_id = $1 OR LOWER(TRIM(customer_info->>'email')) = LOWER(TRIM($2))
       ORDER BY date DESC`,
      [cid, email]
    );
    res.json(result.rows.map(formatOrder));
  } catch (err: any) {
    console.error('[Customer Orders Error]', err);
    res.status(500).json({ error: 'Could not load customer orders.' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM orders WHERE LOWER(id) = LOWER($1)`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = result.rows[0];
    if (!(await requireUserOrAdmin(req, res, String(order.customer_id || '')))) return;
    res.json(formatOrder(order));
  } catch (err: any) {
    console.error('[Order Detail Error]', err);
    res.status(500).json({ error: 'Could not load order.' });
  }
});

// POST /api/orders (Create Order)
router.post('/', async (req, res) => {
  try {
    const { checkoutData, items, totals } = req.body;
    if (!checkoutData || typeof checkoutData !== 'object' || !Array.isArray(items) || items.length === 0 || items.length > 100 || !totals) {
      return res.status(400).json({ error: 'Checkout details and at least one item are required.' });
    }
    let verifiedSubtotal = 0;
    const verifiedItems: any[] = [];
    for (const item of items) {
      const productId = item?.product?.id;
      const quantity = Number(item?.quantity);
      if (typeof productId !== 'string' || !productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return res.status(400).json({ error: 'Invalid product or quantity in checkout.' });
      }
      const productResult = await query('SELECT id, name, price, stock, images FROM products WHERE id = $1 AND LOWER(status) = $2', [productId, 'active']);
      if (!productResult.rows.length) return res.status(400).json({ error: 'A selected product is unavailable.' });
      const product = productResult.rows[0];
      if (Number(product.stock) < quantity) return res.status(409).json({ error: 'Insufficient stock for ' + product.name + '.' });
      const unitPrice = Number(product.price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return res.status(400).json({ error: 'Invalid product pricing.' });
      verifiedSubtotal += unitPrice * quantity;
      verifiedItems.push({ ...item, product: { ...item.product, id: product.id, name: product.name, price: unitPrice, images: product.images } });
    }
    const requestedShipping = Number(totals.shipping);
    const requestedTax = Number(totals.tax);
    if (!Number.isFinite(requestedShipping) || requestedShipping < 0 || requestedShipping > 100 ||
        !Number.isFinite(requestedTax) || requestedTax < 0 || requestedTax > verifiedSubtotal * 0.2) {
      return res.status(400).json({ error: 'Invalid shipping or tax amount.' });
    }
    let verifiedDiscount = 0;
    const cleanDiscountCode = typeof checkoutData.discountCode === 'string' ? checkoutData.discountCode.trim().toUpperCase() : '';
    if (cleanDiscountCode) {
      const discountResult = await query('SELECT * FROM discounts WHERE UPPER(code) = $1', [cleanDiscountCode]);
      if (!discountResult.rows.length) return res.status(400).json({ error: 'Invalid discount code.' });
      const d = discountResult.rows[0];
      if (!d.is_active || new Date(d.expires_at).getTime() < Date.now() ||
          (d.max_uses != null && Number(d.usage_count) >= Number(d.max_uses)) ||
          (d.min_spend != null && verifiedSubtotal < Number(d.min_spend))) {
        return res.status(400).json({ error: 'Discount code is no longer eligible.' });
      }
      verifiedDiscount = Math.round(verifiedSubtotal * Math.min(100, Math.max(0, Number(d.percentage))) / 100 * 100) / 100;
    }
    const verifiedTotals = {
      subtotal: Math.round(verifiedSubtotal * 100) / 100,
      shipping: Math.round(requestedShipping * 100) / 100,
      tax: Math.round(requestedTax * 100) / 100,
      discount: verifiedDiscount,
      total: Math.max(0, Math.round((verifiedSubtotal + requestedShipping + requestedTax - verifiedDiscount) * 100) / 100),
    };
    let authenticatedCustomerId: string | null = null;
    const authorization = req.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      try {
        const claims = jwt.verify(authorization.slice(7), JWT_SECRET) as any;
        authenticatedCustomerId = String(claims.id || '');
        if (!authenticatedCustomerId) return res.status(401).json({ error: 'Invalid customer session.' });
      } catch {
        return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
      }
      const storedUser = await query('SELECT id FROM users WHERE id = $1', [authenticatedCustomerId]);
      if (!storedUser.rows.length) return res.status(401).json({ error: 'Customer account no longer exists.' });
    }

    const orderId = `MOS-${new Date().getFullYear()}-${crypto.randomBytes(10).toString('hex').toUpperCase()}`;
    const date = new Date().toISOString();

    const customerInfo = {
      firstName: checkoutData.firstName,
      lastName: checkoutData.lastName,
      email: String(checkoutData.email || '').trim().toLowerCase(),
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
      postalCode: checkoutData.postalCode,
      country: checkoutData.country,
      phone: checkoutData.phone,
    };

    const paymentMethod =
      checkoutData.paymentMethod === 'apple_pay'
        ? 'Apple Pay'
        : checkoutData.paymentMethod === 'klarna'
        ? 'Klarna'
        : 'Credit Card';

    const deliveryMethod =
      checkoutData.deliveryMethod === 'express'
        ? 'Express Courier (1-2 business days)'
        : checkoutData.deliveryMethod === 'overnight'
        ? 'Overnight Priority'
        : 'Standard Ground (3-5 business days)';

    const trackingNumber = `MOSS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const carrier = 'DHL Express';
    const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Only a verified session can immediately associate this order with an account.
    // Guest orders keep all supplied details on the order and are linked after email verification/login.
    const finalCustomerId: string | null = authenticatedCustomerId;

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
        JSON.stringify(verifiedItems),
        verifiedTotals.subtotal,
        verifiedTotals.shipping,
        verifiedTotals.tax,
        verifiedTotals.discount,
        cleanDiscountCode || null,
        verifiedTotals.total,
        'Processing',
        paymentMethod,
        'Pending',
        deliveryMethod,
        trackingNumber,
        carrier,
        estimatedDelivery,
        checkoutData.notes || null,
      ]
    );

    if (finalCustomerId) {
      try {
        await saveCheckoutCustomerDetails(finalCustomerId, checkoutData);
      } catch (profileError) {
        // The order is already saved; log profile-save issues without misreporting the purchase as failed.
        console.error('[Checkout Profile Save Error]', profileError);
      }
    }

    // Update stock for purchased products
    if (Array.isArray(verifiedItems)) {
      for (const item of verifiedItems) {
        if (item.product?.id) {
          await query(`UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1`, [item.quantity, item.product.id]);
        }
      }
    }

    // Increment discount usage if discount code used
    if (checkoutData.discountCode) {
      await query(
        `UPDATE discounts SET usage_count = usage_count + 1 WHERE UPPER(code) = UPPER($1) AND is_active = TRUE AND expires_at >= CURRENT_TIMESTAMP AND (max_uses IS NULL OR usage_count < max_uses)`,
        [cleanDiscountCode]
      );
    }

    const created = await query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    res.status(201).json(formatOrder(created.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
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
router.put('/:id/cancel', async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
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
