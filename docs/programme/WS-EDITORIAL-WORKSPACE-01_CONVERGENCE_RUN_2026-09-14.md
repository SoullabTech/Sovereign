# WS-EDITORIAL-WORKSPACE-01 — CONVERGENCE RUN

**Opened:** founder, 2026-09-14  
**Branch:** `claude/ws-editorial-workspace-convergence-01`  
**Base:** `e27db04b5` — replacement architecture charter  
**Production:** untouched  
**Before witness:** `localhost:3100` remains on detached `0bd2b6578`

## Mission

Replace the pre-succession proposal instrumentation with one continuous editorial encounter:

> **MAIA notices → writer understands → writer questions or disagrees → wording evolves → the Work previews the effect → writer adopts one exact version → the Work rereads authoritatively without losing the editorial session.**

This is a convergence run, not a sequence of independently shippable UI increments. The existing `ProposedChange.tsx` is a witness artifact to be retired after the replacement passes the full acceptance matrix.

## Refused strategy

- no `ProposalCard v1.1`
- no cosmetic reskin of the current panel
- no separate AI-editor room
- no modal workflow
- no full-page reload as the normal post-adoption experience
- no milestone declared complete because a component mounted or an endpoint returned 200
- no shipping W1/W2 alone as “the redesign”
## Product law

The primary surface is **the Work plus MAIA**. The centre holds evidence; the editorial pane holds relationship, interpretation, alternatives, and decision.

The workspace stays mounted while the writer moves around the manuscript. Selection, locus, version, conversation, scroll, and comparison state survive ordinary navigation.

The manuscript is not a passive background. Selecting a proposal version updates a reversible in-context preview at the exact locus. Returning to the locus is voluntary after initial arrival.

## One mounted editorial state machine

```text
EditorialWorkspace
 ├─ EditorialContextHeader
 ├─ EditorialReading
 ├─ ContextualComparison
 ├─ VersionLineage
 ├─ EditorialThread
 ├─ Composer
 └─ DecisionBar
```

The state machine owns no manuscript authority. It reads proposal work, stages authored versions, obtains one exact authorization only on the member's decisive gesture, executes that authorization through the existing guarded seam, and then rereads authoritative Work state.

## Human-facing vocabulary

Visible: **MAIA noticed · Why it matters · Your wording · MAIA's wording · Compare · Talk about this · Keep original · Use this version**.

Hidden from the ordinary experience: chain ids, version ids, execution authority, coordinate spaces, row counts, transport state, schema vocabulary.
## Interaction laws

1. **Direct manipulation.** Select a version and the Work shows that version at its locus.
2. **Continuity.** Thread, scroll, focus, comparison and selection persist through ordinary actions.
3. **Spatial causality.** The thing acted on changes where it lives, not in a detached summary card.
4. **Progressive disclosure.** Provenance and authority remain available without dominating the experience.
5. **Immediate response.** Local state responds immediately; generation shows a situated pending state.
6. **Meaningful motion.** Motion explains reveal, version change, or return. Decorative motion is refused.
7. **One dominant commitment.** Only one selected exact version may be adopted at a time.
8. **Reversibility before commitment.** Preview and compare freely; the Work does not change before adoption.
9. **Authorship is always visible.** `MAIA` and `You` are rendered on every authored candidate.
10. **Accessibility is structural.** Keyboard parity, visible focus, screen-reader semantics and reduced motion are acceptance requirements.

## The composer rule

Free text is **conversation or direction by default**. It is not silently treated as authored manuscript wording.

A member authors exact candidate wording through an explicit `Edit wording` / `Use my wording` act. That act reaches `appendAuthoredVersion(author: 'member')`.

A member may say: “I agree with the cut, but keep the spiral image.” That is Direction, not a ProposalVersion.

A member may instead choose `Edit wording`, enter an exact sentence, and create a member-authored successor. That is Suggestion and may later become authorizable.

This distinction is non-negotiable: **what I told MAIA ≠ wording I authored for the manuscript.**
## Canonical MAIA rule

The editorial thread uses the canonical MAIA turn path. There is no second editorial model and no side-channel intelligence path.

One member act may produce at most one MAIA-authored successor wording. MAIA may also answer without proposing wording. Explanation, editorial observation, instruction, and candidate wording remain distinct acts.

The workspace must be able to represent:

> **“I would keep this. It looks redundant structurally, but the repetition is doing emotional work.”**

without manufacturing a fake replacement. This is the discriminator between an editorial relationship and a proposal vending machine.

## Missing-object child lane

The convergence run carries one separately governed child lane because the current ontology genuinely lacks three conversational objects:

```text
Insight     what MAIA sees                  authored, no executable wording
Direction   what either party asks for      instruction, no executable wording
Discourse   question / answer               conversational, no executable wording
Suggestion  exact authored candidate        ProposalVersion; only authorizable object
Change      member adoption act             RevisionAuthorization
```

Schema for Insight / Direction / Discourse remains a separate branch-gated act. The convergence run may specify and integrate its contract, but may not smuggle any of these objects into `ProposalVersion.rationale` or another executable field.
## Live application rule

The current `window.location.reload()` post-acceptance path is not the destination experience.

After `Use this version` succeeds, the Studio must:

1. execute the exact authorization;
2. reread the Work from storage;
3. reread write-state;
4. reread proposal/thread state;
5. refresh Section and Whole projections from authoritative data;
6. preserve editorial pane state, selection, scroll and conversation;
7. show the newly applied wording at the locus already in view.

No optimistic prose patch may stand in for storage truth. No full-browser reload may be required to restore consistency.

## Experience composition

Desktop target: manuscript remains visually dominant; MAIA pane may widen for comparison/conversation but never becomes a settings drawer. Use strong typography, quiet rules, warm Soullab materiality, minimal containers, and meaningful whitespace.

The sovereignty statement reduces to:

> **Nothing changes until you explicitly adopt a version.**

Provenance, detailed authority, and history live behind disclosure. Sovereignty is enforced structurally rather than repeated as warning copy.
## Full acceptance matrix

The lane does not close until all eight editorial cases are walked:

```text
                         DELETE   REPLACE   SUBSTANTIVE REWRITE   KEEP ORIGINAL
Section                     □        □              □                  □
Whole                       □        □              □                  □
```

Every cell must prove: exact locus visible; writer asks a real question; MAIA answers; writer gives direction; a successor may be created without overwriting lineage; authorship remains visible; versions compare; selected version previews in the Work; leaving and returning preserves state; only the selected exact version can cross; adoption rereads authoritative Work state.

Additional acceptance: keyboard-only flow; reduced motion; narrow desktop/tablet; stale Work refusal; unavailable locus; lost-response retry; long thread recovery; long manuscript performance; no accidental remount/write when editorial stance changes.

## Completion criterion

The run closes only when a writer unfamiliar with the implementation can spend an hour working on prose with MAIA and experience **an intelligent editorial relationship rather than management of AI suggestions**.

After that witness:

- retire `ProposedChange.tsx` as a product surface;
- transfer only the lower-level invariants still needed by the replacement;
- remove obsolete instrumentation copy and dead routes deliberately;
- keep the before witness and acceptance record in custody.

## Immediate implementation order

**C1** read-model + mounted workspace shell + lineage; **C2** composer with explicit Direction vs authored wording; **C3** manuscript preview driven by selected version; **C4** canonical MAIA turn integration; **C5** missing-object child lane integration; **C6** exact decision + live authoritative reread; **C7** full witness matrix + retirement.

These are implementation checkpoints inside one product run, not independently acceptable releases.
