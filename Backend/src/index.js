const fs = require('fs');
const path = require('path');

const envPaths = [path.join(__dirname, '..', '.env'), path.join(__dirname, '.env')];
const envPath = envPaths.find((candidate) => fs.existsSync(candidate));
require('dotenv').config({ path: envPath || envPaths[0] });

if (!process.env.GEMINI_API_KEY?.trim()) {
  console.warn('[ai] GEMINI_API_KEY is not configured; AI assistance is disabled.');
}

if (!process.env.JWT_SECRET && process.env.JWT_secret) {
  process.env.JWT_SECRET = process.env.JWT_secret;
}

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;