import { UniversalDeviceIntegration } from '@/components/integration/UniversalDeviceIntegration';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Universal Device Integration Platform | MAIA',
  description: 'Connect and orchestrate any consciousness technology device. HeartMath, Mendi, HUSO, Apple Watch, Oura Ring, and more in one unified platform.',
  keywords: 'device integration, consciousness technology, HeartMath, Mendi, HUSO, Apple Watch, Oura Ring, biofeedback, universal platform',
};

export default function UniversalIntegrationPage() {
  return <UniversalDeviceIntegration />;
}