import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, query } from '../server/src/db';
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

export default async function handler(req: express.Request, res: express.Response) {
  // Vercel rewrites /api/* to this function and passes the original route in ?path=.
  // Restore the expected Express URL before dispatching the request.
  const query = req.query as Record<string, unknown>;
  const routeValue = query.path;
  const route = Array.isArray(routeValue)
    ? routeValue.map(String).join('/')
    : typeof routeValue === 'string'
      ? routeValue
      : '';
  const forwardedParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (key === 'path' || value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) forwardedParams.append(key, String(item));
    } else {
      forwardedParams.append(key, String(value));
    }
  }

  req.url = `/api/${route.replace(/^\/+/, '')}${forwardedParams.size ? `?${forwardedParams.toString()}` : ''}`;

  // Keep a lightweight liveness check independent of database availability.
  const routePath = req.url.split('?')[0];
  if (req.method === 'GET' && routePath === '/api/health') {
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // Explicit database check for production troubleshooting.
  if (req.method === 'GET' && routePath === '/api/health/db') {
    try {
      await query('SELECT 1 AS ok');
      return res.status(200).json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[Vercel DB Health Check Error]', err);
      return res.status(503).json({ status: 'error', database: 'unavailable' });
    }
  }

  if (!dbInitialized) {
    try {
      await initDB();
      await seedDatabase();
      dbInitialized = true;
    } catch (err: any) {
      console.error('[Vercel Serverless DB Init Error]', err);
      return res.status(503).json({ error: 'DB not ready', message: err.message || String(err) });
    }
  }
  return app(req, res);
}
