/**
 * MAIA postures — the ONLY sanctioned way a room may specialize MAIA.
 *
 * Constitutional contract (House Presence directive, 2026-07-17):
 * a posture may alter initial framing, available room tools, response
 * boundaries, and contextual instructions. A posture may NOT create a new
 * identity, a separate memory system, a contradictory system prompt, or an
 * unrelated transcript presented as the same MAIA. There is one MAIA
 * relationship; rooms change her posture, never her person.
 *
 * STATUS: contract only. The existing specialized surfaces (SessionReviewChat,
 * MentorChat, MentorPanel, NowWhatRoom) are classified in
 * docs/architecture/MAIA_HOUSE_PRESENCE_IMPLEMENTATION.md and are NOT yet
 * migrated onto this contract — per the directive's ordering, the
 * relationship is unified before the interfaces, and several dispositions
 * require Kelly's ruling. New room-specialized MAIA behavior MUST use this
 * type rather than introducing another assistant implementation.
 */

export type MaiaPosture =
  | 'companion'          // default — the host, quietly present
  | 'journal-reflection' // Journal room
  | 'decision-witness'   // Decisions room
  | 'change-reflection'  // Changes room
  | 'session-review'     // post-session review (Session Room)
  | 'now-what';          // Now What? container (isolated pending ruling)

export interface MaiaPostureSpec {
  posture: MaiaPosture;
  /** Optional initial framing shown/spoken when the posture is entered. */
  framing?: string;
  /** Contextual instructions appended to the ONE canonical prompt path. */
  instructions?: string;
}
