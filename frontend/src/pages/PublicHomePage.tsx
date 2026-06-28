import { Link } from "react-router-dom";
import { ArrowRight, Shield, Bell, Brain, Sparkles, CalendarDays, LineChart, CheckCircle2 } from "lucide-react";

export default function PublicHomePage() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <FeatureBand />
      <SignalEngineSection />
      <CalendarSection />
      <PerformanceSection />
      <PricingSection />
      <FAQSection />
      <FooterCTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-14 lg:pb-20">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -top-24 left-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl" />
      <div className="absolute top-10 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-5 border border-white/5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Platform Trading Intelligence</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02] text-chrome-bright max-w-2xl">
            Sinyal trading <span className="text-gradient-blue">berbasis confluence</span> untuk market modern.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-ink-500 max-w-xl leading-relaxed">
            Quantum Signal memadukan live market data, multi-timeframe analysis, event calendar, dan risk engine untuk membantu trader fokus pada setup dengan probabilitas lebih tinggi.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link to="/app/signals" className="btn-primary text-sm px-5 py-3 rounded-xl inline-flex items-center justify-center gap-1.5">
              Buka App Signal <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#fitur" className="btn-secondary text-sm px-5 py-3 rounded-xl inline-flex items-center justify-center">
              Lihat Fitur
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-ink-500">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Multi-market</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Event aware</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Mobile-first</span>
          </div>
        </div>

        <div className="glossy-elevated rounded-3xl p-5 lg:p-6 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative grid grid-cols-2 gap-3">
            <StatCard title="Confluence Engine" value="MTF + ATR" note="Trend, structure, momentum" />
            <StatCard title="Event Filter" value="Forex Factory" note="High impact blackout" />
            <StatCard title="Watchlist" value="Custom" note="Fokus pair favorit" />
            <StatCard title="Push Ready" value="PWA/App" note="Homescreen & local alerts" />
          </div>
          <div className="mt-4 glossy rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-2">Contoh Workflow</div>
            <div className="space-y-2 text-[13px] text-ink-700">
              <div>1. Market pulse mendeteksi pair terkuat / terlemah</div>
              <div>2. Event engine memblokir area high-impact news</div>
              <div>3. Signal engine menghitung trend, ATR, structure, dan score</div>
              <div>4. User follow setup dan track TP/SL di history</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="glossy rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{title}</div>
      <div className="font-display text-xl font-bold text-chrome-bright mt-1">{value}</div>
      <div className="text-[11px] text-ink-500 mt-1">{note}</div>
    </div>
  );
}

function FeatureBand() {
  const items = [
    { icon: Brain, title: "Engine lebih kredibel", text: "Multi-timeframe, structure, ATR, momentum, dan event risk digabung menjadi confluence score." },
    { icon: CalendarDays, title: "Event-aware", text: "Signal forex bisa diblokir saat high-impact event mendekat agar mengurangi noise sebelum rilis data." },
    { icon: Bell, title: "Notification-ready", text: "Siap untuk alur notifikasi app-style di homescreen dan fondasi push production." },
    { icon: Shield, title: "Risk-first", text: "Setup selalu memiliki entry, TP1, TP2, TP3, SL, dan risk/reward yang terlihat jelas." },
  ];
  return (
    <section id="fitur" className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.title} className="glossy rounded-2xl p-5">
            <item.icon className="w-5 h-5 text-blue-400 mb-4" />
            <div className="font-display text-lg font-semibold text-chrome-bright mb-2">{item.title}</div>
            <div className="text-sm text-ink-500 leading-relaxed">{item.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SignalEngineSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-4 border border-white/5">
            <LineChart className="w-3 h-3 text-cyan-400" />
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Signal Engine</span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-chrome-bright leading-tight">
            Bukan sekadar RSI — tapi sistem confluence yang lebih matang.
          </h2>
          <p className="mt-4 text-base text-ink-500 leading-relaxed max-w-xl">
            Mesin sinyal sekarang menilai struktur harga, alignment multi-timeframe, ATR, momentum, dan risiko event. Hasilnya bukan hanya “ada sinyal”, tapi “seberapa layak setup itu diambil”.
          </p>
        </div>
        <div className="glossy-elevated rounded-3xl p-5">
          <div className="space-y-3">
            {[
              ["Trend Score", "Alignment 1H / 4H / 1D"],
              ["Structure Score", "Breakout, higher high / lower low, swing context"],
              ["Momentum Score", "RSI, MACD, slope, impulse move"],
              ["Volatility Score", "ATR untuk sizing TP/SL yang realistis"],
              ["Event Risk Score", "Penalty saat high-impact event dekat"],
            ].map(([title, text]) => (
              <div key={title} className="glossy rounded-2xl p-4">
                <div className="font-semibold text-[14px] text-ink-900">{title}</div>
                <div className="text-[12px] text-ink-500 mt-1">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CalendarSection() {
  return (
    <section id="kalender" className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto glossy-elevated rounded-3xl p-6 lg:p-8">
        <div className="flex items-start justify-between gap-6 flex-col lg:flex-row">
          <div>
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-4 border border-white/5">
              <CalendarDays className="w-3 h-3 text-orange-400" />
              <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider">Forex Factory Calendar</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-chrome-bright leading-tight">
              Event ekonomi masuk ke keputusan, bukan sekadar ditampilkan.
            </h2>
            <p className="mt-4 text-base text-ink-500 max-w-2xl leading-relaxed">
              Kalender ekonomi dipakai untuk mengurangi sinyal palsu saat market mendekati rilis data besar. Ini penting khususnya di forex, gold, dan index yang sensitif pada data makro.
            </p>
          </div>
          <Link to="/app/news" className="btn-secondary text-sm px-5 py-3 rounded-xl inline-flex items-center gap-1.5">
            Lihat Kalender Live <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PerformanceSection() {
  return (
    <section id="kinerja" className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4">
        {[
          ["Live Watchlist", "Pair favorit tersimpan lokal dan siap dikembangkan ke akun cloud."],
          ["Signal History", "Semua TP/SL tercatat sehingga user bisa audit performa secara transparan."],
          ["App-first UX", "Bottom nav, install prompt, notification flow, dan mode standalone siap untuk PWA/app."],
        ].map(([title, text]) => (
          <div key={title} className="glossy rounded-2xl p-5">
            <div className="font-display text-lg font-semibold text-chrome-bright mb-2">{title}</div>
            <div className="text-sm text-ink-500 leading-relaxed">{text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      desc: 'Cocok untuk eksplorasi awal dan coba workflow dasar.',
      features: ['Watchlist 3 pair', 'Basic signal feed', 'Kalender ekonomi', 'Tidak ada push premium'],
      accent: 'text-ink-700',
      button: 'Mulai Gratis'
    },
    {
      name: 'Pro',
      price: '$29',
      desc: 'Untuk trader aktif yang butuh analytics dan push notification.',
      features: ['Watchlist 15 pair', 'Advanced performance analytics', 'Push notification', 'Generated signal details'],
      accent: 'text-blue-400',
      button: 'Upgrade ke Pro',
      highlight: true
    },
    {
      name: 'Elite',
      price: '$79',
      desc: 'Untuk penggunaan lebih intensif dan monitoring multi-pair.',
      features: ['Watchlist 50 pair', 'Priority monitoring', 'Workflow lebih luas', 'Siap integrasi lanjutan'],
      accent: 'text-success',
      button: 'Pilih Elite'
    }
  ];

  return (
    <section id="pricing" className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-4 border border-white/5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Pricing & Access</span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-chrome-bright">Plan yang selaras dengan tahap trading Anda.</h2>
          <p className="mt-4 text-base text-ink-500 max-w-xl">Plan enforcement sekarang aktif di backend agar feature gating konsisten antara website, app, dan backend API.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.name} className={`glossy rounded-3xl p-6 ${plan.highlight ? 'ring-1 ring-blue-400/30' : ''}`}>
              <div className={`font-display text-xl font-bold ${plan.accent}`}>{plan.name}</div>
              <div className="mt-2 text-4xl font-display font-bold text-chrome-bright">{plan.price}<span className="text-base text-ink-500">/bln</span></div>
              <div className="mt-3 text-sm text-ink-500 leading-relaxed">{plan.desc}</div>
              <ul className="mt-5 space-y-2 text-sm text-ink-500">
                {plan.features.map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <Link to="/app/profile" className={`mt-6 inline-flex justify-center w-full ${plan.highlight ? 'btn-primary' : 'btn-secondary'} text-sm px-5 py-3 rounded-xl`}>{plan.button}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const items = [
    ["Apakah ini broker?", "Bukan. Quantum Signal adalah platform signal intelligence dan market workflow, bukan broker atau exchange."],
    ["Apakah semua sinyal pasti profit?", "Tidak. Karena itu sistem menampilkan confidence, confluence, dan history performa agar user bisa menilai kualitas setup dengan lebih rasional."],
    ["Apakah data news real?", "Ya, kalender ekonomi menggunakan Forex Factory feed real-time dengan cache dan refresh terpusat."],
    ["Apakah bisa jadi app?", "Bisa. Fondasi PWA sudah ada dan bisa dilanjutkan ke packaging Android / iOS / Capacitor / push production."],
  ];
  return (
    <section id="faq" className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-3xl lg:text-4xl font-bold text-chrome-bright mb-6">FAQ</h2>
        <div className="space-y-3">
          {items.map(([q, a]) => (
            <div key={q} className="glossy rounded-2xl p-5">
              <div className="font-semibold text-[15px] text-ink-900 mb-2">{q}</div>
              <div className="text-sm text-ink-500 leading-relaxed">{a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-14 lg:py-20 border-t border-white/5">
      <div className="max-w-5xl mx-auto glossy-elevated rounded-3xl p-8 lg:p-12 text-center">
        <h2 className="font-display text-3xl lg:text-5xl font-bold text-chrome-bright leading-tight max-w-3xl mx-auto">
          Dari website publik ke app dashboard — satu ekosistem yang siap naik level.
        </h2>
        <p className="mt-4 text-base text-ink-500 max-w-2xl mx-auto leading-relaxed">
          Buka dashboard live untuk melihat signal engine, market pulse, watchlist, dan kalender ekonomi yang sudah terhubung langsung ke data real.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/app" className="btn-secondary text-sm px-5 py-3 rounded-xl">Buka Dashboard</Link>
          <Link to="/app/signals" className="btn-primary text-sm px-5 py-3 rounded-xl inline-flex items-center justify-center gap-1.5">
            Lihat Signal Engine <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
