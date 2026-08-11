/**
 * Article III boundary — MAIA may not claim the other person's interior.
 *
 * MAIA has never met the person a Relationship Room is about. She has one
 * account, from one side. She may reflect the MEMBER'S experience of the
 * relationship. She may NOT state what the other person feels, wants, intends,
 * or agreed to, and may not assert a mutual "between you" condition as fact.
 * Silence is not consent; a shared moment is not a mutual state she can see.
 *
 * WRONG: "That omission was its own kind of agreement between you."
 * RIGHT: "I wonder whether the shared silence carried some meaning for you."
 *
 * APPLIED TWICE, ON PURPOSE.
 *   • At GENERATION, so overreach is never stored.
 *   • At READ, so overreach already sitting in the database never reaches the
 *     member — including rows written before this boundary existed.
 *
 * The read-side pass is also why remediation needs no rewrite of anyone's
 * stored data: the same principle as the provenance work — re-label and
 * withhold, never edit or delete what a member's record already contains.
 *
 * Offending sentences are DROPPED, not softened. Hedging adverbs would leave
 * the same claim wearing a disguise. Where nothing survives, the caller gets
 * silence, which this room has already proved it can hold.
 */

const OVERREACH: RegExp[] = [
  // A mutual state asserted as fact.
  /\bbetween (you|us) (both|two)?\b/i,
  /\bbetween you\b/i,
  /\byou both\b/i,
  /\b(neither|either|both) of you\b/i,
  /\byour (shared|mutual) (agreement|understanding|decision|silence)\b/i,
  /\bthe two of you\b/i,
  // The other person's interior, stated rather than wondered.
  /\b(he|she|they|your (mother|father|mom|dad|partner|husband|wife|spouse|friend|parent|sister|brother|son|daughter|child|colleague|boss|ex|grandmother|grandfather)) (is|was|are|were|feels?|felt|wants?|wanted|thinks?|thought|needs?|needed|means?|meant|intends?|intended|knows?|knew|believes?|believed|agrees?|agreed|understands?|understood|expects?|expected)\b/i,
  /\ban? (agreement|understanding|pact|contract|truce) (between|with)\b/i,
  /\bits own kind of (agreement|understanding|consent|permission)\b/i,
];

function crossesBoundary(sentence: string): boolean {
  return OVERREACH.some((re) => re.test(sentence));
}

/**
 * Keep only the sentences that stay inside the member's own experience.
 * Returns '' when nothing survives — the caller decides what silence means.
 */
export function constrainToMemberExperience(
  text: string | null | undefined,
  where = 'unknown',
): string {
  if (!text) return '';
  const kept = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => {
      if (crossesBoundary(s)) {
        console.warn(
          `⛔ [ArticleIII:${where}] withheld a claim about the other person: ` +
            JSON.stringify(s.slice(0, 120)),
        );
        return false;
      }
      return true;
    });
  return kept.join(' ').trim();
}

/** Read-side pass: null rather than '' so the UI simply renders nothing. */
export function constrainForDisplay(
  text: string | null | undefined,
  where = 'read',
): string | null {
  const out = constrainToMemberExperience(text, where);
  return out.length > 0 ? out : null;
}
