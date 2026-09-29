import { Router } from 'express';
import { query } from '../db';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'moss-secret-jwt-key-2026';

function formatAddress(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    company: row.company || undefined,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2 || undefined,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    phone: row.phone || '',
    isDefault: !!row.is_default,
  };
}

async function formatCustomer(row: any) {
  if (!row) return null;

  // Fetch addresses
  const addrRes = await query(`SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id ASC`, [row.id]);
  const addresses = addrRes.rows.map(formatAddress);

  // Fetch orders count and spent
  const ordersRes = await query(
    `SELECT COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_spent FROM orders WHERE customer_id = $1`,
    [row.id]
  );
  const totalOrders = parseInt(ordersRes.rows[0]?.total_orders || '0', 10);
  const totalSpent = parseFloat(ordersRes.rows[0]?.total_spent || '0');

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    phone: row.phone || '',
    role: row.role || 'customer',
    avatar: row.avatar || undefined,
    registeredAt: row.registered_at ? new Date(row.registered_at).toISOString() : new Date().toISOString(),
    addresses,
    defaultAddressId: row.default_address_id || (addresses[0]?.id) || undefined,
    totalOrders,
    totalSpent,
    status: row.status || 'Active',
  };
}

// POST /api/auth/google
router.post('/auth/google', async (req, res) => {
  try {
    const { email, firstName, lastName, avatar, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for Google Sign-In' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await query(`SELECT * FROM users WHERE LOWER(email) = $1`, [cleanEmail]);

    let userRow: any;
    if (existing.rows.length > 0) {
      userRow = existing.rows[0];
      // Update avatar or names if available
      const updates: any[] = [];
      const setParts: string[] = [];

      if (avatar && !userRow.avatar) {
        updates.push(avatar);
        setParts.push(`avatar = $${updates.length}`);
      }
      if (firstName && !userRow.first_name) {
        updates.push(firstName);
        setParts.push(`first_name = $${updates.length}`);
      }
      if (lastName && !userRow.last_name) {
        updates.push(lastName);
        setParts.push(`last_name = $${updates.length}`);
      }

      if (setParts.length > 0) {
        updates.push(userRow.id);
        await query(`UPDATE users SET ${setParts.join(', ')} WHERE id = $${updates.length}`, updates);
        const refetched = await query(`SELECT * FROM users WHERE id = $1`, [userRow.id]);
        userRow = refetched.rows[0];
      }
    } else {
      const id = `cust-${Date.now()}`;
      await query(
        `INSERT INTO users (id, email, password, first_name, last_name, phone, role, avatar, status, registered_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [id, cleanEmail, `google_${googleId || Date.now()}`, firstName || '', lastName || '', '', 'customer', avatar || null, 'Active']
      );
      const created = await query(`SELECT * FROM users WHERE id = $1`, [id]);
      userRow = created.rows[0];
    }

    const customer = await formatCustomer(userRow);
    const token = jwt.sign({ id: userRow.id, email: userRow.email, role: userRow.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ customer, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { email, firstName, lastName, phone, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await query(`SELECT * FROM users WHERE LOWER(email) = $1`, [cleanEmail]);

    let userRow: any;
    if (existing.rows.length > 0) {
      userRow = existing.rows[0];
    } else {
      const id = `cust-${Date.now()}`;
      await query(
        `INSERT INTO users (id, email, password, first_name, last_name, phone, role, status, registered_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [id, cleanEmail, password || 'password123', firstName || '', lastName || '', phone || '', 'customer', 'Active']
      );
      const created = await query(`SELECT * FROM users WHERE id = $1`, [id]);
      userRow = created.rows[0];
    }

    const customer = await formatCustomer(userRow);
    const token = jwt.sign({ id: userRow.id, email: userRow.email, role: userRow.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ customer, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await query(`SELECT * FROM users WHERE LOWER(email) = $1`, [cleanEmail]);

    if (result.rows.length === 0) {
      // Auto register demo customer if not existing
      const id = `cust-${Date.now()}`;
      await query(
        `INSERT INTO users (id, email, password, first_name, last_name, phone, role, status, registered_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [id, cleanEmail, password || 'password123', cleanEmail.split('@')[0], '', '', 'customer', 'Active']
      );
      const created = await query(`SELECT * FROM users WHERE id = $1`, [id]);
      const customer = await formatCustomer(created.rows[0]);
      const token = jwt.sign({ id: customer.id, email: customer.email, role: customer.role }, JWT_SECRET, { expiresIn: '30d' });
      return res.json({ customer, token });
    }

    const userRow = result.rows[0];
    const customer = await formatCustomer(userRow);
    const token = jwt.sign({ id: userRow.id, email: userRow.email, role: userRow.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ customer, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/auth/logout', async (_req, res) => {
  res.json({ success: true });
});

// GET /api/customers/me
router.get('/customers/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const result = await query(`SELECT * FROM users WHERE id = $1`, [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const customer = await formatCustomer(result.rows[0]);
    res.json(customer);
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// GET /api/customers (Admin list)
router.get('/customers', async (_req, res) => {
  try {
    const result = await query(`SELECT * FROM users ORDER BY registered_at DESC`);
    const customers = await Promise.all(result.rows.map(formatCustomer));
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/customers/:id
router.get('/customers/:id', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const customer = await formatCustomer(result.rows[0]);
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id
router.put('/customers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const u = req.body;
    const existing = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const curr = existing.rows[0];

    await query(
      `UPDATE users SET
        first_name = $1, last_name = $2, phone = $3, avatar = $4,
        role = $5, status = $6, default_address_id = $7
       WHERE id = $8`,
      [
        u.firstName !== undefined ? u.firstName : curr.first_name,
        u.lastName !== undefined ? u.lastName : curr.last_name,
        u.phone !== undefined ? u.phone : curr.phone,
        u.avatar !== undefined ? u.avatar : curr.avatar,
        u.role !== undefined ? u.role : curr.role,
        u.status !== undefined ? u.status : curr.status,
        u.defaultAddressId !== undefined ? u.defaultAddressId : curr.default_address_id,
        id,
      ]
    );

    const updated = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    const customer = await formatCustomer(updated.rows[0]);
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers/:id/addresses
router.post('/customers/:id/addresses', async (req, res) => {
  try {
    const customerId = req.params.id;
    const a = req.body;
    const addrId = `addr-${Date.now()}`;

    if (a.isDefault) {
      await query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [customerId]);
    }

    await query(
      `INSERT INTO addresses (
        id, user_id, first_name, last_name, company, address_line1, address_line2,
        city, state, postal_code, country, phone, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        addrId,
        customerId,
        a.firstName,
        a.lastName,
        a.company || null,
        a.addressLine1,
        a.addressLine2 || null,
        a.city,
        a.state,
        a.postalCode,
        a.country,
        a.phone || '',
        !!a.isDefault,
      ]
    );

    if (a.isDefault) {
      await query(`UPDATE users SET default_address_id = $1 WHERE id = $2`, [addrId, customerId]);
    }

    const created = await query(`SELECT * FROM addresses WHERE id = $1`, [addrId]);
    res.status(201).json(formatAddress(created.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/customers/:id/addresses/:addressId
router.put('/customers/:id/addresses/:addressId', async (req, res) => {
  try {
    const { id: customerId, addressId } = req.params;
    const a = req.body;

    const existing = await query(`SELECT * FROM addresses WHERE id = $1 AND user_id = $2`, [addressId, customerId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    const curr = existing.rows[0];

    if (a.isDefault) {
      await query(`UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, [customerId]);
      await query(`UPDATE users SET default_address_id = $1 WHERE id = $2`, [addressId, customerId]);
    }

    await query(
      `UPDATE addresses SET
        first_name = $1, last_name = $2, company = $3, address_line1 = $4,
        address_line2 = $5, city = $6, state = $7, postal_code = $8,
        country = $9, phone = $10, is_default = $11
       WHERE id = $12 AND user_id = $13`,
      [
        a.firstName !== undefined ? a.firstName : curr.first_name,
        a.lastName !== undefined ? a.lastName : curr.last_name,
        a.company !== undefined ? a.company : curr.company,
        a.addressLine1 !== undefined ? a.addressLine1 : curr.address_line1,
        a.addressLine2 !== undefined ? a.addressLine2 : curr.address_line2,
        a.city !== undefined ? a.city : curr.city,
        a.state !== undefined ? a.state : curr.state,
        a.postalCode !== undefined ? a.postalCode : curr.postal_code,
        a.country !== undefined ? a.country : curr.country,
        a.phone !== undefined ? a.phone : curr.phone,
        a.isDefault !== undefined ? !!a.isDefault : curr.is_default,
        addressId,
        customerId,
      ]
    );

    const updated = await query(`SELECT * FROM addresses WHERE id = $1`, [addressId]);
    res.json(formatAddress(updated.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/customers/:id/addresses/:addressId
router.delete('/customers/:id/addresses/:addressId', async (req, res) => {
  try {
    const { id: customerId, addressId } = req.params;
    const result = await query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, [addressId, customerId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
