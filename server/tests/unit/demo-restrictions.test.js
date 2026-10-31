import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isDemoUser, preventDemoDeletion, enforceDemoScanLimit } from '../../middleware/demo-restriction.middleware.js';

describe('Demo Account Constraints: Deletion Block & Daily Scan Limits', () => {
  it('correctly identifies demo user by email or object', () => {
    assert.strictEqual(isDemoUser('demo@scanbeforeeat.local'), true);
    assert.strictEqual(isDemoUser('DEMO@SCANBEFOREEAT.LOCAL'), true);
    assert.strictEqual(isDemoUser({ email: 'demo@scanbeforeeat.local' }), true);

    assert.strictEqual(isDemoUser('regular_user@example.com'), false);
    assert.strictEqual(isDemoUser({ email: 'john.doe@gmail.com' }), false);
    assert.strictEqual(isDemoUser(null), false);
    assert.strictEqual(isDemoUser(undefined), false);
  });

  it('preventDemoDeletion blocks demo user with 403 Forbidden', () => {
    let statusCalled = null;
    let jsonCalled = null;
    let nextCalled = false;

    const req = {
      user: { id: 1, email: 'demo@scanbeforeeat.local', isDemo: true },
      originalUrl: '/api/v1/scans/12',
      method: 'DELETE'
    };

    const res = {
      status(code) {
        statusCalled = code;
        return this;
      },
      json(data) {
        jsonCalled = data;
        return this;
      }
    };

    const next = () => { nextCalled = true; };

    preventDemoDeletion(req, res, next);

    assert.strictEqual(nextCalled, false, 'next() should NOT be called for demo user deletion');
    assert.strictEqual(statusCalled, 403, 'Should respond with 403 Forbidden');
    assert.strictEqual(jsonCalled.success, false);
    assert.strictEqual(jsonCalled.code, 'DEMO_DELETION_FORBIDDEN');
  });

  it('preventDemoDeletion permits regular non-demo user to delete', () => {
    let nextCalled = false;

    const req = {
      user: { id: 42, email: 'regular_user@example.com', isDemo: false },
      originalUrl: '/api/v1/scans/12',
      method: 'DELETE'
    };

    const res = {
      status() { return this; },
      json() { return this; }
    };

    const next = () => { nextCalled = true; };

    preventDemoDeletion(req, res, next);

    assert.strictEqual(nextCalled, true, 'next() SHOULD be called for non-demo users');
  });

  it('enforceDemoScanLimit permits regular non-demo user unlimited scans', async () => {
    let nextCalled = false;

    const req = {
      user: { id: 42, email: 'regular_user@example.com', isDemo: false }
    };

    const res = {
      status() { return this; },
      json() { return this; }
    };

    const next = () => { nextCalled = true; };

    await enforceDemoScanLimit(req, res, next);

    assert.strictEqual(nextCalled, true, 'next() SHOULD be called for non-demo users');
  });
});

