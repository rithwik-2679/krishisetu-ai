import { getMarketDataProvider } from '@/features/market-intelligence/data/market-data-factory';
import { CreateLotForm } from '@/features/marketplace/components/create-lot-form';
import { MarketPriceRecord } from '@/types/market-data';

export const revalidate = 3600;

export default async function CreateLotPage() {
  const provider = getMarketDataProvider();
  
  let records: MarketPriceRecord[] = [];

  try {
    records = await provider.getMarketPrices();
  } catch (err) {
    console.error("Failed to fetch market records for create lot form", err);
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <CreateLotForm initialRecords={records} />
    </div>
  );
}
