import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';

export default function LabToolsLayout({ children }: { children: React.ReactNode }) {
  return <MaiaBoundaryLayout boundary="labtools">{children}</MaiaBoundaryLayout>;
}
