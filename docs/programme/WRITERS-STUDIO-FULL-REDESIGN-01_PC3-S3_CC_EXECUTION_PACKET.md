# JARVIS-WRITERS-STUDIO-FULL-REDESIGN-01 · PC3-S3 — CC EXECUTION PACKET
## WRITE RESTING + FULL-CANVAS IMPLEMENTATION ONLY

**Standing:** EXECUTABLE · fixture-only · STOP BEFORE MERGE / DEPLOY · founder adjudication required  
**Issued:** 2026-09-24  
**Exact base / custody commit:** `fa151298997380fd5e4c76beef22b0afb6dc5662`  
**Required parent chain:** `e8868884 → b8a3656a2 → 9995c785b → c01d19085 → d7501001e → fa1512989`  
**Canonical awareness only:** `clean-main-no-secrets@e886888416062c7fcbcf899040e3827bc8013835`; do not rebase the accepted PC3 lineage.

### 1. Custodied founder authority
- Path: `docs/design/writers-studio/founder-reference-corpus/s3-visual-authority/a_clean_multi_panel_ui_ux_design_composite_with_fi.png`
- Custody commit: `fa151298997380fd5e4c76beef22b0afb6dc5662`
- SHA-256: `982b363b158a47d229c3efcb634be0ee09e722a7810df33a500a51de8058b5d9`
- Bytes: `1855655`
- The instrument MUST read the reference from Git (`git show <commit>:<path>`) and refuse on SHA or byte mismatch.
- The five labelled regions of this one PNG are the five authorities: S3-A Light Write Resting; S3-B Light Full Canvas; S3-C Night Write Resting; S3-D Night Full Canvas; S3-E Transition & Return Continuity.
### 2. Founder adjudication carried with the pixels
The governing experiential law is: **Entering full canvas changes the field, not the work.**  
The behavioural law is: **One editor. More room. No loss.**

Explicit law outranks incidental image-generation artifacts. Record these exact non-specification notes:
- Night is governed to have the same chapter tree as Light, Chapters 6–12; generated Night chapter text/omission has no authority.
- S3-E's generated caption typo (`passag e`) has no semantic standing.
- No unexplained MANUSCRIPT document control is authorized.
- No formatting architecture is authorized. Markdown remains candidate-only pending the nine formatting invariants.

### 3. Scope
Implement the S3 family only in the existing isolated founder-review fixture. Production and live Writer's Studio remain untouched.
S3 is additive to accepted S1/S1R2/S2/S2R1. Do not redesign, rebase, or silently reinterpret those accepted states.
The implementation may add the minimum Write-specific fixture component(s), fixture state/types/tokens, review-harness wiring, CSS, tests, S3 capture/fidelity instruments, S3 screenshots/boards, one S3 Experience Contract, and one S3 evidence record.
### 4. Allowed mutation surface
Code:
- `app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient.tsx`
- `app/dev/writers-studio-full-redesign-review/full-redesign-review.css`
- `app/dev/writers-studio-full-redesign-review/page.tsx` only if metadata/default-state parsing must name S3
- `app/writers-studio/full-redesign/WriteRoom.tsx` (new; preferred locus)
- `app/writers-studio/full-redesign/Shell.tsx` only for the smallest additive seam required by Write/full-canvas
- `app/writers-studio/full-redesign/fixtures.ts`
- `app/writers-studio/full-redesign/tokens.ts`
- `app/writers-studio/full-redesign/types.ts`
- `app/writers-studio/__tests__/fullRedesignWrite.test.ts` (new)

Evidence/instruments:
- `scripts/writers-studio/pc3-s3-write-capture.mjs` (new)
- `scripts/writers-studio/pc3-s3-write-fidelity.mjs` (new)
- `docs/design/contracts/writers-studio-full-redesign-pc3-s3-write.md` (new)
- `docs/design/contracts/screenshots/full-redesign-pc3-s3/**` (new only)
- `docs/programme/WRITERS-STUDIO-FULL-REDESIGN-01_PC3-S3_EVIDENCE_2026-09-24.md` (new)

No other path is writable without returning to JARVIS for a packet amendment.
### 5. Forbidden surfaces and acts
Do NOT modify:
- `app/writers-studio/rebuild/**`, `app/writers-studio/canvas/**`, live `/writers-studio/**` routing, APIs, SQL, migrations, auth, member data, save/runtime services, production config, deployment files, or canonical branch.
- accepted S1/S2 screenshot/reference bytes or the S3 custody PNG/SHA256SUMS.
- Develop/Review/Home behaviour except where a shared additive seam is mechanically necessary and all prior witnesses prove unchanged.

Do NOT:
- merge, deploy, rebase, cherry-pick to canonical, install a new dependency, call MAIA, read/write member data, or make a business network request.
- implement Markdown/rich text, bold/italic/list/quote controls, paste semantics, source-format decisions, version history, Keeps, structure editing, or other deferred capabilities.
- treat the fixture as live capability. The founder-review strip must continue to say fixture data / nothing live.

### 6. S3-A / S3-C — Write Resting contract
At 1536 authority width, Light and Night must have identical geometry and controls; appearance changes colour roles only.
Preserve the accepted S1 product bar: Soullab · Home · Write · Develop · Review · Work picker · member.
Write is current. There is no resident MAIA region.
Left context is literary manuscript context, not findings/source/version/MAIA tooling: plain MANUSCRIPT heading and Chapters 6–12, with Chapter 6 / The Current Changes current.
The centre is manuscript-first: `The River Between › Chapter 6`, title `The Current Changes`, the same Chapter 6 fixture prose, the same held/selected full quotation:
`“Maybe this is what growing feels like,” she whispered. “Not arriving, but learning to stay with the in-between.”`
Show truthful fixture state `Saved` and `Draft v12`; do not show elapsed-time copy.
Show one quiet `Full Canvas` entry control beside that state, in the same position in Light and Night.
Show quiet Previous / Next at rest. They are navigation context, not a toolbar.
No formatting toolbar. No resident MAIA. No unsupported search/dropdown/document affordances.
Typography must resolve through declared semantic roles / `--fr-serif` and `--fr-sans`; add zero component-local font-family declarations.

### 7. S3-B / S3-D — Full Canvas contract
Full Canvas is a presentation state of the SAME Write editor/state, not a second editor, route, document, manuscript state, or save engine.
On entry the global Soullab product bar and manuscript rail recede. Previous/Next recede. No resident MAIA appears.
Keep minimal place orientation (`The River Between › Chapter 6`), `Saved`, `Draft v12`, manuscript text/selection, word count, and exactly one visible `Return` control.
Return and Escape invoke the same semantic return action and destination. No third divergent exit is permitted.
No loading/interstitial screen. The field changes in place; do not imply reload/navigation.
Light and Night full-canvas geometry and controls are identical.

### 8. S3-E — transition state tuple
The witness must capture and compare the same tuple before entry, in Full Canvas, and after return:
`Work · section/passage · selection · cursor · version · save state · focus`.
Fixture values are:
- Work: `The River Between`
- section/place: `Chapter 6 · The Current Changes`
- passage/selection: the full quotation in §6
- cursor: end of that selected quotation (or an equivalent explicit fixture cursor representation)
- version: `Draft v12`
- save state: `Saved`
- focus: `editor`
Before and after tuples must be identical. Entering must focus the editor; returning must restore editor focus, selection and cursor. Do not prescribe a specific DOM element type merely to satisfy the picture: prove semantic editor identity and state continuity.

### 9. Same-editor proof
The implementation must expose a stable test locator for the single Write editor and a stable identity that survives Resting → Full Canvas → Resting.
The witness must prove:
- exactly one editor exists before, during and after;
- the same editor element/state identity survives the transition (no remount/substitution);
- no second manuscript state is created;
- selection/cursor and the §8 tuple survive;
- save/version presentation remains the same state, not re-created fiction.

### 10. Responsive scope
1536×1024 is founder visual authority.
1280×800, 1024×768 and 390×844 are derived/witnessed layouts, not additional founder authority.
At each derived viewport: no horizontal overflow, manuscript remains primary, Full Canvas remains reachable/returnable, no content/control duplication, no resident MAIA, and no invented mobile navigation.
Do not perform deliberate mobile recomposition; PC10 owns that act.

### 11. Capture list
Commit only S3 captures under `docs/design/contracts/screenshots/full-redesign-pc3-s3/`:
- `write-resting-1536x1024.png`
- `write-resting-night-1536x1024.png`
- `write-full-canvas-1536x1024.png`
- `write-full-canvas-night-1536x1024.png`
- `write-resting-{1280x800,1024x768,390x844}.png`
- `write-full-canvas-{1280x800,1024x768,390x844}.png`
- `board-s3-a-light-write-resting.jpg`
- `board-s3-b-light-full-canvas.jpg`
- `board-s3-c-night-write-resting.jpg`
- `board-s3-d-night-full-canvas.jpg`
- `board-s3-e-transition-return.jpg`
Boards must place the render/state evidence against the custodied authority, not against a prior candidate render. S3-E is behavioural evidence, not a fabricated fifth application screen.

### 12. Fidelity contract
Mechanically assert at minimum:
- custody SHA + byte count before any fidelity run;
- accepted S1 product-bar geometry unchanged in Resting at 1536/1280/1024;
- no product bar in Full Canvas;
- no resident MAIA in any S3 state;
- no formatting controls or forbidden toolbar labels;
- Chapters 6–12 present in both appearances at authority width; Chapter 6 current;
- `Saved`, `Draft v12`, Full Canvas entry and Previous/Next in Resting;
- `Saved`, `Draft v12`, Return and no Previous/Next in Full Canvas;
- selected quotation identical in A/B/C/D;
- Light = Night geometry for corresponding states;
- semantic type-role conformance with zero component-local `font-family`;
- same-editor and §8 tuple continuity through entry and both return mechanisms;
- button Return and Escape land identically;
- zero business network requests;
- no horizontal overflow at 1536/1280/1024/390.

Visual measurements should be derived from the custodied PNG where stable and recorded in the S3 contract/evidence. Do not invent tolerances silently: record every tolerance and why it exists.
### 13. Mandatory known-bad mutants
The S3 fidelity/behaviour instrument must deliberately make each candidate RED and report the intended killed law:
1. `duplicate-editor` — creates a second editor / manuscript state.
2. `cursor-loss` — loses selection/cursor on Full Canvas entry or return.
3. `save-state-loss` — removes or changes Saved/Draft v12 across transition.
4. `return-divergence` — visible Return lands differently from Escape, or adds a third divergent exit.
5. `escape-removed` — removes the keyboard return route; must fail as keyboard-route loss, never pass as “fewer paths”.
6. `resident-maia` — adds MAIA to Write at rest or Full Canvas.
7. `formatting-toolbar` — adds formatting controls/model affordances.
8. `type-role-bypass` — adds a component-local font-family.
9. `light-night-drift` — changes corresponding geometry between appearances.
10. `shell-leak` — leaves global navigation or Previous/Next visible in Full Canvas.
11. `custody-mismatch` — reference hash/byte mismatch must refuse the run.

Mutants may be runtime/test injections; they must leave source bytes unchanged after the witness. Every mutant must be proven RED before S3 can be presented.

### 14. Regression gates
Before presenting S3, rerun:
- S1 fidelity: 55/55 GREEN at baseline and the accepted text-shaping drift matrix; S1 `maia-drop` mutant still RED.
- S2R1 Home fidelity: 91/91 GREEN; all seven accepted S2R1 mutants still RED.
- Jest `fullRedesignShell.test.ts`, `fullRedesignHome.test.ts`, and new `fullRedesignWrite.test.ts`.
- `npm run check:design-canon`
- `npm run typecheck`
- `npm run check:no-supabase`
- regenerate accepted S1/S2 captures only for comparison and prove zero byte diff; do not commit changed accepted bytes.

If an existing gate's invocation differs in this checkout, use the invocation recorded by the accepted S1/S2 evidence; do not weaken the gate.
### 15. Evidence record
The S3 evidence record must name:
- exact packet commit + packet blob hash;
- exact base `fa151298…`, custody path/SHA/bytes, branch and candidate SHA;
- exact paths changed;
- each fidelity assertion and result;
- each mutant and its RED result;
- S1/S2R1 regression results;
- capture/board inventory;
- derived responsive findings;
- known differences / generation artifacts;
- proven vs not proven;
- explicit statement that production/live Writer's Studio was untouched.

### 16. Human / founder boundary
Mechanical GREEN does not establish atmosphere, literary spaciousness, immersion, beauty, or that Full Canvas feels like “more room, not another editor.” Those remain founder judgment.
The builder may not silently repair the live-runtime gaps found in CR0 (conflict latch, no beforeunload, Chapter 10 fallback, focus/caret behaviour in the live Rebuild room, etc.). S3 proves the target in the isolated fixture only.

### 17. Execution sequence
1. Verify exact base, clean worktree, parent chain and custodied PNG from Git.
2. Create an S3 implementation branch from exact `fa151298…`; do not work on the custody branch.
3. Implement the smallest fixture-only Write family within §4.
4. Add unit laws and the S3 capture/fidelity instruments.
5. Run custody refusal first, then baseline fidelity and all mutants.
6. Run S1/S2R1 regressions and repository gates.
7. Capture S3 authority/derived states and create the five evidence boards.
8. Write the Experience Contract and evidence record.
9. Commit the candidate and record exact SHA.
10. **STOP. Do not merge, deploy, modify production, or begin live convergence. Return the candidate + evidence for founder adjudication.**

### 18. Stop / refusal conditions
STOP and return to JARVIS if: a required path falls outside §4; the authority PNG cannot be read from custody; a prior accepted S1/S2R1 law must change; live/runtime code appears necessary; a new dependency appears necessary; a mutant cannot be made lethal without changing the governing law; or the visual target is materially ambiguous after applying the explicit adjudication notes.

**NEXT RETURN:** `FOUNDER ADJUDICATION — PC3-S3 CANDIDATE ONLY`.
