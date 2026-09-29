import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Helper to format product DB row to frontend Product type
function formatProduct(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    tagline: row.tagline || undefined,
    description: row.description,
    shortDescription: row.short_description || row.shortDescription,
    details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details || [],
    materials: typeof row.materials === 'string' ? JSON.parse(row.materials) : row.materials || [],
    dimensions: row.dimensions || undefined,
    shippingInfo: row.shipping_info || row.shippingInfo,
    returnsInfo: row.returns_info || row.returnsInfo,
    price: parseFloat(row.price),
    compareAtPrice: row.compare_at_price ? parseFloat(row.compare_at_price) : undefined,
    category: row.category,
    categoryName: row.category_name || row.categoryName || undefined,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images || [],
    colors: typeof row.colors === 'string' ? JSON.parse(row.colors) : row.colors || [],
    sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes || [],
    rating: parseFloat(row.rating || '0'),
    reviewCount: parseInt(row.review_count || '0', 10),
    stock: parseInt(row.stock || '0', 10),
    badge: row.badge || undefined,
    isFeatured: !!row.is_featured,
    isNewArrival: !!row.is_new_arrival,
    isBestSeller: !!row.is_best_seller,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, size, color, availability, rating, search, sortBy } = req.query;

    let sql = `SELECT * FROM products WHERE 1=1`;
    const params: any[] = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (minPrice !== undefined && minPrice !== '') {
      params.push(parseFloat(minPrice as string));
      sql += ` AND price >= $${params.length}`;
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      params.push(parseFloat(maxPrice as string));
      sql += ` AND price <= $${params.length}`;
    }

    if (availability === 'in-stock') {
      sql += ` AND stock > 0`;
    } else if (availability === 'out-of-stock') {
      sql += ` AND stock = 0`;
    }

    if (rating !== undefined && rating !== '') {
      params.push(parseFloat(rating as string));
      sql += ` AND rating >= $${params.length}`;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      params.push(q);
      const idx = params.length;
      sql += ` AND (LOWER(name) LIKE $${idx} OR LOWER(description) LIKE $${idx} OR LOWER(sku) LIKE $${idx} OR LOWER(category) LIKE $${idx})`;
    }

    // Sort order
    if (sortBy === 'newest') {
      sql += ` ORDER BY created_at DESC`;
    } else if (sortBy === 'bestselling') {
      sql += ` ORDER BY review_count DESC, rating DESC`;
    } else if (sortBy === 'price-low') {
      sql += ` ORDER BY price ASC`;
    } else if (sortBy === 'price-high') {
      sql += ` ORDER BY price DESC`;
    } else if (sortBy === 'rating') {
      sql += ` ORDER BY rating DESC`;
    } else {
      sql += ` ORDER BY is_featured DESC, created_at DESC`;
    }

    const result = await query(sql, params);
    let products = result.rows.map(formatProduct);

    // Apply color/size filter if provided
    if (size) {
      const s = (size as string).toLowerCase();
      products = products.filter(p => p.sizes && p.sizes.some((sz: any) => sz.name.toLowerCase() === s && sz.inStock));
    }
    if (color) {
      const c = (color as string).toLowerCase();
      products = products.filter(p => p.colors && p.colors.some((cl: any) => cl.name.toLowerCase() === c));
    }

    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 8;
    const result = await query(`SELECT * FROM products WHERE is_featured = TRUE AND status = 'active' LIMIT $1`, [limit]);
    res.json(result.rows.map(formatProduct));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/new-arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 8;
    const result = await query(`SELECT * FROM products WHERE is_new_arrival = TRUE AND status = 'active' ORDER BY created_at DESC LIMIT $1`, [limit]);
    res.json(result.rows.map(formatProduct));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/bestsellers
router.get('/bestsellers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 8;
    const result = await query(`SELECT * FROM products WHERE is_best_seller = TRUE AND status = 'active' ORDER BY review_count DESC LIMIT $1`, [limit]);
    res.json(result.rows.map(formatProduct));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM products WHERE slug = $1`, [req.params.slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(formatProduct(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id/related
router.get('/:id/related', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 4;
    const prodRes = await query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const current = prodRes.rows[0];
    const relatedRes = await query(
      `SELECT * FROM products WHERE category = $1 AND id != $2 AND status = 'active' LIMIT $3`,
      [current.category, req.params.id, limit]
    );
    res.json(relatedRes.rows.map(formatProduct));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(formatProduct(result.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (Admin Create)
router.post('/', async (req, res) => {
  try {
    const p = req.body;
    const id = `prod-${Date.now()}`;
    const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const createdAt = new Date().toISOString();

    await query(
      `INSERT INTO products (
        id, name, slug, sku, tagline, description, short_description,
        details, materials, dimensions, shipping_info, returns_info,
        price, compare_at_price, category, category_name, images, colors,
        sizes, rating, review_count, stock, badge, is_featured, is_new_arrival,
        is_best_seller, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)`,
      [
        id,
        p.name,
        slug,
        p.sku || `SKU-${Date.now().toString().slice(-6)}`,
        p.tagline || null,
        p.description || '',
        p.shortDescription || '',
        JSON.stringify(p.details || []),
        JSON.stringify(p.materials || []),
        p.dimensions || null,
        p.shippingInfo || 'Free standard shipping on orders over $100. Dispatches within 1-2 business days.',
        p.returnsInfo || 'Complimentary 30-day returns on all unused items in original packaging.',
        p.price,
        p.compareAtPrice || null,
        p.category,
        p.categoryName || null,
        JSON.stringify(p.images || []),
        JSON.stringify(p.colors || []),
        JSON.stringify(p.sizes || []),
        p.rating || 0,
        p.reviewCount || 0,
        p.stock || 0,
        p.badge || null,
        !!p.isFeatured,
        !!p.isNewArrival,
        !!p.isBestSeller,
        p.status || 'active',
        createdAt,
      ]
    );

    const created = await query(`SELECT * FROM products WHERE id = $1`, [id]);
    res.status(201).json(formatProduct(created.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id (Admin Update)
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const p = req.body;

    const existingRes = await query(`SELECT * FROM products WHERE id = $1`, [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const current = existingRes.rows[0];

    await query(
      `UPDATE products SET
        name = $1, slug = $2, sku = $3, tagline = $4, description = $5,
        short_description = $6, details = $7, materials = $8, dimensions = $9,
        shipping_info = $10, returns_info = $11, price = $12, compare_at_price = $13,
        category = $14, category_name = $15, images = $16, colors = $17, sizes = $18,
        rating = $19, review_count = $20, stock = $21, badge = $22, is_featured = $23,
        is_new_arrival = $24, is_best_seller = $25, status = $26
      WHERE id = $27`,
      [
        p.name !== undefined ? p.name : current.name,
        p.slug !== undefined ? p.slug : current.slug,
        p.sku !== undefined ? p.sku : current.sku,
        p.tagline !== undefined ? p.tagline : current.tagline,
        p.description !== undefined ? p.description : current.description,
        p.shortDescription !== undefined ? p.shortDescription : current.short_description,
        p.details !== undefined ? JSON.stringify(p.details) : current.details,
        p.materials !== undefined ? JSON.stringify(p.materials) : current.materials,
        p.dimensions !== undefined ? p.dimensions : current.dimensions,
        p.shippingInfo !== undefined ? p.shippingInfo : current.shipping_info,
        p.returnsInfo !== undefined ? p.returnsInfo : current.returns_info,
        p.price !== undefined ? p.price : current.price,
        p.compareAtPrice !== undefined ? p.compareAtPrice : current.compare_at_price,
        p.category !== undefined ? p.category : current.category,
        p.categoryName !== undefined ? p.categoryName : current.category_name,
        p.images !== undefined ? JSON.stringify(p.images) : current.images,
        p.colors !== undefined ? JSON.stringify(p.colors) : current.colors,
        p.sizes !== undefined ? JSON.stringify(p.sizes) : current.sizes,
        p.rating !== undefined ? p.rating : current.rating,
        p.reviewCount !== undefined ? p.reviewCount : current.review_count,
        p.stock !== undefined ? p.stock : current.stock,
        p.badge !== undefined ? p.badge : current.badge,
        p.isFeatured !== undefined ? !!p.isFeatured : current.is_featured,
        p.isNewArrival !== undefined ? !!p.isNewArrival : current.is_new_arrival,
        p.isBestSeller !== undefined ? !!p.isBestSeller : current.is_best_seller,
        p.status !== undefined ? p.status : current.status,
        id,
      ]
    );

    const updated = await query(`SELECT * FROM products WHERE id = $1`, [id]);
    res.json(formatProduct(updated.rows[0]));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id (Admin Delete)
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(`DELETE FROM products WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
