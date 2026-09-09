import { LogisticsDashboard } from '@/features/logistics/components/logistics-dashboard';

export const metadata = {
  title: 'Logistics | KrishiSetu AI'
};

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <LogisticsDashboard />
    </div>
  );
}
