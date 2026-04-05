import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';

export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
  return <MaiaBoundaryLayout boundary="astrology">{children}</MaiaBoundaryLayout>;
}
