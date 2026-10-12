import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../server/src/db.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await query('SELECT 1 AS ok');
    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Do not return internal connection details or credentials in public responses.
    console.error('[MOSS DB Health Check Error]', error);
    return res.status(503).json({
      status: 'error',
      database: 'unavailable',
    });
  }
}
