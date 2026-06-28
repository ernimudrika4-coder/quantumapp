export interface NormalizedEconomicEvent {
  id: string;
  title: string;
  country: string;
  impact: 'High' | 'Medium' | 'Low' | 'Holiday';
  category: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  eventTime: number;
}

function detectCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('cpi') || t.includes('inflation')) return 'Inflasi';
  if (t.includes('gdp')) return 'PDB';
  if (t.includes('pmi') || t.includes('manufacturing')) return 'Manufaktur';
  if (t.includes('employment') || t.includes('unemployment') || t.includes('job') || t.includes('nfp')) return 'Ketenagakerjaan';
  if (t.includes('interest rate') || t.includes('fed') || t.includes('ecb') || t.includes('boe') || t.includes('speaks') || t.includes('minutes')) return 'Kebijakan Moneter';
  if (t.includes('retail') || t.includes('sales') || t.includes('consumer')) return 'Konsumen';
  return 'Ekonomi';
}

export function normalizeEconomicEvents(raw: any[]): NormalizedEconomicEvent[] {
  return raw.map((item, idx) => ({
    id: `ff-${idx}-${item.date}`,
    title: item.title,
    country: item.country,
    impact: item.impact,
    category: detectCategory(item.title),
    forecast: item.forecast || null,
    previous: item.previous || null,
    actual: item.actual || null,
    eventTime: new Date(item.date).getTime(),
  })).sort((a, b) => a.eventTime - b.eventTime);
}
