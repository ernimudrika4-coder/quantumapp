import { NavLink } from "react-router-dom";
import { Home, Zap, BarChart3, Newspaper, User } from "lucide-react";

const TABS = [
  { to: "/app", icon: Home, label: "Beranda" },
  { to: "/app/signals", icon: Zap, label: "Sinyal" },
  { to: "/app/markets", icon: BarChart3, label: "Pasar" },
  { to: "/app/news", icon: Newspaper, label: "Berita" },
  { to: "/app/profile", icon: User, label: "Akun" },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="mx-3 mb-2">
        <div className="glass-strong rounded-2xl px-2 py-1.5 flex items-center justify-between relative overflow-hidden">
          {/* Top glossy line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/app"}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative group touchable"
            >
              {({ isActive }) => (
                <>
                  {/* Active pill indicator */}
                  {isActive && (
                    <div className="absolute inset-1 rounded-xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/[0.08]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </div>
                  )}

                  <div className="relative">
                    {isActive && (
                      <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full" />
                    )}
                    <tab.icon
                      className={`relative w-5 h-5 transition-all ${
                        isActive
                          ? "text-white"
                          : "text-ink-500 group-active:text-ink-700"
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span
                    className={`text-[9px] font-semibold tracking-wide transition-colors ${
                      isActive ? "text-white" : "text-ink-500 group-active:text-ink-700"
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
