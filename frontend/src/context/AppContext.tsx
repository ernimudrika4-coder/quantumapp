import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { useAuth } from './AuthContext';
import { SYMBOLS, LiveData, SymbolDef } from "../services/twelvedata";
import type { ConfluenceBreakdown } from "../services/technical";
import { showAppNotification } from "../services/pwa";
import {
  loadHistory, saveHistory, addToHistory, checkSignals,
  calculateStats, generateId, SignalHistory
} from "../services/history";
import type { EconomicEvent } from "../services/news";
import {
  backendAddWatchlist,
  backendGetNotifications,
  backendGetWatchlist,
  backendMarkAllNotificationsRead,
  backendMarkNotificationRead,
  backendRemoveWatchlist,
  fetchBackendQuotes,
  fetchBackendEvents,
  fetchBackendSignalHistory,
  fetchBackendSignalPerformance,
  fetchBackendSignals,
  postBackendFollowSignal,
} from '../services/backend';

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "signal" | "news" | "system";
}

export interface GeneratedSignal {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  category: SymbolDef["category"];
  gradient: string;
  type: "BUY" | "SELL";
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  confidence: number;
  reason: string;
  breakdown: ConfluenceBreakdown;
  createdAt: number;
  status: "ACTIVE" | "TP1_HIT" | "TP2_HIT" | "TP3_HIT" | "SL_HIT";
  historyId?: string;
}

interface AppState {
  // Toasts
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: number) => void;

  // Live data (crypto, forex, metals, indices)
  liveData: Map<string, LiveData>;
  symbols: SymbolDef[];
  dataLoading: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;
  lastUpdate: number;
  marketPulse: {
    strongest: LiveData | null;
    weakest: LiveData | null;
    volatilityLeader: LiveData | null;
  };

  // Economic events
  events: EconomicEvent[];
  eventsLoading: boolean;
  refreshEvents: () => Promise<void>;

  // Generated signals (across all markets)
  signals: GeneratedSignal[];
  signalsLoading: boolean;
  refreshSignals: () => Promise<void>;

  // Watchlist
  watchlist: string[];
  toggleWatchlist: (symbol: string) => void;

  // History
  history: SignalHistory[];
  historyStats: ReturnType<typeof calculateStats>;
  performance: Record<string, unknown> | null;
  followSignal: (signal: GeneratedSignal) => Promise<void> | void;
  unfollowSignal: (id: string) => void;

  // Modals
  signalDetailId: string | null;
  openSignalDetail: (id: string) => void;
  closeSignalDetail: () => void;

  newsDetailId: number | null;
  openNewsDetail: (id: number) => void;
  closeNewsDetail: () => void;

  searchOpen: boolean;
  toggleSearch: () => void;
  closeSearch: () => void;

  notifOpen: boolean;
  toggleNotif: () => void;
  closeNotif: () => void;

  notifications: Notification[];
  markNotifRead: (id: number) => void;
  markAllNotifRead: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [liveData, setLiveData] = useState<Map<string, LiveData>>(new Map());
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [signals, setSignals] = useState<GeneratedSignal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("quantum_watchlist");
      return raw ? JSON.parse(raw) : ["BTC/USD", "XAU/USD", "EUR/USD"];
    } catch {
      return ["BTC/USD", "XAU/USD", "EUR/USD"];
    }
  });
  const [history, setHistory] = useState<SignalHistory[]>(() => loadHistory());
  const [performance, setPerformance] = useState<Record<string, unknown> | null>(null);
  const [signalDetailId, setSignalDetailId] = useState<string | null>(null);
  const [newsDetailId, setNewsDetailId] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: "Backend Terhubung", message: "Quantum API siap untuk market, signal, dan event sync.", time: "Baru saja", read: false, type: "system" },
    { id: 2, title: "Mode Backend-Only", message: "Frontend sekarang memuat data melalui API backend resmi.", time: "Baru saja", read: false, type: "system" },
  ]);

  const upcomingEventNotified = useRef<Set<string>>(new Set());

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);


  const toggleWatchlist = useCallback(async (symbol: string) => {
    const current = watchlist.includes(symbol);
    setWatchlist((prev) => {
      const next = current ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      try { localStorage.setItem("quantum_watchlist", JSON.stringify(next)); } catch {}
      return next;
    });

    if (isAuthenticated) {
      if (!current) {
        await backendAddWatchlist(symbol);
      } else {
        await backendRemoveWatchlist(symbol);
      }
    }
  }, [isAuthenticated, watchlist]);

  const refreshEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const data = await fetchBackendEvents();
      if (!data) throw new Error('Backend events unavailable');
      setEvents(data);

      const now = Date.now();
      data.forEach((event: EconomicEvent) => {
        if (
          event.impact === "High" &&
          event.timestamp > now &&
          event.timestamp - now <= 60 * 60 * 1000 &&
          !upcomingEventNotified.current.has(event.id)
        ) {
          upcomingEventNotified.current.add(event.id);
          const title = `High Impact ${event.country}: ${event.title}`;
          const body = `Event ${Math.round((event.timestamp - now) / 60000)} menit lagi`;
          const notif: Notification = {
            id: Date.now() + Math.random(),
            title,
            message: body,
            time: "Baru saja",
            read: false,
            type: "news",
          };
          setNotifications((prev) => [notif, ...prev].slice(0, 20));
          showAppNotification(title, { body, tag: `event-${event.id}`, route: '/#/app/news' });
        }
      });
    } catch (err) {
      console.error("refreshEvents error", err);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // Fetch live data for all symbols (with rotation to respect rate limit)
  const refreshData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const backendQuotes = await fetchBackendQuotes();
      if (!backendQuotes) throw new Error('Backend quotes unavailable');
      const data = new Map(backendQuotes.map((q) => [q.symbol, q]));
      setLiveData(data);
      setLastUpdate(Date.now());

      const priceMap: Record<string, number> = {};
      data.forEach((value: LiveData, symbol: string) => { priceMap[symbol] = value.price; });
      const { history: updatedHistory, updatedIds } = checkSignals(priceMap);
      setHistory(updatedHistory);

      if (updatedIds.length > 0) {
        updatedIds.forEach((id) => {
          const sig = updatedHistory.find((s) => s.id === id);
          if (sig) {
            const isWin = sig.status.includes("TP");
            const notif: Notification = {
              id: Date.now() + Math.random(),
              title: isWin ? `🎯 ${sig.symbol} Hit TP!` : `⛔ ${sig.symbol} Hit SL`,
              message: isWin ? `Profit: +${sig.pnlPercent?.toFixed(2)}%` : `Loss: ${sig.pnlPercent?.toFixed(2)}%`,
              time: "Baru saja",
              read: false,
              type: "signal",
            };
            setNotifications((prev) => [notif, ...prev].slice(0, 20));
            addToast(notif.title + " — " + notif.message, isWin ? "success" : "error");
          }
        });
      }
    } catch (err) {
      setDataError("Gagal memuat data market dari backend.");
      console.error(err);
      setLiveData(new Map());
    } finally {
      setDataLoading(false);
    }
  }, [addToast]);

  // Generate signals backend-only
  const refreshSignals = useCallback(async () => {
    setSignalsLoading(true);
    try {
      const backendSignals = await fetchBackendSignals();
      if (!backendSignals) {
        setSignals([]);
        return;
      }

      setSignals((prev) => {
        const previousSymbols = new Set(prev.map((s) => s.symbol + s.type));
        backendSignals.forEach((sig) => {
          const key = sig.symbol + sig.type;
          if (!previousSymbols.has(key)) {
            const title = `Sinyal Baru ${sig.symbol}`;
            const body = `${sig.type} · Confidence ${sig.confidence}% · Entry ${sig.entry.toFixed(2)}`;
            const notif: Notification = {
              id: Date.now() + Math.random(),
              title,
              message: body,
              time: 'Baru saja',
              read: false,
              type: 'signal',
            };
            setNotifications((prevNotif) => [notif, ...prevNotif].slice(0, 20));
            showAppNotification(title, { body, tag: `signal-${sig.symbol}`, route: '/#/app/signals' });
          }
        });
        return backendSignals;
      });
    } finally {
      setSignalsLoading(false);
    }
  }, []);

  const followSignal = useCallback(async (signal: GeneratedSignal) => {
    const historySignal: SignalHistory = {
      id: generateId(),
      symbol: signal.symbol,
      name: signal.name,
      icon: signal.icon,
      type: signal.type,
      entry: signal.entry,
      tp1: signal.tp1,
      tp2: signal.tp2,
      tp3: signal.tp3,
      sl: signal.sl,
      confidence: signal.confidence,
      reason: signal.reason,
      status: "ACTIVE",
      createdAt: Date.now(),
    };

    await postBackendFollowSignal({
      id: historySignal.id,
      symbol: signal.symbol,
      direction: signal.type,
      entry: signal.entry,
      tp1: signal.tp1,
      tp2: signal.tp2,
      tp3: signal.tp3,
      sl: signal.sl,
      confidence: signal.confidence,
    });

    const newHistory = addToHistory(historySignal);
    setHistory(newHistory);
    addToast(`✓ Sinyal ${signal.symbol} ${signal.type} diikuti`, "success");
    setSignals((prev) => prev.map((s) =>
      s.id === signal.id ? { ...s, historyId: historySignal.id } : s
    ));
  }, [addToast]);

  const unfollowSignal = useCallback((id: string) => {
    const newHistory = history.filter((s) => s.id !== id);
    saveHistory(newHistory);
    setHistory(newHistory);
    addToast("Sinyal dihapus dari portfolio", "info");
  }, [history, addToast]);

  // Initial load
  useEffect(() => {
    refreshData();
    refreshEvents();

    const dataInterval = setInterval(refreshData, 60000);
    const eventInterval = setInterval(refreshEvents, 300000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(eventInterval);
    };
  }, [refreshData, refreshEvents]);

  // Sync user-scoped state from backend after login
  useEffect(() => {
    if (!isAuthenticated) return;
    void (async () => {
      const [serverWatchlist, serverHistory, serverNotifications, serverPerformance] = await Promise.all([
        backendGetWatchlist(),
        fetchBackendSignalHistory(),
        backendGetNotifications(),
        fetchBackendSignalPerformance(),
      ]);

      if (serverWatchlist) {
        setWatchlist(serverWatchlist);
        try { localStorage.setItem('quantum_watchlist', JSON.stringify(serverWatchlist)); } catch {}
      }

      if (serverHistory) {
        const mapped: SignalHistory[] = serverHistory.map((item: any) => ({
          id: item.id,
          symbol: item.signal?.symbol ?? item.symbol,
          name: item.signal?.symbol ?? item.symbol,
          icon: item.signal?.symbol?.charAt(0) ?? 'Q',
          type: item.signal?.direction ?? item.direction,
          entry: item.entryPrice ?? item.signal?.entry ?? 0,
          tp1: item.signal?.tp1 ?? 0,
          tp2: item.signal?.tp2 ?? 0,
          tp3: item.signal?.tp3 ?? 0,
          sl: item.signal?.sl ?? 0,
          confidence: item.signal?.confidence ?? 0,
          reason: Array.isArray(item.signal?.reason) ? item.signal.reason.join(' · ') : 'followed-from-backend',
          status: item.status,
          createdAt: new Date(item.followedAt).getTime(),
          closedAt: item.closedAt ? new Date(item.closedAt).getTime() : undefined,
          closePrice: item.closePrice ?? undefined,
          pnl: item.pnl ?? undefined,
          pnlPercent: item.pnlPct ?? undefined,
        }));
        setHistory(mapped);
        saveHistory(mapped);
      }

      if (serverNotifications) {
        const mapped = serverNotifications.map((n: any) => ({
          id: typeof n.id === 'string' ? Number.parseInt(n.id.slice(-6), 36) || Date.now() + Math.random() : n.id,
          title: n.title,
          message: n.body,
          time: new Date(n.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
          read: Boolean(n.readAt),
          type: n.type,
        })) as Notification[];
        setNotifications(mapped);
      }

      if (serverPerformance) {
        setPerformance(serverPerformance);
      }
    })();
  }, [isAuthenticated]);

  // Generate signals periodically (every 2 min)
  useEffect(() => {
    refreshSignals();
    const signalInterval = setInterval(refreshSignals, 120000);
    return () => clearInterval(signalInterval);
  }, [refreshSignals]);

  const pulseArray = Array.from(liveData.values());
  const marketPulse = {
    strongest: pulseArray.length ? [...pulseArray].sort((a, b) => b.changePercent - a.changePercent)[0] : null,
    weakest: pulseArray.length ? [...pulseArray].sort((a, b) => a.changePercent - b.changePercent)[0] : null,
    volatilityLeader: pulseArray.length ? [...pulseArray].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))[0] : null,
  };

  const value: AppState = {
    toasts, addToast, removeToast,
    liveData, symbols: SYMBOLS, dataLoading, dataError, refreshData, lastUpdate, marketPulse,
    events, eventsLoading, refreshEvents,
    signals, signalsLoading, refreshSignals,
    watchlist, toggleWatchlist,
    history, historyStats: calculateStats(history),
    performance,
    followSignal, unfollowSignal,
    signalDetailId, openSignalDetail: setSignalDetailId, closeSignalDetail: () => setSignalDetailId(null),
    newsDetailId, openNewsDetail: setNewsDetailId, closeNewsDetail: () => setNewsDetailId(null),
    searchOpen, toggleSearch: () => setSearchOpen((v) => !v), closeSearch: () => setSearchOpen(false),
    notifOpen, toggleNotif: () => setNotifOpen((v) => !v), closeNotif: () => setNotifOpen(false),
    notifications,
    markNotifRead: (id) => {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      if (isAuthenticated) void backendMarkNotificationRead(String(id));
    },
    markAllNotifRead: () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      if (isAuthenticated) void backendMarkAllNotificationsRead();
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
