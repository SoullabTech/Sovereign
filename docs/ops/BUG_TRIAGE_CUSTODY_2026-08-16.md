# Bug backlog — custody-checked triage

```text
STATUS: EVIDENCE LEDGER — NO REPAIR AUTHORITY
PRODUCTION REFERENT: 8983a6747
```

**This document records custody and witness state. It authorizes no merge, deploy, product change, or bug closure.**

**Date:** 2026-08-16
**Production referent:** `8983a6747` — tip of `origin/clean-main-no-secrets`; container `maia-sovereign` created 2026-08-16T23:35:16Z; confirmed by `docker exec maia-sovereign printenv GIT_COMMIT`.
**Method:** every "fixed" claim re-bound to the production referent by ancestry and, where a rebase could have relocated a change, by patch-id **and** tree content.
**Evidence class:** code-read + deploy custody. **No runtime witness. No member witness.** Nothing here claims any member's experience is repaired.
**Provenance of findings:** items marked *(verified here)* were established against the local object store and the running container. Items marked *(founder-supplied)* were read independently by the founder from GitHub and are recorded, not re-derived.

---

## 1. Corrections to the working status table

| Item | Table said | Custody against `8983a6747` | Correction |
|---|---|---|---|
| Services show Inactive on `/studio/scheduling` | ✅ Code fix prepared | `013da1461` (2026-06-30) — **ancestor: yes** | Understated. Live ~7 weeks. |
| DM command text contrast | ✅ Code fix prepared | same commit `013da1461` — **ancestor: yes** | Same. One commit carried both. |

One 3-line commit carried both repairs:

```text
013da1461  fix(bugs): scheduling shows all services; command text contrast
  app/studio/scheduling/page.tsx   | 2 +-
  components/team/MessageInput.tsx | 4 ++--
```

These are not *prepared*. They are **SHIPPED · UNWITNESSED**. The open question is not whether to fix them but whether the fix worked for the person who reported it — which nobody has looked at. *(verified here)*

> Referent caution: `components/team/DMProfileCard.tsx` carries an unrelated 3-line uncommitted edit in the dirty main checkout. Different file, different surface. It is not the contrast fix.

---

## 2. The P0 voice repair was split; half never entered production

Two P0 commits were authored 2026-08-13 on `fix/p0-voice-recovery` in response to the 2026-08-06/07 reports.

```text
e0b2b9c01  P0 — Speak restores voice intent, not just voice UI          → 8983a6747   ancestor   yes
b59f83074  P0 — make Text↔Speak recoverable; stop amplitude-driven      → 8983a6747   diverged   yes
           flashing
```

`b59f83074` is absent from production **by SHA, by patch-id, and by content** *(verified here)*:

- patch-id `c8facd02f6fc6c68b311692282ef025b1bdb6fc0` matches no commit in production history since 2026-08-01 — a rebased copy is ruled out, not merely unlooked-for;
- production's `components/OracleConversation.tsx` differs from the repaired version by **+161 / −310** lines;
- all nine accompanying contract, review, and witness files are absent from the production tree.

**Scope of what did not ship** *(founder-supplied, from the commit message)*: `b59f83074` is not a stray patch. It addresses four distinct concerns — recoverability, Text→Speak state, photosensitive flashing, and output-modality independence — and carries a physical-device witness that was still pending at authorship.

The photosensitive-flashing concern is the one to weigh soonest on its own terms: amplitude-driven flashing is an accessibility hazard, and it is the concern least dependent on the rest of the branch for its justification.

**Why this matters to the open reports.** The half that shipped restores voice *intent*. The half that did not is the half addressing Text↔Speak recoverability and amplitude-driven flashing — the half that maps onto the reported experience of *the voice going off* and *voice and/or MAIA disappearing*. Reports on `/maia` continued through 2026-08-16.

**The witness protocol is itself undeployed.** `docs/design/reviews/P0_VOICE_RECOVERY_WITNESS_PROTOCOL.md` exists only on the branch. The instrument written to witness this repair has never been runnable against production for the `b59f83074` path. A pending device witness and an undeployed witness protocol are the same gap seen from two directions.

**Branch standing** *(verified here)*: `fix/p0-voice-recovery` is live at head `357462c98`, **three commits beyond** `b59f83074`:

```text
357462c98  fix(maia): P0 repair — a state may be asserted only after the event that authorizes it
ef5068302  docs(governance): ratify the third-party consent rider, with refinement
f5da4cce7  docs(jarvis): record the Living Field as MAIA's body language (Cat 1, held)
```

Full branch delta against production: **13 files, +2817 / −93**. The head has moved past the voice fix into a broader P0 authority repair, and the branch additionally carries governance ratification and a Cat-1 held direction — categories that must not ride into production inside a bug fix.

⛔ **Whole-branch merge is NOT justified.** This requires a rescue/reconciliation unit that separates the voice repair from the authority repair, the governance act, and the held direction. "Merge the fix" is not an available operation on this branch as it stands. Worktree copies exist at `fix/p0-voice-recovery-clean` (`af3abe63c`) and `p0-rebase` (`357462c98`); their relationship to the branch is unestablished and must not be assumed from their names.

---

## 3. Open reports — attributed

### 3.1 Vision Studio — "Fire I works, but I can't get past it" (reported twice: 2026-07-01, 2026-07-03)

**SOURCE DEFECT ESTABLISHED.** The content exists; the doorway does not. *(verified here)*

- `app/maia/vision-studio/page.tsx:25` — `const phase = params.get('phase') ?? 'fire_1'`. Phase is **URL-only**.
- `components/maia/vision-studio/VisionStudioRoom.tsx:115` — `fire_2: 'Fire II — Expression'` is defined, with its own authored prompt at line 130.
- No `setPhase`, `nextPhase`, `onNext`, or any advance control in the room's 945 lines.

Fire II is authored and reachable only by hand-editing the address bar. A member who completed Fire I met a wall with no door in it, and said so twice.

### 3.2 Living Field — "I want MAIA to acknowledge what I wrote" (2026-07-03)

**Finding refined — the earlier data-plumbing reading was wrong and is superseded.**

My prior read stopped at the client boundary (`PersonalLivingFieldDashboard.tsx:125-129` passes `fieldKey` and `fieldLabel`, not content) and inferred a plumbing gap. The founder read the next hop *(founder-supplied)*: `/api/maia/living-field/[fieldKey]/encounter` **does** load gathered member material server-side, on both `open` and `turn`, via `buildEncounterContext(...)`, and injects the formatted material into the system prompt. The prompt states explicitly that MAIA already holds what has gathered there and should speak from inside it rather than ask the member to re-explain. The context carries current field expression, source excerpts, developmental history, recent states, gathered Keeps / memory atoms with warrants, and spiral state.

```text
LIVING FIELD ACKNOWLEDGMENT

server loads the member's field material      SOURCE ESTABLISHED
material enters MAIA's prompt                 SOURCE ESTABLISHED
member-visible acknowledgment occurred        NOT ESTABLISHED
```

The route has the material. If the member still experiences not being heard, the failure is downstream of the prompt: whether the generated encounter *surfaces* that material in a form the member can recognize as being heard. **This is now a behavioral witness question, not a data-plumbing question** — and the two demand different instruments. A code-read cannot close it; only a member or session witness can.

This correction is preserved rather than overwritten: a plausible code-read diagnosis was overturned by reading one hop further, which is the failure mode this ledger exists to catch.

### 3.3 Document loading interrupts input (2026-08-16)

**UNATTRIBUTED.** Distinct from the 2026-08-06/07 voice cluster. MAIA submits mid-input while a long document is still being entered, against an explicit member request to wait. This concerns composer submit-trigger behavior in the production `OracleConversation.tsx`. The auto-send / silence-timeout probe timed out during this pass and was not re-run; no attribution is claimed. Owed: its own trace.

### 3.4 `/press/manuscript?import=1` — section families (2026-08-07)

**PRODUCT AUTHORITY QUESTION, not a defect.** The reporter's own framing — uncertainty whether it is a bug or a feature — is correct. The mechanism works as built; the objection is that the member has no way to say *no* and show the tool what they want instead. Governed by the `writers-studio-product-steward` skill. Must not be absorbed into a bug-fix lane.

### 3.5 "The journal page doesn't open" (2026-07-27, iOS)

**LIVE VERIFY OWED.** `/maia/journal` does not exist. The Journal Room cutover `d118123a7` (2026-08-11) **is** an ancestor of `8983a6747` *(verified here)*, and the report predates it by two weeks. Likely superseded — but *likely superseded* is not *verified*, and closing on inference is the exact move this ledger refuses. Classified **SHIPPED · UNWITNESSED** pending a live route check.

### 3.6 Test and acceptance entries

Test submissions on `/maia` carry no defect content. Ignore, as the working table already had it.

---

## 4. Standing state

```text
SHIPPED · UNWITNESSED
  scheduling Inactive                013da1461   in prod since 2026-06-30
  DM command contrast                013da1461   in prod since 2026-06-30
  journal cutover candidate          d118123a7   in prod since 2026-08-11

P0 VOICE
  e0b2b9c01                          IN PROD
  b59f83074                          NOT IN PROD  (SHA · patch-id · content)
  branch fix/p0-voice-recovery       LIVE at 357462c98  (+3 commits, 13 files, +2817/-93)
  whole-branch merge                 NOT JUSTIFIED — rescue/reconciliation unit required
  device witness                     PENDING
  witness protocol vs prod           NOT RUNNABLE for the b59 path

OPEN
  Fire II                            SOURCE DEFECT ESTABLISHED
  Living Field                       context plumbing ESTABLISHED · acknowledgment UNWITNESSED
  document-load autosubmit           UNATTRIBUTED
  press/manuscript sections          PRODUCT AUTHORITY QUESTION
  journal                            LIVE VERIFY OWED
```

---

## 5. Separate operational finding — "fixed" is not a lifecycle state

*Recorded here as a standalone operational finding, not as a bug entry. The monitor is **not** redesigned in this lane.*

These are distinct states, and a fix occupies exactly one of them at a time:

```text
PREPARED
COMMITTED
MERGED
IN_PRODUCTION
WITNESSED
CLOSED
```

The bug board currently collapses them into approximately `new / fixed`. Both classes of error in this pass came from that collapse, and they run in opposite directions:

- **Understated:** two fixes sat labeled "prepared" while already deployed for seven weeks — work treated as outstanding that was in fact awaiting a witness nobody knew to perform.
- **Overstated:** one P0 read as "fixed" while half its repair never entered production at all, its own witness protocol undeployed beside it, for three days and counting.

The first error wastes attention. The second lets a member keep hitting a defect that the board believes is closed — including, in this instance, an accessibility hazard. **A fix label that does not say *where the fix lives* cannot distinguish these two cases, and both are live in the backlog today.**

Minimum information for a fix label to be meaningful: `state` (from the six above) · the production SHA the claim was checked against · who witnessed it, if anyone. No redesign is proposed here; the finding is recorded so it is not rediscovered a third time.

---

## 6. What this document does not authorize

Discovery grants standing to report, not to repair. Specifically **not** authorized by this ledger:

- merging or cherry-picking any part of `fix/p0-voice-recovery`;
- adding a Fire II advance control;
- changing the Living Field encounter or its prompt;
- closing any report listed above;
- redesigning the bug monitor;
- any deploy.

Each requires its own authority, obtained separately.
