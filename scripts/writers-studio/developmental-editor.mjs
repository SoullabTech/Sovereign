/**
 * Writer's Studio — Developmental Editor
 *
 * A developmental editor does not rewrite a manuscript. It reads the Work
 * against a stated editorial doctrine and returns line-addressable findings
 * plus a revision architecture. The author revises. That division is the whole
 * point: a tool that returns "an improved Chapter 10" has substituted its
 * judgement for the author's, which is the same class of error as calling an
 * interpretation a source (master brief §4).
 *
 * ── The load-bearing distinctions ───────────────────────────────────────────
 *
 *   THE EDITOR DIAGNOSES. IT DOES NOT DECIDE, AND IT DOES NOT DRAFT.
 *
 * 1. **Referent before reading.** The editor never guesses which artifact is
 *    the Work. Given more than one candidate it emits a Jarvis governance gate
 *    (FOUNDER_DECISION_REQUIRED) and reports, rather than silently picking one
 *    and producing an authoritative-looking edit of the wrong file.
 *
 * 2. **Doctrine is supplied, not invented.** Every finding cites a rule the
 *    author wrote down (`doctrine/*.json`). The editor has no taste of its own.
 *    A finding with no doctrine citation is a bug.
 *
 * 3. **Deterministic.** No model call. Findings are reproducible and can be
 *    proven capable of FAILING against a fixture with known ground truth
 *    (`__tests__/developmental-editor-proof.mjs`). An editor that cannot be
 *    shown to catch a defect it was told to catch is not evidence of anything.
 *
 * 4. **A fixture is not the Work.** Choosing a corpus because its defects are
 *    visible asserts nothing about which artifact is canonical. Findings against
 *    a named fixture are valid on their own terms — not provisional pending a
 *    custody decision. Only MODIFYING the book requires a bound Work referent
 *    (`REFERENT_MODE` / `requireWorkBinding`).
 *
 * Provenance is carried on every referent: artifact path, line range, sha256.
 * The editor reads; it never writes to the manuscript.
 *
 * ── Status ──────────────────────────────────────────────────────────────────
 *
 * This module is the SPECIFICATION + DIAGNOSTIC/PROOF SUBSTRATE for a
 * Developmental Editor. It is not the Writer's Studio capability, which is a
 * conversational reading loop (open a Work → developmental reading → discuss an
 * observation → develop it with the author → capture the recognition → propose a
 * change that stays separate → the author adopts). This engine belongs in that
 * feature's grounding/evaluation layer. Do not describe it as the finished
 * Developmental Editor.
 */

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const SEVERITY = Object.freeze({
  CRITICAL: 'critical', MAJOR: 'major', MINOR: 'minor',
  /**
   * An OBSERVATION is evidence, not a verdict. It is surfaced for the author to
   * discuss; it never scores, never ranks, and never asserts that a change is
   * owed. Founder ruling: pattern detection "remains an observation, not an
   * automatic editorial verdict."
   */
  OBSERVATION: 'observation',
});
const SEV_RANK = { critical: 0, major: 1, minor: 2, observation: 3 };

/**
 * §0 — referent modes. The distinction this file exists to protect.
 *
 *   FIXTURE_ANALYSIS   reading a corpus deliberately chosen because its defects
 *                      are visible. Findings are valid AGAINST THAT FIXTURE and
 *                      are not provisional. Selecting a fixture asserts nothing
 *                      about which artifact is the canonical Work.
 *
 *   WORK_MODIFICATION  changing the actual book. This REQUIRES a bound Work
 *                      referent and gates to the founder if there isn't one.
 *
 * Conflating them turns a development experiment into a custody ruling.
 */
export const REFERENT_MODE = Object.freeze({
  FIXTURE_ANALYSIS: 'FIXTURE_ANALYSIS',
  WORK_MODIFICATION: 'WORK_MODIFICATION',
});

const rx = (s, flags = 'i') => new RegExp(s, flags);
const wordsIn = (s) => (String(s).match(/[A-Za-z'’-]+/g) || []).length;
const clip = (s, n = 150) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

// ── §1 referent ─────────────────────────────────────────────────────────────

/**
 * Build a Work referent with honest provenance. `fromLine`/`toLine` are
 * 1-indexed and inclusive; every finding's `line` is absolute in the artifact,
 * so a finding can be opened in the source file without translation.
 */
export function readWorkReferent({ artifact, fromLine = 1, toLine = Infinity, label = null }) {
  const raw = readFileSync(artifact, 'utf8');
  const all = raw.split('\n');
  const end = Math.min(toLine, all.length);
  const lines = all.slice(fromLine - 1, end);
  const text = lines.join('\n');
  return Object.freeze({
    label: label ?? path.basename(artifact),
    artifact,
    fromLine,
    toLine: end,
    lines,
    text,
    words: wordsIn(text),
    sha256: createHash('sha256').update(text, 'utf8').digest('hex'),
  });
}

/** Absolute artifact line for a 0-indexed offset inside the referent. */
const absLine = (work, i) => work.fromLine + i;

// ── §2 doctrine ─────────────────────────────────────────────────────────────

export function loadDoctrine(idOrPath) {
  const p = idOrPath.endsWith('.json')
    ? idOrPath
    : path.join(here, 'doctrine', `${idOrPath}.json`);
  return Object.freeze(JSON.parse(readFileSync(p, 'utf8')));
}

// ── §3 segmentation ─────────────────────────────────────────────────────────

/**
 * Split into heading-delimited sections. Prose before the first heading becomes
 * a synthetic `(chapter open)` section so an inverted opening is still
 * addressable.
 */
export function segment(work) {
  const sections = [];
  let cur = { level: 0, title: '(chapter open)', line: work.fromLine, bodyLines: [], startIdx: 0 };
  work.lines.forEach((ln, i) => {
    const m = /^(#{1,6})\s+(.*)$/.exec(ln);
    if (m) {
      sections.push(cur);
      cur = { level: m[1].length, title: m[2].trim(), line: absLine(work, i), bodyLines: [], startIdx: i + 1 };
    } else {
      cur.bodyLines.push({ text: ln, line: absLine(work, i) });
    }
  });
  sections.push(cur);
  return sections
    .filter((s) => s.title !== '(chapter open)' || s.bodyLines.some((b) => b.text.trim()))
    .map((s) => Object.freeze({ ...s, body: s.bodyLines.map((b) => b.text).join('\n'), words: wordsIn(s.bodyLines.map((b) => b.text).join('\n')) }));
}

// ── §4 shared measures ──────────────────────────────────────────────────────

const protagonistRx = (d) => rx(`\\b(${d.protagonist.primary.join('|')})\\b`, 'gi');
const frameworkRx = (d) => rx(`(${d.framework_terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

const countMatches = (text, re) => (String(text).match(re) || []).length;

/** First 0-indexed line inside a referent matching `re`, or -1. */
const firstLineMatching = (lines, re) => lines.findIndex((l) => re.test(l));

function measure(work, doctrine) {
  const pRx = protagonistRx(doctrine);
  const fRx = frameworkRx(doctrine);
  return {
    protagonistCount: countMatches(work.text, pRx),
    frameworkCount: countMatches(work.text, fRx),
    firstProtagonistIdx: firstLineMatching(work.lines, rx(pRx.source, 'i')),
    firstFrameworkIdx: firstLineMatching(work.lines, rx(fRx.source, 'i')),
  };
}

// ── §5 diagnostics ──────────────────────────────────────────────────────────
// Each returns findings[]. A finding is: { rule, severity, line, excerpt,
// claim, remedy, citation }. `citation` names the doctrine field that makes it
// a finding — without it the editor would just be asserting preference.

const finding = (o) => Object.freeze({ excerpt: null, ...o });

/** D1 — foreground inversion: the framework is introduced before the life is. */
export function foregroundInversion(work, doctrine, sections, m) {
  const out = [];
  // A referent with no protagonist is not a compliant referent — it is a
  // different chapter. Scoring silence as cleanliness would rank the draft that
  // deleted the protagonist as the closest to a doctrine built on her.
  if (m.protagonistCount === 0) {
    out.push(finding({
      rule: 'D1.protagonist-absent',
      severity: SEVERITY.CRITICAL,
      line: work.fromLine,
      claim: `${doctrine.protagonist.name} does not appear in this referent. The doctrine makes her the foreground; this artifact answers the same defect by a different route.`,
      remedy: `Either restore ${doctrine.protagonist.name} as the carrying life, or record a founder decision that this doctrine no longer governs this artifact.`,
      citation: 'governing_principle',
    }));
    return out;
  }
  if (m.firstFrameworkIdx >= 0 && (m.firstProtagonistIdx < 0 || m.firstFrameworkIdx < m.firstProtagonistIdx)) {
    out.push(finding({
      rule: 'D1.foreground-inversion',
      severity: SEVERITY.CRITICAL,
      line: absLine(work, m.firstFrameworkIdx),
      excerpt: clip(work.lines[m.firstFrameworkIdx]),
      claim: m.firstProtagonistIdx < 0
        ? `The framework is named at this line; ${doctrine.protagonist.name} never appears in this referent at all.`
        : `The framework is named ${m.firstProtagonistIdx - m.firstFrameworkIdx} lines before ${doctrine.protagonist.name} appears (line ${absLine(work, m.firstProtagonistIdx)}).`,
      remedy: `Open on the lived disturbance. Let the framework be a name for something the reader has already begun to recognize.`,
      citation: 'governing_principle',
    }));
  }
  // Sections that explain without depicting.
  const fRx = frameworkRx(doctrine);
  for (const s of sections) {
    if (s.words < 60) continue;
    const hasFramework = countMatches(`${s.title}\n${s.body}`, fRx) > 0;
    const hasProtagonist = countMatches(s.body, protagonistRx(doctrine)) > 0;
    if (hasFramework && !hasProtagonist) {
      out.push(finding({
        rule: 'D1.explanation-without-experience',
        severity: SEVERITY.MAJOR,
        line: s.line,
        excerpt: clip(s.title),
        claim: `${s.words} words explaining the framework with no appearance by ${doctrine.protagonist.name}.`,
        remedy: 'Move later, shorten, let it emerge from her experience, or cut it because the reader already understands it.',
        citation: 'editorial_test',
      }));
    }
  }
  return out;
}

/** D2 — framework density: how much foreground the system is occupying. */
export function frameworkDensity(work, doctrine, _sections, m) {
  const per1000 = work.words ? (m.frameworkCount / work.words) * 1000 : 0;
  const t = doctrine.framework_density_per_1000_words;
  if (per1000 < t.warn) return [];
  return [finding({
    rule: 'D2.framework-density',
    severity: per1000 >= t.fail ? SEVERITY.MAJOR : SEVERITY.MINOR,
    line: work.fromLine,
    claim: `${m.frameworkCount} framework namings across ${work.words} words = ${per1000.toFixed(1)} per 1,000 (warn ${t.warn}, fail ${t.fail}).`,
    remedy: doctrine.success_condition,
    citation: 'framework_density_per_1000_words',
  })];
}

/** D3 — curriculum scaffolding: numbered Parts/Sections read as a syllabus. */
export function headingArchitecture(work, doctrine, sections) {
  const out = [];
  const pats = doctrine.heading_architecture.curriculum_scaffolding_patterns.map((p) => rx(p));
  const scaffolded = sections.filter((s) => pats.some((p) => p.test(s.title)));
  if (scaffolded.length) {
    const parts = scaffolded.filter((s) => /^Part/i.test(s.title)).length;
    const secs = scaffolded.length - parts;
    out.push(finding({
      rule: 'D3.curriculum-scaffolding',
      severity: SEVERITY.MAJOR,
      line: scaffolded[0].line,
      excerpt: clip(scaffolded[0].title),
      claim: `${parts} numbered Parts and ${secs} numbered Sections inside one chapter. That is a course outline, not a life.`,
      remedy: `Reduce visible hierarchy to depth ${doctrine.heading_architecture.max_visible_depth}; let the concepts live inside the movement.`,
      citation: 'heading_architecture.curriculum_scaffolding_patterns',
    }));
  }
  const depth = new Set(sections.filter((s) => s.level > 0).map((s) => s.level)).size;
  if (depth > doctrine.heading_architecture.max_visible_depth) {
    out.push(finding({
      rule: 'D3.hierarchy-depth',
      severity: SEVERITY.MINOR,
      line: work.fromLine,
      claim: `${depth} visible heading levels; doctrine allows ${doctrine.heading_architecture.max_visible_depth}.`,
      remedy: 'Flatten. Depth signals curriculum.',
      citation: 'heading_architecture.max_visible_depth',
    }));
  }
  return out;
}

/** D4 — prospective stance in a terminal chapter: pointing forward from the end. */
export function prospectiveStance(work, doctrine) {
  if (doctrine.position !== 'terminal') return [];
  const pats = doctrine.prospective_patterns.map((p) => rx(p));
  const out = [];
  work.lines.forEach((ln, i) => {
    const hit = pats.find((p) => p.test(ln));
    if (hit) {
      out.push(finding({
        rule: 'D4.prospective-stance',
        severity: SEVERITY.CRITICAL,
        line: absLine(work, i),
        excerpt: clip(ln),
        claim: 'Forward-looking framing in the final chapter — it tells the reader they are near the beginning when they are at the end.',
        remedy: 'Cut. This is residue from the chapter\'s previous position in the book.',
        citation: 'position',
      }));
    }
  });
  return out;
}

/** D5 — reintroducing the book inside its own last chapter. */
export function chapterReintroduction(work, doctrine, sections) {
  if (doctrine.position !== 'terminal') return [];
  const pats = doctrine.heading_architecture.reintroduction_patterns.map((p) => rx(p));
  return sections
    .filter((s) => s.level > 0 && pats.some((p) => p.test(s.title.replace(/^(Part|Section)\s+\d+:\s*/i, ''))))
    .map((s) => finding({
      rule: 'D5.reintroduction',
      severity: SEVERITY.MAJOR,
      line: s.line,
      excerpt: clip(s.title),
      claim: 'An introduction/overview heading inside the last chapter re-teaches material the reader has already walked.',
      remedy: 'Delete or demote. The reader met the elements in the preceding chapters.',
      citation: 'developmental_thesis',
    }));
}

/** D6 — is every element actually LIVED, or is one of them only described? */
export function elementEmbodiment(work, doctrine) {
  const pRx = rx(protagonistRx(doctrine).source, 'i');
  const WINDOW = 6; // lines either side — a paragraph neighbourhood, not a section
  const per = doctrine.elements.map((el) => {
    const eRx = rx(`\\b${el.key}\\b`, 'i');
    const hits = [];
    work.lines.forEach((ln, i) => { if (eRx.test(ln)) hits.push(i); });
    // Count DISTINCT lines where the protagonist appears near this element, so
    // heading style cannot decide whether an element counts as lived.
    const near = new Set();
    for (const h of hits) {
      for (let j = Math.max(0, h - WINDOW); j <= Math.min(work.lines.length - 1, h + WINDOW); j++) {
        if (pRx.test(work.lines[j])) near.add(j);
      }
    }
    return { element: el.key, mentions: hits.length, embodied: near.size, firstLine: hits.length ? absLine(work, hits[0]) : work.fromLine };
  });
  const present = per.filter((p) => p.mentions > 0);
  if (present.length < 2) return [];
  const lived = present.filter((p) => p.embodied > 0).map((p) => p.embodied);
  if (!lived.length) {
    return [finding({
      rule: 'D6.no-element-embodied',
      severity: SEVERITY.CRITICAL,
      line: work.fromLine,
      claim: `No element is carried by ${doctrine.protagonist.name} anywhere in this referent. The spiral is asserted, not lived.`,
      remedy: 'The elements must move through a life before they are named as a system.',
      citation: 'developmental_thesis',
    })];
  }
  const median = lived.slice().sort((a, b) => a - b)[Math.floor(lived.length / 2)];
  return present
    .filter((p) => p.embodied * 2 < median)
    .map((p) => finding({
      rule: 'D6.element-not-embodied',
      severity: SEVERITY.MAJOR,
      line: p.firstLine,
      excerpt: p.element,
      claim: `${p.element} is named ${p.mentions}× but ${doctrine.protagonist.name} is present near only ${p.embodied} of those lines, against a median of ${median} for the elements that are lived. It is described, not experienced.`,
      remedy: `Give ${doctrine.protagonist.name} a ${p.element} experience: a moment she cannot solve, plan, or improve — where something reorganizes without her forcing it.`,
      citation: 'elements',
    }));
}

/** D7 — staircase vs spiral: do the elements ever RETURN? */
export function spiralRecurrence(work, doctrine) {
  const order = doctrine.elements.map((e) => e.key);
  const seq = [];
  work.lines.forEach((ln, i) => {
    order.forEach((k, idx) => {
      if (rx(`\\b${k}\\b`).test(ln)) seq.push({ idx, key: k, line: absLine(work, i) });
    });
  });
  if (seq.length < 4) return [];
  let peak = -1;
  const returns = [];
  for (const s of seq) {
    if (s.idx > peak) peak = s.idx;
    else if (s.idx < peak) returns.push(s);
  }
  if (returns.length >= 3) return [];
  return [finding({
    rule: 'D7.staircase-not-spiral',
    severity: SEVERITY.MAJOR,
    line: seq[0].line,
    claim: `The elements advance in near-monotonic order with ${returns.length} return(s). A staircase teaches sequence; a spiral teaches recurrence.`,
    remedy: 'Let them overlap and recur — old Water returning while she is deep in Earth; building before she understands why.',
    citation: 'developmental_thesis',
  })];
}

/** D8 — is the fifth element Aether or Spirit? Pick one. */
export function fifthElementConsistency(work, doctrine) {
  const canon = doctrine.fifth_element_canonical;
  const canonN = countMatches(work.text, rx(`\\b${canon}\\b`, 'gi'));
  const out = [];
  for (const alt of doctrine.fifth_element_conflicts) {
    const aRx = rx(`\\b${alt}\\b`, 'g');
    const n = countMatches(work.text, aRx);
    if (n > 0 && canonN > 0) {
      const i = firstLineMatching(work.lines, rx(`\\b${alt}\\b`, ''));
      out.push(finding({
        rule: 'D8.fifth-element-inconsistency',
        severity: SEVERITY.MINOR,
        line: absLine(work, i),
        excerpt: clip(work.lines[i]),
        claim: `The fifth element is called "${alt}" ${n}× and "${canon}" ${canonN}×.`,
        remedy: `Decide. If "${alt}" is the experiential name for ${canon}, establish that once; otherwise it is residue.`,
        citation: 'fifth_element_canonical',
      }));
    }
  }
  return out;
}

/** D9 — pitch register: the author steps onstage to explain why the product works. */
export function pitchRegister(work, doctrine) {
  const pats = doctrine.pitch_register_patterns.map((p) => rx(p));
  const out = [];
  work.lines.forEach((ln, i) => {
    if (pats.some((p) => p.test(ln))) {
      out.push(finding({
        rule: 'D9.pitch-register',
        severity: SEVERITY.MAJOR,
        line: absLine(work, i),
        excerpt: clip(ln),
        claim: 'Credentialing/marketing register interrupts the enchantment the story just built.',
        remedy: 'Relocate to preface, author\'s note, afterword, or practitioner material. Not inside the chapter\'s culmination.',
        citation: 'editorial_test',
      }));
    }
  });
  return out;
}

/** D10 — within a section, does definition precede depiction? */
export function teachingSequenceOrder(work, doctrine, sections) {
  const pRx = rx(protagonistRx(doctrine).source, 'i');
  const fRx = rx(frameworkRx(doctrine).source, 'i');
  const defRx = rx('\\b(represents|is the realm of|refers to|is defined as|stands for)\\b');
  const out = [];
  for (const s of sections) {
    if (s.words < 60) continue;
    const texts = s.bodyLines.map((b) => b.text);
    const pIdx = texts.findIndex((t) => pRx.test(t));
    const dIdx = texts.findIndex((t) => fRx.test(t) || defRx.test(t));
    if (pIdx >= 0 && dIdx >= 0 && dIdx < pIdx) {
      out.push(finding({
        rule: 'D10.definition-before-depiction',
        severity: SEVERITY.MINOR,
        line: s.bodyLines[dIdx].line,
        excerpt: clip(texts[dIdx]),
        claim: `This section defines before it depicts (${doctrine.protagonist.name} arrives ${pIdx - dIdx} lines later).`,
        remedy: doctrine.teaching_sequence_note,
        citation: 'teaching_sequence',
      }));
    }
  }
  return out;
}

/**
 * D11 — subordination pattern (OBSERVATION ONLY).
 *
 * Counting protagonist appearances is inadequate: a chapter can name her often
 * and still subordinate her. What matters is the SHAPE each section takes.
 *
 *   subordinating          principle → explanation → protagonist as example
 *   carrying               protagonist lives something → movement becomes
 *                          visible → reflection → light naming → back to her
 *
 * This reports the dominant shape and the strongest evidence for it. It is
 * deliberately never a verdict: the author reads the pattern and decides.
 */
export function subordinationPattern(work, doctrine, sections) {
  const pRx = rx(protagonistRx(doctrine).source, 'i');
  const fRx = rx(frameworkRx(doctrine).source, 'i');
  const defRx = rx('\\b(represents|is the realm of|refers to|is defined as|stands for|consists of|is the process)\\b');
  // Explicit demotion: the protagonist introduced AS an illustration.
  const exampleRx = rx(`\\b(for example|for instance|consider|such as|to illustrate|take)\\b[^.]{0,40}\\b(${doctrine.protagonist.primary.join('|')})\\b`);

  let subordinating = 0, carrying = 0;
  const evidence = [];
  for (const s of sections) {
    if (s.words < 60) continue;
    const texts = s.bodyLines.map((b) => b.text);
    const pIdx = texts.findIndex((t) => pRx.test(t));
    const eIdx = texts.findIndex((t) => fRx.test(t) || defRx.test(t));
    if (pIdx < 0 || eIdx < 0) continue;
    if (eIdx < pIdx) {
      subordinating++;
      if (evidence.length < 5) evidence.push(`L${s.bodyLines[eIdx].line} “${clip(s.title || texts[eIdx], 60)}” — exposition ${pIdx - eIdx} lines before her`);
    } else carrying++;
  }
  const demotions = [];
  work.lines.forEach((ln, i) => { if (exampleRx.test(ln)) demotions.push(absLine(work, i)); });

  if (!subordinating && !carrying && !demotions.length) return [];
  const dominant = subordinating > carrying ? 'subordinating' : subordinating < carrying ? 'carrying' : 'mixed';
  const out = [finding({
    rule: 'D11.subordination-pattern',
    severity: SEVERITY.OBSERVATION,
    line: work.fromLine,
    excerpt: dominant,
    claim: `Dominant shape: **${dominant}**. ${subordinating} section(s) place principle and explanation before ${doctrine.protagonist.name}; ${carrying} let her live it first.${evidence.length ? ` Strongest: ${evidence.join('; ')}.` : ''}`,
    remedy: `Observation for discussion, not a required change. The doctrine's shape is: ${doctrine.teaching_sequence.join(' → ')}.`,
    citation: 'teaching_sequence',
  })];
  if (demotions.length) {
    out.push(finding({
      rule: 'D11.protagonist-as-example',
      severity: SEVERITY.OBSERVATION,
      line: demotions[0],
      excerpt: clip(work.lines[demotions[0] - work.fromLine]),
      claim: `${doctrine.protagonist.name} is introduced as an illustration of a point already made, at ${demotions.length} line(s): L${demotions.join(', L')}.`,
      remedy: 'Observation only. Where she is an example of a principle, the principle is the foreground.',
      citation: 'governing_principle',
    }));
  }
  return out;
}

export const DIAGNOSTICS = Object.freeze([
  foregroundInversion, frameworkDensity, headingArchitecture, prospectiveStance,
  chapterReintroduction, elementEmbodiment, spiralRecurrence, fifthElementConsistency,
  pitchRegister, teachingSequenceOrder, subordinationPattern,
]);

// ── §6 analysis ─────────────────────────────────────────────────────────────

export function analyze(work, doctrine) {
  const sections = segment(work);
  const m = measure(work, doctrine);
  const findings = DIAGNOSTICS
    .flatMap((d) => d(work, doctrine, sections, m))
    .sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity] || a.line - b.line);
  return Object.freeze({
    work, doctrine_id: doctrine.doctrine_id, sections: sections.length, measures: m, findings,
    counts: {
      critical: findings.filter((f) => f.severity === 'critical').length,
      major: findings.filter((f) => f.severity === 'major').length,
      minor: findings.filter((f) => f.severity === 'minor').length,
    },
    observations: {
      count: findings.filter((f) => f.severity === 'observation').length,
    },
  });
}

/**
 * Score referents against the doctrine, for ARCHAEOLOGY — reading how a chapter
 * changed across drafts. This orders by doctrine distance; it does not nominate
 * a Work, and a low penalty is not a claim of canonicity. Binding the Work is a
 * founder act (`workBindingGate`), never a consequence of a ranking.
 */
export function compareCandidates(works, doctrine) {
  return works
    .map((w) => {
      const a = analyze(w, doctrine);
      // Observations deliberately excluded — evidence does not rank.
      const penalty = a.counts.critical * 5 + a.counts.major * 2 + a.counts.minor;
      return { label: w.label, artifact: w.artifact, range: [w.fromLine, w.toLine], sha256: w.sha256.slice(0, 12), words: w.words, protagonist: a.measures.protagonistCount, framework: a.measures.frameworkCount, ...a.counts, penalty };
    })
    .sort((a, b) => a.penalty - b.penalty);
}

// ── §7 the gate — required to CHANGE the Work, never to READ a fixture ──────

/**
 * A gate is owed when the editor is asked to modify the book, because that
 * needs a bound Work referent. It is NOT owed for reading a named fixture:
 * findings against a deliberately selected corpus are valid on their own terms,
 * and marking them provisional pending a custody decision would imply the
 * fixture was a candidate for the Work. It is not.
 *
 * Returns only a CLAIM. Validation and resolution belong to
 * `scripts/builder/jarvis-governance-gate.mjs`; a worker never supplies the
 * authority it is asking for (§4 there).
 */
export function workBindingGate(candidates, { run_id = null, work_unit_id = null, target = 'chapter-10' } = {}) {
  return {
    gate_class: 'FOUNDER_DECISION_REQUIRED',
    reason: `Modifying the Work requires a bound Work referent; ${candidates.length} divergent artifacts carry this chapter and none has been declared canonical. Reading a fixture does not need this gate; changing the book does.`,
    ...(run_id ? { run_id } : {}),
    ...(work_unit_id ? { work_unit_id } : {}),
    authority_required: { operation_class: 'WORK_REFERENT_BINDING', target },
    evidence: candidates.map((c) => ({ label: c.label, artifact: c.artifact, range: c.range, sha256: c.sha256, protagonist_mentions: c.protagonist, framework_mentions: c.framework })),
  };
}

/**
 * Guard for any future write path. Fixture analysis needs no Work binding;
 * modification without one must refuse rather than proceed.
 */
export function requireWorkBinding(mode, workReferent) {
  if (mode !== REFERENT_MODE.WORK_MODIFICATION) return { ok: true, gate: null };
  if (workReferent && workReferent.resolved) return { ok: true, gate: null };
  return { ok: false, gate: 'FOUNDER_DECISION_REQUIRED', reason: 'the Work referent is unresolved; the editor may read, not change' };
}

// ── §8 the editorial letter ─────────────────────────────────────────────────

export function editorialLetter(analysis, doctrine) {
  const { work, findings, counts } = analysis;
  const L = [];
  L.push(`## ${work.label}`);
  L.push('');
  L.push(`> \`${work.artifact}\` lines ${work.fromLine}–${work.toLine} · sha256 \`${work.sha256.slice(0, 12)}\` · ${work.words.toLocaleString()} words`);
  L.push(`> ${analysis.measures.protagonistCount} × ${doctrine.protagonist.name} · ${analysis.measures.frameworkCount} × framework naming`);
  L.push('');
  L.push(`**${counts.critical} critical · ${counts.major} major · ${counts.minor} minor · ${analysis.observations.count} observation(s)**`);
  L.push('');
  L.push('_Observations are evidence for discussion. They carry no verdict and do not score._');
  L.push('');
  if (!findings.length) { L.push('_No findings against this doctrine._'); return L.join('\n'); }
  let sev = null;
  for (const f of findings) {
    if (f.severity !== sev) {
      sev = f.severity;
      L.push(sev === 'observation' ? '### OBSERVATIONS — evidence, not verdicts' : `### ${sev.toUpperCase()}`);
      L.push('');
    }
    L.push(`**L${f.line} · \`${f.rule}\`**${f.excerpt ? ` — _${f.excerpt}_` : ''}`);
    L.push('');
    L.push(`- ${f.claim}`);
    L.push(`- → ${f.remedy}`);
    L.push(`- doctrine: \`${f.citation}\``);
    L.push('');
  }
  return L.join('\n');
}
