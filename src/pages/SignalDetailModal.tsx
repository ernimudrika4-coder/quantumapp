import { Modal, useApp } from "../components/UI";
import { formatPrice } from "../services/twelvedata";
import { ArrowUpRight, ArrowDownRight, Brain, TrendingUp, Share2, BellOff, CheckCircle2, AlertCircle, Shield, Activity, Layers3, Gauge } from "lucide-react";

export function SignalDetailModal() {
  const { signalDetailId, closeSignalDetail, signals, history, followSignal, unfollowSignal, addToast } = useApp();
  const signal = signals.find((s) => s.id === signalDetailId);

  if (!signal) return null;
  const isBuy = signal.type === "BUY";

  // Check if this signal is in history
  const historyEntry = history.find((h) => h.id === signal.historyId);
  const isFollowed = !!historyEntry;
  const historyStatus = historyEntry?.status;

  return (
    <Modal open={signalDetailId !== null} onClose={closeSignalDetail}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-bg-4 border border-white/5 flex items-center justify-center font-bold text-ink-900 text-base">
              {signal.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold text-chrome-bright">{signal.symbol}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isBuy ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                }`}>
                  {signal.type}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-ink-500 mt-0.5">
                <span>Live · AI Generated</span>
                <span>·</span>
                <span>{signal.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status banner if followed */}
        {isFollowed && historyStatus && (
          <div className={`glossy rounded-xl p-3 mb-4 flex items-center gap-3 ${
            historyStatus === "ACTIVE" ? "border-success/20" :
            historyStatus.includes("TP") ? "border-success/30 bg-success/5" :
            "border-danger/30 bg-danger/5"
          }`}>
            {historyStatus === "ACTIVE" && (
              <>
                <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-success">Posisi Aktif</div>
                  <div className="text-[10px] text-ink-500">Entry: ${formatPrice(historyEntry.entry)}</div>
                </div>
              </>
            )}
            {historyStatus === "TP1_HIT" && (
              <>
                <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-success">TP1 Tercapai!</div>
                  <div className="text-[10px] text-ink-500">Menunggu TP2/TP3...</div>
                </div>
              </>
            )}
            {historyStatus === "TP2_HIT" && (
              <>
                <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-success">TP2 Tercapai!</div>
                  <div className="text-[10px] text-ink-500">Menunggu TP3 final...</div>
                </div>
              </>
            )}
            {historyStatus === "TP3_HIT" && (
              <>
                <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-success">TP3 Tercapai!</div>
                  <div className="text-[10px] text-ink-500">
                    Profit: +${formatPrice(historyEntry.pnl || 0)} ({historyEntry.pnlPercent?.toFixed(2)}%)
                  </div>
                </div>
              </>
            )}
            {historyStatus === "SL_HIT" && (
              <>
                <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-danger" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-semibold text-danger">Stop Loss Tersentuh</div>
                  <div className="text-[10px] text-ink-500">
                    Loss: ${formatPrice(historyEntry.pnl || 0)} ({historyEntry.pnlPercent?.toFixed(2)}%)
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Live price card */}
        <div className="glossy-elevated rounded-2xl p-4 mb-4">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-0.5">Entry Price</div>
              <div className="font-mono text-2xl font-bold text-chrome-bright">${formatPrice(signal.entry)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-ink-500 uppercase tracking-wider">Confidence</div>
              <div className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-display font-bold text-lg text-gradient-blue">{signal.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Entry/TP/SL grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="glossy rounded-xl p-3">
            <div className="text-[9px] text-ink-500 uppercase tracking-wider mb-1">Entry</div>
            <div className="font-mono font-bold text-[15px] text-chrome-bright">${formatPrice(signal.entry)}</div>
          </div>
          <div className="glossy rounded-xl p-3">
            <div className="text-[9px] text-ink-500 uppercase tracking-wider mb-1">Analisa AI</div>
            <div className="text-[11px] text-ink-700 leading-tight line-clamp-2">{signal.reason}</div>
          </div>
        </div>

        {/* TP Levels */}
        <div className="mb-4">
          <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2 px-1">Target Profit (3 Level)</div>
          <div className="space-y-1.5">
            {[
              { label: "TP1 (Conservative)", price: signal.tp1, pct: ((signal.tp1 - signal.entry) / signal.entry * 100 * (isBuy ? 1 : -1)) },
              { label: "TP2 (Moderate)", price: signal.tp2, pct: ((signal.tp2 - signal.entry) / signal.entry * 100 * (isBuy ? 1 : -1)) },
              { label: "TP3 (Aggressive)", price: signal.tp3, pct: ((signal.tp3 - signal.entry) / signal.entry * 100 * (isBuy ? 1 : -1)) },
            ].map((tp, i) => {
              const hit = historyStatus && (
                (i === 0 && historyStatus.includes("TP")) ||
                (i === 1 && (historyStatus === "TP2_HIT" || historyStatus === "TP3_HIT")) ||
                (i === 2 && historyStatus === "TP3_HIT")
              );
              return (
                <div key={i} className={`glossy rounded-lg p-3 flex items-center justify-between ${hit ? "border-success/30 bg-success/5" : ""}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      hit ? "bg-success/20" : "bg-success/10 border border-success/20"
                    }`}>
                      <TrendingUp className={`w-3.5 h-3.5 ${hit ? "text-success" : "text-success/70"}`} />
                    </div>
                    <div>
                      <div className="text-[10px] text-ink-500">{tp.label}</div>
                      <div className="text-[10px] text-success/80">
                        +{tp.pct.toFixed(2)}%
                        {hit && " ✓"}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-[14px] text-success">${formatPrice(tp.price)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SL */}
        <div className="mb-5">
          <div className={`glossy rounded-lg p-3 flex items-center justify-between border ${
            historyStatus === "SL_HIT" ? "border-danger/40 bg-danger/10" : "border-danger/20"
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                historyStatus === "SL_HIT" ? "bg-danger/20" : "bg-danger/10 border border-danger/20"
              }`}>
                <ArrowDownRight className={`w-3.5 h-3.5 ${historyStatus === "SL_HIT" ? "text-danger" : "text-danger/70"}`} />
              </div>
              <div>
                <div className="text-[10px] text-ink-500">Stop Loss</div>
                <div className="text-[10px] text-danger/80">
                  {((signal.sl - signal.entry) / signal.entry * 100 * (isBuy ? 1 : -1)).toFixed(2)}%
                  {historyStatus === "SL_HIT" && " ⚠️"}
                </div>
              </div>
            </div>
            <div className="font-mono font-bold text-[14px] text-danger">${formatPrice(signal.sl)}</div>
          </div>
        </div>

        {/* Confluence Scorecard */}
        <div className="mb-5">
          <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-2 px-1">Confluence Scorecard</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Trend', value: signal.breakdown?.trendScore ?? 0, icon: Activity, color: 'text-blue-400' },
              { label: 'Momentum', value: signal.breakdown?.momentumScore ?? 0, icon: Gauge, color: 'text-cyan-400' },
              { label: 'Structure', value: signal.breakdown?.structureScore ?? 0, icon: Layers3, color: 'text-violet-400' },
              { label: 'Event Risk', value: signal.breakdown?.eventRiskScore ?? 0, icon: Shield, color: 'text-orange-400' },
            ].map((item) => (
              <div key={item.label} className="glossy rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span className="text-[10px] text-ink-500 uppercase tracking-wider">{item.label}</span>
                </div>
                <div className="font-display text-lg font-bold text-chrome-bright">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="glossy rounded-xl p-3 mt-2">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-ink-500">Total Confluence</span>
              <span className="font-semibold text-gradient-blue">{signal.breakdown?.total ?? signal.confidence}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-ink-500">Higher TF Trend</span>
              <span className="font-semibold text-chrome-bright">{signal.breakdown?.higherTimeframeTrend ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-ink-500">Structure</span>
              <span className="font-semibold text-chrome-bright">{signal.breakdown?.structure ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-ink-500">ATR</span>
              <span className="font-semibold text-chrome-bright">{signal.breakdown?.atr ? formatPrice(signal.breakdown.atr) : '—'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-ink-500">Risk/Reward Ratio</span>
              <span className="font-semibold text-chrome-bright">1 : {signal.breakdown?.rrRatio?.toFixed(2) ?? ((signal.tp3 - signal.entry) / Math.max(signal.entry - signal.sl, 0.0001)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sticky bottom-0 bg-bg-2 pt-2 pb-1">
          {isFollowed ? (
            <button
              onClick={() => {
                if (historyEntry) {
                  unfollowSignal(historyEntry.id);
                  closeSignalDetail();
                }
              }}
              className="flex-1 btn-secondary text-[13px] px-4 py-3 rounded-xl flex items-center justify-center gap-1.5"
            >
              <BellOff className="w-4 h-4" />
              Berhenti Ikuti
            </button>
          ) : (
            <button
              onClick={() => {
                followSignal(signal);
                closeSignalDetail();
              }}
              className="flex-1 btn-primary text-[13px] px-4 py-3 rounded-xl flex items-center justify-center gap-1.5"
            >
              Ikuti Sinyal {signal.type}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => addToast("Link disalin ke clipboard", "success")}
            className="btn-secondary px-4 py-3 rounded-xl flex items-center justify-center touchable"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
