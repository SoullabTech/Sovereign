import { PrototypeDemo } from '@/components/prototype/PrototypeDemo';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MAIA Consciousness Interface Prototype | Build Guide & Demo',
  description: 'Build your own multi-modal consciousness interface using existing hardware. Complete prototype guide from Arduino to full neuropod validation.',
  keywords: 'consciousness prototype, DIY biofeedback, Arduino consciousness, Raspberry Pi meditation, HeartMath integration, prototype build guide',
};

export default function PrototypeDemoPage() {
  return <PrototypeDemo />;
}