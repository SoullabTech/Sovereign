# WRITERS-STUDIO-MANUSCRIPT-TYPESETTING-R1

**Opened:** 2026-10-01 — founder report from the canonical Writer’s Studio Write room.  
**Terminal claim:** A writer can open an imported finished manuscript and see professional, book-like typography without Writer’s Studio changing, inventing, deleting, or reordering the author’s words; editing, exact passage selection, saving, and Full Canvas remain intact; the proved canonical merge SHA may then be promoted through the governed production deployment lane for the invited tester cohort.

## Founder observation

The Chapter 10 witness showed a finished manuscript rendered as a dense continuous block. A printed-page folio (`161`) appeared inside the prose flow. The manuscript substrate can retain PDF hard line-wraps while lacking blank-line paragraph separators; the former Write projection treated blank lines as the only paragraph authority, so good CSS had no blocks to typeset.

This is a manuscript-fidelity defect, not a request to rewrite content. The repair must be a **presentation projection over source truth**. Source custody and canonical draft text are not silently rewritten merely because the room renders them.

## Standing laws

1. **Words are sovereign.** The typesetting layer may classify whitespace/layout signals for presentation; it may not add, delete, substitute, or reorder lexical content.
2. **Exact selection still addresses canonical text.** Hard line-wrap characters remain in the DOM text so a selected passage can resolve against the canonical body.
3. **Explicit author structure outranks inference.** Existing blank-line paragraph boundaries are used directly. Heuristics operate only when those boundaries are absent.
4. **Inference is conservative and presentation-only.** A sentence ending near a typeset line end is not, by itself, a paragraph. Break recovery requires a hard-wrap layout profile plus paired boundary signals.
5. **No render-time mutation.** Opening the Studio does not persist normalized text or alter source custody.
6. **Professional presentation is part of Writer’s Studio quality.** Readable measure, paragraph rhythm, epigraphs, subheads, lists, folios, responsive layout, and Full Canvas are one writing surface, not optional decoration.

## Flow

### G0 · Reproduce and locate
**Question:** Is the reported defect real, and which canonical path creates it?  
**Subject:** `/writers-studio?mode=write` → P4R1 host → live projection → WriteRoom.  
**Authority:** read-only repository/runtime inspection.  
**Evidence required:** exact renderer, paragraph projection, and CSS identified.  
**Falsifier:** screenshot is produced by another route or the stored body already supplies correctly rendered blocks.  
**PASS opens:** G1.  
**Standing:** PASS — canonical route and blank-line-only projection located.

### G1 · Content-preservation contract
**Question:** Can professional typesetting be derived without changing the writer’s words or breaking passage coordinates?  
**Permitted:** pure presentation projection; classification from existing whitespace/layout; CSS.  
**Forbidden:** model rewriting; source/draft migration; deleting PDF folios; text substitution; selection offsets computed from visually normalized strings.  
**Evidence required:** tests proving word-sequence conservation and preserved intra-block newlines.  
**Falsifier:** any lexical delta or selected visible text cannot resolve against canonical text.  
**PASS opens:** G2.

### G2 · Typesetting engine
**Question:** Does the room recover enough manuscript structure to present finished work professionally?  
**Required roles:** paragraph · epigraph · subhead · list · folio.  
**Order:** explicit blank-line blocks first; otherwise high-confidence hard-wrap recovery.  
**Falsifier:** ordinary prose is arbitrarily fragmented, a folio remains buried in prose, or a real explicit paragraph is collapsed into another.  
**PASS opens:** G3.

### G3 · Professional page geometry
**Question:** Does the Write room read like a professional writing page at rest and in Full Canvas?  
**Required:** restrained reading measure; balanced chapter title; ~1.7 leading; visible paragraph rhythm; differentiated epigraph/subhead/list/folio; responsive mobile behavior; no cardification of prose.  
**Falsifier:** long desktop lines dominate the viewport, typography jumps on Full Canvas, or semantic roles look like UI controls.  
**PASS opens:** G4.

### G4 · Authorship behavior regression
**Question:** Did typesetting preserve the working editor?  
**Required:** edit · autosave · section navigation · selection → held passage · Revise/Discuss affordance · Full Canvas focus/selection continuity.  
**Falsifier:** render alone marks dirty; typing loses words; selection address drifts; paragraph projection changes section identity.  
**PASS opens:** G5.

### G5 · Automated verification
**Question:** Is the candidate internally clean?  
**Required:** targeted typesetting tests; P4R1 Write tests; typehealth no-regression; relevant Writer’s Studio suites; build; `git diff --check`.  
**Falsifier:** any new failure attributable to the candidate.  
**PASS opens:** G6.

### G6 · Visual/browser witness
**Question:** Does the actual room show the intended result, not merely satisfy source assertions?  
**Required witness:** representative finished-manuscript page in Evening/Night or current tester theme; ordinary paragraphs visibly separated; epigraph/subhead/folio legible; desktop + Full Canvas; no overflow.  
**Falsifier:** visual bunching remains or editor behavior differs from tests.  
**PASS opens:** G7.

### G7 · Review and canonical convergence
**Question:** Is the exact reviewed tree ready to become canonical without bypassing the existing Writer’s Studio repair stack?  
**Required:** dedicated branch and PR; upstream Writer’s Studio bases reconciled in order; required checks green; exact merge SHA recorded.  
**Falsifier:** merge conflict, stale base, red required check, or candidate tree differs from reviewed tree.  
**PASS opens:** G8.

### G8 · Governed deployment
**Question:** May the canonical merge SHA be promoted for the invited tester cohort?  
**Authority:** founder request of 2026-10-01 authorizes this feature deployment; repository deployment constitution still governs mechanism and provenance.  
**Required:** deploy the canonical merge SHA, never an unmerged branch head; run pre-deploy/provenance gates; no pending migration shortcut; preserve deployment lock; health check.  
**Falsifier:** candidate does not descend from running production, pending migrations require a different lane, provenance mismatch, failed build/health gate, or another deployment owns the lock.  
**PASS opens:** G9.

### G9 · Tester witness and closeout
**Question:** Can tomorrow’s writers enter the Studio and trust the page they see?  
**Required:** post-deploy Writer’s Studio smoke witness on the exact production SHA; open a finished manuscript; inspect Write + Full Canvas; edit/save one non-destructive tester passage or use a disposable witness manuscript; record observed SHA and health.  
**Falsifier:** presentation or authorship regression in production.  
**PASS:** close R1 and retain this manuscript as regression custody.

## Current implementation lane

- Branch: `feature/ws-manuscript-typesetting-r1-20261001`
- Base: `f250f2953` (`feature/ws-working-style-preferences-20261001`, PR #1704 lineage)
- Worktree: `/Users/soullab/ws-manuscript-typesetting-r1-20261001`
- Production source branch remains `clean-main-no-secrets`; deployment must use the eventual canonical merge SHA.

## Explicit non-goals for R1

- No manuscript prose rewriting.
- No database migration.
- No destructive cleanup of PDF page numbers from source custody.
- No claim that every PDF layout can be reconstructed perfectly from plain text. Ambiguous cases remain prose rather than being confidently invented.
- No new rich-text formatting model. This is manuscript presentation and structural fidelity over the existing plain-text authorship substrate.

## Execution record — candidate before PR

- G0: **PASS** — canonical P4R1 Write route, adapter, editor, and CSS traced.
- G1–G3: **PASS (automated candidate evidence)** — pure presentation projection added; intra-block newlines preserved for canonical passage matching; explicit author paragraphs outrank inference; epigraph/subhead/list/folio roles added; desktop reading measure reduced from 980px to 780px (840px Full Canvas), with 21px/1.72 prose and deliberate paragraph rhythm.
- Targeted typesetting + immediate-selection tests: **8/8 PASS**.
- Broader Writer’s Studio sample: **30/30 candidate-relevant assertions PASS**; one unrelated `p4r1AppearanceContinuity` assertion fails identically on the parent `f250f2953`, so it is recorded as inherited rather than attributed to this lane.
- TypeScript no-regression gate: **PASS**, 222 errors vs baseline 239 (17 fewer; no new TypeScript regression).
- Production build: **PASS** (`next build --webpack`, 110.74s).
- Targeted ESLint introduced **no new lint failure**; two pre-existing React-hook lint findings in `WriteRoom.tsx` remain on the parent (render-time `liveRef.current = live`, and the existing open-chapter synchronization effect). They are outside this typesetting repair and are not widened here.
- G6 remains a runtime/browser witness and is not discharged by source inspection alone.
