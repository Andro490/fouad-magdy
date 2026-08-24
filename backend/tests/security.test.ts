import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticateToken } from '../src/middleware/auth';

test('authenticateToken rejects mock tokens used in local development', () => {
  let nextCalled = false;
  const req: any = {
    headers: {
      authorization: 'Bearer mock-jwt-token',
    },
  };
  const res: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.payload = payload;
      return this;
    },
  };

  authenticateToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.error, 'Invalid or expired token.');
});

test('authenticateToken requires a real bearer token', () => {
  let nextCalled = false;
  const req: any = { headers: {} };
  const res: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.payload = payload;
      return this;
    },
  };

  authenticateToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.payload.error, /No token provided|Missing authorization/i);
});
