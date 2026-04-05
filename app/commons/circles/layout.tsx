import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';

export default function CirclesLayout({ children }: { children: React.ReactNode }) {
  return <MaiaBoundaryLayout boundary="circles">{children}</MaiaBoundaryLayout>;
}
