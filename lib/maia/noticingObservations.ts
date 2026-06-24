/**
 * noticingObservations.ts
 *
 * Deterministic concrete-referent extraction for Experiment 01 ("Something I noticed").
 * Authority: docs/specs/EXPERIMENT_01_ATTENTION_MADE_VISIBLE_2026-06-20.md §"The selection unit"
 *
 * INVARIANTS (from the v1 design lock):
 *  - ZERO inference, ZERO LLM, ZERO model. Pure token-level pattern matching.
 *  - Unit = concrete named referent (proper nouns / capitalised noun phrases):
 *    people, places, projects, books, organisations.
 *  - Recurrence counted by DISTINCT TURNS (not raw token frequency).
 *  - Floor: referent must appear in ≥ 2 distinct turns. Below floor → return null.
 *  - Counts are stored in the event row, NEVER shown to the member.
 *  - Does NOT import or call recurrenceDetector.ts (that is interpretive/LLM-judged).
 *  - v1.5 (coreference + theme-clustering) is explicitly deferred — that crosses
 *    into inference and requires its own review before authorisation.
 */

import { query } from '@/lib/db/postgres';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NoticingReferent {
  /** The canonical display form of the referent. */
  text: string;
  /** Number of distinct turns in which this referent appeared. */
  distinctTurnCount: number;
  /** The observation sentence shown to the member. */
  observationSentence: string;
}

export interface NoticingObservationsResult {
  referents: NoticingReferent[];
  /** The single reflective question shown after the observations. */
  question: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LOOK_BACK_DAYS = 14;
const MIN_DISTINCT_TURNS = 2;
const MAX_REFERENTS = 3;
const REFLECTIVE_QUESTION = 'Does anything here feel important to you?';

/**
 * Stopwords used to suppress false-positive capitalised tokens.
 * These are common sentence-initial words, titles, filler phrases, and
 * abbreviations that are capitalised purely by English grammar rules,
 * NOT because they name a concrete entity.
 */
const STOPWORDS = new Set([
  // Articles / determiners
  'A', 'An', 'The',
  // Pronouns
  'I', 'Me', 'My', 'Mine', 'We', 'Our', 'You', 'Your', 'He', 'She', 'It',
  'They', 'Them', 'Their', 'His', 'Her', 'Its', 'This', 'That', 'These', 'Those',
  // Common sentence-starters
  'So', 'But', 'And', 'Or', 'Yet', 'For', 'Nor', 'Because', 'Although',
  'However', 'Therefore', 'Meanwhile', 'Also', 'Actually', 'Basically',
  'Honestly', 'Anyway', 'Like', 'Well', 'Okay', 'Yeah', 'Yes', 'No', 'Not',
  // Common prepositions / conjunctions when capitalised
  'In', 'On', 'At', 'By', 'To', 'Of', 'With', 'From', 'As', 'Into', 'Over',
  'Under', 'After', 'Before', 'Since', 'During', 'Between', 'Through',
  'About', 'Against', 'Among', 'Around', 'Across', 'Along', 'Behind',
  // MAIA-specific terms that appear capitalised but are not member referents
  'MAIA', 'Maia', 'Sanctuary', 'Spiralogic', 'AIN',
  // Days / months (often sentence-initial in journaling)
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
  // Abbreviations
  'OK', 'FYI', 'TBH', 'IMO', 'IIRC',
]);

// ── Tokeniser ─────────────────────────────────────────────────────────────────

/**
 * Extract capitalised tokens that look like concrete named referents.
 * Strategy: split on whitespace / punctuation; keep tokens that start with an
 * uppercase letter and are not in the stopword list; strip trailing punctuation.
 *
 * Multi-word proper nouns (e.g. "New York", "Project Phoenix") are detected by
 * looking for consecutive capitalised tokens and treating them as one unit.
 */
function extractCandidates(text: string): string[] {
  // Normalise: strip markdown, URLs
  const cleaned = text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/[*_`#>]/g, ' ');

  // Tokenise on whitespace and most punctuation (preserve hyphens within words)
  const tokens = cleaned.split(/[\s,;:!?.()[\]{}"']+/).filter(Boolean);

  const candidates: string[] = [];
  let i = 0;

  while (i < tokens.length) {
    const tok = tokens[i].replace(/[.,;:!?'")\]]+$/, '');

    if (isCapitalisedCandidate(tok)) {
      // Try to extend to a multi-word proper noun
      let phrase = tok;
      let j = i + 1;
      while (j < tokens.length) {
        const next = tokens[j].replace(/[.,;:!?'")\]]+$/, '');
        if (isCapitalisedCandidate(next)) {
          phrase = `${phrase} ${next}`;
          j++;
        } else {
          break;
        }
      }
      candidates.push(phrase);
      i = j;
    } else {
      i++;
    }
  }

  return candidates;
}

function isCapitalisedCandidate(token: string): boolean {
  if (token.length < 2) return false;
  if (!/^[A-Z]/.test(token)) return false;
  if (STOPWORDS.has(token)) return false;
  // Must contain at least one alphabetic character beyond the initial cap
  if (!/[a-zA-Z]{2,}/.test(token)) return false;
  return true;
}

// ── Main extraction function ──────────────────────────────────────────────────

/**
 * Query the member's recent user turns and extract the top concrete referents.
 *
 * Returns null when fewer than MIN_DISTINCT_TURNS (floor) are cleared,
 * meaning there is not enough signal to offer.
 */
export async function extractNoticingReferents(
  memberId: string,
): Promise<NoticingObservationsResult | null> {
  // Fetch user turns from the last LOOK_BACK_DAYS days
  const rows = await query<{ id: string; content: string }>(
    `SELECT id, content
     FROM conversation_turns
     WHERE user_id = $1
       AND role = 'user'
       AND created_at >= NOW() - INTERVAL '${LOOK_BACK_DAYS} days'
     ORDER BY created_at DESC`,
    [memberId],
  );

  if (rows.rows.length === 0) return null;

  // Build a map: referent text → set of distinct turn IDs
  const referentTurns = new Map<string, Set<string>>();

  for (const row of rows.rows) {
    const candidates = extractCandidates(row.content);
    for (const candidate of candidates) {
      // Normalise to Title Case for consistent grouping of the same token
      const key = candidate;
      if (!referentTurns.has(key)) {
        referentTurns.set(key, new Set());
      }
      referentTurns.get(key)!.add(row.id);
    }
  }

  // Filter to those meeting the floor, sort descending by distinct turn count
  const qualifying: Array<{ text: string; distinctTurnCount: number }> = [];
  for (const [text, turnSet] of referentTurns.entries()) {
    if (turnSet.size >= MIN_DISTINCT_TURNS) {
      qualifying.push({ text, distinctTurnCount: turnSet.size });
    }
  }

  if (qualifying.length === 0) return null;

  qualifying.sort((a, b) => b.distinctTurnCount - a.distinctTurnCount);

  // Take top MAX_REFERENTS
  const top = qualifying.slice(0, MAX_REFERENTS);

  // Render observation sentences — alternating form for naturalness
  const referents: NoticingReferent[] = top.map((r, idx) => ({
    text: r.text,
    distinctTurnCount: r.distinctTurnCount,
    observationSentence: idx % 2 === 0
      ? `Your ${r.text} has come up in several conversations over the last few weeks.`
      : `One thing that's appeared often in our conversations is ${r.text}.`,
  }));

  return {
    referents,
    question: REFLECTIVE_QUESTION,
  };
}
