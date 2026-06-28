import { Outlet, Link, useLocation } from "react-router-dom";
import { Zap, Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useApp } from "../components/UI";

function pathMatches(pathname: string, paths: string[]) {
  return paths.includes(pathname);
}

export default function MobileLayout() {
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(true);
  const [lastY, setLastY] = useState(0);

  // Auto scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  // Hide header on scroll down (app-like)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShowHeader(y < 60 || y < lastY);
      setLastY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  // Determine page title
  const getTitle = () => {
    const path = location.pathname;
    if (path === "/app") return "Quantum Signal";
    if (path === "/app/signals") return "Sinyal Live";
    if (path === "/app/markets") return "Pasar";
    if (path.startsWith("/app/markets/")) return "Detail Market";
    if (path === "/app/news") return "Berita";
    if (path === "/app/profile") return "Akun Saya";
    return "Quantum";
  };

  const { toggleSearch, toggleNotif, notifications } = useApp();
  const showSearch = pathMatches(location.pathname, ["/app/signals", "/app/markets", "/app/news"]) || location.pathname.startsWith('/app/markets/');
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen min-h-[100dvh] relative">
      {/* Top Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}
      >
        <div className="px-4 pt-2 pb-2">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link to="/app" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-chrome-1 via-chrome-2 to-chrome-4 flex items-center justify-center shadow-lg shadow-black/40">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent" />
                  <Zap className="w-4 h-4 text-bg-base relative z-10" strokeWidth={3} />
                </div>
                {/* Glossy shine */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
                </div>
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-display font-bold text-[15px] text-chrome-bright tracking-tight">Quantum</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-ink-500 font-semibold">Signal</span>
              </div>
            </Link>

            {/* Page title — centered */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <h1 className="font-display font-semibold text-sm text-chrome-bright">
                {getTitle()}
              </h1>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1.5">
              {showSearch && (
                <button
                  onClick={toggleSearch}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center text-ink-700 touchable"
                  aria-label="Cari"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={toggleNotif}
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-ink-700 touchable relative"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-blue-400 text-bg-base text-[9px] font-bold flex items-center justify-center ring-2 ring-bg-2">
                      {unreadNotifs}
                    </span>
                  </>
                )}
              </button>
              <Link
                to="/app/profile"
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-chrome-2 to-chrome-4 flex items-center justify-center touchable shadow-md shadow-black/30 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                <span className="text-[11px] font-bold text-bg-base relative">M</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content — with bottom nav padding */}
      <main
        className="relative pt-16 pb-24"
        style={{ paddingBottom: "calc(var(--nav-height) + env(safe-area-inset-bottom) + 16px)" }}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
