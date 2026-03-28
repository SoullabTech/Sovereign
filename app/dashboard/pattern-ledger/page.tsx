import PatternLedgerPanel from '@/components/consciousness/PatternLedgerPanel';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pattern Ledger | Soullab',
  description: 'What your process keeps returning to — structural patterns across your conversations.',
};

export default function PatternLedgerPage() {
  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <PatternLedgerPanel windowDays={30} />
      </div>
    </div>
  );
}
