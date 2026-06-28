import { getQuote } from './service';
import { fetchTwelveDataTimeSeries } from '../../providers/twelvedata/client';
import { normalizeTimeSeries } from '../../providers/twelvedata/normalize';
import { getUpcomingEvents } from '../events/service';
import { getGeneratedSignalBySymbol } from '../signals/generated-repository';
import { atrApprox, ema, macd, rsi, sma, structure, volatility, momentum } from '../../engine/indicators';

const MARKET_TO_COUNTRIES: Record<string, string[]> = {
  'EUR/USD': ['EUR', 'USD'],
  'GBP/USD': ['GBP', 'USD'],
  'GBP/JPY': ['GBP', 'JPY'],
  'XAU/USD': ['USD'],
  'SPX500': ['USD'],
  'NAS100': ['USD'],
};

export async function getMarketDetail(symbol: string) {
  const [quote, ts1hRaw, ts4hRaw, ts1dRaw, events, signal] = await Promise.all([
    getQuote(symbol),
    fetchTwelveDataTimeSeries(symbol, '1h', 120),
    fetchTwelveDataTimeSeries(symbol, '4h', 80),
    fetchTwelveDataTimeSeries(symbol, '1day', 80),
    getUpcomingEvents(),
    getGeneratedSignalBySymbol(symbol),
  ]);

  const candles1h = normalizeTimeSeries(ts1hRaw, symbol, '1h');
  const candles4h = normalizeTimeSeries(ts4hRaw, symbol, '4h');
  const candles1d = normalizeTimeSeries(ts1dRaw, symbol, '1day');

  const closes1h = candles1h.map((c) => c.close);
  const closes4h = candles4h.map((c) => c.close);
  const closes1d = candles1d.map((c) => c.close);

  const indicators = {
    '1h': buildIndicatorPack(closes1h),
    '4h': buildIndicatorPack(closes4h),
    '1d': buildIndicatorPack(closes1d),
  };

  const overlays = {
    '1h': buildOverlay(candles1h),
    '4h': buildOverlay(candles4h),
    '1d': buildOverlay(candles1d),
  };

  const relatedCountries = MARKET_TO_COUNTRIES[symbol] ?? [];
  const relatedEvents = events.filter((e) => relatedCountries.includes(e.country)).slice(0, 5);

  return {
    quote,
    candles: {
      '1h': candles1h,
      '4h': candles4h,
      '1d': candles1d,
    },
    overlays,
    indicators,
    relatedEvents,
    activeSignal: signal,
  };
}

function buildIndicatorPack(closes: number[]) {
  if (!closes.length) {
    return {
      ema20: 0,
      ema50: 0,
      sma20: 0,
      rsi: 50,
      macd: 0,
      atr: 0,
      volatility: 0,
      momentum: 0,
      structure: 'RANGE',
    };
  }
  return {
    ema20: ema(closes, 20),
    ema50: ema(closes, 50),
    sma20: sma(closes, 20),
    rsi: rsi(closes, 14),
    macd: macd(closes),
    atr: atrApprox(closes, 14),
    volatility: volatility(closes),
    momentum: momentum(closes, 10),
    structure: structure(closes),
  };
}

function buildOverlay(candles: Array<{ close: number }>) {
  const closes = candles.map((c) => c.close);
  if (!closes.length) return { ema20: [] as number[], ema50: [] as number[], sma20: [] as number[] };

  const ema20Series: number[] = [];
  const ema50Series: number[] = [];
  const sma20Series: number[] = [];

  for (let i = 1; i <= closes.length; i++) {
    const slice = closes.slice(0, i);
    ema20Series.push(ema(slice, 20));
    ema50Series.push(ema(slice, 50));
    sma20Series.push(sma(slice, 20));
  }

  return {
    ema20: ema20Series,
    ema50: ema50Series,
    sma20: sma20Series,
  };
}
