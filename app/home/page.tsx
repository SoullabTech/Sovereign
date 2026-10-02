import { HouseExperience } from '@/app/house/page';
import { HomeThreshold } from './HomeThreshold';
import { requireMemberId } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

async function hasAuthenticatedMember(): Promise<boolean> {
  try {
    await requireMemberId();
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') return false;
    throw error;
  }
}

export default async function HomePage() {
  if (!(await hasAuthenticatedMember())) return <HomeThreshold />;
  return <HouseExperience current="home" />;
}
