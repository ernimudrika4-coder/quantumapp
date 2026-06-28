import { atrApprox, ema, macd, momentum, rsi, sma, structure, volatility } from './indicators';

export interface EngineInput {
  symbol: string;
  closes1h: number[];
  closes4h?: number[];
  closes1d?: number[];
  eventRiskPenalty?: number;
  sessionBias?: string;
}

export interface EngineOutput {
  direction: 'BUY' | 'SELL' | null;
  confidence: number;
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  trendScore: number;
  momentumScore: number;
  structureScore: number;
  volatilityScore: number;
  eventRiskScore: number;
  mtfScore: number;
  totalConfluence: number;
  reason: string[];
  noTradeReason?: string;
}

function analyze(closes: number[]) {
  const current = closes[closes.length - 1] ?? 0;
  const trendSma = sma(closes, 20);
  const trendEmaFast = ema(closes, 12);
  const trendEmaSlow = ema(closes, 26);
  const rsiValue = rsi(closes, 14);
  const macdValue = macd(closes);
  const momentumValue = momentum(closes, 10);
  const atr = atrApprox(closes, 14);
  const vol = volatility(closes);
  const structureState = structure(closes);

  let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (current > trendSma && trendEmaFast > trendEmaSlow) trend = 'BULLISH';
  if (current < trendSma && trendEmaFast < trendEmaSlow) trend = 'BEARISH';

  return { current, trendSma, trendEmaFast, trendEmaSlow, rsiValue, macdValue, momentumValue, atr, vol, structureState, trend };
}

export function runSignalEngine(input: EngineInput): EngineOutput {
  const a1h = analyze(input.closes1h);
  const a4h = input.closes4h?.length ? analyze(input.closes4h) : null;
  const a1d = input.closes1d?.length ? analyze(input.closes1d) : null;
  const entry = a1h.current;

  const bullishHTF = [a4h?.trend, a1d?.trend].filter(Boolean).filter((t) => t === 'BULLISH').length;
  const bearishHTF = [a4h?.trend, a1d?.trend].filter(Boolean).filter((t) => t === 'BEARISH').length;

  const trendScoreBuy = (a1h.current > a1h.trendSma ? 14 : 0) + (a1h.trendEmaFast > a1h.trendEmaSlow ? 10 : 0) + bullishHTF * 8;
  const trendScoreSell = (a1h.current < a1h.trendSma ? 14 : 0) + (a1h.trendEmaFast < a1h.trendEmaSlow ? 10 : 0) + bearishHTF * 8;

  const momentumScoreBuy = (a1h.macdValue > 0 ? 12 : 0) + (a1h.momentumValue > 0 ? Math.min(12, Math.abs(a1h.momentumValue) * 2) : 0) + (a1h.rsiValue < 58 ? 8 : 0);
  const momentumScoreSell = (a1h.macdValue < 0 ? 12 : 0) + (a1h.momentumValue < 0 ? Math.min(12, Math.abs(a1h.momentumValue) * 2) : 0) + (a1h.rsiValue > 42 ? 8 : 0);

  const structureScoreBuy = a1h.structureState === 'BOS_BULL' ? 18 : a1h.structureState === 'RANGE' ? 6 : 0;
  const structureScoreSell = a1h.structureState === 'BOS_BEAR' ? 18 : a1h.structureState === 'RANGE' ? 6 : 0;

  const volScore = Math.max(8, Math.min(18, Math.round(a1h.vol * 2)));
  const mtfScoreBuy = bullishHTF >= 2 ? 16 : bullishHTF === 1 ? 8 : 0;
  const mtfScoreSell = bearishHTF >= 2 ? 16 : bearishHTF === 1 ? 8 : 0;
  const eventRiskScore = Math.max(0, 25 - (input.eventRiskPenalty ?? 0));

  const buyConfluence = trendScoreBuy + momentumScoreBuy + structureScoreBuy + volScore + mtfScoreBuy - (input.eventRiskPenalty ?? 0);
  const sellConfluence = trendScoreSell + momentumScoreSell + structureScoreSell + volScore + mtfScoreSell - (input.eventRiskPenalty ?? 0);

  const atrPct = Math.max(0.006, Math.min(0.04, a1h.atr / Math.max(entry, 1)));

  const noTrade = (input.eventRiskPenalty ?? 0) >= 20 && a1h.structureState === 'RANGE';
  if (noTrade) {
    return {
      direction: null,
      confidence: 0,
      entry,
      tp1: entry,
      tp2: entry,
      tp3: entry,
      sl: entry,
      trendScore: 0,
      momentumScore: 0,
      structureScore: 0,
      volatilityScore: volScore,
      eventRiskScore,
      mtfScore: 0,
      totalConfluence: 0,
      reason: [],
      noTradeReason: 'High impact event terlalu dekat dan struktur market masih range.'
    };
  }

  if (buyConfluence >= sellConfluence && buyConfluence >= 48) {
    const tp1 = entry * (1 + atrPct * 1.1);
    const tp2 = entry * (1 + atrPct * 2.1);
    const tp3 = entry * (1 + atrPct * 3.4);
    const sl = entry * (1 - atrPct * 1.0);
    return {
      direction: 'BUY',
      confidence: Math.min(95, Math.max(48, Math.round(buyConfluence))),
      entry,
      tp1,
      tp2,
      tp3,
      sl,
      trendScore: trendScoreBuy,
      momentumScore: momentumScoreBuy,
      structureScore: structureScoreBuy,
      volatilityScore: volScore,
      eventRiskScore,
      mtfScore: mtfScoreBuy,
      totalConfluence: buyConfluence,
      reason: [
        a1h.structureState === 'BOS_BULL' ? 'Break of structure bullish' : 'Trend bullish aktif',
        bullishHTF > 0 ? 'Higher timeframe bullish selaras' : 'Momentum bullish aktif',
        input.sessionBias ? `Bias sesi: ${input.sessionBias}` : 'Sesi netral'
      ]
    };
  }

  if (sellConfluence > buyConfluence && sellConfluence >= 48) {
    const tp1 = entry * (1 - atrPct * 1.1);
    const tp2 = entry * (1 - atrPct * 2.1);
    const tp3 = entry * (1 - atrPct * 3.4);
    const sl = entry * (1 + atrPct * 1.0);
    return {
      direction: 'SELL',
      confidence: Math.min(95, Math.max(48, Math.round(sellConfluence))),
      entry,
      tp1,
      tp2,
      tp3,
      sl,
      trendScore: trendScoreSell,
      momentumScore: momentumScoreSell,
      structureScore: structureScoreSell,
      volatilityScore: volScore,
      eventRiskScore,
      mtfScore: mtfScoreSell,
      totalConfluence: sellConfluence,
      reason: [
        a1h.structureState === 'BOS_BEAR' ? 'Break of structure bearish' : 'Trend bearish aktif',
        bearishHTF > 0 ? 'Higher timeframe bearish selaras' : 'Momentum bearish aktif',
        input.sessionBias ? `Bias sesi: ${input.sessionBias}` : 'Sesi netral'
      ]
    };
  }

  return {
    direction: null,
    confidence: 0,
    entry,
    tp1: entry,
    tp2: entry,
    tp3: entry,
    sl: entry,
    trendScore: Math.max(trendScoreBuy, trendScoreSell),
    momentumScore: Math.max(momentumScoreBuy, momentumScoreSell),
    structureScore: Math.max(structureScoreBuy, structureScoreSell),
    volatilityScore: volScore,
    eventRiskScore,
    mtfScore: Math.max(mtfScoreBuy, mtfScoreSell),
    totalConfluence: Math.max(buyConfluence, sellConfluence),
    reason: [],
    noTradeReason: 'Confluence belum cukup kuat untuk menghasilkan setup valid.'
  };
}
