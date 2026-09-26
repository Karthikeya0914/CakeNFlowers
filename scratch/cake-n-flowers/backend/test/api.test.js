const assert = require('assert');
const http = require('http');
const app = require('../src/server');

let server;
const PORT = 5099;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:${PORT}${path}`,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  server = app.listen(PORT);
  console.log('Testing Cake N Flowers Backend API...');

  try {
    // 1. Health check
    const health = await request('/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, 'online');
    console.log('✔ Health check passed');

    // 2. Categories
    const cats = await request('/api/categories');
    assert.strictEqual(cats.status, 200);
    assert.ok(Array.isArray(cats.body.categories));
    console.log(`✔ Categories passed (${cats.body.categories.length} categories)`);

    // 3. Products
    const prods = await request('/api/products');
    assert.strictEqual(prods.status, 200);
    assert.ok(Array.isArray(prods.body.products));
    console.log(`✔ Products listing passed (${prods.body.products.length} products)`);

    // 4. Coupon validation
    const couponRes = await request('/api/coupons/validate', {
      method: 'POST',
      body: { code: 'WELCOME10', subtotal: 50.0 }
    });
    assert.strictEqual(couponRes.status, 200);
    assert.strictEqual(couponRes.body.valid, true);
    assert.strictEqual(couponRes.body.discount, 5.0);
    console.log('✔ Coupon validation passed');

    // 5. Order Tracking
    const trackRes = await request('/api/orders/track/CNF-2026-8941');
    assert.strictEqual(trackRes.status, 200);
    assert.strictEqual(trackRes.body.order.orderNumber, 'CNF-2026-8941');
    assert.ok(Array.isArray(trackRes.body.order.stages));
    console.log('✔ Order tracking lookup passed');

    console.log('\nAll API automated tests completed successfully! 🎉');
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTests();
