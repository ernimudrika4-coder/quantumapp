import { Link, Outlet } from "react-router-dom";
import { ArrowRight, Menu, Zap } from "lucide-react";
import { useState } from "react";

const NAV = [
  { label: "Fitur", id: "fitur" },
  { label: "Kalender", id: "kalender" },
  { label: "Kinerja", id: "kinerja" },
  { label: "Pricing", id: "pricing" },
  { label: "FAQ", id: "faq" },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-base text-ink-900">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-base/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-chrome-1 via-chrome-2 to-chrome-4 flex items-center justify-center shadow-lg shadow-black/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
              <Zap className="w-4 h-4 text-bg-base relative" strokeWidth={3} />
            </div>
            <div className="leading-none">
              <div className="font-display font-bold text-[15px] text-chrome-bright">Quantum</div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-ink-500 font-semibold">Signal</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-sm text-ink-500 hover:text-white transition-colors">
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/app" className="btn-secondary text-sm px-4 py-2 rounded-xl">Buka App</Link>
            <Link to="/app/signals" className="btn-primary text-sm px-4 py-2 rounded-xl inline-flex items-center gap-1.5">
              Coba Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-10 h-10 rounded-xl glass flex items-center justify-center"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5 text-ink-700" />
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/5 px-4 py-3 space-y-3 bg-bg-2/95">
            {NAV.map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)} className="block text-sm text-ink-500 hover:text-white text-left w-full">
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/app" className="btn-secondary text-sm px-4 py-2 rounded-xl flex-1 text-center">Buka App</Link>
              <Link to="/app/signals" className="btn-primary text-sm px-4 py-2 rounded-xl flex-1 text-center">Mulai</Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
