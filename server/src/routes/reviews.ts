import { Router } from 'express';
import { query } from '../db';

const router = Router();

function formatReview(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    author: row.author,
    avatar: row.avatar || undefined,
    location: row.location || undefined,
    rating: parseInt(row.rating, 10),
    title: row.title,
    comment: row.comment,
    date: row.date,
    verified: !!row.verified,
    status: row.status,
    helpfulCount: parseInt(row.helpful_count || '0', 10),
    images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images || [],
  };
}

// Helper to update product average rating and count
async function updateProductRatingStats(productId: string) {
  const statsRes = await query(
    `SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE product_id = $1 AND status = 'approved'`,
    [productId]
  );
  const count = parseInt(statsRes.rows[0]?.count || '0', 10);
  const avg = parseFloat(statsRes.rows[0]?.avg_rating || '5.0');
  const roundedAvg = Math.round(avg * 10) / 10;

  await query(
    `UPDATE products SET review_count = $1, rating = $2 WHERE id = $3`,
    [count, roundedAvg, productId]
  );
}

// GET /api/reviews
router.get('/', async (_req, res) => {
  try {
    const result = await query(`SELECT * FROM reviews ORDER BY date DESC`);
    res.json(result.rows.map(formatReview));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM reviews WHERE product_id = $1 AND status = 'approved' ORDER BY date DESC`,
      [req.params.productId]
    );
    res.json(result.rows.map(formatReview));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const input = req.body;
    const prodRes = await query(`SELECT name FROM products WHERE id = $1`, [input.productId]);
    const productName = prodRes.rows[0]?.name || 'MOSS Essential Item';

    const id = `rev-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO reviews (
        id, product_id, product_name, author, avatar, location, rating, title,
        comment, date, verified, status, helpful_count, images
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id,
        input.productId,
        productName,
        input.author,
        input.avatar || null,
        input.location || 'Verified Buyer',
        input.rating,
        input.title,
        input.comment,
        date,
        true,
        'approved',
        0,
        JSON.stringify(input.images || []),
      ]
    );

    // Update product rating stats
    await updateProductRatingStats(input.productId);

    const created = await query(`SELECT * FROM reviews WHERE id = $1`, [id]);
    res.status(201).json(formatReview(created.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reviews/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const existing = await query(`SELECT * FROM reviews WHERE id = $1`, [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    const curr = existing.rows[0];

    await query(`UPDATE reviews SET status = $1 WHERE id = $2`, [status, curr.id]);
    await updateProductRatingStats(curr.product_id);

    const updated = await query(`SELECT * FROM reviews WHERE id = $1`, [curr.id]);
    res.json(formatReview(updated.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:id/helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const existing = await query(`SELECT * FROM reviews WHERE id = $1`, [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    const curr = existing.rows[0];

    await query(`UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1`, [curr.id]);
    const updated = await query(`SELECT * FROM reviews WHERE id = $1`, [curr.id]);
    res.json(formatReview(updated.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
