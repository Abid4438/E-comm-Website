import { Router } from 'express';
import { query } from '../db.js';
import { requireAdmin } from '../security.js';

const router = Router();

function formatDiscount(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    percentage: parseFloat(row.percentage),
    minSpend: row.min_spend ? parseFloat(row.min_spend) : undefined,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : new Date().toISOString(),
    usageCount: parseInt(row.usage_count || '0', 10),
    maxUses: row.max_uses ? parseInt(row.max_uses, 10) : undefined,
    isActive: !!row.is_active,
    description: row.description || '',
  };
}

// GET /api/discounts
router.get('/', async (_req, res) => {
  try {
    const result = await query(`SELECT * FROM discounts ORDER BY expires_at DESC`);
    res.json(result.rows.map(formatDiscount));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/discounts/validate
router.post('/validate', async (req, res) => {
  try {
    const { code, currentSubtotal } = req.body;
    if (!code) {
      return res.json({ isValid: false, message: 'Promo code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const result = await query(`SELECT * FROM discounts WHERE UPPER(code) = $1`, [cleanCode]);

    if (result.rows.length === 0) {
      return res.json({ isValid: false, message: 'Invalid promo code' });
    }

    const disc = formatDiscount(result.rows[0]);
    if (!disc.isActive) {
      return res.json({ isValid: false, message: 'This promo code is no longer active' });
    }

    if (new Date(disc.expiresAt).getTime() < Date.now()) {
      return res.json({ isValid: false, message: 'This promo code has expired' });
    }

    if (disc.minSpend && currentSubtotal < disc.minSpend) {
      return res.json({ isValid: false, message: `Requires minimum order of $${disc.minSpend}` });
    }

    if (disc.maxUses && disc.usageCount >= disc.maxUses) {
      return res.json({ isValid: false, message: 'This promo code has reached its usage limit' });
    }

    return res.json({ isValid: true, discount: disc, message: `${disc.percentage}% discount applied` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Applying a code in the cart must not consume a use; count it only when an order is accepted.
router.post('/apply', async (req, res) => {
  try {
    const { code, currentSubtotal } = req.body;
    if (typeof code !== 'string' || !code.trim()) return res.status(400).json({ error: 'Code required' });
    const result = await query("SELECT * FROM discounts WHERE UPPER(code) = $1", [code.trim().toUpperCase()]);
    if (!result.rows.length) return res.status(400).json({ success: false, error: 'Invalid promo code.' });
    const d = result.rows[0];
    if (!d.is_active || new Date(d.expires_at).getTime() < Date.now() ||
        (d.max_uses != null && Number(d.usage_count) >= Number(d.max_uses)) ||
        (Number(d.min_spend || 0) > 0 && Number(currentSubtotal) < Number(d.min_spend))) {
      return res.status(400).json({ success: false, error: 'Promo code is not eligible.' });
    }
    res.json({ success: true, counted: false });
  } catch (err: any) {
    console.error('[Discount Apply Error]', err);
    res.status(500).json({ error: 'Could not validate promo code.' });
  }
});
// POST /api/discounts (Create)
router.post('/', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const d = req.body;
    const id = `disc-${Date.now()}`;
    await query(
      `INSERT INTO discounts (id, code, percentage, min_spend, expires_at, usage_count, max_uses, is_active, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        d.code.toUpperCase(),
        d.percentage,
        d.minSpend || null,
        d.expiresAt,
        0,
        d.maxUses || null,
        d.isActive !== undefined ? !!d.isActive : true,
        d.description || '',
      ]
    );
    const created = await query(`SELECT * FROM discounts WHERE id = $1`, [id]);
    res.status(201).json(formatDiscount(created.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/discounts/:id (Update)
router.put('/:id', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const id = req.params.id;
    const d = req.body;
    const existing = await query(`SELECT * FROM discounts WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    const curr = existing.rows[0];

    await query(
      `UPDATE discounts SET
        code = $1, percentage = $2, min_spend = $3, expires_at = $4,
        max_uses = $5, is_active = $6, description = $7
       WHERE id = $8`,
      [
        d.code !== undefined ? d.code.toUpperCase() : curr.code,
        d.percentage !== undefined ? d.percentage : curr.percentage,
        d.minSpend !== undefined ? d.minSpend : curr.min_spend,
        d.expiresAt !== undefined ? d.expiresAt : curr.expires_at,
        d.maxUses !== undefined ? d.maxUses : curr.max_uses,
        d.isActive !== undefined ? !!d.isActive : curr.is_active,
        d.description !== undefined ? d.description : curr.description,
        id,
      ]
    );

    const updated = await query(`SELECT * FROM discounts WHERE id = $1`, [id]);
    res.json(formatDiscount(updated.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/discounts/:id (Delete)
router.delete('/:id', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const result = await query(`DELETE FROM discounts WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
