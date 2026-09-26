import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/moss',
});

export async function initDB() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, first_name VARCHAR(100), last_name VARCHAR(100),
    phone VARCHAR(50), role VARCHAR(20) DEFAULT 'customer', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY, name VARCHAR(255), price DECIMAL(10,2), sku VARCHAR(50) UNIQUE,
    stock INT DEFAULT 0, image_url VARCHAR(500), category VARCHAR(100)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY, user_id INT, total DECIMAL(10,2), status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS promos (id SERIAL PRIMARY KEY, code VARCHAR(50) UNIQUE, discount DECIMAL(10,2), valid_till DATE)`);
}
