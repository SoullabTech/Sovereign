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
import ts from 'typescript';
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
const REVIEW = 'lib/writersStudio/rebuild/chapterReview.ts';
const DEPTH = 'lib/writersStudio/editorialDepth.ts';
const CONTRACT = 'lib/manuscript/developmentalReader/contract.ts';
const RENDER = 'lib/manuscript/developmentalReader/render.ts';
const STAGES = 'lib/manuscript/developmentalReading/commission.ts';

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
  const review = src(REVIEW);
  const depth = src(DEPTH);
  const depthRaw = read(DEPTH);
  const contractRaw = read(CONTRACT);
  const contractFile = ts.createSourceFile(
    CONTRACT, contractRaw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS,
  );
  const requestNode = contractFile.statements.find(
    (statement): statement is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(statement) && statement.name.text === 'DevelopmentalReaderRequest',
  ) ?? null;
  const requestFields = requestNode
    ? requestNode.members
        .filter(ts.isPropertySignature)
        .map((member) => member.name.getText(contractFile).replace(/^['"]|['"]$/g, ''))
    : [];
  const requestContract = requestNode?.getText(contractFile) ?? '';
  const render = read(RENDER);
  const stages = src(STAGES);

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

  /* ⭐ A reading lost at the storage boundary is not a reading MAIA could not
     do, and the writer who waited out the read is owed that difference. */
  add('C6R2-14-failure-copy-distinguishes-where-it-was-lost',
    /freeze: '[^']*finished reading[^']*could not be finalized/.test(rebuild) &&
    /store: '[^']*finished reading[^']*could not be recorded/.test(rebuild) &&
    /capture: '[^']*could not open this part of your Work/.test(rebuild) &&
    /recover: '[^']*could not open this part of your Work/.test(rebuild),
    'a read that completed and failed after reading no longer reads as a read that never opened');

  add('C6R2-15-failure-copy-leaks-no-internals',
    !/trigger|validator|constraint|schema_migrations|postgres|SQLSTATE/i.test(
      rebuild.slice(rebuild.indexOf('const reviewFailureCopy'),
                    rebuild.indexOf('const visibleReviewFindings'))),
    'the writer is told where the reading was lost, never the internals of why');

  /* ⭐⭐ THE TAXONOMY MUST COVER EVERY STAGE THE PIPELINE CAN REFUSE AT. A
     partial map that LOOKS complete is worse than none: it reads as though the
     unnamed cases cannot happen. Derived from the contract, ⛔ never a list
     kept in step by hand. */
  const declared = (stages.match(/export type CommissionStage = ([^;]+);/)?.[1] ?? '')
    .split('|').map((x) => x.trim().replace(/'/g, '')).filter(Boolean);
  add('C6R3-1-every-commission-stage-is-named',
    declared.length === 6 && declared.every((st) => new RegExp(`\\b${st}:`).test(rebuild)),
    `stages covered: ${declared.filter((st) => new RegExp(`\\b${st}:`).test(rebuild)).join(', ')}`);

  add('C6R3-2-unknown-stage-has-an-honest-floor',
    /'': '[^']*could not be confirmed/.test(rebuild),
    'an unobserved stage says so rather than borrowing a stage name');

  /* ⭐ Stop rather than grind through calls already doomed — ⛔ and never retry. */
  add('C6R3-3-sequence-stops-on-upstream-failure',
    /if \(upstream\(failure\)\) \{/.test(review) && /break;/.test(review),
    'one upstream failure ends the sequence instead of producing three more');

  add('C6R3-4-contract-refusals-do-not-stop-the-sequence',
    /f\.attribution !== 'contract_violation'/.test(review),
    'a lawful lens-specific refusal predicts nothing about the next lens and does not stop it');

  add('C6R3-5-remaining-is-not-a-failure-list',
    /remaining: DevelopmentalLens\[\]/.test(read(REVIEW)) &&
    /remaining = lenses\.slice\(i \+ 1\)/.test(review),
    'lenses never asked for are recorded apart from lenses that refused');

  add('C6R3-6-resuming-is-a-member-gesture-over-unasked-lenses',
    /data-continue-remaining/.test(rebuild) &&
    /runReview\(review!\.remaining\)/.test(rebuild) &&
    !/retry|attempt\s*\+\+|backoff/i.test(review),
    'continuing commissions only what was never asked; nothing re-commissions a refusal');

  add('C6R3-7-manifest-refusal-is-preserved',
    /setReviewManifestRefusal\(kept\.refusal\)/.test(rebuild),
    'the manifest refusal code is kept rather than reconstructed from the database');

  /* ⛔⛔ THE FAILURE CONDITION FACETS-01 NAMES AS THE SHARPEST: a facet that
     changes how much prose MAIA authored. Every depth carries the clause. */
  add('C6R4-1-authorship-is-depth-invariant',
    (depth.match(/Do not write more of my prose than you would at any other depth/g) ?? []).length === 3,
    'all three depths forbid MAIA writing more of the member’s prose');

  /* ⭐⭐ NO CLASSIFIER, SO NO LABEL CAN ACCUMULATE. Structural, not a rule. */
  add('C6R4-2-no-style-classifier-exists',
    !/sentenceLength|detectStyle|classifyWriter|styleProfile|readingLevel/i.test(depth) &&
    !/localStorage|apiFetch|query\(|INSERT/i.test(depth),
    'nothing measures, derives or stores a style — adaptation cannot outlive the turn');

  add('C6R4-3-richer-language-never-licenses-a-stronger-claim',
    /never licenses a stronger claim/.test(depth),
    'style may change the language; it may not change what the evidence supports');

  add('C6R4-4-no-classification-of-the-member',
    /Do not describe, classify, rate or comment on me as a writer/.test(depth) &&
    /Do not infer my education, profession, experience or ability/.test(depth),
    'MAIA may describe the writing; she may never characterise the writer');

  /* ⭐ The writer's correction outranks the dial, and ⛔ MAIA never moves it. */
  add('C6R4-5-attunement-is-repairable-in-conversation',
    /too technical, too simplified/.test(depth) &&
    /NOT WRITTEN BACK TO THE DIAL/.test(depthRaw),
    'a said correction is honoured at once and never rewrites a member-declared setting');

  add('C6R4-6-three-signals-are-not-collapsed',
    /DEPTH_DIRECTIVE\[depth\], STYLE_RESPONSIVE_DIRECTIVE, ATTUNEMENT_DIRECTIVE/.test(depth),
    'manuscript, conversation and depth are composed as three separate signals');

  /* ⛔ One place, so no turn can escape the translation standard. */
  add('C6R4-7-every-turn-carries-the-directive',
    /const exactWords = `\$\{requestText \?\? editorialDraft\}[\s\S]{0,40}editorialDirective\(editorialDepth\)/.test(rebuild),
    'the directive is appended in the single turn seam, not threaded through callers');

  add('C6R4-8-depth-is-declared-not-assigned',
    /DEFAULT_EDITORIAL_DEPTH: EditorialDepth = 'guided'/.test(depth) &&
    /onDepth\(d\)/.test(desk) &&
    !/setEditorialDepth\(/.test(rebuild.slice(rebuild.indexOf('const sendEditorial'), rebuild.indexOf('const applySuggested'))),
    'the default is identical for everyone and only the member moves it');

  /* ⭐⭐ C6R5 — THE READER MAY THINK TECHNICALLY; ITS OBSERVATION SPEAKS PLAINLY.
     ⛔ The boundary is unchanged and is the first thing checked: the depth dial
     must never reach the reader, or how a writer wants a thing EXPLAINED would
     start changing what MAIA NOTICES. */
  add('C6R5-1-reader-request-boundary-unchanged',
    JSON.stringify(requestFields) === JSON.stringify(['commissionedLens', 'evidence', 'recovered']),
    `DevelopmentalReaderRequest: ${requestFields.join(', ')}`);

  add('C6R5-2-no-depth-or-profile-reaches-the-reader',
    !/depth|writerLevel|styleProfile|experience|skillLevel|preferences|compass|conversation/i
      .test(requestContract) &&
    !/editorialDepth|EditorialDepth/.test(src(RENDER)),
    'no depth, level, style, preference, Compass or conversation field enters the reader');

  add('C6R5-3-plain-language-is-the-default-expression',
    /write the claim in plain language/.test(render) &&
    /Say the thing itself rather than naming the device/.test(render),
    'the reader is required to speak plainly by default, not on request');

  add('C6R5-4-translation-never-reduces',
    /Translate the noticing; never reduce it/.test(render) &&
    /Plain language is not permission to notice less/.test(render) &&
    /change no evidence reference and no non-conclusion/.test(render),
    'same claims, same tradeoffs, same evidence and non-conclusions — only the telling changes');

  add('C6R5-5-reader-adapts-to-prose-never-to-the-author',
    /describe only the WRITING/.test(render) &&
    /Never describe, classify, rate or infer anything about the AUTHOR/.test(render) &&
    /it never lets you claim more than the evidence carries/.test(render),
    'register may follow the prose; nothing may be inferred about the person');

  add('C6R5-6-no-writing-style-state-is-persisted',
    !/localStorage|INSERT|UPDATE |writer_style|style_profile/i.test(src(RENDER)) &&
    !/localStorage|INSERT INTO/i.test(depth),
    'no style is stored anywhere; adaptation cannot outlive the turn that made it');

  add('C6R5-7-no-observation-schema-change',
    !/ALTER TABLE|CREATE TABLE/i.test(render),
    'the expression discipline is prompt-level; no schema or migration moved');

  /* ⭐ `Go deeper` must unpack the observation that exists, ⛔ never commission
     a second reading — that would be three readings wearing one identity. */
  add('C6R5-8-changing-depth-commissions-no-reading',
    /onDepth\(d\)/.test(desk) &&
    !/runChapterReview|requestDevelopmentalReading/.test(
      desk.slice(desk.indexOf('DEPTH_CHOICES.map'), desk.indexOf('DEPTH_CHOICES.map') + 500)),
    'the depth control asks the editorial turn to re-explain; it reads nothing again');

  /* ⭐⭐ C6R5A — THE TWO PROVENANCE FACTS ARE INDEPENDENT AND NEITHER
     SUBSTITUTES FOR THE OTHER. `readerVersion` names the human-readable
     contract GENERATION; `promptHash` identifies the exact contract INSTANCE.
     ⭐ The version is not inside READER_SYSTEM, so bumping it leaves the hash
     untouched — which is the proof that they are separate facts rather than
     one fact spelled twice. */
  add('C6R5A-1-reader-version-is-06',
    /export const READER_VERSION = 'DEVELOPMENTAL-READER-06';/.test(render),
    'the human-readable contract generation tells the truth at a glance');

  add('C6R5A-2-version-is-not-part-of-the-hashed-prompt',
    !/DEVELOPMENTAL-READER/.test(render.match(/READER_SYSTEM = `([\s\S]*?)`;/)?.[1] ?? '') &&
    /update\(READER_SYSTEM, 'utf8'\)/.test(render),
    'the prompt hash still derives from the prompt alone, automatically');

  /* ⚠️ A FIXTURE IS NOT AN EXPECTATION. `refusalTruth` builds a stored refusal
     record carrying `DEVELOPMENTAL-READER-05` and a fake hash — it stands for a
     record written under the previous generation, and bumping it would erase
     the only place the suite shows two generations coexisting. ⛔ Historical
     records are never rewritten to match the current contract. */
  add('C6R5A-3-historical-records-keep-their-own-generation',
    /readerVersion: 'DEVELOPMENTAL-READER-05', promptHash: 'abc'/
      .test(read('lib/manuscript/developmentalReading/__tests__/refusalTruth.test.ts')),
    'a record from the previous contract still says so; nothing was backfilled');

  /* ⭐⭐ C6R6 — THE HUMAN WITNESS FOUND WHAT NO CHECK HERE COULD.
     Direct said `214 nominalizes With into a stage or term in the system` where
     the evidence established only that the wording changed and a clause was
     added. ⭐ The naming was apt; the CERTAINTY was not — and editorial
     vocabulary is the vehicle, because a strong claim in confident terminology
     reads as expertise. */
  add('C6R6-1-direct-may-not-promote-an-interpretation',
    /Keep the epistemic status of every claim exactly what the evidence supports/.test(depth) &&
    /does not establish a claim about the Work/.test(depth),
    'the depth that licenses the vocabulary is the depth that refuses the promotion');

  add('C6R6-2-promotion-guard-is-directs-alone',
    !/Keep the epistemic status/.test(depth.slice(depth.indexOf('guided: ['), depth.indexOf('direct: ['))),
    'Guided and Learning are not given a rule about vocabulary they do not use');

  /* ⚠️⚠️ THE SEQUENTIAL HALF, which a per-depth rule alone would have missed:
     Guided did exactly what it was asked — preserved the substance — and
     carried the overstatement forward as established. So the guard must hold
     at the depth that INHERITS, not only where the inflation began. */
  add('C6R6-3-no-depth-inherits-an-unsupported-claim',
    /do not carry it forward as one/.test(depth) &&
    /Treat nothing said earlier in this conversation as established merely because it was said confidently/.test(depth),
    'preserving substance never means preserving an epistemic mistake as fact');

  add('C6R6-4-integrity-holds-at-every-depth',
    /EPISTEMIC_INTEGRITY_DIRECTIVE,\n  \]\.join/.test(depthRaw) &&
    /Changing how deeply you explain never changes how certain a claim is entitled to be/.test(depth),
    'the guard is composed into all three depths, not attached to one');

  const c5 = runC5();
  const reusableC5 = c5.filter(c => c.id !== 'C5-19-no-new-revision-substrate');
  add('C6-10-c5-still-green',
    reusableC5.every(c => c.ok),
    `${reusableC5.filter(c => c.ok).length}/${reusableC5.length} reusable C5 invariants green; C5-19 remains the historical C5 containment record`);

  return out;
}
