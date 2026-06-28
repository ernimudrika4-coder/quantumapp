import { DEFAULT_SYMBOLS, MARKET_CACHE_TTL_SEC } from '../../config/constants';
import { cacheGet, cacheSet } from '../../cache/store';
import { fetchTwelveDataQuote } from '../../providers/twelvedata/client';
import { normalizeQuote, type NormalizedQuote } from '../../providers/twelvedata/normalize';

const META: Record<string, { name: string; category: 'crypto' | 'forex' | 'metal' | 'index' }> = {
  'BTC/USD': { name: 'Bitcoin', category: 'crypto' },
  'ETH/USD': { name: 'Ethereum', category: 'crypto' },
  'SOL/USD': { name: 'Solana', category: 'crypto' },
  'EUR/USD': { name: 'Euro / US Dollar', category: 'forex' },
  'GBP/USD': { name: 'British Pound', category: 'forex' },
  'GBP/JPY': { name: 'Pound / Yen', category: 'forex' },
  'XAU/USD': { name: 'Gold', category: 'metal' },
  'SPX500': { name: 'S&P 500', category: 'index' },
  'NAS100': { name: 'NASDAQ 100', category: 'index' },
};

export async function getQuote(symbol: string): Promise<NormalizedQuote | null> {
  const cacheKey = `market:quote:${symbol}`;
  const cached = await cacheGet<NormalizedQuote>(cacheKey);
  if (cached) return cached;

  const raw = await fetchTwelveDataQuote(symbol);
  if (!raw || raw.code || raw.status === 'error') return null;
  const meta = META[symbol] ?? { name: symbol, category: 'crypto' as const };
  const normalized = normalizeQuote(raw, { symbol, ...meta });
  await cacheSet(cacheKey, normalized, MARKET_CACHE_TTL_SEC);
  return normalized;
}

export async function getQuotes(symbols: string[] = DEFAULT_SYMBOLS): Promise<NormalizedQuote[]> {
  const results = await Promise.all(symbols.map((symbol) => getQuote(symbol)));
  return results.filter((q): q is NormalizedQuote => Boolean(q));
}
