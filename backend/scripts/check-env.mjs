import fs from 'node:fs';
import path from 'node:path';

const isBackendCwd = path.basename(process.cwd()) === 'backend';
const envPath = isBackendCwd ? path.resolve('.env') : path.resolve('backend/.env');
const examplePath = isBackendCwd ? path.resolve('.env.example') : path.resolve('backend/.env.example');

if (!fs.existsSync(envPath)) {
  console.error('❌ backend/.env tidak ditemukan');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const exampleContent = fs.readFileSync(examplePath, 'utf8');

const currentKeys = new Set(
  envContent.split('\n').map((l) => l.trim()).filter(Boolean).filter((l) => !l.startsWith('#')).map((l) => l.split('=')[0])
);
const requiredKeys = exampleContent.split('\n').map((l) => l.trim()).filter(Boolean).filter((l) => !l.startsWith('#')).map((l) => l.split('=')[0]);

const missing = requiredKeys.filter((k) => !currentKeys.has(k));
if (missing.length) {
  console.error('❌ Missing env keys:', missing.join(', '));
  process.exit(1);
}

console.log('✅ Semua env key backend tersedia');
