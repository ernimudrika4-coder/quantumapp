// Real-time market data service
// Menggunakan CoinGecko API (free, no API key required)

export interface LivePrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  sparkline7d: number[];
  lastUpdate: number;
  category: "crypto" | "forex" | "metal" | "index";
}

export interface PriceHistory {
  prices: number[]; // oldest to newest
  timestamps: number[];
}

// CoinGecko free API (rate limit: 10-30 calls/min)
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

const COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
};

const COIN_SYMBOLS: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  SOL: "◎",
  BNB: "B",
  XRP: "X",
  ADA: "A",
  DOGE: "D",
  AVAX: "A",
};

// Fetch live prices from CoinGecko
export async function fetchLivePrices(): Promise<LivePrice[]> {
  try {
    const ids = Object.values(COIN_IDS).join(",");
    const res = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`
    );

    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();

    return data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      volume24h: coin.total_volume,
      sparkline7d: coin.sparkline_in_7d?.price || [],
      lastUpdate: Date.now(),
      category: "crypto",
    }));
  } catch (err) {
    console.error("Error fetching live prices:", err);
    // Return cached data if available
    const cached = localStorage.getItem("quantum_cache_prices");
    if (cached) {
      return JSON.parse(cached);
    }
    throw err;
  }
}

// Fetch historical data for technical analysis
export async function fetchPriceHistory(coinId: string, days: number = 7): Promise<PriceHistory> {
  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return {
      prices: data.prices.map((p: any) => p[1]),
      timestamps: data.prices.map((p: any) => p[0]),
    };
  } catch (err) {
    console.error("Error fetching history:", err);
    // Return empty array
    return { prices: [], timestamps: [] };
  }
}

// Get coin ID from symbol
export function getCoinId(symbol: string): string | undefined {
  return COIN_IDS[symbol.toUpperCase()];
}

// Get coin icon/symbol
export function getCoinSymbol(symbol: string): string {
  return COIN_SYMBOLS[symbol.toUpperCase()] || symbol.charAt(0);
}

// Cache prices for offline/fallback
export function cachePrices(prices: LivePrice[]) {
  try {
    localStorage.setItem("quantum_cache_prices", JSON.stringify(prices));
  } catch (err) {
    console.error("Cache error:", err);
  }
}

// Format price in Indonesian style
export function formatPrice(price: number, _currency: string = "USD"): string {
  if (price >= 1000) {
    return price.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  }
  if (price >= 1) {
    return price.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }
  return price.toLocaleString("id-ID", { maximumFractionDigits: 6 });
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
  return `$${volume.toFixed(2)}`;
}
