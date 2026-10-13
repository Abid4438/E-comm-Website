import type { Request, Response, NextFunction } from 'express';

type Bucket = { count: number; resetAt: number };

// Lightweight per-process limiter. This reduces bursts on a running instance, but
// serverless deployments should also enable a shared edge/WAF rate limit.
export function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  const buckets = new Map<string, Bucket>();
  let lastCleanup = 0;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    // Bound memory use by periodically removing expired entries.
    if (now - lastCleanup > Math.min(options.windowMs, 60_000)) {
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
      }
      lastCleanup = now;
    }

    const identity = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${identity}:${req.baseUrl || ''}${req.path}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    res.setHeader('RateLimit-Limit', String(options.max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, options.max - bucket.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > options.max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      return res.status(429).json({ error: options.message });
    }
    return next();
  };
}
