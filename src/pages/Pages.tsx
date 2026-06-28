import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Brain, TrendingUp, Zap, Globe, Activity, Users, MessageCircle, Send, Settings, Bell, HelpCircle, Shield, LogOut, ChevronRight, Trophy, Target, Wallet } from "lucide-react";
import { useApp } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import { SYMBOLS, formatPrice } from "../services/twelvedata";
import { countryFlag, impactColor, categoryIcon, formatEventTime, formatEventDateTime } from "../services/news";
import { backendSendTestNotification } from '../services/backend';
import PlanCard from '../components/PlanCard';
import type { EconomicEvent } from "../services/news";
import type { GeneratedSignal } from "../context/AppContext";

/* ============================================================ */
/* SIGNALS PAGE                                                  */
/* ============================================================ */

export function SignalsPage() {
  const { openSignalDetail, followSignal, signals, history, liveData, dataLoading, historyStats, lastUpdate, refreshSignals, addToast } = useApp();
  const [tab, setTab] = useState<"live" | "history">("live");

  const activeSignals = signals;
  const followedHistory = history.filter((h) =>
    h.status === "ACTIVE" || h.status.includes("TP") || h.status === "SL_HIT"
  );

  return (
    <div className="px-4 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="live-dot" />
          <span className="text-[10px] font-semibold text-success uppercase tracking-wider">
            {dataLoading ? "Memuat..." : `Live · ${activeSignals.length} Sinyal · ${liveData.size} Pair`}
          </span>
          {lastUpdate > 0 && (
            <span className="text-[9px] text-ink-500 ml-1">
              · {Math.floor((Date.now() - lastUpdate) / 1000)}d lalu
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold text-chrome-bright">Sinyal AI Live</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Generated dari analisa teknikal RSI + MACD + MA. Entry, TP, SL otomatis dihitung dari volatilitas.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 glossy rounded-xl p-1">
        <button
          onClick={() => setTab("live")}
          className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all touchable ${
            tab === "live" ? "bg-bg-4 text-chrome-bright" : "text-ink-500"
          }`}
        >
          Sinyal Live ({activeSignals.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all touchable ${
            tab === "history" ? "bg-bg-4 text-chrome-bright" : "text-ink-500"
          }`}
        >
          History ({followedHistory.length})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {tab === "live" ? (
          <>
            <div className="glossy rounded-xl p-2.5 text-center">
              <div className="font-display text-lg font-bold text-chrome-bright">{activeSignals.length}</div>
              <div className="text-[9px] text-ink-500 uppercase tracking-wider">Aktif</div>
            </div>
            <div className="glossy rounded-xl p-2.5 text-center">
              <div className="font-display text-lg font-bold text-success">{activeSignals.filter(s => s.type === "BUY").length}</div>
              <div className="text-[9px] text-ink-500 uppercase tracking-wider">Buy</div>
            </div>
            <div className="glossy rounded-xl p-2.5 text-center">
              <div className="font-display text-lg font-bold text-danger">{activeSignals.filter(s => s.type === "SELL").length}</div>
              <div className="text-[9px] text-ink-500 uppercase tracking-wider">Sell</div>
            </div>
          </>
        ) : (
          <>
            <div className="glossy rounded-xl p-2.5 text-center">
              <div className="font-display text-lg font-bold text-success">{historyStats.winRate.toFixed(0)}%</div>
              <div className="text-[9px] text-ink-500 uppercase tracking-wider">Win Rate</div>
            </div>
            <div className="glossy rounded-xl p-2.5 text-center">
              <div className="font-display text-lg font-bold text-chrome-bright">{historyStats.totalHits}</div>
              <div className="text-[9px] text-ink-500 uppercase tracking-wider">TP Hits</div>
            </div>
            <div className="glossy rounded-xl p-2.5 text-center">
              <div className="font-display text-lg font-bold text-danger">{historyStats.losers}</div>
              <div className="text-[9px] text-ink-500 uppercase tracking-wider">SL Hits</div>
            </div>
          </>
        )}
      </div>

      {tab === "live" && (
        <>
          {dataLoading && activeSignals.length === 0 ? (
            <div className="glossy rounded-2xl p-12 text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
              <div className="text-sm text-ink-700 mb-1">AI sedang menganalisa market...</div>
              <div className="text-[11px] text-ink-500">Menghitung RSI, MACD, MA untuk {liveData.size} pair</div>
            </div>
          ) : activeSignals.length === 0 ? (
            <div className="glossy rounded-2xl p-8 text-center">
              <Brain className="w-10 h-10 mx-auto mb-3 text-ink-500 opacity-50" />
              <div className="font-display text-base text-ink-700 mb-1">Belum ada sinyal aktif</div>
              <div className="text-[11px] text-ink-500 mb-4">AI menunggu kondisi market yang optimal (RSI oversold/overbought)</div>
              <button
                onClick={() => refreshSignals()}
                className="btn-secondary text-[12px] px-4 py-2 rounded-lg"
              >
                Scan Ulang
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 stagger">
              {activeSignals.map((s) => (
                <SignalRow
                  key={s.id}
                  signal={s}
                  onClick={() => openSignalDetail(s.id)}
                  onFollow={() => {
                    followSignal(s);
                    addToast(`✓ Sinyal ${s.symbol} diikuti`, "success");
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "history" && (
        <>
          {followedHistory.length === 0 ? (
            <div className="glossy rounded-2xl p-8 text-center">
              <div className="text-sm text-ink-700 mb-1">Belum ada history</div>
              <div className="text-[11px] text-ink-500">Ikuti sinyal dari tab Live untuk melacaknya di sini</div>
            </div>
          ) : (
            <div className="space-y-2.5 stagger">
              {followedHistory.map((h) => (
                <HistoryRow key={h.id} history={h} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SignalRow({ signal, onClick, onFollow }: { signal: GeneratedSignal; onClick: () => void; onFollow: () => void }) {
  const isBuy = signal.type === "BUY";
  return (
    <button onClick={onClick} className="glossy rounded-2xl p-4 touchable w-full text-left">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-bg-4 border border-white/5 flex items-center justify-center font-bold text-ink-900 text-sm">
            {signal.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[15px] text-ink-900">{signal.symbol}</span>
              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isBuy ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
              }`}>
                {signal.type}
              </span>
            </div>
            <div className="text-[10px] text-ink-500 mt-0.5">
              Live AI · {signal.confidence}% confidence
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-semibold text-[13px] text-chrome-bright">${formatPrice(signal.entry)}</div>
          <div className="text-[9px] text-ink-500">Entry</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-3 text-[10px]">
        <div className="rounded-lg bg-bg-1/60 border border-white/[0.03] p-2">
          <div className="text-ink-500 uppercase tracking-wider text-[8px]">Entry</div>
          <div className="font-mono font-semibold text-ink-700 mt-0.5">{formatPrice(signal.entry)}</div>
        </div>
        <div className="rounded-lg bg-success/[0.06] border border-success/20 p-2">
          <div className="text-success/70 uppercase tracking-wider text-[8px]">TP3</div>
          <div className="font-mono font-semibold text-success mt-0.5">{formatPrice(signal.tp3)}</div>
        </div>
        <div className="rounded-lg bg-success/[0.06] border border-success/20 p-2">
          <div className="text-success/70 uppercase tracking-wider text-[8px]">TP2</div>
          <div className="font-mono font-semibold text-success mt-0.5">{formatPrice(signal.tp2)}</div>
        </div>
        <div className="rounded-lg bg-danger/[0.06] border border-danger/20 p-2">
          <div className="text-danger/70 uppercase tracking-wider text-[8px]">SL</div>
          <div className="font-mono font-semibold text-danger mt-0.5">{formatPrice(signal.sl)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[10px] text-ink-500">
          <Brain className="w-3 h-3 text-blue-400" />
          AI Confidence
        </span>
        <span className="text-[10px] font-semibold text-ink-700">{signal.confidence}%</span>
      </div>
      <div className="h-1 bg-bg-4 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ width: `${signal.confidence}%` }} />
      </div>

      <div className="text-[10px] text-ink-500 italic mb-3 px-1 line-clamp-1">{signal.reason}</div>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFollow();
          }}
          className={`flex-1 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider touchable ${
            isBuy
              ? "bg-success/15 text-success border border-success/20"
              : "bg-danger/15 text-danger border border-danger/20"
          }`}
        >
          Ikuti {signal.type}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="px-3 py-2 rounded-lg text-[11px] font-semibold text-ink-500 bg-bg-3/50 border border-white/5 touchable"
        >
          Detail
        </button>
      </div>
    </button>
  );
}

function HistoryRow({ history }: { history: any }) {
  const isBuy = history.type === "BUY";
  const isWin = history.status.includes("TP");
  const isLoss = history.status === "SL_HIT";

  return (
    <div className={`glossy rounded-2xl p-4 ${isWin ? "border-success/20" : isLoss ? "border-danger/20" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-bg-4 border border-white/5 flex items-center justify-center font-bold text-ink-900 text-sm">
            {history.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[14px] text-ink-900">{history.symbol}</span>
              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isBuy ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
              }`}>
                {history.type}
              </span>
            </div>
            <div className="text-[10px] text-ink-500">
              {new Date(history.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
        <div className={`text-right px-2 py-1 rounded-lg ${
          history.status === "ACTIVE" ? "bg-bg-4" :
          isWin ? "bg-success/15" :
          "bg-danger/15"
        }`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${
            history.status === "ACTIVE" ? "text-chrome-bright" :
            isWin ? "text-success" :
            "text-danger"
          }`}>
            {history.status === "ACTIVE" && "Aktif"}
            {history.status === "TP1_HIT" && "TP1 ✓"}
            {history.status === "TP2_HIT" && "TP2 ✓"}
            {history.status === "TP3_HIT" && "TP3 ✓"}
            {history.status === "SL_HIT" && "SL ⚠️"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-[10px] mb-2">
        <div className="rounded-lg bg-bg-1/60 p-1.5">
          <div className="text-ink-500 text-[8px]">Entry</div>
          <div className="font-mono text-[11px] text-ink-700">{formatPrice(history.entry)}</div>
        </div>
        <div className="rounded-lg bg-success/[0.06] p-1.5">
          <div className="text-success/70 text-[8px]">TP3</div>
          <div className="font-mono text-[11px] text-success">{formatPrice(history.tp3)}</div>
        </div>
        <div className="rounded-lg bg-success/[0.06] p-1.5">
          <div className="text-success/70 text-[8px]">TP2</div>
          <div className="font-mono text-[11px] text-success">{formatPrice(history.tp2)}</div>
        </div>
        <div className="rounded-lg bg-danger/[0.06] p-1.5">
          <div className="text-danger/70 text-[8px]">SL</div>
          <div className="font-mono text-[11px] text-danger">{formatPrice(history.sl)}</div>
        </div>
      </div>

      {history.pnl !== undefined && (
        <div className={`text-[11px] font-semibold text-center py-1.5 rounded-lg ${
          isWin ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
        }`}>
          {isWin ? "+" : ""}{history.pnlPercent?.toFixed(2)}% ({isWin ? "+" : ""}${formatPrice(history.pnl)})
        </div>
      )}
    </div>
  );
}

/* ============================================================ */
/* MARKETS PAGE                                                  */
/* ============================================================ */

export function MarketsPage() {
  const { liveData, dataLoading, lastUpdate, refreshData, signals } = useApp();
  const [filter, setFilter] = useState<string>("Semua");
  const navigate = useNavigate();

  // Merge static symbol definitions with live data
  const markets = SYMBOLS.map((sym) => {
    const data = liveData.get(sym.symbol);
    return { ...sym, data };
  }).filter((m) => filter === "Semua" || m.category === filter);

  const categories = [
    { key: "Semua", label: "Semua" },
    { key: "crypto", label: "Crypto" },
    { key: "forex", label: "Forex" },
    { key: "metal", label: "Metals" },
    { key: "index", label: "Indices" },
  ];

  // Market stats

  return (
    <div className="px-4 space-y-4">
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Globe className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
            Twelve Data · {liveData.size} Live Pairs
          </span>
          {lastUpdate > 0 && (
            <span className="text-[9px] text-ink-500 ml-1">
              · {Math.floor((Date.now() - lastUpdate) / 1000)}d lalu
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold text-chrome-bright">Pasar Dunia</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Data real-time: Crypto, Forex, Emas, Indices via Twelve Data API.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glossy rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[9px] text-ink-500 uppercase tracking-wider">Total Pairs</span>
          </div>
          <div className="font-display font-bold text-lg text-chrome-bright">{liveData.size}</div>
        </div>
        <div className="glossy rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            <span className="text-[9px] text-ink-500 uppercase tracking-wider">Sinyal Aktif</span>
          </div>
          <div className="font-display font-bold text-lg text-success">{signals.length}</div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-full whitespace-nowrap transition-all touchable ${
              filter === c.key
                ? "bg-gradient-to-b from-chrome-2 to-chrome-4 text-bg-base shadow-md"
                : "bg-bg-3/80 text-ink-500 border border-white/5"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Markets list */}
      {dataLoading && markets.every((m) => !m.data) ? (
        <div className="glossy rounded-2xl p-8 text-center">
          <div className="text-sm text-ink-700 mb-1">Memuat data market...</div>
          <div className="text-[11px] text-ink-500">Mengambil harga dari Twelve Data API</div>
        </div>
      ) : (
        <div className="space-y-2 stagger">
          {markets.map((m) => (
            <MarketRow key={m.symbol} market={m} onClick={() => navigate(`/app/markets/${encodeURIComponent(m.symbol)}`)} />
          ))}
        </div>
      )}

      <button
        onClick={refreshData}
        className="w-full btn-secondary text-[12px] py-2.5 rounded-lg"
      >
        Refresh Data
      </button>
    </div>
  );
}

function MarketRow({ market, onClick }: { market: any; onClick: () => void }) {
  const data = market.data;
  const hasData = !!data;
  const price = hasData ? formatPrice(data.price, market.symbol) : "—";
  const change = hasData ? data.changePercent : 0;
  const up = change >= 0;

  return (
    <button onClick={onClick} className="glossy rounded-xl p-3 flex items-center gap-3 touchable w-full text-left">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${market.gradient} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md`}>
        {market.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-[14px] text-ink-900">{market.name}</div>
            <div className="text-[10px] text-ink-500 capitalize">{market.category} · {market.symbol}</div>
          </div>
          <div className="text-right">
            <div className="font-mono font-semibold text-[14px] text-ink-900">{hasData ? `$${price}` : "—"}</div>
            {hasData && (
              <div className={`text-[10px] font-semibold flex items-center gap-0.5 justify-end ${up ? "text-success" : "text-danger"}`}>
                {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
        <div className="h-8 mt-1">
          {hasData && data.sparkline.length > 0 ? (
            <MiniSparkline data={data.sparkline} up={up} />
          ) : hasData ? (
            <div className="h-full flex items-end gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => {
                const h = Math.abs(Math.sin(i * 0.5 + change) * 80 + 20);
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${up ? "bg-success/40" : "bg-danger/40"}`}
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-ink-500">
              Memuat...
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function MiniSparkline({ data, up }: { data: number[]; up: boolean }) {
  // Take last 30 points
  const slice = data.slice(-30);
  if (slice.length < 2) return null;
  const max = Math.max(...slice);
  const min = Math.min(...slice);
  const range = max - min || 1;
  const points = slice.map((v, i) => {
    const x = (i / (slice.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke={up ? "#2DD4BF" : "#F43F5E"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================ */
/* NEWS PAGE — REAL FOREX FACTORY ECONOMIC CALENDAR              */
/* ============================================================ */

export function NewsPage() {
  const { addToast, events, eventsLoading, refreshEvents } = useApp();
  const [filter, setFilter] = useState<"all" | "High" | "Medium">("all");

  const filtered = filter === "all" ? events : events.filter((e) => e.impact === filter);
  const highImpact = events.filter((e) => e.impact === "High").length;
  const medImpact = events.filter((e) => e.impact === "Medium").length;

  return (
    <div className="px-4 space-y-4">
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="live-dot" />
          <span className="text-[10px] font-semibold text-success uppercase tracking-wider">
            Live · Forex Factory
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-chrome-bright">Kalender Ekonomi</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Data real-time dari Forex Factory. Event ini menggerakkan market.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glossy rounded-xl p-3 text-center">
          <div className="font-display text-lg font-bold text-chrome-bright">{events.length}</div>
          <div className="text-[9px] text-ink-500 uppercase tracking-wider">Events</div>
        </div>
        <div className="glossy rounded-xl p-3 text-center">
          <div className="font-display text-lg font-bold text-danger">{highImpact}</div>
          <div className="text-[9px] text-ink-500 uppercase tracking-wider">High Impact</div>
        </div>
        <div className="glossy rounded-xl p-3 text-center">
          <div className="font-display text-lg font-bold text-warning">{medImpact}</div>
          <div className="text-[9px] text-ink-500 uppercase tracking-wider">Medium Impact</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4">
        {[
          { key: "all", label: "Semua" },
          { key: "High", label: "🔴 High Impact" },
          { key: "Medium", label: "🟠 Medium" },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key as any)}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-full whitespace-nowrap transition-all touchable ${
              filter === c.key
                ? "bg-gradient-to-b from-chrome-2 to-chrome-4 text-bg-base shadow-md"
                : "bg-bg-3/80 text-ink-500 border border-white/5"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {eventsLoading ? (
        <div className="glossy rounded-2xl p-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
          <div className="text-sm text-ink-700 mb-1">Memuat kalender ekonomi...</div>
          <div className="text-[11px] text-ink-500">Mengambil data dari Forex Factory</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glossy rounded-2xl p-8 text-center">
          <div className="text-sm text-ink-700 mb-1">Tidak ada event</div>
          <div className="text-[11px] text-ink-500">Coba filter lain atau refresh</div>
        </div>
      ) : (
        <div className="space-y-2.5 stagger">
          {filtered.map((event) => (
            <EconomicEventCard
              key={event.id}
              event={event}
              onClick={() => addToast(`Event: ${event.title}`, "info")}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={refreshEvents}
          className="flex-1 btn-secondary text-[12px] py-2.5 rounded-lg"
        >
          Refresh Data
        </button>
        <a
          href="https://www.forexfactory.com/calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-[12px] px-4 py-2.5 rounded-lg flex items-center gap-1.5"
        >
          Forex Factory ↗
        </a>
      </div>

      <div className="text-[10px] text-ink-500 text-center">
        Data: Forex Factory Economic Calendar · Updated real-time
      </div>
    </div>
  );
}

function EconomicEventCard({ event, onClick }: { event: EconomicEvent; onClick: () => void }) {
  const impact = impactColor(event.impact);
  const cat = categoryIcon(event.category);
  const flag = countryFlag(event.country);
  const timeStr = formatEventTime(event.timestamp);
  const isPast = event.timestamp < Date.now();
  const isSoon = !isPast && event.timestamp - Date.now() < 3600000; // within 1 hour

  return (
    <button onClick={onClick} className="glossy rounded-2xl p-4 touchable w-full text-left relative overflow-hidden">
      {/* Soon indicator */}
      {isSoon && (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-danger/20 border border-danger/30 text-[9px] font-bold text-danger uppercase tracking-wider rounded-bl-lg">
          Segera
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Category icon with gradient */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-lg relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <span className="relative">{cat.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: flag + impact + time */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-sm">{flag}</span>
            <span className="text-[10px] font-bold text-ink-700">{event.country}</span>
            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${impact.bg} ${impact.text} border ${impact.border}`}>
              {event.impact}
            </span>
            <span className="text-[10px] text-ink-500">{event.category}</span>
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-[14px] leading-tight mb-2 ${isPast ? "text-ink-500" : "text-ink-900"}`}>
            {event.title}
          </h3>

          {/* Data: Forecast / Previous / Actual */}
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-lg bg-bg-1/60 border border-white/[0.03] p-2">
              <div className="text-[8px] text-ink-500 uppercase tracking-wider">Actual</div>
              <div className={`font-mono font-bold mt-0.5 ${event.actual ? "text-chrome-bright" : "text-ink-500"}`}>
                {event.actual || "—"}
              </div>
            </div>
            <div className="rounded-lg bg-bg-1/60 border border-white/[0.03] p-2">
              <div className="text-[8px] text-ink-500 uppercase tracking-wider">Forecast</div>
              <div className="font-mono font-semibold text-blue-400 mt-0.5">{event.forecast}</div>
            </div>
            <div className="rounded-lg bg-bg-1/60 border border-white/[0.03] p-2">
              <div className="text-[8px] text-ink-500 uppercase tracking-wider">Previous</div>
              <div className="font-mono font-semibold text-ink-500 mt-0.5">{event.previous}</div>
            </div>
          </div>

          {/* Time */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-ink-500">
            <span>{formatEventDateTime(event.timestamp)}</span>
            <span className={`font-semibold ${
              isPast ? "text-ink-500" :
              isSoon ? "text-danger" : "text-success"
            }`}>
              {timeStr}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}



/* ============================================================ */
/* PROFILE PAGE                                                  */
/* ============================================================ */

export function ProfilePage() {
  const { addToast, historyStats, watchlist, performance } = useApp();
  const { user, isAuthenticated, login, register, logout, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  if (!isAuthenticated) {
    return (
      <div className="px-4 space-y-4">
        <div className="glossy-elevated rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="font-display text-2xl font-bold text-chrome-bright mb-2">Masuk ke Quantum</div>
            <div className="text-[13px] text-ink-500 mb-4">Simpan watchlist, history signal, dan sinkronkan dashboard Anda.</div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}>Login</button>
              <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}>Register</button>
            </div>
            <div className="space-y-2">
              {mode === 'register' && (
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama" className="w-full glossy rounded-xl px-4 py-3 text-[13px] bg-transparent outline-none" />
              )}
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full glossy rounded-xl px-4 py-3 text-[13px] bg-transparent outline-none" />
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="w-full glossy rounded-xl px-4 py-3 text-[13px] bg-transparent outline-none" />
              <button
                disabled={loading}
                onClick={async () => {
                  const res = mode === 'login'
                    ? await login({ email: form.email, password: form.password })
                    : await register({ name: form.name, email: form.email, password: form.password });
                  if (res.success) addToast(mode === 'login' ? 'Login berhasil' : 'Register berhasil', 'success');
                  else addToast(res.message || 'Auth gagal', 'error');
                }}
                className="w-full btn-primary text-[13px] px-4 py-3 rounded-xl"
              >
                {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4">
      <div className="glossy-elevated rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-chrome-1 to-chrome-4 flex items-center justify-center shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
            <span className="font-display font-bold text-2xl text-bg-base relative">{user?.name?.charAt(0)?.toUpperCase() || 'Q'}</span>
          </div>
          <div>
            <div className="font-display text-xl font-bold text-chrome-bright">{user?.name}</div>
            <div className="text-[12px] text-ink-500">{user?.email}</div>
            <div className="text-[11px] text-blue-400 mt-1 uppercase tracking-wider">Plan · {user?.plan}</div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-2">
          {[
            { l: 'Win Rate', v: `${Number(performance?.winRate ?? historyStats.winRate).toFixed(0)}%`, c: 'text-success' },
            { l: 'Watchlist', v: `${watchlist.length}`, c: 'text-gradient-blue' },
            { l: 'Signal Follow', v: `${Number(performance?.total ?? historyStats.total)}`, c: 'text-chrome-bright' },
          ].map((s) => (
            <div key={s.l} className="glass rounded-xl p-2.5 text-center">
              <div className={`font-display font-bold text-lg ${s.c}`}>{s.v}</div>
              <div className="text-[9px] text-ink-500 uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <PlanCard />

      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Trophy, l: 'Expectancy', v: `${Number(performance?.expectancy ?? 0).toFixed(2)}%`, c: 'text-amber-400' },
          { icon: Target, l: 'Profit Factor', v: `${Number(performance?.profitFactor ?? 0).toFixed(2)}`, c: 'text-success' },
          { icon: Wallet, l: 'Avg Win', v: `${Number(performance?.avgWin ?? 0).toFixed(2)}%`, c: 'text-chrome-bright' },
          { icon: TrendingUp, l: '7D Winrate', v: `${Number(performance?.recentWinRate ?? historyStats.winRate).toFixed(0)}%`, c: 'text-blue-400' },
        ].map((s) => (
          <div key={s.l} className="glossy rounded-xl p-3 touchable">
            <s.icon className={`w-4 h-4 ${s.c} mb-2`} />
            <div className="font-display font-bold text-base text-chrome-bright">{s.v}</div>
            <div className="text-[10px] text-ink-500 uppercase tracking-wider">{s.l}</div>
          </div>
        ))}
      </div>

      {Array.isArray(performance?.pairBreakdown) && performance.pairBreakdown.length > 0 && (
        <div className="glossy rounded-2xl p-4">
          <div className="font-semibold text-[14px] text-ink-900 mb-3">Performa per Pair</div>
          <div className="space-y-2">
            {performance.pairBreakdown.slice(0, 4).map((row: any) => (
              <div key={row.symbol} className="flex items-center justify-between text-[12px] rounded-xl bg-bg-1/60 border border-white/5 px-3 py-2.5">
                <div>
                  <div className="font-semibold text-ink-900">{row.symbol}</div>
                  <div className="text-[10px] text-ink-500">{row.total} trades · {row.winRate.toFixed(0)}% win</div>
                </div>
                <div className={`font-semibold ${row.avgReturnPct >= 0 ? 'text-success' : 'text-danger'}`}>
                  {row.avgReturnPct >= 0 ? '+' : ''}{row.avgReturnPct.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glossy rounded-2xl overflow-hidden">
        {[
          { icon: Bell, l: 'Notifikasi', d: 'Kelola preferensi notifikasi', msg: 'Pengaturan notifikasi segera hadir' },
          { icon: Shield, l: 'Keamanan Akun', d: '2FA, password, perangkat', msg: 'Halaman keamanan segera hadir' },
          { icon: Zap, l: 'Langganan', d: `${user?.plan?.toUpperCase()} Plan`, msg: 'Halaman langganan segera hadir' },
          { icon: HelpCircle, l: 'Pusat Bantuan', d: 'FAQ, kontak support', msg: 'Pusat bantuan segera hadir' },
          { icon: Settings, l: 'Pengaturan', d: 'Bahasa, tema, preferensi', msg: 'Halaman pengaturan segera hadir' },
        ].map((item, i) => (
          <button key={i} onClick={() => addToast(item.msg, 'info')} className="w-full flex items-center gap-3 p-3.5 border-b border-white/5 last:border-0 touchable hover:bg-white/[0.02] transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-bg-4 border border-white/5 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-ink-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink-900">{item.l}</div>
              <div className="text-[11px] text-ink-500 truncate">{item.d}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-500" />
          </button>
        ))}
      </div>

      <div className="glossy rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-[14px] text-ink-900">Bergabung dengan Komunitas</h3>
        </div>
        <p className="text-[12px] text-ink-500 mb-3">Terhubung dengan 25.000+ trader lainnya.</p>
        <div className="flex gap-2 mb-2">
          <button onClick={() => addToast('Membuka Discord...', 'info')} className="btn-primary text-[12px] px-3 py-2.5 rounded-lg flex-1 flex items-center justify-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" /> Discord
          </button>
          <button onClick={() => addToast('Membuka Telegram...', 'info')} className="btn-secondary text-[12px] px-3 py-2.5 rounded-lg flex-1 flex items-center justify-center gap-1.5">
            <Send className="w-3.5 h-3.5" /> Telegram
          </button>
        </div>
        <button
          onClick={async () => {
            const res = await backendSendTestNotification();
            if (res) addToast('Test notifikasi dikirim', 'success');
            else addToast('Gagal kirim test notifikasi', 'error');
          }}
          className="w-full btn-secondary text-[12px] px-3 py-2.5 rounded-lg"
        >
          Kirim Test Notifikasi
        </button>
      </div>

      <button onClick={() => { logout(); addToast('Anda telah keluar', 'info'); }} className="w-full glossy rounded-2xl p-3.5 flex items-center justify-center gap-2 touchable text-danger text-[13px] font-semibold">
        <LogOut className="w-4 h-4" /> Keluar
      </button>
    </div>
  );
}
