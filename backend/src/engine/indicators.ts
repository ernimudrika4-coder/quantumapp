export function sma(prices: number[], period: number) {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  const recent = prices.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / period;
}

export function ema(prices: number[], period: number) {
  if (!prices.length) return 0;
  if (prices.length < period) return prices[prices.length - 1];
  const k = 2 / (period + 1);
  let result = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) result = (prices[i] - result) * k + result;
  return result;
}

export function rsi(prices: number[], period = 14) {
  if (prices.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff; else losses += -diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function macd(prices: number[]) {
  return ema(prices, 12) - ema(prices, 26);
}

export function momentum(prices: number[], period = 10) {
  if (prices.length < period + 1) return 0;
  const cur = prices[prices.length - 1];
  const prev = prices[prices.length - 1 - period];
  if (!prev) return 0;
  return ((cur - prev) / prev) * 100;
}

export function atrApprox(prices: number[], period = 14) {
  if (prices.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < prices.length; i++) trs.push(Math.abs(prices[i] - prices[i - 1]));
  const recent = trs.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / Math.max(recent.length, 1);
}

export function volatility(prices: number[]) {
  if (prices.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100;
}

export function structure(prices: number[]) {
  if (prices.length < 8) return 'RANGE' as const;
  const recent = prices.slice(-8);
  const first = recent.slice(0, 4);
  const second = recent.slice(4);
  const fh = Math.max(...first), fl = Math.min(...first), sh = Math.max(...second), sl = Math.min(...second);
  if (sh > fh && sl > fl) return 'BOS_BULL' as const;
  if (sh < fh && sl < fl) return 'BOS_BEAR' as const;
  return 'RANGE' as const;
}
