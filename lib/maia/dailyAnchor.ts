/**
 * Daily Anchor — orienting prompts, deterministic by date.
 *
 * All members see the same prompt on the same day. No personalization,
 * no algorithmic theater. Server is the source of truth for which prompt
 * shows on which date.
 *
 * ─────────────────────────────────────────────────────────────────────
 * PROMPTS — voice pass landed 2026-05-19.
 *
 * These are not "content." They are nervous-system entry conditions.
 * Five orientation markers held to the re-entry frame below. The
 * calibration rubric remains active for any future additions or
 * refinements — every candidate must pass the same tests.
 *
 * ─── THE LOAD-BEARING FRAME ───
 * Daily Anchor is RE-ENTRY, not self-development.
 *
 * Returning · noticing · staying connected · carrying one thread ·
 * reducing fragmentation.
 *
 * NOT: discovering meaning · defining importance · finding the
 * "right" thing · identifying the most meaningful task.
 *
 * The Anchor is for staying with one's life a little more —
 * not for refining one's relationship to it.
 *
 * ─── DRIFT TO WATCH ───
 * A subtle failure mode: prompts that implicitly ask the member to
 * "identify the correct meaningful thing." These read as fine
 * philosophically but under exhaustion they create tiny performance
 * tension — *I should know the answer.* Watch especially for prompts
 * that begin "What one thing matters…" or "What would make today
 * feel like yours" — the form invites self-evaluation more than
 * orientation. Replace with permission-shaped variants when in doubt.
 *
 * ─── THE STRONGEST-PROMPT TEST ───
 * Architecture of the canonical strong prompt
 * ("What would help you not disappear from your own life today?"):
 *   - names continuity loss directly
 *   - without pathologizing
 *   - without optimization pressure
 *   - without therapeutic tone
 *   - without productivity framing
 *   - scales across overwhelmed / exploratory / grief / creative /
 *     ADHD / highly-functional states
 *   - feels like recognition, not instruction
 *
 * If a candidate prompt fails any line in that list, it is weaker.
 * If it requires a larger reflective shift than this one does,
 * it asks for cognitive capacity the member may not have today.
 *
 * The wrong prompt voice can accidentally:
 *   - over-direct
 *   - over-interpret
 *   - create obligation
 *   - imply therapeutic authority
 *   - induce performance
 *   - sound inspirational instead of orienting
 *   - become too abstract
 *   - become too "growth oriented"
 *
 * Each prompt should feel:
 *   - grounding
 *   - receivable
 *   - breathable
 *   - low-demand
 *   - quietly real
 *   - continuity-oriented
 *   - compatible with low-capacity states
 *
 * Test each prompt against six states. It must still land on:
 *   good days · fragmented days · numb days
 *   exhausted days · overloaded days · nonverbal days
 *
 * A prompt that only works on a good day is wrong.
 * The closest one-line frame: "small places to return to yourself."
 * ─────────────────────────────────────────────────────────────────────
 */

// Avoid phrasings that can be heard as suicide-screening questions
// ("stay with your life", "remain here" ≈ "what would keep you alive").
// Presence language must not be mistakable for crisis language.
const PROMPTS = [
  "What would help you feel more anchored today?",
  "What feels quietly present right now?",
  "What would make today feel more inhabited?",
  "What have you been meaning to return to?",
  "What would help you stay grounded today?",
];

export function promptForDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dayCount = Math.abs(y * 366 + m * 31 + d);
  return PROMPTS[dayCount % PROMPTS.length];
}

export function todayISODate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
