import { PaymentDashboard } from '@/features/payments/components/payment-dashboard';

export const metadata = {
  title: 'Payment Tracking | KrishiSetu AI'
};

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <PaymentDashboard />
    </div>
  );
}
