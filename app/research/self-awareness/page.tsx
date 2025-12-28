import { notFound } from 'next/navigation';
import { SelfAwarenessPanel } from '@/components/research/SelfAwarenessPanel';

export default function SelfAwarenessPage() {
  // Gate: only accessible when research UI is explicitly enabled
  if (process.env.RESEARCH_UI_ENABLED !== '1') {
    notFound();
  }

  return <SelfAwarenessPanel />;
}
