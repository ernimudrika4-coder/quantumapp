import { EVENT_CACHE_TTL_SEC } from '../../config/constants';
import { cacheGet, cacheSet } from '../../cache/store';
import { fetchForexFactoryCalendar } from '../../providers/forexfactory/client';
import { normalizeEconomicEvents, type NormalizedEconomicEvent } from '../../providers/forexfactory/normalize';

export interface EventQuery {
  impact?: 'High' | 'Medium' | 'Low' | 'Holiday';
  country?: string;
  limit?: number;
}

export async function getUpcomingEvents(query: EventQuery = {}): Promise<NormalizedEconomicEvent[]> {
  const cacheKey = 'events:upcoming';
  const cached = await cacheGet<NormalizedEconomicEvent[]>(cacheKey);
  let events = cached;

  if (!events) {
    const raw = await fetchForexFactoryCalendar();
    const arrayRaw = Array.isArray(raw) ? raw : [];
    events = normalizeEconomicEvents(arrayRaw);
    await cacheSet(cacheKey, events, EVENT_CACHE_TTL_SEC);
  }

  const now = Date.now();
  let result = events.filter((e) => e.eventTime >= now - 24 * 60 * 60 * 1000);
  if (query.impact) result = result.filter((e) => e.impact === query.impact);
  if (query.country) result = result.filter((e) => e.country === query.country);
  if (query.limit) result = result.slice(0, query.limit);
  return result;
}
