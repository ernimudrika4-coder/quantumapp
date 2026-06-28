export interface SignalHistoryItem {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  confidence: number;
  status: 'ACTIVE' | 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT';
  followedAt: number;
  pnl?: number;
  pnlPct?: number;
}

const store = new Map<string, SignalHistoryItem>();

export function listHistory() {
  return Array.from(store.values()).sort((a, b) => b.followedAt - a.followedAt);
}

export function addHistory(item: SignalHistoryItem) {
  store.set(item.id, item);
  return item;
}
