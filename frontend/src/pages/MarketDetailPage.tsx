import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, CalendarDays, Layers3, Brain } from 'lucide-react';
import { fetchBackendGeneratedSignal, fetchBackendMarketDetail } from '../services/backend';
import { formatPrice } from '../services/twelvedata';

export default function MarketDetailPage() {
  const { symbol = '' } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetchBackendMarketDetail(symbol),
      fetchBackendGeneratedSignal(symbol),
    ]).then(([detail, generated]) => {
      if (!mounted) return;
      setData({ ...(detail || {}), generatedSignal: generated || detail?.activeSignal || null });
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [symbol]);

  const quote = data?.quote;
  const signal = data?.generatedSignal || data?.activeSignal;
  const candles1h = data?.candles?.['1h'] ?? [];
  const overlay1h = data?.overlays?.['1h'];
  const indicators1h = data?.indicators?.['1h'];
  const indicators4h = data?.indicators?.['4h'];
  const indicators1d = data?.indicators?.['1d'];

  const chartData = useMemo(() => {
    if (!candles1h.length) return null;
    const closes = candles1h.slice(-40).map((c: any) => c.close);
    const ema20 = overlay1h?.ema20?.slice(-40) ?? [];
    const ema50 = overlay1h?.ema50?.slice(-40) ?? [];
    const sma20 = overlay1h?.sma20?.slice(-40) ?? [];
    const all = [...closes, ...ema20, ...ema50, ...sma20].filter((v) => Number.isFinite(v));
    const max = Math.max(...all);
    const min = Math.min(...all);
    const range = max - min || 1;

    const makePoints = (arr: number[]) => arr.map((v, i) => {
      const x = (i / (arr.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return {
      closes: makePoints(closes),
      ema20: ema20.length ? makePoints(ema20) : '',
      ema50: ema50.length ? makePoints(ema50) : '',
      sma20: sma20.length ? makePoints(sma20) : '',
    };
  }, [candles1h, overlay1h]);

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/app/markets" className="btn-secondary w-9 h-9 rounded-xl flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-500">Market Detail</div>
          <div className="font-display text-xl font-bold text-chrome-bright">{symbol}</div>
        </div>
      </div>

      {loading ? (
        <div className="glossy rounded-2xl p-8 text-center text-ink-500">Memuat detail market...</div>
      ) : !quote ? (
        <div className="glossy rounded-2xl p-8 text-center text-ink-500">Data market tidak tersedia.</div>
      ) : (
        <>
          <div className="glossy-elevated rounded-3xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] text-ink-500 uppercase tracking-wider mb-1">Live Quote</div>
                <div className="font-display text-3xl font-bold text-chrome-bright">${formatPrice(quote.price, quote.symbol)}</div>
                <div className={`text-[13px] font-semibold mt-1 inline-flex items-center gap-1 ${quote.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                  {quote.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </div>
              </div>
              <div className="text-right text-[11px] text-ink-500">
                <div>High: ${formatPrice(quote.high, quote.symbol)}</div>
                <div>Low: ${formatPrice(quote.low, quote.symbol)}</div>
                <div>Open: ${formatPrice(quote.open, quote.symbol)}</div>
              </div>
            </div>

            <div className="mt-5 h-40 glossy rounded-2xl p-3">
              {chartData ? (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <polyline points={chartData.closes} fill="none" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
                  {chartData.ema20 && <polyline points={chartData.ema20} fill="none" stroke="#22D3EE" strokeWidth="1.1" strokeLinecap="round" />}
                  {chartData.ema50 && <polyline points={chartData.ema50} fill="none" stroke="#F59E0B" strokeWidth="1.1" strokeLinecap="round" />}
                  {chartData.sma20 && <polyline points={chartData.sma20} fill="none" stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2 1" />}
                </svg>
              ) : (
                <div className="h-full flex items-center justify-center text-[12px] text-ink-500">Chart 1H belum tersedia</div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-ink-500">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Harga</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> EMA20</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> EMA50</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400" /> SMA20</span>
            </div>
          </div>

          {signal && (
            <div className="glossy rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <div className="font-semibold text-[14px] text-ink-900">Signal Engine</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="glossy rounded-xl p-3">
                  <div className="text-ink-500 uppercase text-[9px] tracking-wider">Direction</div>
                  <div className={`font-bold mt-1 ${signal.direction === 'BUY' ? 'text-success' : 'text-danger'}`}>{signal.direction}</div>
                </div>
                <div className="glossy rounded-xl p-3">
                  <div className="text-ink-500 uppercase text-[9px] tracking-wider">Confidence</div>
                  <div className="font-bold mt-1 text-gradient-blue">{signal.confidence}%</div>
                </div>
                <div className="glossy rounded-xl p-3">
                  <div className="text-ink-500 uppercase text-[9px] tracking-wider">Entry</div>
                  <div className="font-mono mt-1 text-chrome-bright">${formatPrice(signal.entry, quote.symbol)}</div>
                </div>
                <div className="glossy rounded-xl p-3">
                  <div className="text-ink-500 uppercase text-[9px] tracking-wider">RR / Confluence</div>
                  <div className="font-mono mt-1 text-chrome-bright">{signal.scores?.total ?? signal.totalConfluence ?? signal.confidence}</div>
                </div>
              </div>
              {signal.reason && (
                <div className="text-[12px] text-ink-500 leading-relaxed">
                  {Array.isArray(signal.reason) ? signal.reason.join(' · ') : String(signal.reason)}
                </div>
              )}
            </div>
          )}

          <div className="glossy rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-orange-400" />
              <div className="font-semibold text-[14px] text-ink-900">Related Events</div>
            </div>
            {data?.relatedEvents?.length ? (
              <div className="space-y-2">
                {data.relatedEvents.map((event: any) => (
                  <div key={event.id} className="glossy rounded-xl p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[12px] font-medium text-ink-900">{event.title}</div>
                        <div className="text-[10px] text-ink-500">{event.country} · {event.category}</div>
                      </div>
                      <div className="text-[10px] text-ink-500">{new Date(event.eventTime).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[12px] text-ink-500">Tidak ada event terkait dalam waktu dekat.</div>
            )}
          </div>

          <div className="glossy rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers3 className="w-4 h-4 text-cyan-400" />
              <div className="font-semibold text-[14px] text-ink-900">Timeframes & Indicators</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
              {[
                { label: '1H', bars: data?.candles?.['1h']?.length ?? 0, ind: indicators1h },
                { label: '4H', bars: data?.candles?.['4h']?.length ?? 0, ind: indicators4h },
                { label: '1D', bars: data?.candles?.['1d']?.length ?? 0, ind: indicators1d },
              ].map((row) => (
                <div key={row.label} className="glossy rounded-xl p-3">
                  <div className="text-[9px] uppercase text-ink-500 tracking-wider">{row.label}</div>
                  <div className="mt-1 text-chrome-bright">{row.bars} bars</div>
                  <div className="mt-2 space-y-1 text-[10px] text-ink-500">
                    <div className="flex justify-between"><span>RSI</span><span className="text-ink-900">{row.ind?.rsi?.toFixed?.(1) ?? '—'}</span></div>
                    <div className="flex justify-between"><span>MACD</span><span className="text-ink-900">{row.ind?.macd?.toFixed?.(2) ?? '—'}</span></div>
                    <div className="flex justify-between"><span>ATR</span><span className="text-ink-900">{row.ind?.atr ? formatPrice(row.ind.atr, quote.symbol) : '—'}</span></div>
                    <div className="flex justify-between"><span>Struktur</span><span className="text-ink-900">{row.ind?.structure ?? '—'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
