import { SmartMatching } from '@/features/marketplace/components/smart-matching';

export const metadata = {
  title: 'Smart Matching | KrishiSetu AI'
};

export default function MatchingPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <SmartMatching />
    </div>
  );
}
