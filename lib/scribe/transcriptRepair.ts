/**
 * lib/scribe/transcriptRepair.ts
 *
 * Conservative post-assembly repair for Whisper chunk-boundary word fragments.
 *
 * Background
 * ----------
 * When Whisper transcribes consecutive audio chunks each chunk starts at a
 * fixed offset regardless of word boundaries. If a word straddles two chunks,
 * the second chunk picks up the tail of that word — the leading characters are
 * simply absent. This produces fragments like:
 *
 *   "hings"  ← "things"  (leading 't' lost)
 *   "t's"    ← "it's"    (leading 'i' lost)
 *   "eah"    ← "yeah"    (leading 'y' lost)
 *   "ngs"    ← "things"  (leading "thi" lost)
 *
 * Strategy
 * --------
 * Only repairs patterns where ALL of the following hold:
 *   1. The fragment is not a valid standalone English word.
 *   2. There is exactly one plausible English completion in informal speech.
 *   3. The repair cannot introduce a false positive for another real word.
 *
 * Patterns with multiple plausible completions (e.g. "ut" → but/gut/hut/put)
 * are deliberately excluded. The goal is zero false positives at the cost of
 * incomplete coverage — Claude's language understanding fills the rest.
 *
 * Usage
 * -----
 * Applied read-time only (display + review prompt). Never written back to DB.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepairResult {
  text: string;
  changes: Array<{ from: string; to: string; count: number }>;
}

export interface BulkRepairResult {
  texts: string[];
  totalChanges: number;
  changeLog: Array<{ from: string; to: string; count: number }>;
}

// ---------------------------------------------------------------------------
// High-confidence repair table
//
// Each entry: [compiled RegExp, replacement string, human-readable label]
//
// Inclusion criteria:
//   - The fragment (the pattern match) is NOT a valid standalone English word
//     in any common dictionary sense, AND
//   - There is exactly one dominant completion in conversational English.
//
// Excluded (ambiguous even though common as fragments):
//   "ut"   → but / gut / hut / put / rut / cut
//   "ike"  → like / bike / hike / Mike / pike
//   "ust"  → just / gust / bust / dust / must / rust
//   "et"   → let / get / set / net / bet / yet / met
//   "ey"   → they / hey
//   "ings" → things / kings / rings / sings / wings
// ---------------------------------------------------------------------------

const REPAIRS: Array<[RegExp, string, string]> = [
  // Contractions — missing leading 'i'. Completely unambiguous.
  [/\bt's\b/g,     "it's",     "t's → it's"],
  [/\bt'll\b/g,    "it'll",    "t'll → it'll"],
  [/\bt'd\b/g,     "it'd",     "t'd → it'd"],

  // 'things' tail-fragments. None of "hings" / "ngs" are English words.
  [/\bhings\b/g,   "things",   "hings → things"],
  [/\bngs\b/g,     "things",   "ngs → things"],

  // 'yeah' tail-fragment. "eah" is not an English word.
  [/\beah\b/g,     "yeah",     "eah → yeah"],

  // 'oh' tail-fragments before specific collocations.
  // "h my" / "h, [word]" is never valid standalone English.
  [/\bh my\b/gi,    "oh my",    "h my → oh my"],
  [/\bh, yeah\b/gi, "oh, yeah", "h, yeah → oh, yeah"],
  [/\bh, no\b/gi,   "oh, no",   "h, no → oh, no"],
  [/\bh, wow\b/gi,  "oh, wow",  "h, wow → oh, wow"],
  [/\bh, well\b/gi, "oh, well", "h, well → oh, well"],
];

// ---------------------------------------------------------------------------
// Core repair functions
// ---------------------------------------------------------------------------

/**
 * Apply conservative chunk-boundary fragment repair to a single string.
 */
export function repairChunkFragments(text: string): RepairResult {
  let result = text;
  const changes: Array<{ from: string; to: string; count: number }> = [];

  for (const [pattern, replacement, label] of REPAIRS) {
    const matches = result.match(pattern);
    if (matches && matches.length > 0) {
      result = result.replace(pattern, replacement);
      const from = label.split(' → ')[0].trim();
      changes.push({ from, to: replacement, count: matches.length });
    }
  }

  return { text: result, changes };
}

/**
 * Apply repair to an array of transcript texts.
 * Returns cleaned texts and an aggregated change log.
 */
export function repairTranscriptTexts(texts: string[]): BulkRepairResult {
  const repairedTexts: string[] = [];
  const changeMap = new Map<string, { from: string; to: string; count: number }>();

  for (const text of texts) {
    const { text: repaired, changes } = repairChunkFragments(text);
    repairedTexts.push(repaired);

    for (const change of changes) {
      const key = `${change.from}→${change.to}`;
      const existing = changeMap.get(key);
      if (existing) {
        existing.count += change.count;
      } else {
        changeMap.set(key, { ...change });
      }
    }
  }

  const changeLog = [...changeMap.values()];
  const totalChanges = changeLog.reduce((sum, c) => sum + c.count, 0);

  return { texts: repairedTexts, totalChanges, changeLog };
}
