const BASE = process.env.API_BASE || 'http://localhost:4000';

const endpoints = [
  '/api/health',
  '/api/health/ready',
  '/api/ops/version',
  '/api/ops/launch-readiness',
  '/api/markets/quotes',
  '/api/events/upcoming',
  '/api/signals/live',
];

let failed = false;
for (const endpoint of endpoints) {
  try {
    const res = await fetch(`${BASE}${endpoint}`);
    if (!res.ok) {
      console.error(`❌ ${endpoint} -> ${res.status}`);
      failed = true;
      continue;
    }
    console.log(`✅ ${endpoint}`);
  } catch (err) {
    console.error(`❌ ${endpoint} ->`, err.message);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('✅ Smoke test selesai');
