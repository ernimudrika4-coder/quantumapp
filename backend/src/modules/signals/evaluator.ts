import { getQuotes } from '../markets/service';
import { listActiveSignalFollows, updateFollowStatus } from './repository';

export interface EvaluationResult {
  updated: number;
  items: Array<{ id: string; userId: string; symbol: string; status: string; pnlPct?: number | null }>;
}

export async function evaluateActiveSignalFollows(): Promise<EvaluationResult> {
  const follows = await listActiveSignalFollows();
  if (!follows) return { updated: 0, items: [] };
  if (!follows.length) return { updated: 0, items: [] };

  const symbols = Array.from(new Set(follows.map((f) => f.signal.symbol)));
  const quotes = await getQuotes(symbols);
  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  const items: EvaluationResult['items'] = [];
  let updated = 0;

  for (const follow of follows) {
    const q = quoteMap.get(follow.signal.symbol);
    if (!q) continue;

    const entry = follow.entryPrice;
    const { tp1, tp2, tp3, sl, direction } = follow.signal;
    const currentStatus = follow.status;
    const price = q.price;

    let nextStatus: string | null = null;
    let closePrice: number | undefined;
    let pnl: number | undefined;
    let pnlPct: number | undefined;

    if (direction === 'BUY') {
      if (price <= sl) {
        nextStatus = 'SL_HIT';
        closePrice = price;
        pnl = price - entry;
        pnlPct = ((price - entry) / entry) * 100;
      } else if (price >= tp3 && currentStatus !== 'TP3_HIT') {
        nextStatus = 'TP3_HIT';
        closePrice = price;
        pnl = price - entry;
        pnlPct = ((price - entry) / entry) * 100;
      } else if (price >= tp2 && currentStatus === 'TP1_HIT') {
        nextStatus = 'TP2_HIT';
      } else if (price >= tp1 && currentStatus === 'ACTIVE') {
        nextStatus = 'TP1_HIT';
      }
    } else {
      if (price >= sl) {
        nextStatus = 'SL_HIT';
        closePrice = price;
        pnl = entry - price;
        pnlPct = ((entry - price) / entry) * 100;
      } else if (price <= tp3 && currentStatus !== 'TP3_HIT') {
        nextStatus = 'TP3_HIT';
        closePrice = price;
        pnl = entry - price;
        pnlPct = ((entry - price) / entry) * 100;
      } else if (price <= tp2 && currentStatus === 'TP1_HIT') {
        nextStatus = 'TP2_HIT';
      } else if (price <= tp1 && currentStatus === 'ACTIVE') {
        nextStatus = 'TP1_HIT';
      }
    }

    if (nextStatus && nextStatus !== currentStatus) {
      const updatedFollow = await updateFollowStatus(follow.id, {
        status: nextStatus,
        closePrice,
        pnl,
        pnlPct,
      });
      if (updatedFollow) {
        updated += 1;
        items.push({ id: follow.id, userId: follow.userId, symbol: follow.signal.symbol, status: nextStatus, pnlPct: pnlPct ?? null });
      }
    }
  }

  return { updated, items };
}
