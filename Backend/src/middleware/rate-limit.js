function createRateLimiter({ windowMs, max, keyGenerator = (req) => req.ip || 'unknown' }) {
  const hits = new Map();

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const key = keyGenerator(req);
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    if (hits.size > 1000) {
      for (const [storedKey, storedEntry] of hits) {
        if (storedEntry.resetAt <= now) hits.delete(storedKey);
      }
    }

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    return next();
  };
}

module.exports = createRateLimiter;
