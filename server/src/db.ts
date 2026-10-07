import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let pglite: PGlite | null = null;
let isPgLite = false;

export interface DBResult<T = any> {
  rows: T[];
  rowCount: number;
}

export async function getDBClient() {
  if (pool || pglite) {
    return { pool, pglite, isPgLite };
  }

  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/moss';

  try {
    const testPool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 1500,
    });
    // Test connection with a quick query
    const client = await testPool.connect();
    client.release();
    pool = testPool;
    isPgLite = false;
    console.log(`[Database] Connected successfully to external PostgreSQL at ${databaseUrl}`);
  } catch (err: any) {
    console.log(`[Database] External PostgreSQL not accessible (${err.message}). Using embedded PostgreSQL (PGlite) for persistent local database.`);
    const dataDir = path.resolve(process.cwd(), 'server', 'data', 'pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    pglite = new PGlite(dataDir);
    isPgLite = true;
  }

  return { pool, pglite, isPgLite };
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<DBResult<T>> {
  await getDBClient();

  if (pool) {
    const res = await pool.query(sql, params);
    return {
      rows: res.rows as T[],
      rowCount: res.rowCount ?? res.rows.length,
    };
  } else if (pglite) {
    // PGlite uses $1, $2 params exactly like pg
    const res = await pglite.query(sql, params);
    return {
      rows: res.rows as T[],
      rowCount: res.rowCount ?? (res as any).affectedRows ?? res.rows.length,
    };
  }
  throw new Error('Database client not initialized');
}

export async function initDB() {
  await getDBClient();

  // Create Users Table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone VARCHAR(50),
      role VARCHAR(20) DEFAULT 'customer',
      avatar TEXT,
      status VARCHAR(20) DEFAULT 'Active',
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      default_address_id VARCHAR(100)
    )
  `);

  // Create Addresses Table
  await query(`
    CREATE TABLE IF NOT EXISTS addresses (
      id VARCHAR(100) PRIMARY KEY,
      user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      company VARCHAR(100),
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(50) NOT NULL,
      country VARCHAR(100) NOT NULL,
      phone VARCHAR(50),
      is_default BOOLEAN DEFAULT FALSE
    )
  `);

  // Create Categories Table
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      tagline TEXT,
      description TEXT,
      image TEXT,
      hero_image TEXT,
      item_count INT DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE
    )
  `);

  // Create Products Table
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      sku VARCHAR(100) UNIQUE NOT NULL,
      tagline TEXT,
      description TEXT,
      short_description TEXT,
      details JSONB DEFAULT '[]'::jsonb,
      materials JSONB DEFAULT '[]'::jsonb,
      dimensions TEXT,
      shipping_info TEXT,
      returns_info TEXT,
      price NUMERIC(10,2) NOT NULL,
      compare_at_price NUMERIC(10,2),
      category VARCHAR(100) NOT NULL,
      category_name VARCHAR(255),
      images JSONB DEFAULT '[]'::jsonb,
      colors JSONB DEFAULT '[]'::jsonb,
      sizes JSONB DEFAULT '[]'::jsonb,
      rating NUMERIC(3,2) DEFAULT 0,
      review_count INT DEFAULT 0,
      stock INT DEFAULT 0,
      badge VARCHAR(50),
      is_featured BOOLEAN DEFAULT FALSE,
      is_new_arrival BOOLEAN DEFAULT FALSE,
      is_best_seller BOOLEAN DEFAULT FALSE,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Orders Table
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(100) PRIMARY KEY,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      customer_id VARCHAR(100),
      customer_info JSONB NOT NULL,
      shipping_address JSONB NOT NULL,
      billing_address JSONB,
      items JSONB NOT NULL,
      subtotal NUMERIC(10,2) NOT NULL,
      shipping NUMERIC(10,2) NOT NULL,
      tax NUMERIC(10,2) NOT NULL,
      discount NUMERIC(10,2) DEFAULT 0,
      discount_code VARCHAR(100),
      total NUMERIC(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      payment_method VARCHAR(50),
      payment_status VARCHAR(50) DEFAULT 'Pending',
      delivery_method VARCHAR(100),
      tracking_number VARCHAR(100),
      carrier VARCHAR(100),
      estimated_delivery VARCHAR(100),
      notes TEXT
    )
  `);

  // Create Discounts Table
  await query(`
    CREATE TABLE IF NOT EXISTS discounts (
      id VARCHAR(100) PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      percentage NUMERIC(5,2) NOT NULL,
      min_spend NUMERIC(10,2),
      expires_at TIMESTAMP NOT NULL,
      usage_count INT DEFAULT 0,
      max_uses INT,
      is_active BOOLEAN DEFAULT TRUE,
      description TEXT
    )
  `);

  // Create Reviews Table
  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(100) PRIMARY KEY,
      product_id VARCHAR(100) NOT NULL,
      product_name VARCHAR(255),
      author VARCHAR(255) NOT NULL,
      avatar TEXT,
      location VARCHAR(255),
      rating INT NOT NULL,
      title VARCHAR(255),
      comment TEXT,
      date VARCHAR(50),
      verified BOOLEAN DEFAULT TRUE,
      status VARCHAR(50) DEFAULT 'approved',
      helpful_count INT DEFAULT 0,
      images JSONB DEFAULT '[]'::jsonb
    )
  `);

  console.log('[Database] Tables initialized successfully');
}
