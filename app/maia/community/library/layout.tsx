import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';

export default function CommunityLibraryLayout({ children }: { children: React.ReactNode }) {
  return <MaiaBoundaryLayout boundary="community-library">{children}</MaiaBoundaryLayout>;
}
