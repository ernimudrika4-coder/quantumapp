export type MarketCategory = 'crypto' | 'forex' | 'metal' | 'index';

export interface QuoteDTO {
  symbol: string;
  name: string;
  category: MarketCategory;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume?: number;
  timestamp: number;
  source: 'twelvedata';
}
