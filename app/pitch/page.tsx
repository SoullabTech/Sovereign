import { PitchDeck } from '@/components/pitch';

const title = 'MAIA — Pitch Deck';
const description = 'Consciousness technology for transformation';

export const metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' as const },
  twitter: { card: 'summary_large_image' as const, title, description },
};

export default function PitchPage() {
  return <PitchDeck />;
}
