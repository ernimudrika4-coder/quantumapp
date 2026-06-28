import { env } from '../../config/env';
import { PROVIDER_TIMEOUT_MS } from '../../config/constants';

export async function fetchTwelveDataQuote(symbol: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${env.TWELVE_DATA_API_KEY}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`TwelveData quote failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchTwelveDataTimeSeries(symbol: string, interval = '1h', outputsize = 120) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${env.TWELVE_DATA_API_KEY}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`TwelveData time_series failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
