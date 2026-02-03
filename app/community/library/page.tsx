/**
 * Community Library Page
 *
 * Enhanced interface for exploring consciousness technologies,
 * practical insights, transformation stories, and daily integration guides
 */

export const dynamic = 'force-static';
export const revalidate = false;

import { CommunityLibrary } from '@/components/community/CommunityLibrary';

export default function CommunityLibraryPage() {
  return <CommunityLibrary />;
}