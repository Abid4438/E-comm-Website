import { Router } from 'express';
import { query } from '../db';

const router = Router();

function formatCategory(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    image: row.image,
    heroImage: row.hero_image,
    itemCount: parseInt(row.item_count || '0', 10),
    featured: !!row.featured,
  };
}

// GET /api/categories
router.get('/', async (_req, res) => {
  try {
    const result = await query(`SELECT * FROM categories ORDER BY name ASC`);
    res.json(result.rows.map(formatCategory));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM categories WHERE slug = $1`, [req.params.slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(formatCategory(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const c = req.body;
    const id = `cat-${Date.now()}`;
    await query(
      `INSERT INTO categories (id, name, slug, tagline, description, image, hero_image, item_count, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, c.name, c.slug, c.tagline || '', c.description || '', c.image || '', c.heroImage || '', c.itemCount || 0, !!c.featured]
    );
    const created = await query(`SELECT * FROM categories WHERE id = $1`, [id]);
    res.status(201).json(formatCategory(created.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const c = req.body;
    const existing = await query(`SELECT * FROM categories WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const curr = existing.rows[0];

    await query(
      `UPDATE categories SET
        name = $1, slug = $2, tagline = $3, description = $4,
        image = $5, hero_image = $6, item_count = $7, featured = $8
       WHERE id = $9`,
      [
        c.name !== undefined ? c.name : curr.name,
        c.slug !== undefined ? c.slug : curr.slug,
        c.tagline !== undefined ? c.tagline : curr.tagline,
        c.description !== undefined ? c.description : curr.description,
        c.image !== undefined ? c.image : curr.image,
        c.heroImage !== undefined ? c.heroImage : curr.hero_image,
        c.itemCount !== undefined ? c.itemCount : curr.item_count,
        c.featured !== undefined ? !!c.featured : curr.featured,
        id,
      ]
    );

    const updated = await query(`SELECT * FROM categories WHERE id = $1`, [id]);
    res.json(formatCategory(updated.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(`DELETE FROM categories WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
