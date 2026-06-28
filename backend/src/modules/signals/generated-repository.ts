import { prisma, dbAvailable } from '../../db/prisma';

export interface PersistGeneratedSignalInput {
  symbol: string;
  timeframeTrigger: string;
  timeframeBias: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  confidence: number;
  trendScore: number;
  momentumScore: number;
  structureScore: number;
  volatilityScore: number;
  eventRiskScore: number;
  mtfScore: number;
  totalConfluence: number;
  reason: string[];
}

export async function upsertGeneratedSignal(input: PersistGeneratedSignalInput) {
  if (!(await dbAvailable())) return null;
  return prisma.signal.upsert({
    where: { engineKey: input.symbol },
    update: {
      timeframeTrigger: input.timeframeTrigger,
      timeframeBias: input.timeframeBias,
      direction: input.direction,
      entry: input.entry,
      tp1: input.tp1,
      tp2: input.tp2,
      tp3: input.tp3,
      sl: input.sl,
      confidence: input.confidence,
      trendScore: input.trendScore,
      momentumScore: input.momentumScore,
      structureScore: input.structureScore,
      volatilityScore: input.volatilityScore,
      eventRiskScore: input.eventRiskScore,
      mtfScore: input.mtfScore,
      totalConfluence: input.totalConfluence,
      reason: input.reason,
      status: 'ACTIVE',
      origin: 'engine',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    create: {
      symbol: input.symbol,
      timeframeTrigger: input.timeframeTrigger,
      timeframeBias: input.timeframeBias,
      direction: input.direction,
      entry: input.entry,
      tp1: input.tp1,
      tp2: input.tp2,
      tp3: input.tp3,
      sl: input.sl,
      confidence: input.confidence,
      trendScore: input.trendScore,
      momentumScore: input.momentumScore,
      structureScore: input.structureScore,
      volatilityScore: input.volatilityScore,
      eventRiskScore: input.eventRiskScore,
      mtfScore: input.mtfScore,
      totalConfluence: input.totalConfluence,
      reason: input.reason,
      status: 'ACTIVE',
      origin: 'engine',
      engineKey: input.symbol,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    }
  });
}

export async function listGeneratedSignals() {
  if (!(await dbAvailable())) return null;
  return prisma.signal.findMany({
    where: {
      origin: 'engine',
      status: 'ACTIVE'
    },
    orderBy: [{ confidence: 'desc' }, { createdAt: 'desc' }]
  });
}

export async function getGeneratedSignalBySymbol(symbol: string) {
  if (!(await dbAvailable())) return null;
  return prisma.signal.findFirst({
    where: { symbol, origin: 'engine', status: 'ACTIVE' }
  });
}

export async function deactivateMissingGeneratedSignals(activeSymbols: string[]) {
  if (!(await dbAvailable())) return null;
  return prisma.signal.updateMany({
    where: {
      origin: 'engine',
      status: 'ACTIVE',
      symbol: { notIn: activeSymbols.length ? activeSymbols : ['__NONE__'] }
    },
    data: {
      status: 'CLOSED'
    }
  });
}
