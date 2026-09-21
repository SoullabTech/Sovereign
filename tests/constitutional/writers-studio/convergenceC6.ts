/**
 * WS-CONVERGENCE-01 · C6 — OBSERVATION LAYER CONVERGENCE.
 *
 * ⭐ The law this gate holds: every response offered against an EXACT verified
 * editable passage must reach the SAME cognition as `Talk about it` inside
 * the passage desk — the governed editorial runtime, and through it the
 * Teaching bridge. Where no exact range exists, the declared observation
 * dialogue fallback remains lawful and must not imply that Teacher is active.
 * ⛔ Not "Help me understand alone": the bypass was the bound response LAYER.
 *
 * ⛔ NOT a second Teaching integration. The bridge has exactly one call site
 * in the editorial runtime and this lane does not add another.
 */
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { runC5 } from './convergenceC5';
import {
  editorialSegments, editIds, composeSelected, altersProtectedText,
} from '../../../lib/writersStudio/editorialDiff';

export interface Check { readonly id: string; readonly ok: boolean; readonly detail: string }
const read = (p: string) => readFileSync(p, 'utf8');
const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const src = (p: string) => stripComments(read(p));

const GUIDED = 'app/writers-studio/insight/InsightReading.tsx';
const TURN = 'lib/manuscript/editorialRuntime/turn.ts';
const REBUILD = 'app/writers-studio/rebuild/RebuildStudioClient.tsx';
const DIFF = 'lib/writersStudio/editorialDiff.ts';
const PASSAGE = 'app/writers-studio/insight/ManuscriptPassage.tsx';
const DESK = 'app/writers-studio/insight/RevisionDesk.tsx';
const ADOPTION = 'lib/manuscript/editorialRuntime/adoption.ts';

export function runC6(): readonly Check[] {
  const out: Check[] = [];
  const add = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });
  const guided = src(GUIDED);
  const turn = src(TURN);
  const rebuild = src(REBUILD);
  const diff = src(DIFF);
  const passage = src(PASSAGE);
  const desk = src(DESK);
  const adoption = src(ADOPTION);

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

  /* ⭐⭐ C6R1 — the page is marked, not replaced. */
  add('C6R1-1-no-single-span-diff-in-the-editorial-surfaces',
    !passage.includes('comparisonSpan') && !desk.includes('comparisonSpan') &&
    passage.includes('editorialSegments') && desk.includes('editorialSegments'),
    'both editorial surfaces render word-level segments, not one replacement span');

  add('C6R1-2-composing-declines-to-the-original',
    /if \(s\.kind === 'del' && !take\) out \+= s\.text;/.test(diff),
    'an unselected change falls back to the author’s words — declining is not an edit');

  add('C6R1-3-protected-spans-are-never-composable',
    /if \(s\.protectedSpan\) \{ if \(s\.kind === 'del'\) out \+= s\.text; continue; \}/.test(diff) &&
    /if \(s\.editId !== null && !s\.protectedSpan\) seen\.add/.test(diff),
    'a detected quotation is restored verbatim and is offered as no member choice');

  /* ⛔ THE LETHAL CASE: one character altered inside an attributed quotation. */
  add('C6R1-4-adoption-guard-refuses-whole',
    /export function altersProtectedText/.test(diff) &&
    /editorialSegments\(original, proposed\)\.some\(\(s\) => s\.protectedSpan\)/.test(diff),
    'a proposal altering protected text is refused whole, never trimmed to its lawful part');

  /* ⚠️ The detector is partial and must never be reported as quote custody. */
  add('C6R1-5-detector-declares-itself-partial',
    diff.includes('never reaches this path') || /A PARTIAL INSTRUMENT/.test(read(DIFF)),
    'the quotation detector states in source that it is detection, not preserved identity');

  add('C6R1-6-one-workspace-once-a-proposal-exists',
    /proposalActive \? <details className="wsi-reading-behind"/.test(guided) &&
    /\{!proposalActive && <div className="wsi-page-actions">/.test(guided) &&
    /proposalActive=\{Boolean\(suggestedVersionId\)\}/.test(rebuild),
    'with a live proposal the reading becomes disclosure, not a second live workspace');

  add('C6R1-7-rangeless-try-a-revision-leak-closed',
    /if \(!boundTarget\) return;/.test(guided) &&
    !/\{target && onRevise &&/.test(guided),
    'Try a revision requires boundTarget; the whole-section widening leak is closed');

  /* ⭐ Five choices on one mark, and ⛔ none of them a new mutation path. */
  add('C6R1-8-per-edit-actions-use-the-governed-turn',
    /const editAction = useCallback/.test(rebuild) &&
    /void sendEditorial\(ask\);/.test(rebuild) &&
    !/adoptBound|editorial\/adoption|saveMemberVersion/.test(
      rebuild.slice(rebuild.indexOf('const editAction'), rebuild.indexOf('const reviseInsightPassage'))),
    'accept · change · challenge · learn all enter the existing editorial turn; none applies text');

  const editAction = rebuild.slice(rebuild.indexOf('const editAction'),
                                  rebuild.indexOf('const reviseInsightPassage'));
  add('C6R1-9-keep-mine-mutates-nothing',
    /if \(action === 'accept' \|\| action === 'keep'\)/.test(editAction) &&
    /if \(action === 'accept'\) next\.add\(edit\.id\); else next\.delete\(edit\.id\);/.test(editAction) &&
    editAction.indexOf('return;') < editAction.indexOf('void sendEditorial(ask)'),
    'Keep mine only removes the mark from the working set; it sends nothing and changes no manuscript text');

  add('C6R1-10-related-workspace-closes-once-proposed',
    /<details className="wsi-related" open=\{!suggestedVersionId\}>/.test(rebuild),
    'the observation workspace is no longer forced open under the decision');

  /* ⛔⛔ THE BLOCKER THIS CLOSES: the helper existed and NOTHING CALLED IT, so
     a quotation could look protected on the page and still be applied. A
     browser check is not a guard. */
  const beforeAct1 = adoption.slice(0, adoption.indexOf('ACT 1 · THE PERMISSION'));
  add('C6R2-1-adoption-calls-the-guard-before-authorizing',
    /altersProtectedText\(/.test(beforeAct1) &&
    /kind: 'protected_quotation'/.test(beforeAct1),
    'the live adoption path refuses before authorizeVersion — no permission is minted');

  add('C6R2-2-refusal-is-whole',
    !/slice|substring|trim\(\)\.replace/.test(
      adoption.slice(adoption.indexOf('altersProtectedText('),
                     adoption.indexOf('ACT 1 · THE PERMISSION'))),
    'the refusal returns; it never trims the proposal to its lawful remainder');

  /* ⭐ BEHAVIOURAL, not textual. These execute the module. */
  const orig = 'He wrote, \u201Cthe world is all that is the case,\u201D and left it there.';
  const bad = 'He wrote, \u201Cthe world is all that was the case,\u201D and left it there.';
  const good = 'He wrote, \u201Cthe world is all that is the case,\u201D then moved on.';
  add('C6R2-3-one-character-inside-a-quotation-is-refused',
    altersProtectedText(orig, bad) === true,
    'a proposal differing by one character inside the quotation is caught');
  add('C6R2-4-prose-around-a-quotation-stays-editable',
    altersProtectedText(orig, good) === false,
    'revising the writer’s own words around a quotation is not refused');

  const o2 = 'The elements rarely exist separately, shaping one another.';
  const p2 = 'The elements continually move in relationship, shaping one another.';
  const segs = editorialSegments(o2, p2);
  add('C6R2-5-selected-all-is-maia-proposal',
    composeSelected(segs, new Set(editIds(segs))) === p2,
    'taking every mark reproduces MAIA’s wording exactly');
  add('C6R2-6-selected-none-is-byte-identical-original',
    composeSelected(segs, new Set()) === o2,
    'taking no mark returns the author’s words byte for byte — declining is not an edit');
  add('C6R2-7-protected-edits-are-never-selectable',
    editIds(editorialSegments(orig, bad)).length === 0,
    'a change inside a quotation is offered as no member choice at all');

  /* ⭐⭐ C6R2 — ACCEPT SELECTS; IT DOES NOT CALL MAIA AND DOES NOT MUTATE. */
  const act = rebuild.slice(rebuild.indexOf('const editAction'), rebuild.indexOf('const ask ='));
  add('C6R2-8-accept-and-keep-never-call-maia',
    /if \(action === 'accept' \|\| action === 'keep'\)/.test(act) &&
    !/sendEditorial|apiFetch|adoptBound/.test(act),
    'accept and keep only move the working set — no model turn, no mutation');

  add('C6R2-9-selection-is-not-persisted-per-click',
    !/saveMemberRevision|editorial\/version/.test(act),
    'no version is minted on a click; the decision persists once, at Use selected changes');

  /* ⭐ The provenance rule: all marks taken is MAIA's proposal, not the writer's. */
  add('C6R2-10-all-marks-adopts-maia-not-a-duplicate',
    /if \(composition\.everyMark\) \{ await applySuggested\(\); return; \}/.test(rebuild),
    'taking every mark adopts MAIA’s existing version rather than minting a copy');

  add('C6R2-11-subset-is-member-authored',
    /await saveMemberRevision\(\{[\s\S]{0,160}text: composition\.text,/.test(rebuild),
    'a subset goes through the member-version route and carries the writer’s authorship');

  add('C6R2-12-selection-resets-with-the-proposal',
    /setSelectedEdits\(new Set\(\)\); \}, \[suggestedVersionId\]\)/.test(rebuild),
    'marks chosen against one wording cannot silently mean another');

  add('C6R2-13-adjusting-edits-the-composition',
    /const base = composedText \?\? version\.wording;/.test(desk),
    'Adjust wording opens what the page is showing, not MAIA’s whole proposal');

  /* ⭐ C5-19 was an opening-packet containment check measured against the C5
     base. C6R2 lawfully modifies the EXISTING adoption route to add a refusal,
     so a descendant cannot keep passing "no editorial route changed since C5".
     Preserve C5-19 historically; replace it here with the descendant law:
     existing seams may tighten, but C6 creates no new route/table/substrate. */
  const substrateDelta = execSync(
    'git diff --name-status d519f5165..HEAD -- database/migrations app/api/writers-studio/editorial lib/manuscript/revisionAuthorization lib/manuscript/proposalChain',
    { encoding: 'utf8' },
  ).trim().split('\n').filter(Boolean);
  const newSubstrate = substrateDelta.filter((line) => /^(A|C|R)/.test(line));
  add('C6R2-14-no-new-revision-substrate',
    newSubstrate.length === 0,
    `new route/table/substrate entries: ${newSubstrate.join(', ') || 'none'}`);

  const c5 = runC5();
  const reusableC5 = c5.filter(c => c.id !== 'C5-19-no-new-revision-substrate');
  add('C6-10-c5-still-green',
    reusableC5.every(c => c.ok),
    `${reusableC5.filter(c => c.ok).length}/${reusableC5.length} reusable C5 invariants green; C5-19 remains the historical C5 containment record`);

  return out;
}
