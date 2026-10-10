import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from '../server/src/db';
import { seedDatabase } from '../server/src/seed';
import productsRouter from '../server/src/routes/products';
import categoriesRouter from '../server/src/routes/categories';
import customersRouter from '../server/src/routes/customers';
import ordersRouter from '../server/src/routes/orders';
import discountsRouter from '../server/src/routes/discounts';
import reviewsRouter from '../server/src/routes/reviews';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/reviews', reviewsRouter);

let dbInitialized = false;

export default async function handler(req, res) {
  if (!dbInitialized) {
    try {
      await initDB();
      await seedDatabase();
      dbInitialized = true;
    } catch (err) {
      console.error('[Vercel Serverless DB Init Error]', err);
    }
  }
  return app(req, res);
}
