import { Outlet, Link, useLocation } from "react-router-dom";
import { Zap, ArrowUpRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const NAV = [
  { label: "Signals", path: "/signals" },
  { label: "Markets", path: "/markets" },
  { label: "News", path: "/news" },
  { label: "Features", path: "/features" },
  { label: "Pricing", path: "/pricing" },
  { label: "Community", path: "/community" },
];

export default function MainLayout() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col noise">
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <nav
            className={`flex items-center justify-between transition-all ${
              scrolled
                ? "glass-nav rounded-2xl px-5 py-3 shadow-lg shadow-black/30"
                : "px-2 py-2"
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/30">
                  <Zap className="w-4 h-4 text-[#060810] fill-[#060810]" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-[15px] tracking-tight text-white">Quantum</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400/80 font-semibold -mt-0.5">Signal</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden lg:flex items-center gap-1">
              {NAV.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${
                        active
                          ? "text-white bg-white/5"
                          : "text-ink-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right */}
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-flex text-[13px] font-medium text-ink-300 hover:text-white px-4 py-2 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/pricing"
                className="hidden sm:inline-flex btn-primary text-[13px] px-4 py-2 rounded-lg items-center gap-1.5"
              >
                Get Started
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </nav>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="lg:hidden mt-2 glass-strong rounded-2xl p-2 border border-white/10">
              <ul className="flex flex-col">
                {NAV.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`block px-4 py-3 text-sm rounded-lg transition-colors ${
                          active ? "text-white bg-white/5" : "text-ink-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="border-t border-white/5 mt-1 pt-1">
                  <Link
                    to="/login"
                    className="block px-4 py-3 text-sm text-ink-300 hover:text-white"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="block mx-2 my-1 btn-primary text-center text-sm px-4 py-2.5 rounded-lg"
                  >
                    Get Started →
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 relative z-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
            <div className="col-span-2 md:col-span-4">
              <Link to="/" className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#060810] fill-[#060810]" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-display font-bold text-[15px] text-white">Quantum</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400/80 font-semibold -mt-0.5">Signal</span>
                </div>
              </Link>
              <p className="text-sm text-ink-400 leading-relaxed max-w-sm mb-6">
                Institutional-grade AI trading signals trusted by 128,000+ traders worldwide. Trade smarter with neural network precision.
              </p>
              <div className="flex items-center gap-2">
                {["X", "In", "YT", "TG", "DC"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-ink-400 hover:text-white transition-all"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                {["Signals", "Markets", "Analytics", "API", "Mobile"].map((l) => (
                  <li key={l}><a href="#" className="text-ink-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                {["About", "Careers", "Press", "Blog", "Contact"].map((l) => (
                  <li key={l}><a href="#" className="text-ink-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                {["Documentation", "Help Center", "Community", "Trading Guide", "FAQ"].map((l) => (
                  <li key={l}><a href="#" className="text-ink-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                {["Privacy", "Terms", "Risk Disclosure", "Cookies", "Compliance"].map((l) => (
                  <li key={l}><a href="#" className="text-ink-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="divider mb-6" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-ink-400">
            <div>© 2026 Quantum Signal Inc. All rights reserved.</div>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                <span className="live-dot" />
                <span>All systems operational</span>
              </span>
              <span>v4.2.1</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-ink-400 leading-relaxed">
            <strong className="text-ink-300">Risk Disclosure:</strong> Trading financial instruments involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results.
          </div>
        </div>
      </footer>
    </div>
  );
}
