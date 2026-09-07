import { ForYou } from '@/components/team/ForYou';

// Auth + sidebar are provided by app/team/(shell)/layout.tsx (redirects if no member session).
export const dynamic = 'force-dynamic';

export default function ForYouPage() {
  return <ForYou />;
}
