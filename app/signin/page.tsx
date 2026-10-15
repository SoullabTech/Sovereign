// The returning member door. The invitation-only beta hostname presents
// only the sign-in methods that its restricted enrollment policy can honor.
// The ordinary Soullab route retains all existing joining/recovery pathways.
import { headers } from 'next/headers';
import UnifiedAuth from '@/components/auth/UnifiedAuth';
import { isSingleDoorBetaEnabled } from '@/lib/writersStudio/singleDoorBetaGate';

export default async function SigninPage() {
  const host = (await headers()).get('host')?.split(':', 1)[0]?.toLowerCase();
  const dedicatedBeta = isSingleDoorBetaEnabled(
    process.env.WRITERS_STUDIO_RESTRICTED_BETA,
    process.env.WRITERS_STUDIO_BETA_SINGLE_DOOR,
  );
  return <UnifiedAuth mode="signin" betaInvitationOnly={dedicatedBeta || host === 'beta.soullab.life'} />;
}
