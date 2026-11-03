/**
 * ASTRO-PRO-04 (#1893) — the one decision for who may enter Astrology Pro.
 *
 * Two phases, chosen only by deploy setting:
 *   'founder-only' — exactly the founder (FG01, unchanged).
 *   'tester-grant' — the founder, plus members whose latest event in the
 *                    audited grant log is a grant.
 * Any other phase, a disabled preview, or an invalid founder identity admits
 * no one. The tester flag, an allowlist, a tier claim or a subscription never
 * admit anyone here. A grant-lookup failure admits no one.
 *
 * 'tester-grant' is built but not chosen: it waits on the #1817 R20/privacy
 * verdict and the founder's acceptance of an exact Pro candidate.
 */
import type { FounderPreviewConfig } from './founderOnlyPreviewAccess';
import { hasActiveProTesterGrant } from './proTesterGrants';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PHASES = new Set(['founder-only', 'tester-grant']);

export function proPreviewEnabled(config: Readonly<FounderPreviewConfig>): boolean {
  const id = config.ASTRO_PRO_FOUNDER_MEMBER_ID;
  return config.ASTRO_PRO_PREVIEW_ENABLED === 'true' &&
    PHASES.has(config.ASTRO_PRO_ACCESS_PHASE ?? '') &&
    typeof id === 'string' && UUID.test(id);
}

export async function proMemberAllowed(
  memberId: string | null | undefined,
  config: Readonly<FounderPreviewConfig>,
  hasGrant: (memberId: string) => Promise<boolean> = hasActiveProTesterGrant,
): Promise<boolean> {
  if (!proPreviewEnabled(config) || typeof memberId !== 'string' || !UUID.test(memberId)) return false;
  if (memberId === config.ASTRO_PRO_FOUNDER_MEMBER_ID) return true;
  if (config.ASTRO_PRO_ACCESS_PHASE !== 'tester-grant') return false;
  try {
    return (await hasGrant(memberId)) === true;
  } catch {
    return false;
  }
}
