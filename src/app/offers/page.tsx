import { OffersDashboard } from '@/features/offers/components/offers-dashboard';

export const metadata = {
  title: 'Offers & Negotiation | KrishiSetu AI'
};

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <OffersDashboard />
    </div>
  );
}
