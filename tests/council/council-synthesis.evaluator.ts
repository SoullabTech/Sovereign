/**
 * Council Synthesis — Gold Standard Evaluator
 *
 * Assertion-based scorer for live council synthesis output. NOT a snapshot test.
 * Snapshots fail for probabilistic LLM output; this harness scores structural
 * and behavioral properties that must hold across temperature variation.
 *
 * Usage:
 *   import { evaluateCouncilSynthesis, loadGoldStandardFixture } from './council-synthesis.evaluator';
 *   const fixture = loadGoldStandardFixture('gold-standard-support-network-synthesis');
 *   const report = evaluateCouncilSynthesis(councilResult, fixture);
 *   if (!report.pass) throw new Error(report.summary);
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * Schema v2: required_concepts replaces should_include literals.
 * Each concept passes if ≥1 of its regex any_of patterns matches.
 * Forbidden + structural remain strict.
 *
 * Schema v1 (should_include: string[]) is still accepted for backward
 * compatibility — entries are treated as case-insensitive substring matches.
 */
export interface ConceptMarker {
  name: string;
  description?: string;
  any_of: string[]; // regex source strings, matched case-insensitive
}

export interface GoldStandardFixtureSpec {
  name: string;
  domain: string;
  fixture_md: string;
  schema_version?: number;
  required_concepts?: ConceptMarker[];
  should_include?: string[]; // v1 legacy
  should_not_include: string[];
  behavioral_rules: string[];
}

export interface EvaluationReport {
  pass: boolean;
  summary: string;
  concepts: { name: string; matched: boolean; matchedPattern?: string }[];
  forbidden: { phrase: string; found: boolean }[];
  structural: { rule: string; pass: boolean; detail?: string }[];
}

const FIXTURE_DIR = path.resolve(__dirname, '..', 'fixtures', 'council');

export function loadGoldStandardFixture(name: string): GoldStandardFixtureSpec {
  const p = path.join(FIXTURE_DIR, `${name}.json`);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw) as GoldStandardFixtureSpec;
}

/**
 * Flatten any structured council result to a single lowercased string for scanning.
 * Works across CouncilResult (changes) and ConsultationResult (decisions) shapes.
 */
export function flattenResultToText(result: unknown): string {
  return JSON.stringify(result ?? '')
    .toLowerCase()
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Check structural rules that apply to all gold-standard council output.
 * These are derived from the fixture's Assertions/Guardrails section and
 * encode the six discipline rules + recommendation-robustness protection.
 */
export function checkStructuralRules(text: string): EvaluationReport['structural'] {
  const out: EvaluationReport['structural'] = [];

  // 1. Preserves plurality — at least one of these plural-hedging markers appears
  const plural = [
    'may be',
    'plausible',
    'multiple',
    'not yet clear',
    'remains open',
    'not yet confirmed',
  ];
  out.push({
    rule: 'preserves plurality (plural-hedging language present)',
    pass: plural.some((p) => text.includes(p)),
    detail: 'expected at least one of: ' + plural.join(', '),
  });

  // 2. Names missing data explicitly
  const missing = [
    'limited field data',
    'missing',
    'not yet recorded',
    'no recorded',
    'absent',
    'not yet tested',
  ];
  out.push({
    rule: 'explicitly names missing data',
    pass: missing.some((p) => text.includes(p)),
    detail: 'expected at least one of: ' + missing.join(', '),
  });

  // 3. Asks at least one decision-relevant question — count '?' in recommendation/question blocks
  const questionCount = (text.match(/\?/g) || []).length;
  out.push({
    rule: 'asks at least one orienting question',
    pass: questionCount >= 1,
    detail: `found ${questionCount} question marks`,
  });

  // 4. Recommendation robustness — must signal conditional/robust framing
  const robust = [
    'whether the bottleneck',
    'across multiple interpretations',
    'works whether',
    'regardless of which',
    'robust',
    'either',
  ];
  out.push({
    rule: 'recommendation robust across interpretations',
    pass: robust.some((p) => text.includes(p)),
    detail: 'expected robust-move signal: ' + robust.join(', '),
  });

  // 5. No premature convergence rhetoric
  const banned = [
    'all lenses converge',
    'all lenses agree',
    'the deepest insight',
    'the real issue is',
    'remarkably convergent',
    'strikingly convergent',
  ];
  const hit = banned.find((b) => text.includes(b));
  out.push({
    rule: 'no premature-convergence rhetoric',
    pass: !hit,
    detail: hit ? `found banned phrase: "${hit}"` : 'none found',
  });

  // 6. Does not pathologize urgency/readiness without evidence
  const pathologize = [
    'you are moving ahead of readiness',
    'ahead of your capacity',
    'anxiety is driving',
    'you appear dysregulated',
    'avoidance pattern',
  ];
  const patHit = pathologize.find((p) => text.includes(p));
  out.push({
    rule: 'does not pathologize readiness/urgency',
    pass: !patHit,
    detail: patHit ? `found pathologizing phrase: "${patHit}"` : 'none found',
  });

  return out;
}

/**
 * Evaluate a single concept marker against the flattened text.
 * Returns the first matched pattern, or undefined if none matched.
 */
function evaluateConcept(text: string, marker: ConceptMarker): string | undefined {
  for (const pattern of marker.any_of) {
    try {
      const re = new RegExp(pattern, 'i');
      if (re.test(text)) return pattern;
    } catch {
      // Fall back to literal substring match if the pattern isn't valid regex
      if (text.includes(pattern.toLowerCase())) return pattern;
    }
  }
  return undefined;
}

/**
 * Build a concept-marker list from either schema v2 (required_concepts)
 * or v1 legacy (should_include string[]). v1 entries become single-pattern
 * substring markers so existing fixtures still function.
 */
function resolveRequiredConcepts(fixture: GoldStandardFixtureSpec): ConceptMarker[] {
  if (fixture.required_concepts && fixture.required_concepts.length) {
    return fixture.required_concepts;
  }
  return (fixture.should_include ?? []).map((phrase) => ({
    name: `legacy:${phrase}`,
    any_of: [phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')],
  }));
}

export function evaluateCouncilSynthesis(
  result: unknown,
  fixture: GoldStandardFixtureSpec,
): EvaluationReport {
  const text = flattenResultToText(result);

  const markers = resolveRequiredConcepts(fixture);
  const concepts = markers.map((m) => {
    const matched = evaluateConcept(text, m);
    return { name: m.name, matched: matched !== undefined, matchedPattern: matched };
  });

  const forbidden = fixture.should_not_include.map((phrase) => ({
    phrase,
    found: text.includes(phrase.toLowerCase()),
  }));
  const structural = checkStructuralRules(text);

  const conceptFail = concepts.filter((c) => !c.matched);
  const forbiddenFail = forbidden.filter((f) => f.found);
  const structuralFail = structural.filter((s) => !s.pass);

  const pass =
    conceptFail.length === 0 && forbiddenFail.length === 0 && structuralFail.length === 0;

  const lines: string[] = [];
  lines.push(`Fixture: ${fixture.name} (${fixture.domain})`);
  lines.push(`Schema: v${fixture.schema_version ?? 1}`);
  lines.push(`Pass: ${pass ? 'YES' : 'NO'}`);
  if (conceptFail.length) {
    lines.push(`Missing required concepts (${conceptFail.length}):`);
    conceptFail.forEach((c) => lines.push(`  - ${c.name}`));
  }
  if (forbiddenFail.length) {
    lines.push(`Banned phrases present (${forbiddenFail.length}):`);
    forbiddenFail.forEach((f) => lines.push(`  - "${f.phrase}"`));
  }
  if (structuralFail.length) {
    lines.push(`Structural failures (${structuralFail.length}):`);
    structuralFail.forEach((s) => lines.push(`  - ${s.rule} — ${s.detail ?? ''}`));
  }
  // Always report which concepts matched and by what pattern — useful for diagnosis
  const conceptsPassed = concepts.filter((c) => c.matched);
  if (conceptsPassed.length) {
    lines.push(`Matched concepts (${conceptsPassed.length}):`);
    conceptsPassed.forEach((c) =>
      lines.push(`  - ${c.name} via /${c.matchedPattern}/i`),
    );
  }

  return {
    pass,
    summary: lines.join('\n'),
    concepts,
    forbidden,
    structural,
  };
}
