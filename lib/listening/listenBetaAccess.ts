// LISTEN-01 · who may enter Sound Studio while it is in named beta (founder direction 2026-11-09).
//
// Follows the LAB_ACCESS_MEMBER_IDS precedent (lib/access/labAccess.ts): a separate, named authority so
// testers are never added to FOUNDER_MEMBER_IDS to get through a door. Founders always pass. Listed testers
// pass. Nobody else does, and an unset list admits no tester. Membership confers nothing beyond Sound Studio:
// this module is read only by app/listen/page.tsx and the gated audio route.
//
// CONFIGURATION (production env on minisforum, alongside FOUNDER_MEMBER_IDS):
//   SOULLAB_LISTEN_BETA_MEMBER_IDS=<uuid>,<uuid>
import { isFounderMemberId } from '@/lib/founder/founderAuth';
import { listenBetaAllows, parseMemberIdList } from './soundStudioMediaGate';

const LISTEN_BETA_MEMBER_IDS = parseMemberIdList(process.env.SOULLAB_LISTEN_BETA_MEMBER_IDS);

export function isListenFounder(memberId: string): boolean {
  return isFounderMemberId(memberId);
}

export function hasListenBetaAccess(memberId: string): boolean {
  return listenBetaAllows(memberId, isFounderMemberId(memberId), LISTEN_BETA_MEMBER_IDS);
}

/** Diagnostics only: how many testers are configured. Never returns the ids. */
export function getListenBetaCohortSize(): number {
  return LISTEN_BETA_MEMBER_IDS.size;
}
