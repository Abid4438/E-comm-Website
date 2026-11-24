import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'moss-secret-jwt-key-2026';

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; email: string; role: string };
    }
  }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as { id?: string };
    if (!decoded.id) return res.status(401).json({ error: 'Invalid or expired token' });

    const result = await query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows.length) return res.status(401).json({ error: 'User not found' });
    req.authUser = result.rows[0];
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.authUser?.role !== 'admin') return res.status(403).json({ error: 'Administrator access required' });
  return next();
}

export function requireSelfOrAdmin(paramName = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.authUser?.role === 'admin' || req.authUser?.id === req.params[paramName]) return next();
    return res.status(403).json({ error: 'You cannot access this customer account' });
  };
}
