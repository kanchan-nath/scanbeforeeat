import request from 'supertest';
import { app } from '../app.js';
import { pool } from '../config/database.js';

async function runDemoVerification() {
  console.log('🧪 Starting Demo Account Constraints Verification Test Suite...\n');
  const demoAgent = request.agent(app);
  const regularAgent = request.agent(app);

  let passed = 0;
  let failed = 0;

  function assertTest(name, condition, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. Get CSRF Token
    // -------------------------------------------------------------------------
    const csrfRes = await demoAgent.get('/api/v1/auth/csrf-token');
    const csrfToken = csrfRes.body.csrfToken;
    assertTest('1. Fetch CSRF token for demo session', csrfRes.status === 200 && Boolean(csrfToken));

    // -------------------------------------------------------------------------
    // 2. Demo User Login
    // -------------------------------------------------------------------------
    const loginRes = await demoAgent
      .post('/api/v1/auth/login')
      .set('x-csrf-token', csrfToken)
      .send({ email: 'demo@scanbeforeeat.local', password: 'DemoUser@1234' });

    assertTest(
      '2. Demo user login succeeds and returns isDemo=true',
      loginRes.status === 200 && loginRes.body.user?.isDemo === true,
      `Status: ${loginRes.status}, isDemo: ${loginRes.body.user?.isDemo}`
    );

    const activeCsrfToken = loginRes.body.csrfToken || csrfToken;

    // Verify /api/v1/auth/me also returns isDemo=true
    const meRes = await demoAgent.get('/api/v1/auth/me');
    assertTest(
      '3. /api/v1/auth/me returns isDemo=true and remaining scans count',
      meRes.status === 200 && meRes.body.user?.isDemo === true && typeof meRes.body.user?.scansRemainingToday === 'number',
      `isDemo: ${meRes.body.user?.isDemo}, scansRemaining: ${meRes.body.user?.scansRemainingToday}`
    );

    // -------------------------------------------------------------------------
    // 3. Deletion Constraints Testing
    // -------------------------------------------------------------------------
    // Test A: Demo user cannot delete individual scan
    const deleteScanRes = await demoAgent
      .delete('/api/v1/scans/1')
      .set('x-csrf-token', activeCsrfToken);

    assertTest(
      '4. Demo user CANNOT delete individual scan (403 Forbidden)',
      deleteScanRes.status === 403 && deleteScanRes.body.code === 'DEMO_DELETION_FORBIDDEN',
      `Status: ${deleteScanRes.status}, code: ${deleteScanRes.body.code}`
    );

    // Test B: Demo user cannot clear all history
    const clearHistoryRes = await demoAgent
      .delete('/api/v1/scans/clear-all')
      .set('x-csrf-token', activeCsrfToken);

    assertTest(
      '5. Demo user CANNOT clear all scan history (403 Forbidden)',
      clearHistoryRes.status === 403 && clearHistoryRes.body.code === 'DEMO_DELETION_FORBIDDEN',
      `Status: ${clearHistoryRes.status}, code: ${clearHistoryRes.body.code}`
    );

    // Test C: Demo user cannot delete demo account
    const deleteAccountRes = await demoAgent
      .delete('/api/v1/auth/delete-account')
      .set('x-csrf-token', activeCsrfToken)
      .send({ password: 'DemoUser@1234' });

    assertTest(
      '6. Demo user CANNOT delete account (403 Forbidden)',
      deleteAccountRes.status === 403 && deleteAccountRes.body.code === 'DEMO_DELETION_FORBIDDEN',
      `Status: ${deleteAccountRes.status}, code: ${deleteAccountRes.body.code}`
    );

    // -------------------------------------------------------------------------
    // 4. Scan Limits Testing (2 Scans per day)
    // -------------------------------------------------------------------------
    const demoUserId = loginRes.body.user.id;

    // Clean up any test scans created today by demo user to start with a fresh count of 0
    await pool.execute(
      `DELETE FROM scans WHERE user_id = ? AND created_at >= CONCAT(UTC_DATE(), ' 00:00:00')`,
      [demoUserId]
    );

    // Attempt Scan 1: Should SUCCEED (1 of 2)
    const scan1Res = await demoAgent
      .post('/api/v1/scans')
      .set('x-csrf-token', activeCsrfToken)
      .send({
        scanMethod: 'manual',
        productName: 'Demo Test Product 1',
        confirmedIngredientsText: 'Rolled oats, almond milk, chia seeds, fresh blueberries, honey'
      });

    assertTest(
      '7. Demo user scan 1 succeeds (Allowed: 1 of 2)',
      scan1Res.status === 201 && scan1Res.body.demoScanInfo?.remaining === 1,
      `Status: ${scan1Res.status}, remaining: ${scan1Res.body.demoScanInfo?.remaining}`
    );

    // Attempt Scan 2: Should SUCCEED (2 of 2)
    const scan2Res = await demoAgent
      .post('/api/v1/scans')
      .set('x-csrf-token', activeCsrfToken)
      .send({
        scanMethod: 'manual',
        productName: 'Demo Test Product 2',
        confirmedIngredientsText: 'Whole wheat flour, water, yeast, sea salt, olive oil'
      });

    assertTest(
      '8. Demo user scan 2 succeeds (Allowed: 2 of 2)',
      scan2Res.status === 201 && scan2Res.body.demoScanInfo?.remaining === 0,
      `Status: ${scan2Res.status}, remaining: ${scan2Res.body.demoScanInfo?.remaining}`
    );

    // Attempt Scan 3: Should FAIL with 429 Too Many Requests (Limit reached)
    const scan3Res = await demoAgent
      .post('/api/v1/scans')
      .set('x-csrf-token', activeCsrfToken)
      .send({
        scanMethod: 'manual',
        productName: 'Demo Test Product 3',
        confirmedIngredientsText: 'Sugar, palm oil, artificial flavoring'
      });

    assertTest(
      '9. Demo user scan 3 is REJECTED with 429 Too Many Requests (Limit: 2/day)',
      scan3Res.status === 429 && scan3Res.body.code === 'DEMO_SCAN_LIMIT_REACHED',
      `Status: ${scan3Res.status}, code: ${scan3Res.body.code}, error: ${scan3Res.body.error}`
    );

    // -------------------------------------------------------------------------
    // 5. Contrast Testing: Regular User has NO Deletion or Daily Scan Restrictions
    // -------------------------------------------------------------------------
    const regEmail = `regular_tester_${Date.now()}@test.local`;
    const regPassword = 'RegularTestPassword@123';

    const regCsrfRes = await regularAgent.get('/api/v1/auth/csrf-token');
    const regCsrfToken = regCsrfRes.body.csrfToken;

    const regRegisterRes = await regularAgent
      .post('/api/v1/auth/register')
      .set('x-csrf-token', regCsrfToken)
      .send({
        email: regEmail,
        password: regPassword,
        displayName: 'Regular Tester'
      });

    assertTest(
      '10. Regular user registers and isDemo=false',
      regRegisterRes.status === 201 && regRegisterRes.body.user?.isDemo === false,
      `Status: ${regRegisterRes.status}, isDemo: ${regRegisterRes.body.user?.isDemo}`
    );

    const regActiveCsrf = regRegisterRes.body.csrfToken || regCsrfToken;

    // Regular user creates a scan
    const regScanRes = await regularAgent
      .post('/api/v1/scans')
      .set('x-csrf-token', regActiveCsrf)
      .send({
        scanMethod: 'manual',
        productName: 'Regular User Product',
        confirmedIngredientsText: 'Brown rice, grilled chicken, steamed broccoli, olive oil'
      });

    const regScanId = regScanRes.body.scan?.id;
    assertTest(
      '11. Regular user creates scan without demo restrictions',
      regScanRes.status === 201 && Boolean(regScanId),
      `Status: ${regScanRes.status}, scanId: ${regScanId}`
    );

    // Regular user CAN delete their own scan
    const regDeleteRes = await regularAgent
      .delete(`/api/v1/scans/${regScanId}`)
      .set('x-csrf-token', regActiveCsrf);

    assertTest(
      '12. Regular user CAN delete their own scan (200 OK)',
      regDeleteRes.status === 200 && regDeleteRes.body.success === true,
      `Status: ${regDeleteRes.status}`
    );

    // Clean up regular test user
    if (regRegisterRes.body.user?.id) {
      await pool.execute('DELETE FROM users WHERE id = ?', [regRegisterRes.body.user.id]);
    }

    console.log('\n======================================================');
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Unexpected test error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runDemoVerification();

