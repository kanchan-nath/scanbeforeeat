import test from 'node:test';
import assert from 'node:assert/strict';
import { productDataService } from '../../services/product-data.service.js';

test('Barcode validation logic', async (t) => {
  await t.test('accepts valid 8 to 14 digit retail barcodes', () => {
    assert.equal(productDataService.isValidBarcode('8901234567890'), true);
    assert.equal(productDataService.isValidBarcode('12345678'), true); // EAN-8
    assert.equal(productDataService.isValidBarcode('012345678905'), true); // UPC-A
    assert.equal(productDataService.isValidBarcode('12345678901234'), true); // ITF-14
  });

  await t.test('rejects malformed or alpha barcodes', () => {
    assert.equal(productDataService.isValidBarcode(''), false);
    assert.equal(productDataService.isValidBarcode('12345'), false); // too short
    assert.equal(productDataService.isValidBarcode('890123456789012345'), false); // too long
    assert.equal(productDataService.isValidBarcode('8901234ABC890'), false); // letters
    assert.equal(productDataService.isValidBarcode(null), false);
  });
});
