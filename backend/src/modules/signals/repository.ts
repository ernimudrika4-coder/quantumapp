import { prisma, dbAvailable } from '../../db/prisma';

export interface FollowSignalPersistInput {
  userId: string;
  clientId: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  confidence: number;
}

export async function persistFollowSignal(input: FollowSignalPersistInput) {
  if (!(await dbAvailable())) return null;
  const signal = await prisma.signal.create({
    data: {
      symbol: input.symbol,
      timeframeTrigger: '1h',
      timeframeBias: '4h/1d',
      direction: input.direction,
      entry: input.entry,
      tp1: input.tp1,
      tp2: input.tp2,
      tp3: input.tp3,
      sl: input.sl,
      confidence: input.confidence,
      trendScore: 0,
      momentumScore: 0,
      structureScore: 0,
      volatilityScore: 0,
      eventRiskScore: 0,
      mtfScore: 0,
      totalConfluence: input.confidence,
      reason: ['followed-from-client']
    }
  });

  return prisma.userSignalFollow.create({
    data: {
      id: input.clientId,
      userId: input.userId,
      signalId: signal.id,
      status: 'ACTIVE',
      entryPrice: input.entry,
    },
    include: { signal: true }
  });
}

export async function listUserSignalHistory(userId: string) {
  if (!(await dbAvailable())) return null;
  return prisma.userSignalFollow.findMany({
    where: { userId },
    orderBy: { followedAt: 'desc' },
    include: { signal: true }
  });
}

export async function getUserSignalPerformance(userId: string) {
  if (!(await dbAvailable())) return null;
  const follows = await prisma.userSignalFollow.findMany({ where: { userId }, include: { signal: true }, orderBy: { followedAt: 'asc' } });
  const closed = follows.filter((f) => f.pnlPct !== null);
  const winners = closed.filter((f) => (f.pnlPct ?? 0) > 0);
  const losers = closed.filter((f) => (f.pnlPct ?? 0) < 0);

  const byPair = new Map<string, number[]>();
  closed.forEach((f) => {
    const list = byPair.get(f.signal.symbol) ?? [];
    list.push(f.pnlPct ?? 0);
    byPair.set(f.signal.symbol, list);
  });

  let bestPair: string | null = null;
  let worstPair: string | null = null;
  let bestAvg = -Infinity;
  let worstAvg = Infinity;
  const pairBreakdown = Array.from(byPair.entries()).map(([symbol, vals]) => {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const wins = vals.filter((v) => v > 0).length;
    const losses = vals.filter((v) => v < 0).length;
    if (avg > bestAvg) { bestAvg = avg; bestPair = symbol; }
    if (avg < worstAvg) { worstAvg = avg; worstPair = symbol; }
    return {
      symbol,
      total: vals.length,
      avgReturnPct: avg,
      winRate: vals.length ? (wins / vals.length) * 100 : 0,
      wins,
      losses,
    };
  }).sort((a, b) => b.avgReturnPct - a.avgReturnPct);

  const avgWin = winners.length ? winners.reduce((s, i) => s + (i.pnlPct ?? 0), 0) / winners.length : 0;
  const avgLoss = losers.length ? losers.reduce((s, i) => s + (i.pnlPct ?? 0), 0) / losers.length : 0;
  const expectancy = closed.length ? ((winners.length / closed.length) * avgWin) + ((losers.length / closed.length) * avgLoss) : 0;
  const grossProfit = winners.reduce((s, i) => s + Math.max(i.pnl ?? 0, 0), 0);
  const grossLoss = Math.abs(losers.reduce((s, i) => s + Math.min(i.pnl ?? 0, 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

  let currentWinStreak = 0;
  let currentLossStreak = 0;
  for (let i = closed.length - 1; i >= 0; i--) {
    const p = closed[i].pnlPct ?? 0;
    if (p > 0 && currentLossStreak === 0) currentWinStreak++; else break;
  }
  for (let i = closed.length - 1; i >= 0; i--) {
    const p = closed[i].pnlPct ?? 0;
    if (p < 0 && currentWinStreak === 0) currentLossStreak++; else break;
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = closed.filter((f) => new Date(f.followedAt).getTime() >= sevenDaysAgo);
  const recentWinRate = recent.length ? (recent.filter((f) => (f.pnlPct ?? 0) > 0).length / recent.length) * 100 : 0;

  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  closed.forEach((f) => {
    equity += f.pnl ?? 0;
    peak = Math.max(peak, equity);
    maxDrawdown = Math.min(maxDrawdown, equity - peak);
  });

  return {
    total: follows.length,
    closed: closed.length,
    winRate: closed.length ? (winners.length / closed.length) * 100 : 0,
    avgRR: avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0,
    bestPair,
    worstPair,
    maxDrawdown,
    profitFactor,
    avgWin,
    avgLoss,
    expectancy,
    currentWinStreak,
    currentLossStreak,
    recentWinRate,
    pairBreakdown,
  };
}

export async function listActiveSignalFollows() {
  if (!(await dbAvailable())) return null;
  return prisma.userSignalFollow.findMany({
    where: { status: { in: ['ACTIVE', 'TP1_HIT', 'TP2_HIT'] } },
    include: { signal: true, user: true }
  });
}

export async function updateFollowStatus(id: string, updates: {
  status: string;
  closePrice?: number;
  pnl?: number;
  pnlPct?: number;
}) {
  if (!(await dbAvailable())) return null;
  return prisma.userSignalFollow.update({
    where: { id },
    data: {
      status: updates.status,
      closePrice: updates.closePrice,
      pnl: updates.pnl,
      pnlPct: updates.pnlPct,
      closedAt: ['TP3_HIT', 'SL_HIT'].includes(updates.status) ? new Date() : undefined,
    },
    include: { signal: true, user: true }
  });
}
