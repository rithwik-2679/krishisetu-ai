import { FpoAggregation } from '@/features/aggregation/components/fpo-aggregation';

export const metadata = {
  title: 'FPO Smart Aggregation | KrishiSetu AI'
};

export default function AggregationPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <FpoAggregation />
    </div>
  );
}
