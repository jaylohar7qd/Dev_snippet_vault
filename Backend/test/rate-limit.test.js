const assert = require('node:assert/strict');
const test = require('node:test');
const createRateLimiter = require('../src/middleware/rate-limit');

function makeResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('rate limiter rejects requests after the configured maximum', () => {
  const limit = createRateLimiter({ windowMs: 60_000, max: 1 });
  const req = { ip: '127.0.0.1' };
  const firstResponse = makeResponse();
  const secondResponse = makeResponse();
  let nextCalls = 0;

  limit(req, firstResponse, () => { nextCalls += 1; });
  limit(req, secondResponse, () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.equal(secondResponse.statusCode, 429);
  assert.equal(secondResponse.headers['Retry-After'], '60');
  assert.equal(secondResponse.body.error, 'Too many requests. Please try again later.');
});

test('rate limiter keeps separate keys independent', () => {
  const limit = createRateLimiter({ windowMs: 60_000, max: 1 });
  let nextCalls = 0;

  limit({ ip: '127.0.0.1' }, makeResponse(), () => { nextCalls += 1; });
  limit({ ip: '127.0.0.2' }, makeResponse(), () => { nextCalls += 1; });

  assert.equal(nextCalls, 2);
});
