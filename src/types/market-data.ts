export interface MarketPriceRecord {
  id: string;
  commodity: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  date: string; // ISO format or predictable format
  minPrice: number | null;
  maxPrice: number | null;
  modalPrice: number;
  arrivals: number | null;
  unit: string;
  source: string;
  sourceUrl: string;
  fetchedAt: string;
  isOfficial: boolean;
  isDemo: boolean;
}

export interface MarketDataFilters {
  commodity?: string;
  state?: string;
  district?: string;
  market?: string;
  date?: string; // YYYY-MM-DD
}

export interface ProviderMetadata {
  lastSyncTime: string | null;
  totalRecords: number;
  sourceName: string;
  isOfficial: boolean;
}

export interface MarketDataProvider {
  getMarketPrices(filters?: MarketDataFilters): Promise<MarketPriceRecord[]>;
  getMetadata(): Promise<ProviderMetadata>;
}
