const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const jwt = require('jsonwebtoken');

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'unit-test-only-key';
process.env.JWT_SECRET = 'unit-test-only-secret';
delete process.env.GEMINI_API_KEY;

const app = require('../src/app');
let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
});

test('health endpoint reports that the API is running', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('private snippet routes reject unauthenticated requests', async () => {
  const response = await fetch(`${baseUrl}/api/snippets`);
  assert.equal(response.status, 401);
});

test('public snippet route validates ids without authentication', async () => {
  const response = await fetch(`${baseUrl}/api/snippets/public/not-a-uuid`);
  assert.equal(response.status, 400);
});

test('AI route validates requests and reports missing Gemini configuration', async () => {
  const token = jwt.sign({ sub: 'unit-test-user' }, process.env.JWT_SECRET);
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const invalidAction = await fetch(`${baseUrl}/api/ai/assist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'invalid', prompt: 'test' }),
  });
  assert.equal(invalidAction.status, 400);

  const missingKey = await fetch(`${baseUrl}/api/ai/assist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'explain', code: 'console.log("hello")', language: 'javascript' }),
  });
  assert.equal(missingKey.status, 503);

  const missingPrompt = await fetch(`${baseUrl}/api/ai/assist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'generate' }),
  });
  assert.equal(missingPrompt.status, 400);

  const missingCode = await fetch(`${baseUrl}/api/ai/assist`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'explain' }),
  });
  assert.equal(missingCode.status, 400);
});
