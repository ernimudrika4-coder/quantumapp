// Twelve Data API Service
// Full market coverage: Forex, Crypto, Metals, Indices
// API Key: dd55ebf63a434de19e236f428a51a8a7

const API_KEY = "dd55ebf63a434de19e236f428a51a8a7";
const BASE_URL = "https://api.twelvedata.com";
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

// Symbol definitions with metadata
export interface SymbolDef {
  symbol: string;
  name: string;
  icon: string;
  category: "crypto" | "forex" | "metal" | "index";
  gradient: string;
}

export const SYMBOLS: SymbolDef[] = [
  // Crypto
  { symbol: "BTC/USD", name: "Bitcoin", icon: "₿", category: "crypto", gradient: "from-orange-400 to-amber-700" },
  { symbol: "ETH/USD", name: "Ethereum", icon: "Ξ", category: "crypto", gradient: "from-violet-400 to-purple-700" },
  { symbol: "SOL/USD", name: "Solana", icon: "◎", category: "crypto", gradient: "from-cyan-400 to-blue-700" },
  // Forex
  { symbol: "EUR/USD", name: "Euro / US Dollar", icon: "€", category: "forex", gradient: "from-blue-400 to-cyan-600" },
  { symbol: "GBP/USD", name: "British Pound", icon: "£", category: "forex", gradient: "from-rose-400 to-pink-600" },
  { symbol: "GBP/JPY", name: "Pound / Yen", icon: "¥", category: "forex", gradient: "from-red-400 to-orange-600" },
  // Metals
  { symbol: "XAU/USD", name: "Gold", icon: "Au", category: "metal", gradient: "from-amber-400 to-yellow-700" },
  // Indices
  { symbol: "SPX500", name: "S&P 500", icon: "S", category: "index", gradient: "from-emerald-400 to-teal-700" },
  { symbol: "NAS100", name: "NASDAQ 100", icon: "N", category: "index", gradient: "from-indigo-400 to-violet-700" },
];

// Types
export interface LiveData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume?: number;
  timestamp: number;
  sparkline: number[];
  lastUpdate: number;
  source?: "rest" | "ws" | "cache";
}

export interface TimeSeriesPoint {
  datetime: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Rate limiter — 8 requests/minute
const requestQueue: number[] = [];
async function rateLimit() {
  const now = Date.now();
  // Remove requests older than 1 minute
  while (requestQueue.length > 0 && requestQueue[0] < now - 60000) {
    requestQueue.shift();
  }
  if (requestQueue.length >= 7) {
    const waitTime = 60000 - (now - requestQueue[0]);
    await new Promise((r) => setTimeout(r, waitTime + 100));
  }
  requestQueue.push(Date.now());
}

// Cache management
function getCacheKey(type: string, symbol: string): string {
  return `td_${type}_${symbol.replace("/", "_")}`;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch {}
}

async function fetchJsonWithFallback(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Fallback only for GET requests via CORS proxy
    if (!init || !init.method || init.method.toUpperCase() === "GET") {
      const proxied = `${CORS_PROXY}${encodeURIComponent(url)}`;
      const res = await fetch(proxied);
      if (!res.ok) throw err;
      return await res.json();
    }
    throw err;
  }
}

// Fetch current quote (price, change, etc.)
export async function fetchQuote(symbol: string): Promise<LiveData | null> {
  await rateLimit();
  const cacheKey = getCacheKey("quote", symbol);
  const cached = getCached<LiveData>(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchJsonWithFallback(
      `${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`
    );

    if (data.code || data.status === "error") {
      console.warn(`Quote error for ${symbol}:`, data.message);
      return null;
    }

      const live: LiveData = {
        symbol,
        price: parseFloat(data.close),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        open: parseFloat(data.open),
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        volume: data.volume ? parseFloat(data.volume) : undefined,
        timestamp: data.timestamp ? data.timestamp * 1000 : Date.now(),
        sparkline: [],
        lastUpdate: Date.now(),
        source: "rest",
      };

    setCache(cacheKey, live);
    return live;
  } catch (err) {
    console.error(`Error fetching ${symbol}:`, err);
    return getCached<LiveData>(cacheKey);
  }
}

// Fetch time series for technical analysis
export async function fetchTimeSeries(
  symbol: string,
  interval: "1h" | "4h" | "1day" = "1h",
  outputsize: number = 80
): Promise<TimeSeriesPoint[]> {
  await rateLimit();
  const cacheKey = getCacheKey(`ts_${interval}`, symbol);
  const cached = getCached<TimeSeriesPoint[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  try {
    const data = await fetchJsonWithFallback(
      `${BASE_URL}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`
    );

    if (data.code || data.status === "error") {
      console.warn(`Time series error for ${symbol}:`, data.message);
      return cached || [];
    }

    if (!data.values || !Array.isArray(data.values)) return cached || [];

    // Sort oldest first (API returns newest first)
    const series: TimeSeriesPoint[] = data.values
      .map((v: any) => ({
        datetime: v.datetime,
        timestamp: new Date(v.datetime).getTime(),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
      }))
      .sort((a: TimeSeriesPoint, b: TimeSeriesPoint) => a.timestamp - b.timestamp);

    setCache(cacheKey, series);
    return series;
  } catch (err) {
    console.error(`Error fetching time series for ${symbol}:`, err);
    return getCached<TimeSeriesPoint[]>(cacheKey) || [];
  }
}

// Fetch RSI indicator directly from Twelve Data
export async function fetchRSI(symbol: string, interval: "1h" | "4h" | "1day" = "1h"): Promise<number | null> {
  await rateLimit();
  const cacheKey = getCacheKey(`rsi_${interval}`, symbol);
  const cached = getCached<number>(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await fetch(
      `${BASE_URL}/rsi?symbol=${encodeURIComponent(symbol)}&interval=${interval}&time_period=14&outputsize=1&apikey=${API_KEY}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.code || data.status === "error" || !data.values || data.values.length === 0) {
      return cached;
    }

    const rsi = parseFloat(data.values[0].rsi);
    setCache(cacheKey, rsi);
    return rsi;
  } catch (err) {
    console.error(`RSI error for ${symbol}:`, err);
    return cached;
  }
}

// Fetch MACD indicator
export async function fetchMACD(symbol: string, interval: "1h" | "4h" | "1day" = "1h"): Promise<{ macd: number; signal: number } | null> {
  await rateLimit();
  const cacheKey = getCacheKey(`macd_${interval}`, symbol);
  const cached = getCached<{ macd: number; signal: number }>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `${BASE_URL}/macd?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=1&apikey=${API_KEY}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.code || data.status === "error" || !data.values || data.values.length === 0) {
      return cached;
    }

    const result = {
      macd: parseFloat(data.values[0].macd),
      signal: parseFloat(data.values[0].macd_signal),
    };
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`MACD error for ${symbol}:`, err);
    return cached;
  }
}

// Batch fetch all quotes professionally
// Uses /batch first (1 request), then falls back to individual quote requests.
export async function fetchAllQuotes(
  symbols: SymbolDef[] = SYMBOLS
): Promise<Map<string, LiveData>> {
  const results = new Map<string, LiveData>();

  // 1) Try batch endpoint first
  try {
    const body: Record<string, string> = {};
    symbols.forEach((s, idx) => {
      body[`q${idx}`] = `/quote?symbol=${encodeURIComponent(s.symbol)}`;
    });

    const data = await fetchJsonWithFallback(`${BASE_URL}/batch?apikey=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (data && typeof data === "object") {
      symbols.forEach((s, idx) => {
        const item = data[`q${idx}`];
        const raw = item?.data || item;
        if (raw && !raw.code && raw.close) {
          const live: LiveData = {
            symbol: s.symbol,
            price: parseFloat(raw.close),
            change: parseFloat(raw.change || "0"),
            changePercent: parseFloat(raw.percent_change || "0"),
            open: parseFloat(raw.open || raw.close),
            high: parseFloat(raw.high || raw.close),
            low: parseFloat(raw.low || raw.close),
            volume: raw.volume ? parseFloat(raw.volume) : undefined,
            timestamp: raw.timestamp ? raw.timestamp * 1000 : Date.now(),
            sparkline: [],
            lastUpdate: Date.now(),
            source: "rest",
          };
          results.set(s.symbol, live);
          setCache(getCacheKey("quote", s.symbol), live);
        }
      });
    }

    if (results.size > 0) return results;
  } catch (err) {
    console.warn("Batch quote failed, fallback to individual fetch:", err);
  }

  // 2) Fallback to individual fetch (first priority list)
  const priority = symbols.slice(0, 6);
  const promises = priority.map(async (s) => {
    const data = await fetchQuote(s.symbol);
    if (data) results.set(s.symbol, data);
  });
  await Promise.all(promises);
  return results;
}

// Get symbol metadata
export function getSymbolDef(symbol: string): SymbolDef | undefined {
  return SYMBOLS.find((s) => s.symbol === symbol);
}

// Format price based on symbol type
export function formatPrice(value: number, symbol?: string): string {
  const sym = symbol ? getSymbolDef(symbol) : undefined;
  if (!sym) return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });

  if (sym.category === "forex") {
    return value.toFixed(value < 10 ? 4 : 2);
  }
  if (sym.category === "metal") {
    return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }
  if (sym.category === "index") {
    return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  }
  // Crypto
  if (value >= 1000) return value.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  if (value >= 1) return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  return value.toLocaleString("id-ID", { maximumFractionDigits: 4 });
}

// Clear all caches
export function clearCache() {
  try {
    const keys = Object.keys(localStorage);
    keys.filter((k) => k.startsWith("td_")).forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// WebSocket live price stream (more reliable than REST in browser)
export function connectQuotesSocket(
  symbols: string[],
  handlers: {
    onPrice: (payload: LiveData) => void;
    onOpen?: () => void;
    onError?: (err: Event) => void;
    onStatus?: (message: any) => void;
  }
) {
  const ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`);

  ws.onopen = () => {
    handlers.onOpen?.();
    ws.send(JSON.stringify({
      action: "subscribe",
      params: { symbols: symbols.join(",") }
    }));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (msg.event === "price" && msg.symbol && msg.price) {
        const price = parseFloat(msg.price);
        const payload: LiveData = {
          symbol: msg.symbol,
          price,
          change: 0,
          changePercent: 0,
          open: price,
          high: price,
          low: price,
          volume: msg.day_volume ? parseFloat(msg.day_volume) : undefined,
          timestamp: msg.timestamp ? msg.timestamp * 1000 : Date.now(),
          sparkline: [],
          lastUpdate: Date.now(),
          source: "ws",
        };
        handlers.onPrice(payload);
      } else {
        handlers.onStatus?.(msg);
      }
    } catch {
      // ignore malformed message
    }
  };

  ws.onerror = (err) => handlers.onError?.(err);
  return () => ws.close();
}
