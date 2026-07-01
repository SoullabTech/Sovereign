import type { Metadata } from 'next';
import { TheBeginning } from '@/components/experiences/TheBeginning';
import { getRecipient, DEFAULT_REPLY_TO } from '@/lib/experiences/recipients';

type Params = { params: Promise<{ recipient: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { recipient } = await params;
  const r = getRecipient(recipient);
  return {
    title: r?.name ?? 'The Beginning',
    // A private encounter, not a marketing page — keep it out of the index.
    robots: { index: false, follow: false },
  };
}

export default async function TheBeginningPage({ params }: Params) {
  const { recipient } = await params;
  const r = getRecipient(recipient);
  return <TheBeginning recipientName={r?.name ?? null} replyTo={r?.replyTo ?? DEFAULT_REPLY_TO} />;
}
