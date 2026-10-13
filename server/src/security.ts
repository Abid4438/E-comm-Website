import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    throw new Error('JWT_SECRET must be configured in production.');
  }
  return 'local-development-only-change-before-deploy';
}

export async function getAuthenticatedUser(req: Request, res: Response) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication is required.' });
    return null;
  }
  try {
    const claims = jwt.verify(authorization.slice(7), getJwtSecret()) as { id?: string };
    if (!claims.id) {
      res.status(401).json({ error: 'Invalid session.' });
      return null;
    }
    const result = await query('SELECT id, role, status FROM users WHERE id = $1', [claims.id]);
    const user = result.rows[0];
    if (!user || String(user.status || '').toLowerCase() !== 'active') {
      res.status(401).json({ error: 'Account is unavailable. Please sign in again.' });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return null;
  }
}

export async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return false;
  if (String(user.role).toLowerCase() !== 'admin') {
    res.status(403).json({ error: 'Administrator access is required.' });
    return false;
  }
  return true;
}

export async function requireUserOrAdmin(req: Request, res: Response, userId: string): Promise<boolean> {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return false;
  if (String(user.id) !== String(userId) && String(user.role).toLowerCase() !== 'admin') {
    res.status(403).json({ error: 'You can only access your own account.' });
    return false;
  }
  return true;
}
