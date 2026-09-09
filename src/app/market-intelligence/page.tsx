import { getMarketDataProvider } from '@/features/market-intelligence/data/market-data-factory';
import { MarketDashboard } from '@/features/market-intelligence/components/market-dashboard';
import { MarketPriceRecord, ProviderMetadata } from '@/types/market-data';

export const revalidate = 3600; // revalidate every hour

export default async function MarketIntelligencePage() {
  const provider = getMarketDataProvider();
  
  let records: MarketPriceRecord[] = [];
  let metadata: ProviderMetadata;
  let errorMsg: string | null = null;

  try {
    records = await provider.getMarketPrices();
    metadata = await provider.getMetadata();
  } catch (err: unknown) {
    const error = err as Error;
    errorMsg = error.message || "Failed to load government market data.";
    // Get metadata if possible even on error to show last sync
    metadata = await provider.getMetadata().catch(() => ({
      lastSyncTime: null,
      totalRecords: 0,
      sourceName: "Government of India - AGMARKNET",
      isOfficial: true
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <MarketDashboard 
        initialRecords={records} 
        metadata={metadata} 
        error={errorMsg}
      />
    </div>
  );
}
