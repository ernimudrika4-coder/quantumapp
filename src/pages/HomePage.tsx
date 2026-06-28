import { Link } from "react-router-dom";
import { ArrowRight, Zap, Brain, Shield, Radio, Star, ArrowUpRight, Sparkles, Users, Award, Clock, Check, Play, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { useApp } from "../components/UI";
import { formatPrice } from "../services/twelvedata";
import { formatEventTime, countryFlag, impactColor } from "../services/news";
import AppPrompts from "../components/AppPrompts";

export default function HomePage() {
  return (
    <div className="space-y-8 pb-4">
      <HeroSection />
      <AppPrompts />
      <LiveTicker />
      <QuickStats />
      <MarketPulse />
      <WatchlistSection />
      <SignalsPreview />
      <UpcomingEventsSection />
      <WhyUs />
      <TestimonialsPreview />
      <JoinCTA />
    </div>
  );
}

/* ========== HERO ========== */
function HeroSection() {
  const { marketPulse, symbols } = useApp();
  const featured = marketPulse.strongest;
  const meta = featured ? symbols.find((s) => s.symbol === featured.symbol) : null;
  const up = (featured?.changePercent || 0) >= 0;

  return (
    <section className="px-4 pt-2">
      <div className="relative glossy-elevated rounded-3xl p-5 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-4">
          <span className="live-dot" />
          <span className="text-[10px] font-semibold text-ink-700 uppercase tracking-wider">Neural Engine v4.2</span>
        </div>

        <h1 className="relative font-display font-bold text-[36px] sm:text-5xl leading-[1.05] tracking-tight text-balance">
          <span className="text-chrome-bright">Sinyal trading</span>
          <br />
          <span className="text-chrome">dengan </span>
          <span className="text-gradient-blue">kecerdasan AI</span>
        </h1>

        <p className="relative mt-4 text-[15px] text-ink-500 leading-relaxed max-w-md">
          Dashboard live untuk crypto, forex, emas, dan indeks dengan signal engine berbasis confluence score, event filter, dan risk workflow yang lebih matang.
        </p>

        <div className="relative mt-5 flex gap-2">
          <Link to="/app/signals" className="btn-primary text-[13px] px-4 py-3 rounded-xl flex-1 flex items-center justify-center gap-1.5">
            Lihat Sinyal
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/app/profile" className="btn-secondary text-[13px] px-4 py-3 rounded-xl flex-1 flex items-center justify-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-white" />
            Buka Dashboard
          </Link>
        </div>

        <div className="relative mt-5 glass rounded-2xl p-3 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${meta ? `bg-gradient-to-br ${meta.gradient}` : 'bg-bg-4'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {meta?.icon || 'Q'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-ink-900">{meta?.symbol || 'Menunggu data'}</span>
              {featured && (
                <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${up ? 'text-success' : 'text-danger'}`}>
                  <ArrowUpRight className={`w-3 h-3 ${up ? '' : 'rotate-180'}`} />
                  {up ? '+' : ''}{featured.changePercent.toFixed(2)}%
                </span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <span className="font-mono text-xs text-ink-700">
                {featured ? `$${formatPrice(featured.price, featured.symbol)}` : 'Memuat...'}
              </span>
              <div className="text-[10px] text-ink-500">{meta ? `${meta.name}` : 'Market Pulse'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== LIVE TICKER ========== */
function LiveTicker() {
  const { liveData, symbols } = useApp();

  // Build ticker from live data
  const tickers = symbols.map((s) => {
    const d = liveData.get(s.symbol);
    if (!d) return null;
    const symShort = s.symbol.split("/")[0];
    return {
      p: symShort,
      v: formatPrice(d.price, s.symbol),
      c: `${d.changePercent >= 0 ? "+" : ""}${d.changePercent.toFixed(2)}%`,
      u: d.changePercent >= 0,
    };
  }).filter((t): t is NonNullable<typeof t> => t !== null);

  if (tickers.length === 0) {
    return (
      <section className="overflow-hidden border-y border-white/5 py-2.5 bg-bg-1/40">
        <div className="text-center text-[11px] text-ink-500">Memuat data market...</div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden border-y border-white/5 py-2.5 bg-bg-1/40">
      <div className="marquee">
        {[...tickers, ...tickers, ...tickers].map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-4 flex-shrink-0">
            <span className="font-mono text-[11px] font-semibold text-ink-700">{t.p}</span>
            <span className="font-mono text-[11px] text-ink-500">{t.v}</span>
            <span className={`text-[10px] font-bold ${t.u ? "text-success" : "text-danger"}`}>{t.c}</span>
            <span className="w-px h-3 bg-white/5 ml-2" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========== QUICK STATS ========== */
function QuickStats() {
  const { historyStats, signals, liveData } = useApp();
  return (
    <section className="px-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: `${signals.length}`, l: "Signal Live", icon: Zap, color: "text-blue-400" },
          { v: `${historyStats.winRate.toFixed(0)}%`, l: "Win Rate", icon: Award, color: "text-cyan-400" },
          { v: `${liveData.size}`, l: "Market Aktif", icon: Users, color: "text-success" },
        ].map((s) => (
          <div key={s.l} className="glossy rounded-2xl p-3 touchable">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <div className="font-display font-bold text-xl text-chrome-bright">{s.v}</div>
            <div className="text-[10px] text-ink-500 uppercase tracking-wider mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========== MARKET PULSE ========== */
function MarketPulse() {
  const { marketPulse, symbols } = useApp();

  const cards = [
    { title: "Terkuat", data: marketPulse.strongest, tone: "text-success", icon: TrendingUp },
    { title: "Terlemah", data: marketPulse.weakest, tone: "text-danger", icon: TrendingDown },
    { title: "Paling Volatil", data: marketPulse.volatilityLeader, tone: "text-blue-400", icon: Eye },
  ];

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Market Pulse</span>
          </div>
          <h2 className="font-display text-xl font-bold text-chrome-bright">Ringkasan Pasar</h2>
        </div>
      </div>

      <div className="space-y-2.5">
        {cards.map((card) => {
          const symMeta = card.data ? symbols.find((s) => s.symbol === card.data?.symbol) : null;
          return (
            <div key={card.title} className="glossy rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-bg-4 border border-white/5 flex items-center justify-center">
                    <card.icon className={`w-4 h-4 ${card.tone}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-ink-500 uppercase tracking-wider">{card.title}</div>
                    {card.data && symMeta ? (
                      <div className="font-semibold text-[14px] text-ink-900 truncate">
                        {symMeta.name} · {symMeta.symbol}
                      </div>
                    ) : (
                      <div className="font-semibold text-[14px] text-ink-500">Menunggu data...</div>
                    )}
                  </div>
                </div>
                {card.data && (
                  <div className="text-right">
                    <div className="font-mono text-[13px] text-chrome-bright">${formatPrice(card.data.price, card.data.symbol)}</div>
                    <div className={`text-[11px] font-semibold ${card.tone}`}>
                      {card.data.changePercent >= 0 ? "+" : ""}{card.data.changePercent.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ========== WATCHLIST ========== */
function WatchlistSection() {
  const { watchlist, toggleWatchlist, symbols, liveData } = useApp();
  const items = symbols.filter((s) => watchlist.includes(s.symbol));

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Watchlist</span>
          </div>
          <h2 className="font-display text-xl font-bold text-chrome-bright">Pantauan Saya</h2>
        </div>
        <Link to="/app/markets" className="btn-ghost text-[11px] font-semibold text-ink-500 px-2 py-1 rounded-lg">
          Kelola
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {items.map((item) => {
          const data = liveData.get(item.symbol);
          return (
            <button
              key={item.symbol}
              onClick={() => toggleWatchlist(item.symbol)}
              className="glossy rounded-2xl p-3 min-w-[180px] text-left touchable"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-bold text-xs`}>
                  {item.icon}
                </div>
                <span className="text-[9px] text-ink-500 uppercase">Hapus</span>
              </div>
              <div className="font-semibold text-[13px] text-ink-900">{item.symbol}</div>
              <div className="text-[10px] text-ink-500">{item.name}</div>
              <div className="mt-2 font-mono text-[12px] text-chrome-bright">
                {data ? `$${formatPrice(data.price, item.symbol)}` : "Memuat..."}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ========== UPCOMING EVENTS ========== */
function UpcomingEventsSection() {
  const { events, eventsLoading } = useApp();
  const upcoming = events.filter((e) => e.timestamp > Date.now()).slice(0, 3);

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3 h-3 text-orange-400" />
            <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Event Ekonomi</span>
          </div>
          <h2 className="font-display text-xl font-bold text-chrome-bright">Event Berikutnya</h2>
        </div>
        <Link to="/app/news" className="btn-ghost text-[11px] font-semibold text-ink-500 px-2 py-1 rounded-lg">
          Lihat semua
        </Link>
      </div>

      {eventsLoading && upcoming.length === 0 ? (
        <div className="glossy rounded-2xl p-5 text-center text-[12px] text-ink-500">Memuat kalender ekonomi...</div>
      ) : (
        <div className="space-y-2.5">
          {upcoming.map((event) => {
            const impact = impactColor(event.impact);
            return (
              <div key={event.id} className="glossy rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-4 border border-white/5 flex items-center justify-center text-lg flex-shrink-0">
                    {countryFlag(event.country)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${impact.bg} ${impact.text} border ${impact.border}`}>
                        {event.impact}
                      </span>
                      <span className="text-[10px] text-ink-500">{event.country}</span>
                      <span className="text-[10px] text-ink-500">· {formatEventTime(event.timestamp)}</span>
                    </div>
                    <div className="font-semibold text-[13px] text-ink-900 line-clamp-2">{event.title}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ========== SIGNALS PREVIEW ========== */
function SignalsPreview() {
  const { openSignalDetail, signals } = useApp();
  const previewSignals = signals.slice(0, 3);
  const liveData = useApp().liveData;
  const dataLoading = useApp().dataLoading;

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Radio className="w-3 h-3 text-success" />
            <span className="text-[10px] font-semibold text-success uppercase tracking-wider">
              {dataLoading ? "Memuat..." : `Live · ${signals.length} Sinyal Aktif`}
            </span>
          </div>
          <h2 className="font-display text-xl font-bold text-chrome-bright">Sinyal AI Live</h2>
        </div>
        <Link to="/app/signals" className="btn-ghost text-[11px] font-semibold text-ink-500 px-2 py-1 rounded-lg">
          Lihat semua
        </Link>
      </div>

      {dataLoading && liveData.size === 0 ? (
        <div className="glossy rounded-2xl p-8 text-center">
          <div className="text-sm text-ink-500">Memuat data market...</div>
        </div>
      ) : previewSignals.length === 0 ? (
        <div className="glossy rounded-2xl p-6 text-center">
          <div className="text-sm text-ink-700 mb-1">Menunggu analisa teknikal...</div>
          <div className="text-[11px] text-ink-500">AI sedang menganalisa {liveData.size} pair</div>
        </div>
      ) : (
        <div className="space-y-2.5 stagger">
          {previewSignals.map((s) => (
            <SignalCard key={s.id} signal={s} onClick={() => openSignalDetail(s.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

function SignalCard({ signal, onClick }: { signal: any; onClick: () => void }) {
  const isBuy = signal.type === "BUY";
  return (
    <button onClick={onClick} className="glossy rounded-2xl p-4 touchable block w-full text-left">
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
            <div className="text-[10px] text-ink-500 mt-0.5 flex items-center gap-1.5">
              <span>Live AI</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Brain className="w-2.5 h-2.5 text-blue-400" />
                {signal.confidence}%
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-semibold text-[13px] text-chrome-bright">${formatPrice(signal.entry)}</div>
          <div className="text-[9px] text-ink-500">Entry</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-[10px]">
        <div className="rounded-lg bg-bg-1/60 border border-white/[0.03] p-2">
          <div className="text-ink-500 uppercase tracking-wider text-[8px]">Entry</div>
          <div className="font-mono font-semibold text-ink-700 mt-0.5">{formatPrice(signal.entry)}</div>
        </div>
        <div className="col-span-2 rounded-lg bg-success/[0.06] border border-success/20 p-2">
          <div className="text-success/70 uppercase tracking-wider text-[8px]">TP3</div>
          <div className="font-mono font-semibold text-success mt-0.5">{formatPrice(signal.tp3)}</div>
        </div>
        <div className="rounded-lg bg-danger/[0.06] border border-danger/20 p-2">
          <div className="text-danger/70 uppercase tracking-wider text-[8px]">SL</div>
          <div className="font-mono font-semibold text-danger mt-0.5">{formatPrice(signal.sl)}</div>
        </div>
      </div>
    </button>
  );
}

/* ========== WHY US ========== */
function WhyUs() {
  const features = [
    { icon: Brain, title: "Mesin Neural GPT-5", desc: "Model deep learning dilatih 15+ tahun data pasar di 200+ aset.", color: "text-violet-400", bg: "bg-violet-500/10" },
    { icon: Zap, title: "Notifikasi Instan", desc: "Telegram, Discord, SMS, dan aplikasi mobile. Latensi 12ms.", color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: Shield, title: "Manajemen Risiko", desc: "Setiap sinyal dengan entry, TP, dan SL yang divalidasi.", color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Teknologi Inti</span>
          </div>
          <h2 className="font-display text-xl font-bold text-chrome-bright">Mengapa Quantum?</h2>
        </div>
        <Link to="/features" className="btn-ghost text-[11px] font-semibold text-ink-500 px-2 py-1 rounded-lg">
          Pelajari
        </Link>
      </div>

      <div className="space-y-2.5 stagger">
        {features.map((f, i) => (
          <div key={i} className="glossy rounded-2xl p-4 flex items-start gap-3 touchable">
            <div className={`w-10 h-10 rounded-xl ${f.bg} border border-white/5 flex items-center justify-center flex-shrink-0`}>
              <f.icon className={`w-5 h-5 ${f.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[15px] text-ink-900 mb-0.5">{f.title}</h3>
              <p className="text-[13px] text-ink-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========== TESTIMONIALS ========== */
function TestimonialsPreview() {
  const quotes = [
    { name: "Marcus C.", role: "Trader Crypto", quote: "Quantum mengubah cara saya trading. 8 bulan berturut-turut profit — akurasi AI-nya luar biasa.", profit: "+412%" },
    { name: "Sarah W.", role: "Analis Forex", quote: "Sinyal manajemen risikonya game-changer. Setiap trade punya TP dan SL yang jelas.", profit: "+287%" },
  ];

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}</div>
            <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">4.9 · 12.000+</span>
          </div>
          <h2 className="font-display text-xl font-bold text-chrome-bright">Dipercaya Trader</h2>
        </div>
        <Link to="/app/profile" className="btn-ghost text-[11px] font-semibold text-ink-500 px-2 py-1 rounded-lg">
          Lainnya
        </Link>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
        {quotes.map((q, i) => (
          <div key={i} className="glossy rounded-2xl p-4 flex-shrink-0 w-[280px]">
            <div className="flex items-center gap-0.5 mb-2.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-[13px] text-ink-700 leading-relaxed line-clamp-3">"{q.quote}"</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <div>
                <div className="text-[13px] font-semibold text-ink-900">{q.name}</div>
                <div className="text-[10px] text-ink-500">{q.role}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-ink-500 uppercase tracking-wider">YTD</div>
                <div className="font-display font-bold text-sm text-gradient-blue">{q.profit}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========== JOIN CTA ========== */
function JoinCTA() {
  return (
    <section className="px-4">
      <div className="relative glossy-elevated rounded-3xl p-5 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Penawaran Terbatas</span>
          </div>
          <h3 className="font-display text-[22px] font-bold text-chrome-bright leading-tight mb-2">
            Mulai trading dengan presisi AI hari ini
          </h3>
          <p className="text-[13px] text-ink-500 mb-4">
            Uji coba gratis 7 hari. Tanpa kartu kredit. Bergabung dengan 128.000+ trader.
          </p>

          <Link to="/app/signals" className="btn-primary text-[13px] px-4 py-3 rounded-xl w-full flex items-center justify-center gap-1.5">
            Buka Signal Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-ink-500">
            {["Jaminan 30 hari", "Batal kapan saja", "Keamanan bank"].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <Check className="w-3 h-3 text-success" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
