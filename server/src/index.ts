import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import { seedDatabase } from './seed.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import customersRouter from './routes/customers.js';
import contactRouter from './routes/contact.js';
import ordersRouter from './routes/orders.js';
import discountsRouter from './routes/discounts.js';
import reviewsRouter from './routes/reviews.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api', customersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/reviews', reviewsRouter);

async function startServer() {
  try {
    console.log('[Server] Initializing PostgreSQL database...');
    await initDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`[Server] MOSS PostgreSQL Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
