import { MarketDataProvider, MarketPriceRecord, MarketDataFilters, ProviderMetadata } from "@/types/market-data";

const generateMockData = (): MarketPriceRecord[] => {
  const commodities = ["Tomato", "Onion", "Potato", "Paddy", "Wheat", "Maize", "Cotton", "Soybean", "Groundnut", "Chilli", "Turmeric", "Banana", "Mango"];
  const states = ["Maharashtra", "Karnataka", "Gujarat", "Punjab", "Madhya Pradesh"];
  const markets = ["Market A", "Market B", "Market C"];
  const fetchedAt = new Date().toISOString();
  
  const records: MarketPriceRecord[] = [];
  
  let idCounter = 1;
  commodities.forEach((commodity) => {
    states.forEach((state) => {
      markets.forEach((market) => {
        // Generate a deterministic modal price based on string length to avoid random jumping
        const basePrice = (commodity.length * 100) + (state.length * 50) + (market.length * 10);
        
        records.push({
          id: `demo-${idCounter++}`,
          commodity,
          variety: "Common",
          state,
          district: `${state} District 1`,
          market,
          date: new Date().toISOString().split("T")[0],
          minPrice: basePrice - 100,
          maxPrice: basePrice + 100,
          modalPrice: basePrice,
          arrivals: Math.floor(basePrice / 10),
          unit: "Rs/Quintal",
          source: "DEMO / SIMULATED DATA",
          sourceUrl: "",
          fetchedAt,
          isOfficial: false,
          isDemo: true
        });
      });
    });
  });

  return records;
};

export class DemoMarketDataProvider implements MarketDataProvider {
  private records: MarketPriceRecord[] = generateMockData();
  private fetchedAt = new Date().toISOString();

  async getMarketPrices(filters?: MarketDataFilters): Promise<MarketPriceRecord[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = this.records;
    if (filters) {
      if (filters.commodity) {
        filtered = filtered.filter(r => r.commodity.toLowerCase() === filters.commodity!.toLowerCase());
      }
      if (filters.state) {
        filtered = filtered.filter(r => r.state.toLowerCase() === filters.state!.toLowerCase());
      }
      if (filters.district) {
        filtered = filtered.filter(r => r.district.toLowerCase() === filters.district!.toLowerCase());
      }
      if (filters.market) {
        filtered = filtered.filter(r => r.market.toLowerCase() === filters.market!.toLowerCase());
      }
    }
    return filtered;
  }

  async getMetadata(): Promise<ProviderMetadata> {
    return {
      lastSyncTime: this.fetchedAt,
      totalRecords: this.records.length,
      sourceName: "DEMO / SIMULATED DATA",
      isOfficial: false
    };
  }
}
