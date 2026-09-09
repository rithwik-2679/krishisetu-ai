import { MarketDataProvider, MarketPriceRecord, MarketDataFilters, ProviderMetadata } from "@/types/market-data";
import { normalizeGovernmentRecord } from "../utilities/market-data-normalizer";

const GOV_API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

export class GovernmentMarketDataProvider implements MarketDataProvider {
  private lastSyncTime: string | null = null;
  private totalRecords: number = 0;

  async getMarketPrices(filters?: MarketDataFilters): Promise<MarketPriceRecord[]> {
    const apiKey = process.env.GOV_DATA_API_KEY;
    if (!apiKey) {
      throw new Error("GOV_DATA_API_KEY is not configured in environment variables.");
    }

    // Build URL with filters
    const url = new URL(GOV_API_URL);
    url.searchParams.append("api-key", apiKey);
    url.searchParams.append("format", "json");
    url.searchParams.append("limit", "1000"); 

    if (filters?.commodity) url.searchParams.append("filters[commodity]", filters.commodity);
    if (filters?.state) url.searchParams.append("filters[state]", filters.state);
    if (filters?.district) url.searchParams.append("filters[district]", filters.district);
    if (filters?.market) url.searchParams.append("filters[market]", filters.market);

    const fetchedAt = new Date().toISOString();

    try {
      const response = await fetch(url.toString(), {
        next: { revalidate: 3600 },
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Government API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === "error" || data.error) {
         throw new Error(data.message || data.error || "Government API returned an error");
      }

      const records = data.records || [];
      this.totalRecords = records.length;
      this.lastSyncTime = fetchedAt;

      const parsed: MarketPriceRecord[] = [];
      for (const raw of records) {
        const normalized = normalizeGovernmentRecord(raw, fetchedAt);
        if (normalized) {
          parsed.push(normalized);
        }
      }

      return parsed;

    } catch (error) {
      console.error("Failed to fetch government market data:", error);
      throw error;
    }
  }

  async getMetadata(): Promise<ProviderMetadata> {
    return {
      lastSyncTime: this.lastSyncTime,
      totalRecords: this.totalRecords,
      sourceName: "Government of India - AGMARKNET",
      isOfficial: true
    };
  }
}
