/**
 * WS-CONVERGENCE-01 · C6 — OBSERVATION LAYER CONVERGENCE.
 *
 * ⭐ The law this gate holds: every response the writer can give to an
 * observation must reach the SAME cognition as `Talk about it` inside the
 * passage desk — the governed editorial runtime, and through it the Teaching
 * bridge. ⛔ Not "Help me understand alone": the bypass was the LAYER, and a
 * fix that converged one of five siblings would leave four behaving
 * differently for no reason the writer can see.
 *
 * ⛔ NOT a second Teaching integration. The bridge has exactly one call site
 * in the editorial runtime and this lane does not add another.
 */
import { readFileSync } from 'fs';
import { runC5 } from './convergenceC5';

export interface Check { readonly id: string; readonly ok: boolean; readonly detail: string }
const read = (p: string) => readFileSync(p, 'utf8');
const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const src = (p: string) => stripComments(read(p));

const GUIDED = 'app/writers-studio/insight/InsightReading.tsx';
const TURN = 'lib/manuscript/editorialRuntime/turn.ts';
const REBUILD = 'app/writers-studio/rebuild/RebuildStudioClient.tsx';

export function runC6(): readonly Check[] {
  const out: Check[] = [];
  const add = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });
  const guided = src(GUIDED);
  const turn = src(TURN);
  const rebuild = src(REBUILD);

  /* ⭐ ONE entry point for every observation-level response, so the five
     controls cannot drift apart. The gate asserts the shape, not the count of
     buttons — a sixth response added later inherits the convergence. */
  const begin = guided.slice(guided.indexOf('const beginConversation'),
                             guided.indexOf('const tryRevision'));
  add('C6-1-single-conversation-entry',
    /RESPONSE_PROMPTS\.map/.test(guided) &&
    (guided.match(/beginConversation\(/g) ?? []).length >= 2 &&
    !/onClick=\{\(\) => \{[^}]*setTalking\(true\)/.test(guided),
    'every observation-level response goes through one beginConversation seam');

  add('C6-2-bound-responses-reach-editorial-runtime',
    /if \(target && onRevise\) \{ onRevise\(target, next\); return; \}/.test(begin),
    'with an exact passage, a response binds the passage and enters the editorial runtime');

  /* ⛔ THE DEFEAT CANDIDATE THIS KILLS: converging only the teaching-shaped
     control. If the bound branch were guarded by the prompt text, the other
     four would silently stay on the Ask path. */
  add('C6-3-convergence-not-keyed-on-prompt-text',
    !/Help me understand[\s\S]{0,120}onRevise/.test(begin) &&
    !/prompt\.(includes|startsWith|indexOf)/.test(begin),
    'the bound branch is keyed on the passage, never on which button was pressed');

  add('C6-4-unbound-case-is-declared',
    guided.includes('no verified exact passage to bind here'),
    'an unbound conversation says so rather than reaching a different mind silently');

  /* ⭐ D-D, carried forward from C5: the member's own words land in the
     EDITABLE draft for this turn. ⛔ Nothing is auto-sent, so the direction and
     the response both stay removable before anything leaves the surface. */
  add('C6-5-response-is-editable-before-sending',
    /onRevise\(target, next\)/.test(begin) &&
    /const next = \[memberContext, prompt\]/.test(begin) &&
    !/sendEditorial|apiFetch/.test(begin),
    'the response seeds the editable draft; the seam sends nothing itself');

  add('C6-6-member-context-reaches-the-draft-not-the-wire',
    /appendEditorialNote\(prior, authorNotes\)/.test(rebuild) &&
    /setEditorialDraft\(combined\)/.test(rebuild),
    'authorNotes are appended to the editorial draft, never posted directly');

  /* ⛔ NOT A SECOND INTEGRATION. */
  const bridgeCalls = (turn.match(/buildTeachingRuntimeBridge\(/g) ?? []).length;
  add('C6-7-one-teaching-bridge-call-site-in-the-editorial-runtime',
    bridgeCalls === 1 &&
    /route: 'writers_studio_editorial'/.test(turn) &&
    /domainKey: 'writing_rhetoric'/.test(turn),
    `editorial runtime holds exactly ${bridgeCalls} bridge call site, unchanged`);

  add('C6-8-guided-surface-adds-no-teaching-integration',
    !guided.includes('buildTeachingRuntimeBridge') &&
    !guided.includes('TeachingRuntimeBridge'),
    'the observation surface routes to the runtime; it does not integrate teaching itself');

  const c5 = runC5();
  add('C6-9-c5-still-green',
    c5.every(c => c.ok),
    `${c5.filter(c => c.ok).length}/${c5.length} C5 acceptance checks green`);

  return out;
}
