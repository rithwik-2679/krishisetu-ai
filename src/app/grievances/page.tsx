import { GrievanceDashboard } from '@/features/grievances/components/grievance-dashboard';

export const metadata = {
  title: 'Dispute & Grievance | KrishiSetu AI'
};

export default function GrievancesPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <GrievanceDashboard />
    </div>
  );
}
