import { Modal, useApp } from "../components/UI";
import { NEWS, NewsItem } from "../data";
import { Clock, Share2, Bookmark, Flame, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function NewsDetailModal() {
  const { newsDetailId, closeNewsDetail, addToast } = useApp();
  const news = NEWS.find((n: NewsItem) => n.id === newsDetailId);

  if (!news) return null;

  return (
    <Modal open={newsDetailId !== null} onClose={closeNewsDetail}>
      <div>
        {/* Hero image */}
        <div className={`relative h-48 bg-gradient-to-br ${news.g} overflow-hidden`}>
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-2 via-bg-2/30 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-semibold uppercase tracking-wider text-white">
              {news.cat}
            </span>
            {news.hot && (
              <span className="px-2 py-0.5 rounded-full bg-danger/40 backdrop-blur-md border border-danger/50 text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" />
                Breaking
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <SentBadge sent={news.sent} />
            <ImpactBadge imp={news.impact} />
            <span className="text-[10px] text-ink-500 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {news.time}
            </span>
            <span className="text-[10px] text-ink-500">· {news.src}</span>
            <span className="text-[10px] text-ink-500">· {news.read} baca</span>
          </div>

          {/* Title */}
          <h2 className="font-display font-bold text-[20px] leading-tight text-chrome-bright mb-4">
            {news.title}
          </h2>

          {/* Content */}
          <div className="text-[14px] text-ink-500 leading-relaxed whitespace-pre-line mb-6">
            {news.content}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {["#trading", "#ai", `#${news.cat.toLowerCase()}`, "#sinyal"].map((tag) => (
              <span key={tag} className="text-[11px] text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-white/5">
            <button
              onClick={() => {
                addToast("✓ Artikel disimpan ke bookmark", "success");
              }}
              className="flex-1 btn-secondary text-[13px] px-4 py-3 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Bookmark className="w-4 h-4" />
              Simpan
            </button>
            <button
              onClick={() => {
                addToast("✓ Link artikel disalin", "success");
              }}
              className="flex-1 btn-secondary text-[13px] px-4 py-3 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function SentBadge({ sent }: { sent: string }) {
  const map: Record<string, { bg: string; t: string; b: string }> = {
    BULLISH: { bg: "bg-success/15", t: "text-success", b: "border-success/30" },
    BEARISH: { bg: "bg-danger/15", t: "text-danger", b: "border-danger/30" },
    NETRAL: { bg: "bg-bg-3", t: "text-ink-500", b: "border-white/10" },
  };
  const s = map[sent] || map.NETRAL;
  return (
    <span className={`${s.bg} ${s.t} border ${s.b} text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-flex items-center gap-0.5`}>
      {sent === "BULLISH" && <ArrowUpRight className="w-3 h-3" />}
      {sent === "BEARISH" && <ArrowDownRight className="w-3 h-3" />}
      {sent}
    </span>
  );
}

function ImpactBadge({ imp }: { imp: string }) {
  const isHigh = imp === "TINGGI";
  return (
    <span className={`${isHigh ? "bg-warning/15 text-warning border-warning/30" : "bg-bg-3 text-ink-500 border-white/10"} border text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider`}>
      {imp}
    </span>
  );
}
