// Forex Factory + Real News Service
// Fetches real economic calendar from Forex Factory via fair economy API

const FF_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const FF_PROXY = "https://api.allorigins.win/raw?url=";
const CACHE_KEY = "quantum_ff_calendar";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  date: string;
  timestamp: number;
  impact: "High" | "Medium" | "Low" | "Holiday";
  forecast: string;
  previous: string;
  actual?: string;
  category: string;
}

// Category detection based on event title keywords
function detectCategory(title: string, _country: string): string {
  const t = title.toLowerCase();
  if (t.includes("cpi") || t.includes("inflation")) return "Inflasi";
  if (t.includes("gdp")) return "PDB";
  if (t.includes("pmi") || t.includes("manufacturing") || t.includes("industrial")) return "Manufaktur";
  if (t.includes("employment") || t.includes("unemployment") || t.includes("job") || t.includes("non-farm") || t.includes("nfp")) return "Ketenagakerjaan";
  if (t.includes("retail") || t.includes("consumer")) return "Konsumen";
  if (t.includes("interest rate") || t.includes("fed") || t.includes("ecb") || t.includes("boe") || t.includes("boj") || t.includes("rb") || t.includes("speaks") || t.includes("minutes")) return "Kebijakan Moneter";
  if (t.includes("housing") || t.includes("home") || t.includes("building") || t.includes("construction")) return "Properti";
  if (t.includes("trade") || t.includes("balance") || t.includes("export") || t.includes("import")) return "Perdagangan";
  if (t.includes("money supply") || t.includes("m3") || t.includes("m4") || t.includes("credit")) return "Moneter";
  if (t.includes("confidence") || t.includes("sentiment") || t.includes("barometer")) return "Sentimen";
  if (t.includes("sales") || t.includes("spending")) return "Penjualan";
  return "Ekonomi";
}

// Fetch real economic calendar from Forex Factory
export async function fetchEconomicCalendar(): Promise<EconomicEvent[]> {
  // Check cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_TTL) {
        return data.value;
      }
    }
  } catch {}

  try {
    let data: any;
    try {
      const res = await fetch(FF_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch {
      const proxied = `${FF_PROXY}${encodeURIComponent(FF_URL)}`;
      const res = await fetch(proxied);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    }

    if (!Array.isArray(data)) throw new Error("Invalid data");

    const events: EconomicEvent[] = data.map((item: any, idx: number) => ({
      id: `ff-${idx}-${item.date}`,
      title: item.title,
      country: item.country,
      date: item.date,
      timestamp: new Date(item.date).getTime(),
      impact: item.impact as EconomicEvent["impact"],
      forecast: item.forecast || "—",
      previous: item.previous || "—",
      actual: item.actual || undefined,
      category: detectCategory(item.title, item.country),
    }));

    // Sort by timestamp (earliest first)
    events.sort((a, b) => a.timestamp - b.timestamp);

    // Cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ value: events, timestamp: Date.now() }));
    } catch {}

    return events;
  } catch (err) {
    console.error("Error fetching Forex Factory:", err);
    // Fallback to cached data
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return JSON.parse(cached).value;
    } catch {}
    return [];
  }
}

// Country to flag emoji
export function countryFlag(country: string): string {
  const map: Record<string, string> = {
    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
    AUD: "🇦🇺", NZD: "🇳🇿", CAD: "🇨🇦", CHF: "🇨🇭",
    CNY: "🇨🇳", HKD: "🇭🇰", SGD: "🇸🇬",
  };
  return map[country] || "🌐";
}

// Impact to color class
export function impactColor(impact: string): { bg: string; text: string; border: string } {
  switch (impact) {
    case "High":
      return { bg: "bg-danger/15", text: "text-danger", border: "border-danger/30" };
    case "Medium":
      return { bg: "bg-warning/15", text: "text-warning", border: "border-warning/30" };
    case "Low":
      return { bg: "bg-bg-3", text: "text-ink-500", border: "border-white/10" };
    case "Holiday":
      return { bg: "bg-blue-400/15", text: "text-blue-400", border: "border-blue-400/30" };
    default:
      return { bg: "bg-bg-3", text: "text-ink-500", border: "border-white/10" };
  }
}

// Category to icon
export function categoryIcon(category: string): { icon: string; gradient: string } {
  const map: Record<string, { icon: string; gradient: string }> = {
    "Inflasi": { icon: "📈", gradient: "from-red-400 to-rose-600" },
    "PDB": { icon: "🏭", gradient: "from-blue-400 to-cyan-600" },
    "Manufaktur": { icon: "⚙️", gradient: "from-violet-400 to-purple-600" },
    "Ketenagakerjaan": { icon: "💼", gradient: "from-emerald-400 to-teal-600" },
    "Konsumen": { icon: "🛒", gradient: "from-amber-400 to-orange-600" },
    "Kebijakan Moneter": { icon: "🏛️", gradient: "from-indigo-400 to-blue-600" },
    "Properti": { icon: "🏠", gradient: "from-pink-400 to-rose-600" },
    "Perdagangan": { icon: "🌐", gradient: "from-cyan-400 to-blue-600" },
    "Moneter": { icon: "💰", gradient: "from-yellow-400 to-amber-600" },
    "Sentimen": { icon: "🧠", gradient: "from-fuchsia-400 to-pink-600" },
    "Penjualan": { icon: "🛍️", gradient: "from-orange-400 to-red-600" },
    "Ekonomi": { icon: "📊", gradient: "from-slate-400 to-gray-600" },
  };
  return map[category] || { icon: "📰", gradient: "from-slate-400 to-gray-600" };
}

// Format date to Indonesian relative time
export function formatEventTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);

  if (absDiff < 60000) return diff < 0 ? "Baru saja" : "Segera";
  if (absDiff < 3600000) {
    const mins = Math.floor(absDiff / 60000);
    return diff < 0 ? `${mins}m lalu` : `${mins}m lagi`;
  }
  if (absDiff < 86400000) {
    const hours = Math.floor(absDiff / 3600000);
    return diff < 0 ? `${hours}j lalu` : `${hours}j lagi`;
  }
  const days = Math.floor(absDiff / 86400000);
  return diff < 0 ? `${days}h lalu` : `${days}h lagi`;
}

// Format actual date/time
export function formatEventDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
