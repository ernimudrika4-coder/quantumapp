import { env } from '../../config/env';
import { PROVIDER_TIMEOUT_MS } from '../../config/constants';

export async function fetchForexFactoryCalendar() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const res = await fetch(env.FOREX_FACTORY_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`ForexFactory feed failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
