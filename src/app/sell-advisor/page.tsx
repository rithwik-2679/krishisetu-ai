import { getMarketDataProvider } from '@/features/market-intelligence/data/market-data-factory';
import { SellAdvisor } from '@/features/sell-advisor/components/sell-advisor';
import { MarketPriceRecord, ProviderMetadata } from '@/types/market-data';

export const revalidate = 3600; // revalidate every hour

export default async function SellAdvisorPage() {
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
    metadata = await provider.getMetadata().catch(() => ({
      lastSyncTime: null,
      totalRecords: 0,
      sourceName: "Government of India - AGMARKNET",
      isOfficial: true
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SellAdvisor 
        initialRecords={records} 
        metadata={metadata} 
        error={errorMsg}
      />
    </div>
  );
}
