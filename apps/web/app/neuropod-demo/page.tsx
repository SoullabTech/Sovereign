import { NeuropodInvestorDemo } from '@/components/neuropod/NeuropodInvestorDemo';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neuropod Consciousness Interface - Investor Demo | MAIA',
  description: 'Revolutionary consciousness technology investment opportunity. Multi-modal interface system with $50B+ market potential.',
  keywords: 'consciousness technology, neuropod, investment, Series A, wellness technology, biofeedback, spatial audio, VR meditation',
};

export default function NeuropodDemoPage() {
  return <NeuropodInvestorDemo />;
}