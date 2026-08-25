/**
 * Writer's Studio — Recovery Lens
 *
 * A developmental question the single-referent diagnostics cannot answer:
 *
 *   "Is there anything in the predecessor source that the current draft lost —
 *    and would any of it repair a finding the current draft actually fails?"
 *
 * The lens compares a RECOVERY SOURCE against a FIXTURE and reports passages
 * present in the source and absent downstream, each tagged with the finding it
 * could serve. It is deterministic — survival is measured by n-gram overlap, not
 * by judgement — and it recommends nothing on its own authority.
 *
 * ── The recognition principle ──────────────────────────────────────────────
 *
 *   ELEMENTAL RECOGNITION FOLLOWS MOVEMENT BEFORE VOCABULARY.
 *
 * An element is recognised by what HAPPENS in a passage, not by whether the
 * passage uses the element's name. A lens that searches only for "aether" is a
 * concordance. A lens that recognises non-forcing, release of control, and
 * reorganization from a larger field can detect phenomenology before
 * terminology — which is the intelligence this is for.
 *
 * ⛔ **Observation only, never automatic classification.** A movement match is a
 * reason to READ the passage. It is never a ruling that the passage is that
 * element, and it never adopts anything into the Work.
 *
 * ── What it is not ─────────────────────────────────────────────────────────
 *
 *   ABSENT IS NOT A VERDICT. Material is often cut for good reason. A recovery
 *   candidate is an OBSERVATION: here is what was lost, here is what it would
 *   serve, the author decides. The lens also names what it thinks should NOT be
 *   recovered (pitch register), so it cannot be read as "restore everything."
 *
 * Neither artifact is thereby declared the Work.
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const NGRAM = 6;
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const shingles = (text, n = NGRAM) => {
  const w = norm(text).split(' ').filter(Boolean);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' '));
  return out;
};
const clip = (s, n = 180) => {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

export const SURVIVAL = Object.freeze({ PRESENT: 'present', PARTIAL: 'partial', ABSENT: 'absent' });

/** Evidence markers for lived narrative — reported, never merely counted. */
const LIVED_MARKERS = Object.freeze([
  [/\bmy (client|colleague|son|daughter|teacher|friend|wife)\b/i, 'names a real person in the author\'s life'],
  [/\bone of my clients\b/i, 'a client scene'],
  [/\bI had a dream\b/i, 'a dream account'],
  [/\bI had her\b|\bI asked (her|him|them)\b|\bwe started\b|\bwe then moved\b/i, 'session narration'],
  [/\bshe (said|felt|imagined|watched|was able to|left|had)\b/i, 'third-person lived action'],
  [/\bI (was|had|went|saw|chose|learned|tried|took|watch|watched|spent|love)\b/i, 'first-person past narrative'],
  [/"[^"]{12,}"|“[^”]{12,}”/, 'quoted speech'],
]);

/** Material the doctrine already flags as harmful — never recommended. */
const isPitch = (text, doctrine) =>
  (doctrine.pitch_register_patterns ?? []).some((p) => new RegExp(p, 'i').test(text));

/** Split into paragraphs, keeping 1-indexed line coordinates in the source. */
export function paragraphs(text, skipHeadings = true) {
  return text.split('\n')
    .map((t, i) => ({ text: t, line: i + 1 }))
    .filter((p) => p.text.trim().length > 0)
    .filter((p) => !(skipHeadings && (/^#{1,6}\s/.test(p.text) || /^>/.test(p.text) || /^\|/.test(p.text) || /^```/.test(p.text))));
}

/**
 * Compare a source against a fixture.
 *
 * @param {{path:string,text:string,label:string}} source   predecessor material
 * @param {{text:string,label:string}}             fixture  the current draft
 * @param {object} doctrine
 * @param {object} [fixtureFindings] rules the fixture FAILS, so recovery can be
 *        tied to a real defect rather than to nostalgia. Pass `analysis.findings`.
 */
export function recoveryCandidates(source, fixture, doctrine, fixtureFindings = []) {
  const fixtureShingles = shingles(fixture.text);
  const failing = new Set(fixtureFindings.map((f) => f.rule));
  const unlivedElements = new Set(
    fixtureFindings.filter((f) => f.rule === 'D6.element-not-embodied').map((f) => f.excerpt),
  );
  const elementKeys = doctrine.elements.map((e) => e.key);

  return paragraphs(source.text).map((p) => {
    if (norm(p.text).split(' ').length < NGRAM + 4) return null;
    const s = shingles(p.text);
    let hit = 0;
    for (const g of s) if (fixtureShingles.has(g)) hit++;
    const survival = s.size ? hit / s.size : 1;
    const state = survival >= 0.5 ? SURVIVAL.PRESENT : survival >= 0.05 ? SURVIVAL.PARTIAL : SURVIVAL.ABSENT;
    if (state === SURVIVAL.PRESENT) return null;

    const markers = LIVED_MARKERS.filter(([re]) => re.test(p.text)).map(([, why]) => why);
    const lived = markers.length >= 2 || /\bmy (client|colleague|son|daughter)\b|\bI had a dream\b/i.test(p.text);

    // Element sequence inside the passage, and whether it RETURNS.
    const seq = [];
    norm(p.text).split(' ').forEach((w) => {
      const i = elementKeys.indexOf(w);
      if (i >= 0) seq.push(i);
    });
    let peak = -1, returns = 0;
    for (const i of seq) { if (i > peak) peak = i; else if (i < peak) returns++; }
    const elements = [...new Set(seq.map((i) => elementKeys[i]))];

    // Elements recognised by MOVEMENT, not by name — a shown Aether moment
    // rarely says "aether", which is exactly why the fixture lost it.
    const sigs = doctrine.element_signatures ?? {};
    const bySignature = elementKeys.filter((k) =>
      (sigs[k] ?? []).some((pat) => new RegExp(pat, 'i').test(p.text)));

    // `repairs` answer a finding the fixture actually fails. `supports` are
    // weaker — real, but not tied to a named defect.
    const repairs = [];
    const supports = [];

    if (returns >= 1 && elements.length >= 3) {
      repairs.push({
        rule: failing.has('D7.staircase-not-spiral') ? 'D7.staircase-not-spiral' : 'doctrine:spiral_recurrence',
        why: `carries ${elements.length} elements with ${returns} return(s) — a spiral inside one passage, not a staircase`,
      });
    }
    for (const el of new Set([...elements, ...bySignature])) {
      if (!unlivedElements.has(el)) continue;
      const named = elements.includes(el);
      if (lived || bySignature.includes(el)) {
        repairs.push({
          rule: 'D6.element-not-embodied',
          why: named
            ? `a lived ${el} scene, and the fixture names ${el} without embodying it`
            : `moves like ${el} without naming it — the fixture names ${el} but never shows it. Matched by MOVEMENT, not vocabulary: an observation to read against, never a classification.`,
        });
      }
    }
    if (lived && failing.has('D11.subordination-pattern')) {
      supports.push({ rule: 'D11.subordination-pattern', why: 'lived material — the fixture reads as subordinating' });
    }
    const serves = [...repairs, ...supports];

    const pitch = isPitch(p.text, doctrine);
    return {
      line: p.line, state, survival: Number(survival.toFixed(3)), lived, markers, elements, returns,
      serves, repairs, supports, bySignature, pitch, excerpt: clip(p.text),
      words: norm(p.text).split(' ').length,
    };
  }).filter(Boolean);
}

/** Rank: serves a real failing finding first, then lived, then size. Pitch sinks. */
export function rankCandidates(cands) {
  return cands.slice().sort((a, b) => {
    if (a.pitch !== b.pitch) return a.pitch ? 1 : -1;
    if (a.repairs.length !== b.repairs.length) return b.repairs.length - a.repairs.length;
    if (a.serves.length !== b.serves.length) return b.serves.length - a.serves.length;
    if (a.lived !== b.lived) return a.lived ? -1 : 1;
    return b.words - a.words;
  });
}

export function readSource(path, label) {
  const text = readFileSync(path, 'utf8');
  return { path, label, text, sha256: createHash('sha256').update(text, 'utf8').digest('hex') };
}
