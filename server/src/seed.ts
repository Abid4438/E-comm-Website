import { query } from './db';
import { INITIAL_CATEGORIES } from '../../src/data/categoriesData';
import { INITIAL_PRODUCTS } from '../../src/data/productsData';
import { INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_DISCOUNTS, INITIAL_REVIEWS } from '../../src/data/mockData';

export async function seedDatabase() {
  try {
    // 1. Seed Categories
    const catCount = await query(`SELECT COUNT(*) as count FROM categories`);
    if (parseInt(catCount.rows[0].count, 10) === 0) {
      console.log('[Seed] Seeding categories...');
      for (const c of INITIAL_CATEGORIES) {
        await query(
          `INSERT INTO categories (id, name, slug, tagline, description, image, hero_image, item_count, featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [c.id, c.name, c.slug, c.tagline, c.description, c.image, c.heroImage, c.itemCount, c.featured]
        );
      }
    }

    // 2. Seed Products
    const prodCount = await query(`SELECT COUNT(*) as count FROM products`);
    if (parseInt(prodCount.rows[0].count, 10) === 0) {
      console.log('[Seed] Seeding products...');
      for (const p of INITIAL_PRODUCTS) {
        await query(
          `INSERT INTO products (
            id, name, slug, sku, tagline, description, short_description,
            details, materials, dimensions, shipping_info, returns_info,
            price, compare_at_price, category, category_name, images, colors,
            sizes, rating, review_count, stock, badge, is_featured, is_new_arrival,
            is_best_seller, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
          ON CONFLICT (id) DO NOTHING`,
          [
            p.id,
            p.name,
            p.slug,
            p.sku,
            p.tagline || null,
            p.description,
            p.shortDescription,
            JSON.stringify(p.details || []),
            JSON.stringify(p.materials || []),
            p.dimensions || null,
            p.shippingInfo,
            p.returnsInfo,
            p.price,
            p.compareAtPrice || null,
            p.category,
            p.categoryName || null,
            JSON.stringify(p.images || []),
            JSON.stringify(p.colors || []),
            JSON.stringify(p.sizes || []),
            p.rating,
            p.reviewCount,
            p.stock,
            p.badge || null,
            !!p.isFeatured,
            !!p.isNewArrival,
            !!p.isBestSeller,
            p.status,
            p.createdAt,
          ]
        );
      }
    }

    // 3. Seed Users & Addresses
    const userCount = await query(`SELECT COUNT(*) as count FROM users`);
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      console.log('[Seed] Seeding users and addresses...');
      for (const u of INITIAL_CUSTOMERS) {
        await query(
          `INSERT INTO users (
            id, email, password, first_name, last_name, phone, role, avatar, status, registered_at, default_address_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING`,
          [
            u.id,
            u.email,
            'password123', // default mock password
            u.firstName,
            u.lastName,
            u.phone,
            u.role,
            u.avatar || null,
            u.status,
            u.registeredAt,
            u.defaultAddressId || null,
          ]
        );

        if (u.addresses && u.addresses.length > 0) {
          for (const a of u.addresses) {
            await query(
              `INSERT INTO addresses (
                id, user_id, first_name, last_name, company, address_line1, address_line2,
                city, state, postal_code, country, phone, is_default
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
              ON CONFLICT (id) DO NOTHING`,
              [
                a.id,
                u.id,
                a.firstName,
                a.lastName,
                a.company || null,
                a.addressLine1,
                a.addressLine2 || null,
                a.city,
                a.state,
                a.postalCode,
                a.country,
                a.phone,
                !!a.isDefault,
              ]
            );
          }
        }
      }
    }

    // 4. Seed Discounts
    const discCount = await query(`SELECT COUNT(*) as count FROM discounts`);
    if (parseInt(discCount.rows[0].count, 10) === 0) {
      console.log('[Seed] Seeding discounts...');
      for (const d of INITIAL_DISCOUNTS) {
        await query(
          `INSERT INTO discounts (
            id, code, percentage, min_spend, expires_at, usage_count, max_uses, is_active, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING`,
          [
            d.id,
            d.code,
            d.percentage,
            d.minSpend || null,
            d.expiresAt,
            d.usageCount || 0,
            d.maxUses || null,
            d.isActive,
            d.description,
          ]
        );
      }
    }

    // 5. Seed Reviews
    const revCount = await query(`SELECT COUNT(*) as count FROM reviews`);
    if (parseInt(revCount.rows[0].count, 10) === 0) {
      console.log('[Seed] Seeding reviews...');
      for (const r of INITIAL_REVIEWS) {
        await query(
          `INSERT INTO reviews (
            id, product_id, product_name, author, avatar, location, rating, title,
            comment, date, verified, status, helpful_count, images
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO NOTHING`,
          [
            r.id,
            r.productId,
            r.productName,
            r.author,
            r.avatar || null,
            r.location || null,
            r.rating,
            r.title,
            r.comment,
            r.date,
            r.verified,
            r.status,
            r.helpfulCount || 0,
            JSON.stringify(r.images || []),
          ]
        );
      }
    }

    // 6. Seed Orders
    const orderCount = await query(`SELECT COUNT(*) as count FROM orders`);
    if (parseInt(orderCount.rows[0].count, 10) === 0) {
      console.log('[Seed] Seeding orders...');
      for (const o of INITIAL_ORDERS) {
        await query(
          `INSERT INTO orders (
            id, date, customer_id, customer_info, shipping_address, billing_address,
            items, subtotal, shipping, tax, discount, discount_code, total, status,
            payment_method, payment_status, delivery_method, tracking_number, carrier,
            estimated_delivery, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          ON CONFLICT (id) DO NOTHING`,
          [
            o.id,
            o.date,
            o.customerId || null,
            JSON.stringify(o.customer),
            JSON.stringify(o.shippingAddress),
            o.billingAddress ? JSON.stringify(o.billingAddress) : null,
            JSON.stringify(o.items),
            o.subtotal,
            o.shipping,
            o.tax,
            o.discount,
            o.discountCode || null,
            o.total,
            o.status,
            o.paymentMethod,
            o.paymentStatus,
            o.deliveryMethod,
            o.trackingNumber || null,
            o.carrier || null,
            o.estimatedDelivery || null,
            o.notes || null,
          ]
        );
      }
    }

    console.log('[Seed] Database initialization and seed completed.');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
}
