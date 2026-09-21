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
    (guided.match(/beginConversation\(/g) ?? []).length >= 2,
    'every observation-level response goes through one beginConversation seam');

  add('C6-2-bound-responses-reach-editorial-runtime',
    /if \(boundTarget && onRevise\) \{ onRevise\(boundTarget, next\); return; \}/.test(begin),
    'with an exact passage, a response binds it and enters the editorial runtime');

  /* ⛔ THE DEFEAT CANDIDATE THIS KILLS: converging only the teaching-shaped
     control, which would leave four siblings on the Ask path for no reason a
     writer can see. */
  add('C6-3-convergence-not-keyed-on-prompt-text',
    !/prompt\.(includes|startsWith|indexOf)/.test(begin),
    'the bound branch is keyed on the passage, never on which button was pressed');

  /* ⭐⭐ THE RULING'S MEMBRANE. `verified && editable` is not sufficient: a
     passage with no range yields only the whole section body, and automatic
     widening is the ruling's third prohibition. */
  add('C6-4-binding-requires-an-exact-range',
    /const boundTarget = target && target\.range \? target : null;/.test(guided),
    'no exact range, no editorial binding — widening to the whole section is refused');

  add('C6-5-unbound-states-the-position-plainly',
    guided.includes('isn’t tied to one exact editable passage yet') &&
    !/no verified exact passage to bind/.test(guided),
    'the unbound notice is plain language, not binding vocabulary');

  /* ⛔ "Help me understand" must not appear where it cannot reach the governed
     Teacher path — that would make two cognition paths look like one
     capability. Structural: the prompt set renders only inside the bound
     branch, so no future label can leak across. */
  const unbound = guided.slice(guided.indexOf('This observation isn’t tied'),
                               guided.indexOf('</section>', guided.indexOf('This observation isn’t tied')));
  add('C6-6-unbound-never-offers-the-bound-vocabulary',
    /boundToPassage \? <div className="wsi-page-actions">[\s\S]{0,200}RESPONSE_PROMPTS\.map/.test(guided) &&
    !unbound.includes('Help me understand') &&
    unbound.includes('Talk about this'),
    'the bound prompt set renders only when bound; unbound offers discussion and passage choice');

  /* ⛔ THE RULING'S FIRST PROHIBITION: it is not permission to invent a locus. */
  const chooser = rebuild.slice(rebuild.indexOf('const chooseOwnPassage'),
                                rebuild.indexOf('const chooseOwnPassage') + 400);
  add('C6-7-choose-a-passage-chooses-nothing',
    /const chooseOwnPassage = useCallback/.test(rebuild) &&
    !/passages\.find|setSelected|holdPassage|reviseInsightPassage/.test(chooser),
    'the chooser moves the member to their manuscript; it selects no passage for them');

  /* ⭐ D-D, carried forward from C5. */
  add('C6-8-response-is-editable-before-sending',
    /const next = \[memberContext, prompt\]/.test(begin) &&
    !/sendEditorial|apiFetch/.test(begin) &&
    /appendEditorialNote\(prior, authorNotes\)/.test(rebuild),
    'the response seeds the editable draft; the seam sends nothing itself');

  /* ⛔ NOT A SECOND INTEGRATION, and ⛔ the runtime is never entered merely to
     reach the bridge — it is entered only where a real locus exists. */
  const bridgeCalls = (turn.match(/buildTeachingRuntimeBridge\(/g) ?? []).length;
  add('C6-9-one-teaching-bridge-call-site-unchanged',
    bridgeCalls === 1 &&
    /route: 'writers_studio_editorial'/.test(turn) &&
    /domainKey: 'writing_rhetoric'/.test(turn) &&
    !guided.includes('TeachingRuntimeBridge'),
    `editorial runtime holds exactly ${bridgeCalls} bridge call site; the surface adds none`);

  const c5 = runC5();
  add('C6-10-c5-still-green',
    c5.every(c => c.ok),
    `${c5.filter(c => c.ok).length}/${c5.length} C5 acceptance checks green`);

  return out;
}
