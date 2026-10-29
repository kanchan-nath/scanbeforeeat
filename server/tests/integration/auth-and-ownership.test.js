import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../app.js';
import { pool } from '../../config/database.js';

test('Integration & Security: Authentication, CSRF, and Multi-Tenant Ownership', async (t) => {
  const agentUserA = request.agent(app);
  const agentUserB = request.agent(app);

  const emailA = `test_user_a_${Date.now()}@test.local`;
  const emailB = `test_user_b_${Date.now()}@test.local`;
  const password = 'TestUserPassword@123';

  let csrfTokenA = null;
  let csrfTokenB = null;
  let scanIdUserA = null;

  await t.test('1. Unauthenticated requests to protected endpoints return 401', async () => {
    const res = await request(app).get('/api/v1/scans');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('2. Missing CSRF token on registration is rejected with 403', async () => {
    // Missing CSRF token
    const rejectRes = await agentUserA
      .post('/api/v1/auth/register')
      .send({ email: emailA, password, displayName: 'User A' });
    
    assert.equal(rejectRes.status, 403, 'Missing CSRF must return 403');
    assert.equal(rejectRes.body.success, false);
  });

  await t.test('3. Successfully registers User A with valid CSRF token', async () => {
    // Fetch CSRF token for Agent A
    const csrfResA = await agentUserA.get('/api/v1/auth/csrf-token');
    csrfTokenA = csrfResA.body.csrfToken;
    assert.ok(csrfTokenA, 'Received CSRF token');

    const regRes = await agentUserA
      .post('/api/v1/auth/register')
      .set('x-csrf-token', csrfTokenA)
      .send({ email: emailA, password, displayName: 'User A' });

    assert.equal(regRes.status, 201);
    assert.equal(regRes.body.success, true);
    assert.equal(regRes.body.user.email, emailA);
    csrfTokenA = regRes.body.csrfToken || csrfTokenA;
  });

  await t.test('4. Successfully registers User B with separate session', async () => {
    const csrfResB = await agentUserB.get('/api/v1/auth/csrf-token');
    csrfTokenB = csrfResB.body.csrfToken;

    const regRes = await agentUserB
      .post('/api/v1/auth/register')
      .set('x-csrf-token', csrfTokenB)
      .send({ email: emailB, password, displayName: 'User B' });

    assert.equal(regRes.status, 201);
    assert.equal(regRes.body.success, true);
    csrfTokenB = regRes.body.csrfToken || csrfTokenB;
  });

  await t.test('5. User A creates a food ingredient scan', async () => {
    const scanRes = await agentUserA
      .post('/api/v1/scans')
      .set('x-csrf-token', csrfTokenA)
      .send({
        scanMethod: 'manual',
        productName: 'User A Secret Snack',
        confirmedIngredientsText: 'Whole wheat flour, sugar, vegetable oil, salt.'
      });

    assert.equal(scanRes.status, 201);
    assert.equal(scanRes.body.success, true);
    scanIdUserA = scanRes.body.scan.id;
    assert.ok(scanIdUserA, 'Created scan ID for User A');
  });

  await t.test('5b. User A creates a scan for a product with an existing barcode (regression test)', async () => {
    const barcodeScanRes = await agentUserA
      .post('/api/v1/scans')
      .set('x-csrf-token', csrfTokenA)
      .send({
        scanMethod: 'barcode',
        barcode: '8901234567890',
        productName: 'ChocoCrunch Whole Wheat Biscuits',
        brand: 'NutriBake',
        category: 'Biscuits & Bakery',
        confirmedIngredientsText: 'Whole Wheat Flour, Sugar, Palm Oil, Cocoa Solids.'
      });

    assert.equal(barcodeScanRes.status, 201);
    assert.equal(barcodeScanRes.body.success, true);
    assert.ok(barcodeScanRes.body.scan.id);
    assert.ok(barcodeScanRes.body.scan.product_id > 0, 'product_id must be a valid positive integer referencing products table');
  });

  await t.test('6. User A can retrieve their own scan', async () => {
    const getRes = await agentUserA.get(`/api/v1/scans/${scanIdUserA}`);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.scan.id, scanIdUserA);
  });

  await t.test('7. SECURITY: User B CANNOT view User A\'s scan (Forbidden 403)', async () => {
    const blockedRes = await agentUserB.get(`/api/v1/scans/${scanIdUserA}`);
    assert.equal(blockedRes.status, 403, 'Cross-user data access must be blocked with 403');
    assert.equal(blockedRes.body.success, false);
  });

  await t.test('8. SECURITY: User B CANNOT delete User A\'s scan', async () => {
    const blockedDelete = await agentUserB
      .delete(`/api/v1/scans/${scanIdUserA}`)
      .set('x-csrf-token', csrfTokenB);

    assert.equal(blockedDelete.status, 403, 'Cross-user deletion must be blocked with 403');
  });

  await t.test('9. User A performs AI analysis on their scan', async () => {
    const analyzeRes = await agentUserA
      .post(`/api/v1/scans/${scanIdUserA}/analyze`)
      .set('x-csrf-token', csrfTokenA);

    assert.equal(analyzeRes.status, 200);
    assert.equal(analyzeRes.body.success, true);
    assert.ok(analyzeRes.body.report.overall_score > 0);
  });

  await t.test('10. Clean up test users', async () => {
    await agentUserA.delete('/api/v1/auth/delete-account').set('x-csrf-token', csrfTokenA).send({ password });
    await agentUserB.delete('/api/v1/auth/delete-account').set('x-csrf-token', csrfTokenB).send({ password });
  });

  after(async () => {
    await pool.end();
  });
});
