// Writer's Studio — Developmental Editor proof.
//
// Two obligations, per the WS-01 §2.3 discipline that a verification "must be
// shown capable of FAILING — it has to detect an introduced defect, not merely
// agree with a correct pipeline":
//
//   PART A  ground truth — the founder's predicted findings are present, at the
//           lines predicted, in the real manuscript.
//   PART B  discrimination — a doctrine-clean fixture yields NO finding for a
//           rule, and injecting exactly that defect makes exactly that rule
//           fire. A diagnostic that fires on both is not detecting anything.
//
// PART C proves the governance gate is a validated Jarvis claim, and PART D
// pins the regression where absence of the protagonist scored as compliance.
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadDoctrine, readWorkReferent, analyze, workBindingGate, compareCandidates,
  REFERENT_MODE, requireWorkBinding,
} from '../developmental-editor.mjs';
import { validateWorkerGate } from '../../builder/jarvis-governance-gate.mjs';
import { readSource, recoveryCandidates, rankCandidates, SURVIVAL } from '../recovery-lens.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const doctrine = loadDoctrine(path.join(repoRoot, 'scripts/writers-studio/doctrine/elemental-alchemy-ch10.json'));
const tmp = mkdtempSync(path.join(tmpdir(), 'devedit-'));

let pass = 0, fail = 0;
const report = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}${detail ? ' :: ' + detail : ''}`); }
  else { fail++; console.log(`FAIL  ${name}${detail ? ' :: ' + detail : ''}`); }
};
const rules = (a) => new Set(a.findings.map((f) => f.rule));
const at = (a, rule) => a.findings.filter((f) => f.rule === rule).map((f) => f.line);

const fixture = (name, body) => {
  const p = path.join(tmp, `${name}.md`);
  writeFileSync(p, body);
  return readWorkReferent({ artifact: p, label: name });
};

// ── PART A — ground truth against the real manuscript ───────────────────────
console.log('==================== PART A — founder-predicted findings ====================');
{
  const w = readWorkReferent({
    artifact: path.join(repoRoot, 'docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md'),
    fromLine: 3492, toLine: 3816, label: 'MANUSCRIPT ch10',
  });
  const a = analyze(w, doctrine);
  const r = rules(a);

  report('prediction 1 — prospective stance detected at L3519',
    at(a, 'D4.prospective-stance').includes(3519), at(a, 'D4.prospective-stance').join(','));
  report('prediction 2 — end-of-chapter forward residue detected (L3810/L3812)',
    at(a, 'D4.prospective-stance').includes(3810) && at(a, 'D4.prospective-stance').includes(3812));
  report('prediction 3 — reintroduction headings detected',
    r.has('D5.reintroduction') && at(a, 'D5.reintroduction').includes(3513),
    `${at(a, 'D5.reintroduction').length} headings`);
  report('prediction 4 — curriculum scaffolding (numbered Parts/Sections) detected',
    r.has('D3.curriculum-scaffolding'));
  report('foreground inversion detected at the chapter open',
    at(a, 'D1.foreground-inversion').includes(3492));
  report('pitch register detected ("25 years of applying this process")',
    r.has('D9.pitch-register'), `${at(a, 'D9.pitch-register').length} lines`);
  report('Aether flagged as described-not-lived', r.has('D6.element-not-embodied'));
  report('every finding cites a doctrine field',
    a.findings.every((f) => typeof f.citation === 'string' && f.citation.length > 0));
  report('every finding is line-addressable inside the referent',
    a.findings.every((f) => f.line >= w.fromLine && f.line <= w.toLine));
}

// ── PART B — discrimination: clean yields nothing, defect yields the rule ───
console.log('\n==================== PART B — capable of failing ====================');

const CLEAN = `# When the Old Life No Longer Fits

Maya did not know exactly what she wanted yet. She only knew that the life she
had built could no longer contain what was beginning to stir within her. Fire
moved in her before she had a word for it.

## Going Beneath the Surface

Water returned for Maya while she was still carrying Fire. She descended into
what hurt. Maya wept, and the weeping was not a setback.

## Giving the New Life a Body

Maya had to build something real. Earth asked for practice. Fire flared again
here, and Water came back, and Maya let them overlap without resolving them.

## Bringing It Into Relationship

Air gave Maya a voice. Water surfaced once more. Earth held. Maya spoke, and in
speaking discovered what she had been building.

## The Still Point in the Turning

Maya could not solve this. Aether was not a step she took. Maya stopped, and
something reorganized without her forcing it. Fire waited. Maya belonged.
`;

const clean = fixture('clean', CLEAN);
const cleanRules = rules(analyze(clean, doctrine));
report('doctrine-clean fixture produces no critical/major structural findings',
  !['D1.foreground-inversion', 'D1.protagonist-absent', 'D3.curriculum-scaffolding',
    'D4.prospective-stance', 'D5.reintroduction', 'D9.pitch-register', 'D7.staircase-not-spiral',
  ].some((r) => cleanRules.has(r)),
  [...cleanRules].join(',') || 'none');

const injections = [
  ['D1.foreground-inversion', `# Chapter 10\n\nIn the Spiralogic Process, Fire represents possibility.\n\n${CLEAN}`],
  ['D3.curriculum-scaffolding', CLEAN.replace('## Going Beneath the Surface', '## Part 2: Understanding the Elements\n\n### Section 1: The Elements')],
  ['D4.prospective-stance', `${CLEAN}\n\nNow let us explore each element in greater depth. We begin with Fire.\n`],
  ['D5.reintroduction', CLEAN.replace('# When the Old Life No Longer Fits', '# When the Old Life No Longer Fits\n\n## Introduction to the Spiralogic Process')],
  ['D9.pitch-register', `${CLEAN}\n\nAfter more than 25 years of applying this process with hundreds of clients, I decided to share it.\n`],
  ['D8.fifth-element-inconsistency', `${CLEAN}\n\nSpirit integrates and harmonizes all the other elements.\n`],
  ['D1.protagonist-absent', CLEAN.replace(/Maya/g, 'the dreamer').replace(/\bher\b/g, 'their')],
];

for (const [rule, body] of injections) {
  const a = analyze(fixture(rule.replace(/\W+/g, '_'), body), doctrine);
  const fired = rules(a).has(rule);
  report(`inject ${rule} → rule fires`, fired && !cleanRules.has(rule),
    fired ? `L${at(a, rule).join(',L')}` : 'NOT DETECTED');
}

// D7 needs its own clean/defect pair: the clean fixture deliberately recurs.
{
  const staircase = fixture('staircase', `# Fire\n\nMaya felt Fire.\n\n# Water\n\nMaya felt Water.\n\n# Earth\n\nMaya felt Earth.\n\n# Air\n\nMaya felt Air.\n\n# Aether\n\nMaya felt Aether.\n`);
  report('inject D7.staircase-not-spiral → rule fires on monotonic order',
    rules(analyze(staircase, doctrine)).has('D7.staircase-not-spiral'));
  report('D7 stays silent when the elements recur (the clean fixture)',
    !cleanRules.has('D7.staircase-not-spiral'));
}

// ── PART C — the gate is a validated governed claim ─────────────────────────
console.log('\n==================== PART C — governance gate ====================');
{
  const ranked = compareCandidates([clean, fixture('other', CLEAN.replace(/Maya/g, 'Mara'))], doctrine);
  const claim = workBindingGate(ranked);
  const v = validateWorkerGate(claim, { run_id: null, objective: 'x', packet: { work_unit_id: null } });
  report('work modification without a bound Work emits a VALID Jarvis gate', v.ok, v.ok ? v.gate.gate_id : `${v.refusal}: ${v.reason}`);
  report('FIXTURE_ANALYSIS needs no Work binding (findings are not provisional)',
    requireWorkBinding(REFERENT_MODE.FIXTURE_ANALYSIS, { resolved: false }).ok === true
    && requireWorkBinding(REFERENT_MODE.FIXTURE_ANALYSIS, null).ok === true);
  report('WORK_MODIFICATION without a resolved Work referent REFUSES',
    requireWorkBinding(REFERENT_MODE.WORK_MODIFICATION, { resolved: false }).ok === false);
  report('WORK_MODIFICATION with a resolved Work referent proceeds',
    requireWorkBinding(REFERENT_MODE.WORK_MODIFICATION, { resolved: true }).ok === true);
  report('gate class is FOUNDER_DECISION_REQUIRED', claim.gate_class === 'FOUNDER_DECISION_REQUIRED');
  report('gate carries no grant (never self-authorises)',
    !['approved', 'authorized', 'granted', 'delegation_id', 'resolution_id'].some((k) => k in claim));
  const bad = validateWorkerGate({ ...claim, approved: true }, { run_id: null, objective: 'x', packet: {} });
  report('a gate that carries a grant is REFUSED', !bad.ok && bad.refusal === 'GATE_SELF_GRANT', bad.refusal);
}

// ── PART D — regression pin ─────────────────────────────────────────────────
console.log('\n==================== PART D — regression: silence is not compliance ====================');
{
  const empty = fixture('no_protagonist', '# Chapter 10\n\nThe dream arrived as a crystalline mandala. Everything had been pointing here.\n');
  const a = analyze(empty, doctrine);
  report('a referent with no protagonist raises a CRITICAL, not a clean pass',
    rules(a).has('D1.protagonist-absent') && a.counts.critical > 0,
    `crit=${a.counts.critical}`);
  const ranked = compareCandidates([clean, empty], doctrine);
  report('the protagonist-less referent does not outrank the compliant one',
    ranked[0].label === 'clean', ranked.map((r) => `${r.label}:${r.penalty}`).join(' '));
}

// ── PART E — fixture/Work separation and observation discipline ────────────
console.log('\n==================== PART E — fixture is not the Work; observations are not verdicts ====================');
{
  const manifest = JSON.parse(readFileSync(path.join(repoRoot, 'scripts/writers-studio/works/elemental-alchemy-ch10.json'), 'utf8'));
  report('manifest declares a fixture referent, not a decided Work',
    !!manifest.fixture_referent && !('decided_referent' in manifest));
  report('Work referent is explicitly unresolved / out of scope',
    manifest.work_referent?.resolved === false && /UNRESOLVED/.test(manifest.work_referent?.status ?? ''));
  report('fixture selection explicitly disclaims canonicity',
    /not thereby declared canonical|asserts NOTHING/i.test(manifest.fixture_referent?.not_a_claim ?? ''));
  report('protagonist doctrine is recorded as settled by the founder',
    manifest.protagonist_doctrine?.settled === true && manifest.protagonist_doctrine?.authority === 'Founder');
  report('the drafts are a comparison corpus, not candidates for the Work',
    Array.isArray(manifest.comparison_corpus) && !('candidates' in manifest));

  // D11 discriminates shape, not head-count.
  const subordinating = fixture('subordinating', `# Fire

The Spiralogic Process represents a developmental sequence that organises human
growth into five elemental movements. Fire is the realm of If, and it stands for
possibility in the model. Fire is defined as the activating principle, the first
of the three states, and it refers to the moment when inspiration precedes any
capacity to act on it. The model holds that this movement must be understood
before the others can be approached, because each element depends on the one
before it in the developmental order described throughout this process.

For example, Maya felt this. Maya changed her life. Maya moved on, and her
experience illustrates the principle that has just been described here.
`);
  const carrying = fixture('carrying', `# When the Old Life No Longer Fits

Maya did not know exactly what she wanted yet. She only knew that the life she
had built could no longer contain what was beginning to stir within her. Maya
noticed it first in small refusals — a meeting she could not sit through, a plan
she could not bring herself to make. New possibilities became visible everywhere:
people she wanted to meet, work she wanted to do, parts of herself she wanted to
recover. Maya did not yet have language for any of it, and she did not look for
language. She simply found that she could no longer pretend the disturbance was
temporary, and she let it stay.

In the Spiralogic Process I think of this as Fire: it is the realm of If.

Maya kept moving.
`);
  const sub = analyze(subordinating, doctrine).findings.find((f) => f.rule === 'D11.subordination-pattern');
  const car = analyze(carrying, doctrine).findings.find((f) => f.rule === 'D11.subordination-pattern');
  report('D11 reads a principle-first section as subordinating', sub?.excerpt === 'subordinating', sub?.excerpt);
  report('D11 reads a lived-first section as carrying', car?.excerpt === 'carrying', car?.excerpt);
  report('D11 flags the protagonist introduced as an example',
    rules(analyze(subordinating, doctrine)).has('D11.protagonist-as-example'));
  report('subordination findings are OBSERVATIONS, never verdicts',
    [sub, car].every((f) => !f || f.severity === 'observation'));

  const a = analyze(subordinating, doctrine);
  const ranked2 = compareCandidates([subordinating, carrying], doctrine);
  report('observations do not score or rank',
    a.observations.count > 0 && ranked2.every((r) => !('observation' in r)),
    `observations=${a.observations.count}`);
}

// ── PART F — recovery lens ─────────────────────────────────────────────────
console.log('\n==================== PART F — recovery lens ====================');
{
  const fx = readWorkReferent({
    artifact: path.join(repoRoot, 'docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md'),
    fromLine: 3492, toLine: 3816, label: 'fixture',
  });
  const a = analyze(fx, doctrine);
  const src = readSource(path.join(repoRoot, 'docs/book-studio/sources/SPIRALOGIC_CHAPTER_9_ORIGINAL.md'), 'ch9');
  const cands = rankCandidates(recoveryCandidates(src, fx, doctrine, a.findings));
  const find = (frag) => cands.find((c) => c.excerpt.includes(frag));

  const dream = find('holding onto some roots');
  report('the river dream is detected as ABSENT from the fixture',
    dream?.state === SURVIVAL.ABSENT, dream ? `survival ${dream.survival}` : 'NOT FOUND');
  report('the river dream repairs D6 for aether — matched by MOVEMENT, not by the word',
    !!dream?.repairs.some((r) => r.rule === 'D6.element-not-embodied')
    && !dream.elements.includes('aether'),
    dream?.repairs.map((r) => r.rule).join(','));

  const tree = find('tree house');
  report('the treehouse passage is detected as a spiral-recurrence demonstration',
    !!tree?.repairs.some((r) => /spiral_recurrence|D7/.test(r.rule)) && tree.returns >= 1,
    tree ? `${tree.elements.length} elements, ${tree.returns} return(s)` : 'NOT FOUND');

  report('pitch-register material is marked do-NOT-recover, never recommended',
    cands.some((c) => c.pitch) && cands.filter((c) => c.pitch).every((c) => rankCandidates(cands).indexOf(c) >= cands.filter((x) => x.repairs.length).length));

  // Capability to NOT fire: material that survived must not be reported as lost.
  const surviving = fx.lines.filter((l) => l.trim().split(/\s+/).length > 40)[0];
  const echo = readSource(path.join(repoRoot, 'docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md'), 'self');
  const selfCands = recoveryCandidates(echo, fx, doctrine, a.findings);
  const fixtureOwn = selfCands.filter((c) => c.line >= 3492 && c.line <= 3816);
  report('the lens does not report the fixture\'s OWN passages as lost',
    fixtureOwn.length === 0, `${fixtureOwn.length} false losses out of ${3816 - 3492} fixture lines`);
  report('a passage present verbatim in the fixture scores as PRESENT (not absent)',
    !!surviving && recoveryCandidates({ text: surviving }, fx, doctrine, []).length === 0);
}

console.log(`\n${pass} passed · ${fail} failed`);
process.exit(fail ? 1 : 0);
