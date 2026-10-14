/**
 * ASTRO-R4e — A chart is member-owned, not ambient MAIA identity.
 *
 * Standing astrology_consent permits private calculation/display. It is NOT a
 * conversational disclosure grant. At present the only supported crossing is
 * the chart room's member-reviewed "Send to MAIA", which delivers the exact
 * approved draft as an ordinary member-authored message.
 *
 * No trusted one-turn server authorization for hidden/system chart addenda is
 * provisioned. Until one is independently accepted, every implicit metadata
 * or loader path must fail closed. A client boolean, preference, environment
 * flag, opt-in status or retained browser storage cannot re-enable it.
 */
export const IMPLICIT_MAIA_ASTROLOGY_TRANSFER_ALLOWED = false as const;

/** Never treat merely opting in to the chart as permission for a MAIA prompt. */
export function mayAttachImplicitAstrologyContext(): false {
  return IMPLICIT_MAIA_ASTROLOGY_TRANSFER_ALLOWED;
}

/**
 * Remove forged or stale hidden astrology addenda before the model prompt is
 * assembled. This preserves all non-astrology fields and never edits the
 * caller-owned object. The member's actual reviewed message text is NOT meta.
 */
export function withoutImplicitAstrologyAddenda<T extends Record<string, unknown>>(
  metadata: T,
): T {
  const result = { ...metadata };
  delete result.astrologyAddendum;
  delete result.astrologicalContextAddendum;
  // R4K: BaZi/Da Yun (and derived Wu Xing/Bridge snapshots) also come from
  // member-owned birth data. Hidden context is not a member-reviewed Send.
  // Remove both textual prompt addenda and structured chart metadata.
  delete result.wuxingSnapshotAddendum;
  delete result.bridgeSnapshotAddendum;
  delete result.wuxingAddendum;
  delete result.baziAddendum;
  delete result.daYunAddendum;
  delete result.wuxingSnapshot;
  delete result.bridgedSnapshot;
  delete result.baziProfile;
  return result;
}
