/**
 * The Home doorway that brings existing writing into Writer's Studio.
 *
 * FOUNDER RULING — WRITER'S STUDIO · LIFE OF A WORK, Step 1 (2026-09-08).
 * The doorway read "Import writing". That named the MECHANISM and hid the
 * capability: a member who has a finished, abandoned, or half-buried piece of
 * writing had to already know that "import" was the way back to it. The first
 * shipped act of the Life-of-a-Work sequence is telling the truth about a
 * capability the Studio already has.
 *
 * The second line is not a lesson about what a Work can be. It is the
 * sovereignty clause: `what, if anything`. Bringing a work back does not
 * commit the member to doing anything to it. PT-6 — rest is a legitimate
 * condition of a Living Work — is already true at the door.
 *
 * WHAT THIS IS NOT. This is presentation only. The import path is unchanged
 * (IMPORT_HREF), no route is added, no schema moves, and nothing here
 * implements Encounter, Restore, or Work-to-Work lineage. A doorway that
 * names a capability honestly is not the capability.
 *
 * Copy lives in one module so the two Home render sites — the empty Studio and
 * the shelf footer — cannot drift into two different promises about the same
 * door.
 */

export const RETURN_DOORWAY_COPY = {
  /** The action. Names what the member is doing, not what the system does. */
  label: 'Bring a work back to life',
  /**
   * One quiet line beneath the action. Ends in the member's authority, and
   * that ending is load-bearing: no obligation follows arrival.
   */
  note: "Import something you've written before and decide what, if anything, you want to do with it.",
} as const;
