import { ReactNode, useEffect, useMemo, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info, Bell, Zap, Newspaper, Settings, Search as SearchIcon, Globe2, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
export { useApp } from "../context/AppContext";
import { useApp } from "../context/AppContext";

/* =================== MODAL =================== */
export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm fade-in"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full sm:max-w-md sm:mx-4 max-h-[90vh] sm:max-h-[85vh] bg-bg-2 border-t sm:border border-white/10 sm:rounded-3xl rounded-t-3xl overflow-hidden scale-in safe-bottom">
        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <h3 className="font-display font-semibold text-[16px] text-chrome-bright">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center touchable"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 text-ink-700" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] sm:max-h-[calc(85vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =================== TOAST =================== */
export function Toasts() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 pointer-events-none px-4 w-full max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`glass-strong rounded-xl px-4 py-3 border flex items-center gap-3 pointer-events-auto touchable fade-up ${
            t.type === "success" ? "border-success/30" :
            t.type === "error" ? "border-danger/30" : "border-blue-400/30"
          }`}
        >
          {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />}
          {t.type === "error" && <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />}
          {t.type === "info" && <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />}
          <span className="text-[13px] font-medium text-ink-900 flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* =================== SEARCH DRAWER =================== */
export function SearchModal() {
  const navigate = useNavigate();
  const {
    searchOpen, closeSearch, addToast,
    signals, symbols, events, openSignalDetail
  } = useApp();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Array<{ type: string; title: string; subtitle: string; action: () => void }>;

    const out: Array<{ type: string; title: string; subtitle: string; action: () => void }> = [];

    signals.forEach((s) => {
      if (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) {
        out.push({
          type: "Sinyal",
          title: `${s.symbol} · ${s.type}`,
          subtitle: `${s.confidence}% confidence`,
          action: () => openSignalDetail(s.id),
        });
      }
    });

    symbols.forEach((s) => {
      if (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) {
        out.push({
          type: "Market",
          title: s.symbol,
          subtitle: s.name,
          action: () => navigate('/app/markets'),
        });
      }
    });

    events.slice(0, 20).forEach((e) => {
      if (e.title.toLowerCase().includes(q) || e.country.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) {
        out.push({
          type: "Event",
          title: e.title,
          subtitle: `${e.country} · ${e.impact}`,
          action: () => navigate('/app/news'),
        });
      }
    });

    return out.slice(0, 12);
  }, [query, signals, symbols, events, navigate, openSignalDetail]);

  if (!searchOpen) return null;

  const quick = [
    { label: 'BTC/USD', kind: 'pair', icon: SearchIcon },
    { label: 'XAU/USD', kind: 'pair', icon: SearchIcon },
    { label: 'EUR/USD', kind: 'pair', icon: SearchIcon },
    { label: 'Kalender Ekonomi', kind: 'event', icon: CalendarDays },
    { label: 'Pasar Global', kind: 'market', icon: Globe2 },
  ];

  return (
    <div className="fixed inset-0 z-[100] fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeSearch} />
      <div className="relative bg-bg-2 border-b border-white/10 safe-top">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 glossy rounded-xl px-3 py-2.5 mb-3">
            <SearchIcon className="w-4 h-4 text-ink-500" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari pair, sinyal, event..."
              className="bg-transparent outline-none flex-1 text-[15px] text-ink-900 placeholder:text-ink-500"
            />
            <button onClick={closeSearch} className="text-[12px] font-semibold text-blue-400 touchable">
              Batal
            </button>
          </div>

          {query.trim() ? (
            <>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider px-1 mb-2">Hasil Pencarian</div>
              <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="p-4 text-[13px] text-ink-500 text-center">Tidak ada hasil yang cocok.</div>
                ) : results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      r.action();
                      closeSearch();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] touchable text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-bg-4 border border-white/5 flex items-center justify-center flex-shrink-0">
                      {r.type === 'Sinyal' ? <Zap className="w-4 h-4 text-blue-400" /> : r.type === 'Market' ? <Globe2 className="w-4 h-4 text-cyan-400" /> : <CalendarDays className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-ink-900">{r.title}</div>
                      <div className="text-[10px] text-ink-500">{r.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider px-1 mb-2">Akses Cepat</div>
              <div className="space-y-1">
                {quick.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(s.label);
                      addToast(`Mencari: ${s.label}`, "info");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] touchable text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-bg-4 border border-white/5 flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-ink-900">{s.label}</div>
                      <div className="text-[10px] text-ink-500 capitalize">{s.kind}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =================== NOTIFICATION DRAWER =================== */
export function NotificationDrawer() {
  const { notifOpen, closeNotif, notifications, markNotifRead, markAllNotifRead, addToast } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (notifOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [notifOpen]);

  if (!notifOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeNotif} />
      <div className="absolute top-0 right-0 bottom-0 w-full sm:max-w-sm bg-bg-2 border-l border-white/10 safe-top safe-bottom fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-display font-semibold text-[17px] text-chrome-bright">Notifikasi</h3>
            {unread > 0 && (
              <span className="text-[10px] font-bold text-bg-base bg-blue-400 rounded-full px-1.5 py-0.5">{unread}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                onClick={() => {
                  markAllNotifRead();
                  addToast("Semua notifikasi ditandai dibaca", "success");
                }}
                className="text-[11px] font-semibold text-blue-400 touchable px-2 py-1"
              >
                Baca semua
              </button>
            )}
            <button
              onClick={closeNotif}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center touchable"
            >
              <X className="w-4 h-4 text-ink-700" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-ink-500 text-[13px]">
              Tidak ada notifikasi
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    markNotifRead(n.id);
                    addToast(n.message, "info");
                    closeNotif();
                  }}
                  className={`w-full p-4 flex items-start gap-3 text-left touchable ${
                    n.read ? "" : "bg-blue-400/[0.03]"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    n.type === "signal" ? "bg-success/10" :
                    n.type === "news" ? "bg-orange-400/10" : "bg-blue-400/10"
                  }`}>
                    {n.type === "signal" && <Zap className="w-4 h-4 text-success" />}
                    {n.type === "news" && <Newspaper className="w-4 h-4 text-orange-400" />}
                    {n.type === "system" && <Settings className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${n.read ? "text-ink-700" : "text-ink-900"}`}>
                        {n.title}
                      </span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                    </div>
                    <div className="text-[12px] text-ink-500 mt-0.5 line-clamp-2">{n.message}</div>
                    <div className="text-[10px] text-ink-500 mt-1">{n.time}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
