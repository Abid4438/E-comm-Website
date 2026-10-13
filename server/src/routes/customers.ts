import { Router } from 'express';
import { query } from '../db.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getJwtSecret, requireAdmin, requireUserOrAdmin } from '../security.js';
class EmailConfigurationError extends Error {
  constructor() {
    super('Email service is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in Vercel.');
    this.name = 'EmailConfigurationError';
  }
}
class EmailDeliveryError extends Error {
  constructor(message = 'Could not send email. Please try again shortly.') {
    super(message);
    this.name = 'EmailDeliveryError';
  }
}
function generatePin(): string { return String(crypto.randomInt(0, 1000000)).padStart(6, '0'); }
function hashToken(token: string): string { return crypto.createHash('sha256').update(token).digest('hex'); }
async function sendEmail(to: string, subject: string, pin: string, purpose: 'verify' | 'reset') {
  const apiKey = (process.env.RESEND_API_KEY || process.env.RESEND_API_TOKEN || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.EMAIL_FROM_ADDRESS || '').trim();
  if (!apiKey || !from) throw new EmailConfigurationError();
  const heading = purpose === 'verify' ? 'Verify your MOSS email' : 'Reset your MOSS password';
  const explanation = purpose === 'verify' ? 'Enter this code on the MOSS website to verify your email address.' : 'Enter this code on the MOSS website to reset your password.';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from, to: [to], subject,
      text: heading + '\n\nYour one-time code is: ' + pin + '\n\n' + explanation + '\nThis code expires in 10 minutes. If you did not request this, ignore this email.',
      html: '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#252820"><h2>' + heading + '</h2><p>' + explanation + '</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f5f3ee;text-align:center">' + pin + '</div><p>This one-time code expires in <strong>10 minutes</strong>.</p><p>If you did not request this, ignore this email.</p><p>MOSS</p></div>'
    })
  });
  if (!response.ok) {
    const details = await response.text().catch(() => '');
    console.error('[Resend email error]', response.status, details.slice(0, 500));
    throw new EmailDeliveryError();
  }
}
async function sendWelcomeEmail(to: string, requiresVerification = false) {
  const apiKey = (process.env.RESEND_API_KEY || process.env.RESEND_API_TOKEN || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || process.env.EMAIL_FROM || process.env.EMAIL_FROM_ADDRESS || '').trim();
  if (!apiKey || !from) throw new EmailConfigurationError();
  const message = requiresVerification
    ? 'Thank you for creating a MOSS account. For your security, enter the six-digit verification code sent in a separate email. You can sign in after your email address is verified.'
    : 'Your MOSS account is ready. You can sign in to explore our collection and manage your orders.';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Welcome to MOSS',
      text: 'Welcome to MOSS!\n\n' + message + '\n\nIf you did not create this account, please contact MOSS support.',
      html: '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#252820"><h2>Welcome to MOSS</h2><p>' + message + '</p><p>If you did not create this account, please contact MOSS support.</p><p>MOSS</p></div>'
    })
  });
  if (!response.ok) {
    const details = await response.text().catch(() => '');
    console.error('[Resend welcome email error]', response.status, details.slice(0, 500));
    throw new Error('Could not send welcome email.');
  }
}

async function linkHistoricalOrders(userId: string, email: string) {
  await query(
    `UPDATE orders
     SET customer_id = $1
     WHERE LOWER(TRIM(customer_info->>'email')) = LOWER(TRIM($2))
       AND customer_id IS DISTINCT FROM $1`,
    [userId, email]
  );
}

async function createAndSendPin(userId: string, email: string, purpose: 'verify' | 'reset') {
  const pin = generatePin();
  const tokenHash = hashToken(pin);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const table = purpose === 'verify' ? 'email_verification_tokens' : 'password_reset_tokens';
  await query('DELETE FROM ' + table + ' WHERE user_id = $1 AND used_at IS NULL', [userId]);
  await query('INSERT INTO ' + table + ' (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)', [(purpose === 'verify' ? 'verify-' : 'reset-') + crypto.randomUUID(), userId, tokenHash, expiresAt]);
  try {
    await sendEmail(email, purpose === 'verify' ? 'Your MOSS verification code' : 'Your MOSS password reset code', pin, purpose);
  } catch (error) {
    await query('DELETE FROM ' + table + ' WHERE user_id = $1 AND token_hash = $2 AND used_at IS NULL', [userId, tokenHash]);
    throw error;
  }
}


const router = Router();

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

// Google sign-in verifies the email identity provided by the trusted Google OAuth client.
router.post('/auth/google', async (req, res) => {
  try {
    const { idToken, credential, firstName, lastName, avatar } = req.body;
    const googleToken = typeof idToken === 'string' ? idToken : typeof credential === 'string' ? credential : '';
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!googleToken || !clientId) return res.status(401).json({ error: 'Google sign-in is not configured. Please use a verified Google ID token.' });
    const tokenResponse = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(googleToken));
    if (!tokenResponse.ok) return res.status(401).json({ error: 'Invalid Google credential.' });
    const googleClaims = await tokenResponse.json() as { aud?: string; email?: string; email_verified?: string | boolean; sub?: string; given_name?: string; family_name?: string; picture?: string };
    if (googleClaims.aud !== clientId || !googleClaims.sub || !googleClaims.email || String(googleClaims.email_verified) !== 'true') {
      return res.status(401).json({ error: 'Google account verification failed.' });
    }
    const email = googleClaims.email;
    const googleId = googleClaims.sub;
    const safeFirstName = firstName || googleClaims.given_name || '';
    const safeLastName = lastName || googleClaims.family_name || '';
    const safeAvatar = avatar || googleClaims.picture || '';
    const cleanEmail = email.trim().toLowerCase();
    const existing = await query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    let userRow: any;
    let isNewUser = false;
    if (existing.rows.length) {
      userRow = existing.rows[0];
      const updates: any[] = [true, 'Active', userRow.id];
      const setParts = ['email_verified = $1', 'status = $2'];
      if (safeAvatar && !userRow.avatar) { updates.splice(2, 0, safeAvatar); setParts.splice(2, 0, 'avatar = $3'); }
      if (safeFirstName && !userRow.first_name) { updates.splice(updates.length - 1, 0, safeFirstName); setParts.splice(setParts.length - 1, 0, 'first_name = $' + (updates.length - 1)); }
      if (safeLastName && !userRow.last_name) { updates.splice(updates.length - 1, 0, safeLastName); setParts.splice(setParts.length - 1, 0, 'last_name = $' + (updates.length - 1)); }
      updates[updates.length - 1] = userRow.id;
      await query('UPDATE users SET ' + setParts.join(', ') + ' WHERE id = $' + updates.length, updates);
      userRow = (await query('SELECT * FROM users WHERE id = $1', [userRow.id])).rows[0];
    } else {
      const id = 'cust-' + crypto.randomUUID();
      await query("INSERT INTO users (id, email, password, first_name, last_name, phone, role, avatar, status, email_verified, registered_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE,NOW())",
        [id, cleanEmail, await bcrypt.hash('google_' + (googleId || crypto.randomUUID()), 12), safeFirstName, safeLastName, '', 'customer', safeAvatar || null, 'Active']);
      userRow = (await query('SELECT * FROM users WHERE id = $1', [id])).rows[0];
      isNewUser = true;
    }
    try {
      await linkHistoricalOrders(userRow.id, cleanEmail);
    } catch (linkError) {
      console.error('[Google Order Link Error]', linkError);
    }
    if (isNewUser) {
      try {
        await sendWelcomeEmail(cleanEmail);
      } catch (emailError) {
        // Email failure must not prevent a verified Google account from signing in.
        console.error('[Google Welcome Email Error]', emailError);
      }
    }
    const customer = await formatCustomer(userRow);
    const token = jwt.sign({ id: userRow.id, email: userRow.email, role: userRow.role }, getJwtSecret(), { expiresIn: '30d' });
    return res.json({ customer, token });
  } catch (err: any) {
    console.error('[Google Auth Error]', err);
    return res.status(500).json({ error: 'Google sign-in failed' });
  }
});

// Register pending account and email a six-digit PIN. No session is created before verification.
router.post('/auth/register', async (req, res) => {
  try {
    const { email, firstName, lastName, phone, password } = req.body;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string')
      return res.status(400).json({ error: 'Email and password are required.' });
    const cleanEmail = email.trim().toLowerCase();
    const existing = await query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    let userId: string;
    let isNewUser = false;
    if (existing.rows.length) {
      if (existing.rows[0].email_verified) return res.status(409).json({ code: 'ACCOUNT_ALREADY_EXISTS', error: 'An account with this email already exists. Please sign in.' });
      userId = existing.rows[0].id;
      await query(
        'UPDATE users SET password = $1, first_name = $2, last_name = $3, phone = $4 WHERE id = $5',
        [await bcrypt.hash(password, 12), firstName || '', lastName || '', phone || '', userId]
      );
    } else {
      userId = 'cust-' + crypto.randomUUID();
      await query("INSERT INTO users (id,email,password,first_name,last_name,phone,role,status,email_verified,registered_at) VALUES ($1,$2,$3,$4,$5,$6,'customer','Pending',FALSE,NOW())",
        [userId, cleanEmail, await bcrypt.hash(password, 12), firstName || '', lastName || '', phone || '']);
      isNewUser = true;
    }
    await createAndSendPin(userId, cleanEmail, 'verify');
    if (isNewUser) {
      try {
        await sendWelcomeEmail(cleanEmail, true);
      } catch (emailError) {
        // Keep registration successful when the verification PIN was sent but the optional welcome email failed.
        console.error('[Registration Welcome Email Error]', emailError);
      }
    }
    return res.status(201).json({ requiresVerification: true, email: cleanEmail, expiresIn: '10 minutes' });
  } catch (err: any) {
    console.error('[Registration Error]', err);
    if (err?.code === '23505' && String(err?.constraint || '').toLowerCase().includes('email')) {
      return res.status(409).json({
        code: 'ACCOUNT_ALREADY_EXISTS',
        error: 'An account with this email already exists. Please sign in.',
      });
    }
    return res.status(500).json({ error: err.message || 'Could not register. Please try again.' });
  }
});

// Login requires an existing account, a valid password, and a verified email.
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') return res.status(400).json({ error: 'Enter your email and password.' });
    const result = await query('SELECT * FROM users WHERE LOWER(email) = $1', [email.trim().toLowerCase()]);
    if (!result.rows.length) return res.status(404).json({ code: 'ACCOUNT_NOT_FOUND', error: 'No account found for this email. Please create an account.' });
    const userRow = result.rows[0];
    if (userRow.email_verified === false) return res.status(403).json({ code: 'EMAIL_NOT_VERIFIED', error: 'Please verify your email before signing in.' });
    const saved = String(userRow.password || '');
    let valid = false;
    if (/^\$2[aby]\$/.test(saved)) valid = await bcrypt.compare(password, saved);
    else {
      valid = saved.length > 0 && saved === password;
      if (valid) await query('UPDATE users SET password = $1 WHERE id = $2', [await bcrypt.hash(password, 12), userRow.id]);
    }
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });
    try {
      await linkHistoricalOrders(userRow.id, userRow.email);
    } catch (linkError) {
      console.error('[Login Order Link Error]', linkError);
    }
    const customer = await formatCustomer(userRow);
    const token = jwt.sign({ id: userRow.id, email: userRow.email, role: userRow.role }, getJwtSecret(), { expiresIn: '30d' });
    return res.json({ customer, token });
  } catch (err: any) {
    console.error('[Login Error]', err);
    return res.status(500).json({ error: 'Sign-in failed. Please try again.' });
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
    const decoded = jwt.verify(token, getJwtSecret()) as any;

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
router.get('/customers', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
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
    if (!(await requireUserOrAdmin(req, res, req.params.id))) return;
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
    if (!(await requireUserOrAdmin(req, res, id))) return;
    if ((u.role !== undefined || u.status !== undefined) && !(await requireAdmin(req, res))) return;
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
    if (!(await requireUserOrAdmin(req, res, customerId))) return;
    const a = req.body;
    const addrId = 'addr-' + crypto.randomUUID();

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
    if (!(await requireUserOrAdmin(req, res, customerId))) return;
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
    if (!(await requireUserOrAdmin(req, res, customerId))) return;
    const result = await query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, [addressId, customerId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot password: send a one-time PIN without exposing account existence or a reset URL.
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email is required.' });
    const cleanEmail = email.trim().toLowerCase();
    const result = await query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (result.rows.length) await createAndSendPin(result.rows[0].id, cleanEmail, 'reset');
    return res.json({ sent: true, message: 'If an account exists for this email, a reset code has been sent.', expiresIn: '10 minutes' });
  } catch (err: any) {
    console.error('[Forgot Password Error]', err);
    if (err instanceof EmailConfigurationError) {
      return res.status(503).json({
        code: 'EMAIL_SERVICE_NOT_CONFIGURED',
        error: 'Password reset email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in the Vercel Production environment.',
      });
    }
    if (err instanceof EmailDeliveryError) {
      return res.status(502).json({ code: 'EMAIL_DELIVERY_FAILED', error: 'The email service could not send a reset code. Please try again shortly.' });
    }
    return res.status(500).json({ error: 'Could not send a reset code. Please try again.' });
  }
});
router.post('/auth/resend-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email is required.' });
    const cleanEmail = email.trim().toLowerCase();
    const result = await query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (result.rows.length) await createAndSendPin(result.rows[0].id, cleanEmail, 'reset');
    return res.json({ sent: true, message: 'If an account exists, a new reset code has been sent.', expiresIn: '10 minutes' });
  } catch (err: any) {
    console.error('[Resend Reset Error]', err);
    if (err instanceof EmailConfigurationError) {
      return res.status(503).json({
        code: 'EMAIL_SERVICE_NOT_CONFIGURED',
        error: 'Password reset email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in the Vercel Production environment.',
      });
    }
    if (err instanceof EmailDeliveryError) {
      return res.status(502).json({ code: 'EMAIL_DELIVERY_FAILED', error: 'The email service could not send a reset code. Please try again shortly.' });
    }
    return res.status(500).json({ error: 'Could not resend reset code. Please try again.' });
  }
});
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword || typeof newPassword !== 'string' || newPassword.length < 8)
      return res.status(400).json({ error: 'Email, verification code, and a new password of at least 8 characters are required.' });
    const cleanEmail = String(email).trim().toLowerCase();
    const userResult = await query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (!userResult.rows.length) return res.status(400).json({ error: 'Invalid or expired code. Request a new one.' });
    const userId = userResult.rows[0].id;
    const tokenRes = await query('SELECT * FROM password_reset_tokens WHERE user_id=$1 AND token_hash=$2 AND used_at IS NULL AND expires_at > NOW()', [userId, hashToken(String(token))]);
    if (!tokenRes.rows.length) return res.status(400).json({ error: 'Invalid or expired code. Request a new one.' });
    await query('UPDATE users SET password=$1 WHERE id=$2', [await bcrypt.hash(newPassword, 12), userId]);
    await query('UPDATE password_reset_tokens SET used_at=NOW() WHERE id=$1', [tokenRes.rows[0].id]);
    return res.json({ success: true, message: 'Password updated. You can now sign in with your new password.' });
  } catch (err: any) {
    console.error('[Reset Password Error]', err);
    return res.status(500).json({ error: 'Could not reset password. Please try again.' });
  }
});
router.post('/auth/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email is required.' });
    const cleanEmail = email.trim().toLowerCase();
    const result = await query('SELECT id,email_verified FROM users WHERE LOWER(email)=$1', [cleanEmail]);
    if (!result.rows.length) return res.status(400).json({ error: 'Please register first.' });
    if (result.rows[0].email_verified) return res.json({ sent: false, verified: true, message: 'Email already verified.', email: cleanEmail, expiresIn: '10 minutes' });
    await createAndSendPin(result.rows[0].id, cleanEmail, 'verify');
    return res.json({ sent: true, verified: false, message: 'Verification code sent.', email: cleanEmail, expiresIn: '10 minutes' });
  } catch (err: any) {
    console.error('[Verify Email Error]', err);
    return res.status(500).json({ error: 'Could not send verification code.' });
  }
});
router.post('/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Email is required.' });
    const cleanEmail = email.trim().toLowerCase();
    const result = await query('SELECT id,email_verified FROM users WHERE LOWER(email)=$1', [cleanEmail]);
    if (result.rows.length && !result.rows[0].email_verified) await createAndSendPin(result.rows[0].id, cleanEmail, 'verify');
    return res.json({ sent: true, message: 'If verification is needed, a code has been sent.', email: cleanEmail, expiresIn: '10 minutes' });
  } catch (err: any) {
    console.error('[Resend Verification Error]', err);
    return res.status(500).json({ error: 'Could not resend verification code.' });
  }
});
router.post('/auth/confirm-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || typeof email !== 'string' || !code || !/^\d{6}$/.test(String(code))) return res.status(400).json({ error: 'Enter the 6-digit code sent to your email.' });
    const cleanEmail = email.trim().toLowerCase();
    const result = await query('SELECT id,email_verified FROM users WHERE LOWER(email)=$1', [cleanEmail]);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired code.' });
    const user = result.rows[0];
    if (user.email_verified) return res.json({ verified: true, message: 'Email already verified.' });
    const tokenRes = await query('SELECT * FROM email_verification_tokens WHERE user_id=$1 AND token_hash=$2 AND used_at IS NULL AND expires_at > NOW()', [user.id, hashToken(String(code))]);
    if (!tokenRes.rows.length) return res.status(400).json({ error: 'Invalid or expired code. Request a new one.' });
    await query("UPDATE users SET email_verified=TRUE,status='Active' WHERE id=$1", [user.id]);
    await query('UPDATE email_verification_tokens SET used_at=NOW() WHERE id=$1', [tokenRes.rows[0].id]);
    try {
      await linkHistoricalOrders(user.id, cleanEmail);
    } catch (linkError) {
      console.error('[Verification Order Link Error]', linkError);
    }
    return res.json({ verified: true, message: 'Email verified. You can now sign in.' });
  } catch (err: any) {
    console.error('[Confirm Email Error]', err);
    return res.status(500).json({ error: 'Could not verify email.' });
  }
});
export default router;
