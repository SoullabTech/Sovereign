// The returning member door. The invitation-only beta hostname presents
// only the sign-in methods that its restricted enrollment policy can honor.
// The ordinary Soullab route retains all existing joining/recovery pathways.
import { headers } from 'next/headers';
import UnifiedAuth from '@/components/auth/UnifiedAuth';

export default async function SigninPage() {
  const host = (await headers()).get('host')?.split(':', 1)[0]?.toLowerCase();
  return <UnifiedAuth mode="signin" betaInvitationOnly={host === 'beta.soullab.life'} />;
}
