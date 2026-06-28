export interface NormalizedQuote {
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'metal' | 'index';
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume?: number;
  timestamp: number;
  source: 'twelvedata';
}

export function normalizeQuote(raw: any, meta: { symbol: string; name: string; category: 'crypto' | 'forex' | 'metal' | 'index' }): NormalizedQuote {
  const close = Number(raw?.close ?? 0);
  const open = Number(raw?.open ?? close);
  const change = Number(raw?.change ?? close - open);
  const changePercent = Number(raw?.percent_change ?? (open !== 0 ? ((close - open) / open) * 100 : 0));
  return {
    symbol: meta.symbol,
    name: meta.name,
    category: meta.category,
    price: close,
    change,
    changePercent,
    open,
    high: Number(raw?.high ?? close),
    low: Number(raw?.low ?? close),
    volume: raw?.volume ? Number(raw.volume) : undefined,
    timestamp: raw?.timestamp ? Number(raw.timestamp) * 1000 : Date.now(),
    source: 'twelvedata'
  };
}

export interface NormalizedCandle {
  symbol: string;
  timeframe: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export function normalizeTimeSeries(raw: any, symbol: string, timeframe: string): NormalizedCandle[] {
  const values = Array.isArray(raw?.values) ? raw.values : [];
  return values
    .map((v: any) => ({
      symbol,
      timeframe,
      timestamp: new Date(v.datetime).getTime(),
      open: Number(v.open),
      high: Number(v.high),
      low: Number(v.low),
      close: Number(v.close),
      volume: v.volume ? Number(v.volume) : undefined,
    }))
    .sort((a: any, b: any) => a.timestamp - b.timestamp);
}
