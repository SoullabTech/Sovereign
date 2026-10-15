/**
 * The notice must be founder-reviewed and its exact bytes SHA-256 signed-off.
 * No fallback and no test policy in a public runtime.
 */
import { createHash } from 'node:crypto';
import { approvedBetaConsentPolicy } from './betaConsentGate';

export type VerifiedBetaConsentNotice = {
  version: string;
  sha256: string;
  text: string;
};

export function verifiedBetaConsentNotice(env: NodeJS.ProcessEnv = process.env):
  VerifiedBetaConsentNotice | null {
  const policy = approvedBetaConsentPolicy(
    env.WRITERS_STUDIO_BETA_CONSENT_VERSION,
    env.WRITERS_STUDIO_BETA_CONSENT_SHA256,
  );
  const notice = env.WRITERS_STUDIO_BETA_CONSENT_NOTICE;
  if (!policy || !notice || notice.length < 30 || notice.length > 16000) return null;
  const actual = createHash('sha256').update(notice, 'utf8').digest('hex');
  if (actual !== policy.policySHA256) return null;
  return { version: policy.policyVersion, sha256: actual, text: notice };
}
