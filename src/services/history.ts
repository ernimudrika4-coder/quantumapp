// Signal History Tracking Service
// Menyimpan dan mengelola history sinyal di localStorage

export interface SignalHistory {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  type: "BUY" | "SELL";
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  confidence: number;
  reason: string;
  status: "ACTIVE" | "TP1_HIT" | "TP2_HIT" | "TP3_HIT" | "SL_HIT" | "CLOSED";
  createdAt: number;
  closedAt?: number;
  closePrice?: number;
  pnl?: number;
  pnlPercent?: number;
}

const STORAGE_KEY = "quantum_signal_history";

export function loadHistory(): SignalHistory[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error("Error loading history:", err);
    return [];
  }
}

export function saveHistory(history: SignalHistory[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error("Error saving history:", err);
  }
}

export function addToHistory(signal: SignalHistory): SignalHistory[] {
  const history = loadHistory();
  history.unshift(signal); // newest first
  // Keep only last 100
  const trimmed = history.slice(0, 100);
  saveHistory(trimmed);
  return trimmed;
}

export function updateHistory(id: string, updates: Partial<SignalHistory>): SignalHistory[] {
  const history = loadHistory();
  const idx = history.findIndex((s) => s.id === id);
  if (idx === -1) return history;

  history[idx] = { ...history[idx], ...updates };
  saveHistory(history);
  return history;
}

export function removeFromHistory(id: string): SignalHistory[] {
  const history = loadHistory().filter((s) => s.id !== id);
  saveHistory(history);
  return history;
}

export function clearHistory(): SignalHistory[] {
  saveHistory([]);
  return [];
}

// Check if any active signals have hit TP/SL
export function checkSignals(currentPrices: Record<string, number>): {
  history: SignalHistory[];
  updatedIds: string[];
} {
  const history = loadHistory();
  const updatedIds: string[] = [];

  for (const signal of history) {
    if (signal.status !== "ACTIVE") continue;

    const price = currentPrices[signal.symbol];
    if (!price) continue;

    let newStatus: string | null = null;
    let closePrice: number | undefined;
    let pnl: number | undefined;
    let pnlPercent: number | undefined;

    const currentStatus = signal.status as string;

    if (signal.type === "BUY") {
      // Check SL first (priority)
      if (price <= signal.sl) {
        newStatus = "SL_HIT";
        closePrice = price;
        pnl = price - signal.entry;
        pnlPercent = ((price - signal.entry) / signal.entry) * 100;
      }
      // Check TPs in reverse order (TP3 > TP2 > TP1)
      else if (price >= signal.tp3 && currentStatus !== "TP3_HIT") {
        newStatus = "TP3_HIT";
        closePrice = price;
        pnl = price - signal.entry;
        pnlPercent = ((price - signal.entry) / signal.entry) * 100;
      } else if (price >= signal.tp2 && currentStatus.includes("TP1")) {
        newStatus = "TP2_HIT";
      } else if (price >= signal.tp1 && currentStatus === "ACTIVE") {
        newStatus = "TP1_HIT";
      }
    } else {
      // SELL
      if (price >= signal.sl) {
        newStatus = "SL_HIT";
        closePrice = price;
        pnl = signal.entry - price;
        pnlPercent = ((signal.entry - price) / signal.entry) * 100;
      } else if (price <= signal.tp3 && currentStatus !== "TP3_HIT") {
        newStatus = "TP3_HIT";
        closePrice = price;
        pnl = signal.entry - price;
        pnlPercent = ((signal.entry - price) / signal.entry) * 100;
      } else if (price <= signal.tp2 && currentStatus.includes("TP1")) {
        newStatus = "TP2_HIT";
      } else if (price <= signal.tp1 && currentStatus === "ACTIVE") {
        newStatus = "TP1_HIT";
      }
    }

    if (newStatus && newStatus !== signal.status) {
      const updates: Partial<SignalHistory> = { status: newStatus as SignalHistory["status"] };
      if (closePrice !== undefined) updates.closePrice = closePrice;
      if (pnl !== undefined) updates.pnl = pnl;
      if (pnlPercent !== undefined) updates.pnlPercent = pnlPercent;
      if (newStatus === "TP3_HIT" || newStatus === "SL_HIT") {
        updates.closedAt = Date.now();
      }
      const idx = history.findIndex((s) => s.id === signal.id);
      if (idx !== -1) {
        history[idx] = { ...signal, ...updates };
        updatedIds.push(signal.id);
      }
    }
  }

  if (updatedIds.length > 0) {
    saveHistory(history);
  }

  return { history, updatedIds };
}

// Calculate portfolio stats
export function calculateStats(history: SignalHistory[]) {
  const closed = history.filter((s) => ["TP3_HIT", "SL_HIT", "CLOSED"].includes(s.status));
  const winners = closed.filter((s) => s.pnl && s.pnl > 0);
  const losers = closed.filter((s) => s.pnl && s.pnl < 0);

  const totalPnl = closed.reduce((sum, s) => sum + (s.pnl || 0), 0);
  const winRate = closed.length > 0 ? (winners.length / closed.length) * 100 : 0;
  const avgWin = winners.length > 0
    ? winners.reduce((sum, s) => sum + (s.pnlPercent || 0), 0) / winners.length
    : 0;
  const avgLoss = losers.length > 0
    ? losers.reduce((sum, s) => sum + (s.pnlPercent || 0), 0) / losers.length
    : 0;

  const active = history.filter((s) => s.status === "ACTIVE" || s.status.includes("TP"));
  const totalHits = history.filter((s) => s.status.includes("TP")).length;

  return {
    total: history.length,
    active: active.length,
    closed: closed.length,
    winners: winners.length,
    losers: losers.length,
    totalPnl,
    winRate,
    avgWin,
    avgLoss,
    totalHits,
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
