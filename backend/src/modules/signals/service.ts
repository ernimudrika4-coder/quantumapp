import { SIGNAL_CACHE_TTL_SEC, DEFAULT_SYMBOLS, HIGH_IMPACT_EVENT_BLACKOUT_AFTER_MIN, HIGH_IMPACT_EVENT_BLACKOUT_BEFORE_MIN } from '../../config/constants';
import { cacheGet, cacheSet } from '../../cache/store';
import { getQuotes } from '../markets/service';
import { getUpcomingEvents } from '../events/service';
import { fetchTwelveDataTimeSeries } from '../../providers/twelvedata/client';
import { normalizeTimeSeries } from '../../providers/twelvedata/normalize';
import { runSignalEngine } from '../../engine/signal-engine';
import { deactivateMissingGeneratedSignals, upsertGeneratedSignal } from './generated-repository';

export interface LiveSignal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  confidence: number;
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  reason: string[];
  scores: {
    trend: number;
    momentum: number;
    structure: number;
    volatility: number;
    eventRisk: number;
    mtf: number;
    total: number;
  };
  generatedAt: number;
}

const MARKET_TO_COUNTRIES: Record<string, string[]> = {
  'EUR/USD': ['EUR', 'USD'],
  'GBP/USD': ['GBP', 'USD'],
  'GBP/JPY': ['GBP', 'JPY'],
  'XAU/USD': ['USD'],
  'SPX500': ['USD'],
  'NAS100': ['USD'],
};

function getSessionBias() {
  const h = new Date().getUTCHours();
  if (h >= 0 && h < 7) return 'Asia';
  if (h >= 7 && h < 13) return 'London';
  if (h >= 13 && h < 21) return 'NewYork';
  return 'AfterHours';
}

function eventPenaltyForSymbol(symbol: string, events: Awaited<ReturnType<typeof getUpcomingEvents>>) {
  const countries = MARKET_TO_COUNTRIES[symbol] ?? [];
  const now = Date.now();
  const beforeMs = HIGH_IMPACT_EVENT_BLACKOUT_BEFORE_MIN * 60 * 1000;
  const afterMs = HIGH_IMPACT_EVENT_BLACKOUT_AFTER_MIN * 60 * 1000;
  const risky = events.some((e) =>
    e.impact === 'High' &&
    countries.includes(e.country) &&
    e.eventTime >= now - afterMs &&
    e.eventTime <= now + beforeMs
  );
  return risky ? 20 : 0;
}

export async function getLiveSignals(symbols: string[] = DEFAULT_SYMBOLS): Promise<LiveSignal[]> {
  const cacheKey = `signals:live:${symbols.join('|')}`;
  const cached = await cacheGet<LiveSignal[]>(cacheKey);
  if (cached) return cached;

  const quotes = await getQuotes(symbols);
  const events = await getUpcomingEvents();
  const sessionBias = getSessionBias();

  const outputs = await Promise.all(quotes.map(async (quote) => {
    const [ts1hRaw, ts4hRaw, ts1dRaw] = await Promise.all([
      fetchTwelveDataTimeSeries(quote.symbol, '1h', 120),
      fetchTwelveDataTimeSeries(quote.symbol, '4h', 80),
      fetchTwelveDataTimeSeries(quote.symbol, '1day', 80),
    ]);

    const candles1h = normalizeTimeSeries(ts1hRaw, quote.symbol, '1h');
    const candles4h = normalizeTimeSeries(ts4hRaw, quote.symbol, '4h');
    const candles1d = normalizeTimeSeries(ts1dRaw, quote.symbol, '1day');

    const closes1h = candles1h.map((c) => c.close);
    const closes4h = candles4h.map((c) => c.close);
    const closes1d = candles1d.map((c) => c.close);

    const eventRiskPenalty = eventPenaltyForSymbol(quote.symbol, events);
    const engine = runSignalEngine({
      symbol: quote.symbol,
      closes1h,
      closes4h,
      closes1d,
      eventRiskPenalty,
      sessionBias,
    });

    if (!engine.direction || engine.confidence < 45) return null;

    const liveSignal = {
      id: `${quote.symbol}-${Date.now()}`,
      symbol: quote.symbol,
      direction: engine.direction,
      confidence: engine.confidence,
      entry: engine.entry,
      tp1: engine.tp1,
      tp2: engine.tp2,
      tp3: engine.tp3,
      sl: engine.sl,
      reason: engine.reason,
      scores: {
        trend: engine.trendScore,
        momentum: engine.momentumScore,
        structure: engine.structureScore,
        volatility: engine.volatilityScore,
        eventRisk: engine.eventRiskScore,
        mtf: engine.mtfScore,
        total: engine.totalConfluence,
      },
      generatedAt: Date.now(),
    } satisfies LiveSignal;

    await upsertGeneratedSignal({
      symbol: quote.symbol,
      timeframeTrigger: '1h',
      timeframeBias: '4h/1d',
      direction: engine.direction,
      entry: engine.entry,
      tp1: engine.tp1,
      tp2: engine.tp2,
      tp3: engine.tp3,
      sl: engine.sl,
      confidence: engine.confidence,
      trendScore: engine.trendScore,
      momentumScore: engine.momentumScore,
      structureScore: engine.structureScore,
      volatilityScore: engine.volatilityScore,
      eventRiskScore: engine.eventRiskScore,
      mtfScore: engine.mtfScore,
      totalConfluence: engine.totalConfluence,
      reason: engine.reason,
    });

    return liveSignal;
  }));

  const signals = outputs.filter((s): s is LiveSignal => Boolean(s)).sort((a, b) => b.confidence - a.confidence);
  await deactivateMissingGeneratedSignals(signals.map((s) => s.symbol));
  await cacheSet(cacheKey, signals, SIGNAL_CACHE_TTL_SEC);
  return signals;
}

export async function getSignalPerformance() {
  const live = await getLiveSignals();
  return {
    totalSignals: live.length,
    avgConfidence: live.length ? live.reduce((s, i) => s + i.confidence, 0) / live.length : 0,
    bestPair: live[0]?.symbol ?? null,
    byDirection: {
      buy: live.filter((s) => s.direction === 'BUY').length,
      sell: live.filter((s) => s.direction === 'SELL').length,
    },
    note: 'Performance live sementara. Backtesting database-driven menyusul di fase berikutnya.'
  };
}
