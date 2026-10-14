const express = require('express');
const cors = require('cors');
const createRateLimiter = require('./middleware/rate-limit');

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }), require('./routes/auth'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/snippets', require('./routes/snippet'));
app.use('/api/ai', require('./routes/ai'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
