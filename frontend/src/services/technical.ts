// Technical Analysis Service
// RSI, Moving Averages, dan analisa teknikal untuk generate sinyal

export interface AnalysisResult {
  rsi: number;
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  macd: number;
  momentum: number;
  volatility: number;
  atr: number;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  structure: "BOS_BULL" | "BOS_BEAR" | "RANGE";
  strength: number; // 0-100
}

// Calculate RSI (Relative Strength Index) - 14 period default
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  const recentGains = gains.slice(-period);
  const recentLosses = losses.slice(-period);

  const avgGain = recentGains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = recentLosses.reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate Simple Moving Average
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const recent = prices.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / period;
}

// Calculate Exponential Moving Average
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length < period) return prices[prices.length - 1];

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  return ema;
}

// Calculate MACD (Moving Average Convergence Divergence)
export function calculateMACD(prices: number[]): number {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  return ema12 - ema26;
}

// Calculate volatility (standard deviation of returns)
export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] !== 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }

  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100; // percentage
}

// Approx ATR from close-to-close as fallback when OHLC unavailable
export function calculateATR(prices: number[], period: number = 14): number {
  if (prices.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    trs.push(Math.abs(prices[i] - prices[i - 1]));
  }
  const recent = trs.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / Math.max(recent.length, 1);
}

export function detectStructure(prices: number[]): "BOS_BULL" | "BOS_BEAR" | "RANGE" {
  if (prices.length < 8) return "RANGE";
  const recent = prices.slice(-8);
  const firstHalf = recent.slice(0, 4);
  const secondHalf = recent.slice(4);
  const firstHigh = Math.max(...firstHalf);
  const firstLow = Math.min(...firstHalf);
  const secondHigh = Math.max(...secondHalf);
  const secondLow = Math.min(...secondHalf);

  if (secondHigh > firstHigh && secondLow > firstLow) return "BOS_BULL";
  if (secondHigh < firstHigh && secondLow < firstLow) return "BOS_BEAR";
  return "RANGE";
}

// Calculate momentum (price change over period)
export function calculateMomentum(prices: number[], period: number = 10): number {
  if (prices.length < period) return 0;
  const current = prices[prices.length - 1];
  const past = prices[prices.length - 1 - period];
  if (past === 0) return 0;
  return ((current - past) / past) * 100;
}

// Full technical analysis
export function analyze(prices: number[]): AnalysisResult {
  const rsi = calculateRSI(prices);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, Math.min(50, prices.length));
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = calculateMACD(prices);
  const momentum = calculateMomentum(prices);
  const volatility = calculateVolatility(prices);
  const atr = calculateATR(prices, 14);
  const structure = detectStructure(prices);

  // Determine trend
  const currentPrice = prices[prices.length - 1] || 0;
  let bullishSignals = 0;

  if (rsi < 40) bullishSignals++;
  else if (rsi > 60) bullishSignals--;

  if (currentPrice > sma20) bullishSignals++;
  if (macd > 0) bullishSignals++;
  if (ema12 > ema26) bullishSignals++;
  if (momentum > 0) bullishSignals++;
  if (structure === "BOS_BULL") bullishSignals++;
  if (structure === "BOS_BEAR") bullishSignals--;

  let trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  if (bullishSignals >= 4) trend = "BULLISH";
  else if (bullishSignals <= 1) trend = "BEARISH";
  else trend = "NEUTRAL";

  const strength = Math.min(100, Math.abs(bullishSignals) * 16 + (100 - Math.abs(rsi - 50)) / 2);

  return {
    rsi,
    sma20,
    sma50,
    ema12,
    ema26,
    macd,
    momentum,
    volatility,
    atr,
    trend,
    structure,
    strength,
  };
}

// Generate entry point based on analysis
export interface ConfluenceBreakdown {
  trendScore: number;
  momentumScore: number;
  volatilityScore: number;
  structureScore: number;
  eventRiskScore: number;
  mtfScore: number;
  total: number;
  sessionBias: string;
  higherTimeframeTrend: "BULLISH" | "BEARISH" | "NEUTRAL";
  structure: "BOS_BULL" | "BOS_BEAR" | "RANGE";
  atr: number;
  rrRatio: number;
}

export interface SignalGeneration {
  type: "BUY" | "SELL";
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  confidence: number;
  reason: string;
  breakdown: ConfluenceBreakdown;
}

export interface GenerateSignalOptions {
  higherTimeframePrices?: number[];
  dailyPrices?: number[];
  eventRiskPenalty?: number; // 0..25
  sessionBias?: string;
}

export function generateSignal(
  prices: number[],
  currentPrice: number,
  _symbol: string,
  options: GenerateSignalOptions = {}
): SignalGeneration | null {
  if (prices.length < 20) return null;

  const analysis = analyze(prices);
  const htf = options.higherTimeframePrices && options.higherTimeframePrices.length >= 20
    ? analyze(options.higherTimeframePrices)
    : null;
  const daily = options.dailyPrices && options.dailyPrices.length >= 20
    ? analyze(options.dailyPrices)
    : null;

  const eventRiskPenalty = options.eventRiskPenalty || 0;
  const sessionBias = options.sessionBias || "Sesi aktif";

  const higherTrend = htf?.trend || analysis.trend;
  const dailyTrend = daily?.trend || analysis.trend;
  const mtfAlignedBull = analysis.trend === "BULLISH" && higherTrend === "BULLISH";
  const mtfAlignedBear = analysis.trend === "BEARISH" && higherTrend === "BEARISH";

  const trendScoreBull = (
    (currentPrice > analysis.sma20 ? 14 : 0) +
    (analysis.ema12 > analysis.ema26 ? 10 : 0) +
    (higherTrend === "BULLISH" ? 12 : 0) +
    (dailyTrend === "BULLISH" ? 8 : 0)
  );
  const trendScoreBear = (
    (currentPrice < analysis.sma20 ? 14 : 0) +
    (analysis.ema12 < analysis.ema26 ? 10 : 0) +
    (higherTrend === "BEARISH" ? 12 : 0) +
    (dailyTrend === "BEARISH" ? 8 : 0)
  );

  const momentumScoreBull = (
    (analysis.macd > 0 ? 12 : 0) +
    (analysis.momentum > 0 ? Math.min(12, Math.abs(analysis.momentum) * 2) : 0) +
    (analysis.rsi < 55 ? 8 : 0)
  );
  const momentumScoreBear = (
    (analysis.macd < 0 ? 12 : 0) +
    (analysis.momentum < 0 ? Math.min(12, Math.abs(analysis.momentum) * 2) : 0) +
    (analysis.rsi > 45 ? 8 : 0)
  );

  const structureScoreBull = analysis.structure === "BOS_BULL" ? 18 : analysis.structure === "RANGE" ? 6 : 0;
  const structureScoreBear = analysis.structure === "BOS_BEAR" ? 18 : analysis.structure === "RANGE" ? 6 : 0;

  const volatilityScore = Math.max(8, Math.min(18, Math.round(analysis.volatility * 2)));
  const mtfScoreBull = mtfAlignedBull ? 16 : higherTrend === "BULLISH" ? 8 : 0;
  const mtfScoreBear = mtfAlignedBear ? 16 : higherTrend === "BEARISH" ? 8 : 0;

  const buyConfluence = trendScoreBull + momentumScoreBull + structureScoreBull + volatilityScore + mtfScoreBull - eventRiskPenalty;
  const sellConfluence = trendScoreBear + momentumScoreBear + structureScoreBear + volatilityScore + mtfScoreBear - eventRiskPenalty;

  const atr = analysis.atr || currentPrice * 0.01;
  const atrPct = Math.max(0.006, Math.min(0.04, atr / Math.max(currentPrice, 1)));
  const entry = currentPrice;

  const buildBreakdown = (type: "BUY" | "SELL", total: number, rrRatio: number): ConfluenceBreakdown => ({
    trendScore: type === "BUY" ? trendScoreBull : trendScoreBear,
    momentumScore: type === "BUY" ? momentumScoreBull : momentumScoreBear,
    volatilityScore,
    structureScore: type === "BUY" ? structureScoreBull : structureScoreBear,
    eventRiskScore: Math.max(0, 25 - eventRiskPenalty),
    mtfScore: type === "BUY" ? mtfScoreBull : mtfScoreBear,
    total,
    sessionBias,
    higherTimeframeTrend: higherTrend,
    structure: analysis.structure,
    atr,
    rrRatio,
  });

  if (buyConfluence >= sellConfluence && buyConfluence >= 48) {
    const tp1 = entry * (1 + atrPct * 1.1);
    const tp2 = entry * (1 + atrPct * 2.1);
    const tp3 = entry * (1 + atrPct * 3.4);
    const sl = entry * (1 - atrPct * 1.0);
    const rrRatio = (tp3 - entry) / Math.max(entry - sl, 0.0001);
    return {
      type: "BUY",
      entry,
      tp1,
      tp2,
      tp3,
      sl,
      confidence: Math.min(95, Math.max(48, Math.round(buyConfluence))),
      reason: [
        analysis.structure === "BOS_BULL" ? "Break of structure bullish" : "Trend bullish aktif",
        higherTrend === "BULLISH" ? "HTF selaras bullish" : "Momentum bullish aktif",
      ].join(" · "),
      breakdown: buildBreakdown("BUY", buyConfluence, rrRatio),
    };
  }

  if (sellConfluence > buyConfluence && sellConfluence >= 48) {
    const tp1 = entry * (1 - atrPct * 1.1);
    const tp2 = entry * (1 - atrPct * 2.1);
    const tp3 = entry * (1 - atrPct * 3.4);
    const sl = entry * (1 + atrPct * 1.0);
    const rrRatio = (entry - tp3) / Math.max(sl - entry, 0.0001);
    return {
      type: "SELL",
      entry,
      tp1,
      tp2,
      tp3,
      sl,
      confidence: Math.min(95, Math.max(48, Math.round(sellConfluence))),
      reason: [
        analysis.structure === "BOS_BEAR" ? "Break of structure bearish" : "Trend bearish aktif",
        higherTrend === "BEARISH" ? "HTF selaras bearish" : "Momentum bearish aktif",
      ].join(" · "),
      breakdown: buildBreakdown("SELL", sellConfluence, rrRatio),
    };
  }

  return null;
}
