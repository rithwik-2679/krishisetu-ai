import { BuyerMarketplace } from '@/features/marketplace/components/buyer-marketplace';

export const metadata = {
  title: 'Buyer Directory | KrishiSetu AI'
};

export default function BuyersPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <BuyerMarketplace />
    </div>
  );
}
