import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';
import { HouseEntryThreshold } from '@/components/house/HouseEntryThreshold';

export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100svh', background: '#0d1b2e' }}>
      <HouseEntryThreshold room="FREE ASTROLOGY" destinationCarriesMark />
      <MaiaBoundaryLayout boundary="astrology">{children}</MaiaBoundaryLayout>
    </div>
  );
}
