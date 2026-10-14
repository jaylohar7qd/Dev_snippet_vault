const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || process.env.JWT_secret;

function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'Login required' });
  }

  try {
    const payload = jwt.verify(match[1], jwtSecret, {
      algorithms: ['HS256']
    });

    if (typeof payload.sub !== 'string' || !payload.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = payload.sub;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = requireAuth;
