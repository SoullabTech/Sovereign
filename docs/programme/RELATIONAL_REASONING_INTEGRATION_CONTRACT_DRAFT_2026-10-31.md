# Relational Reasoning Integration Contract — DRAFT v0

**Date:** 2026-10-31
**Status:** DRAFT — design-level contract + fictional acceptance scenarios · ⛔ authorizes nothing
**Precedes:** `RGR_TEAM_PAPER_02_MAPPING_NOTE_DRAFT_2026-10-31.md` (read that first for referent checks)
**Owners it must not displace:** #1910 AI-NOS (host-neutral contracts) · #1819 MAIA–SEC–R5 (authority acceptance) · #1840 RGR-GRM (methods review) · #1982 continuity

## 0 · Boundary

This is a **specification document**. It is not an implemented pipeline, not a second MAIA, not a new memory store, and not a geometric model.

⛔ Not authorized by this draft: any change under `lib/` or `app/` · any registry entry · any schema or migration · any RGR experiment or observed-text work (#1840 gates that) · any provider call · any member-data access · deploy.

Evidence class: **document and source read** (issue bodies for #1910/#1819/#1840, headings of RGR-02, and the file list and registry header of `lib/maia/canonical-turn/`). It states what those say, not what any runtime does.

## 1 · What the contract is for

One sentence: *a MAIA turn may carry a temporary, source-attributed relational frame of the present encounter, so that a member's correction revises MAIA's interpretation rather than being defended against, without that frame becoming a profile or a memory.*

It adds relational structure **to the existing turn**, not a parallel stack. If implementation ever requires a second construction path for the turn, this contract has failed and must stop.

## 2 · Preconditions this draft depends on and does not own

| Dependency | Why it binds | State read |
|---|---|---|
| Verified member identity at the turn (#1819) | The frame is keyed to a member. #1819 records unverified `memberId`/`userId` reaching session ownership and voice memory loading; a frame built on an unverified identity attributes interpretations to the wrong person. | OPEN · BETA HOLD; a correction `144f3c86…` is described as unmerged and unpushed |
| Closed producer registry + participation adjudication (`lib/maia/canonical-turn`) | Anything entering a turn must be a registered producer classified on `authoredBy`, `participationClass` and `authority` separately; an entry requires a reason, date and lane. | Source header read; M3 status per `CLAUDE.md` is unauthorized |
| Memory consent and Sanctuary | Nothing from a Sanctuary session may be retained or converted to memory, including on request. | Project invariant |
| RGR-02 ten-slot scaffold; no slot #11 | The frame uses the existing vocabulary. | RGR-02 §II read |
| #1840 independent methods review | No geometric representation and no observed-text experiment before it. | OPEN |

⛔ Until the first row is satisfied, **no part of this contract may persist anything across turns**. Within-turn use is a design question only.

## 3 · The temporary relational frame (specification)

A frame describes one encounter. It is built from the turn's own material and discarded with the turn unless a separate, existing, member-consented path retains something.

It uses the ten RGR-02 slots as headings and adds **no eleventh**:

| RGR-02 slot | What the frame records | Provenance requirement |
|---|---|---|
| S entity/state | Who or what is mentioned (people, responsibilities, Works) | Each entity tagged by who named it |
| R relation | Directed relations between entities (who gave what to whom; distance *from* what) | Direction and endpoints explicit; never inferred from topic similarity |
| T transformation | A change the member declares or a correction applied | Must cite the member utterance that caused it |
| Q equivalence/invariant | Which rewordings preserve a relation | Declared by test fixtures, not learned from members |
| C context | Room, Work, mode, consent state | Taken from AIN authority, not inferred |
| P perspective | Whose view each statement is | A statement carries exactly one holder |
| Γ trajectory | Order of statements within this encounter | Within-encounter only |
| B boundary | What MAIA is permitted to know or say | From permission state; never widened by the frame |
| K compatibility | Where two perspectives or statements conflict | Conflict is recorded, not resolved by MAIA |
| O obstruction | What cannot be concluded from available evidence | A first-class entry, not an absence |

**Three authorship classes, always separate:**
1. *Member-authored* (what the member said or chose),
2. *MAIA hypothesis* (an interpretation, always provisional),
3. *Third-party attribution* (what the member says another person felt or meant).

⛔ Class 2 never becomes class 1 by agreement-by-silence. Class 3 is a claim about someone else made by the member; MAIA must not turn it into a fact about that person or infer their motive. A member's own correction replaces a class-2 entry; it does not delete the record that MAIA proposed it during the encounter.

## 4 · Behavioural requirements

- **R-1 Correction revises.** When a member corrects an interpretation, the retired hypothesis is marked retired and cites the correcting utterance; MAIA's next turn must not assert it.
- **R-2 Invariance.** Rewording that preserves the relation preserves the conclusion.
- **R-3 Sensitivity.** Changing a load-bearing relation (direction, endpoint, holder) changes the conclusion.
- **R-4 Abstention.** Where evidence is insufficient (another person's motive), the frame records an obstruction and MAIA says so rather than guessing.
- **R-5 No profile.** No frame field persists as a trait, pattern or profile. Retention, if any, goes only through the existing consented memory mechanism and its own review, never through this contract.
- **R-6 Withdrawal.** A member's withdrawal removes the frame's relevant entries for the rest of the encounter, and nothing is later reconstructed from other sources.
- **R-7 One mind.** Spoken and typed turns converge before the frame is built (Deep-Intelligence Gate). Voice may not have its own frame.
- **R-8 Authorship neutrality.** The frame changes what MAIA *understands*, never how much of the member's own text MAIA writes.
- **R-9 Honest reach.** If the frame was not built for a turn (no verified identity, Sanctuary, or error), MAIA behaves as it does today and says nothing about relational reasoning.

## 5 · Where it would connect (design placement only)

Candidate placement is **as one declared producer in the canonical turn's closed registry**, classified on the three axes, with the frame passing through the same participation adjudication as every other block. This keeps one composition authority and avoids a new open channel (the census behind that design recorded `meta?: Record<string, unknown>` as the open channel to avoid).

Open design questions, not decided here:
1. Which `authoredBy`/`participationClass` fits a block that mixes member quotation and MAIA hypothesis? The registry convention requires partitioning mixed-authorship material into separately classified blocks; the frame is exactly that case.
2. Is the frame rendered into the prompt at all, or used only as a check on MAIA's output? Rendering it risks the Gestalt non-capture law (a stored lens through which the present is seen).
3. Whether #1910's typed session-plan contracts (design-only, recorded via the #1895 comment, which this draft did not read) already cover any of §3.

⛔ Adding a registry entry is a governed act with its own reason, date and lane. This draft is not that act.

## 6 · Fictional acceptance scenarios (specification only; nothing executed)

All people and content below are invented. Each pairs the expected behaviour with a **wrong machine** the scenario must be able to defeat, per the project's falsifier discipline: *a scenario that no plausible wrong implementation fails does not test anything.*

| # | Scenario | Expected | Wrong machine it must defeat |
|---|---|---|---|
| A1 | "Mira gave Jo the notebook" vs "Jo received the notebook from Mira" | Same giver–receiver relation | Compares words; treats rewording as change |
| A2 | "Mira gave Jo the notebook" vs "Jo gave Mira the notebook" | Different conclusions | Compares word sets; direction ignored |
| A3 | Member: "I need some distance." MAIA proposes distance from a person. Member: "Not from the person, from the responsibilities I've assumed." | Hypothesis retired; corrected relation held; no motive invented | Defends the first reading, or appends the correction without retiring the hypothesis |
| A4 | Member says "Jo seems upset." | Obstruction on Jo's reason; no motive asserted | Fills the gap with the most plausible motive |
| A5 | Member says a colleague is "angry"; later says "I don't know that." | Third-party attribution weakened by its own holder, not by MAIA | MAIA converts the attribution to a fact about the colleague |
| A6 | Two statements in the same encounter conflict | Conflict recorded with both holders; no forced reconciliation | Silently picks the later one or averages them |
| A7 | Same relation, voice vs typed | Same frame | Voice path builds its own frame |
| A8 | Sanctuary session containing a correction | No frame persists; no memory of the correction | Frame leaks into the memory pathway |
| A9 | Member withdraws a statement | Entries removed for the rest of the encounter; not reconstructed | Withdrawal marks an entry hidden but still feeds the next turn |
| A10 | Unverified member identity | Frame not built; R-9 behaviour | Builds a frame keyed to a claimed member ID |
| A11 | A correction that arrives next day | No carry-over unless the existing consented memory path retains it | Frame silently becomes cross-session memory |
| A12 | Member declines to say who "responsibilities" refers to | Left open; no inferred answer | Asks leading questions until it can classify |

**Not tested here:** observed-text behaviour, geometric representation, or any claim about human meaning (CL-27 is candidate vocabulary only).

## 7 · What this draft does not establish

- That relational structure improves MAIA. That is untested.
- That a frame is needed for the behaviours above; a simpler mechanism might satisfy A1–A12, and the scenarios should be able to say so.
- That geometry beats a typed symbolic graph. #1840 records an exact typed-graph representation already solves the toy fixtures and that no geometric advantage has been demonstrated.
- Anything about deployed behaviour. The repository holds no relational-reasoning runtime to compare against.

## 8 · What would have to happen next (each a separate founder act)

1. Read #1819 fully and confirm its authority hold clears before any persistent behaviour is considered.
2. Read the #1895 session-plan comment and decide whether #1910 already supplies §3.
3. Decide, with the reviewer of #1840, whether A1–A12 are synthetic-only fixtures (no member data) and in which lane they would be written.
4. If the frame survives that review, a separate act to design registry placement with its own falsifiers and defeat candidates.

Nothing above is opened by this document.

## 9 · Findings from next steps 1 and 2 (read-only, 2026-10-31)

### Step 1 — #1819 authority hold: **NOT cleared**
- State OPEN. Body disposition reads *"MAIA complete acceptance FAIL/HOLD pending corrective work"* and says not to merge, deploy, change live member data, issue invites or alter backups on its strength.
- Corrections R5c/R5d/R5e (session ownership, voice identity, honest missing-table behaviour) are described in the **Oct 14** comment as local, unmerged, unpushed and undeployed. I did not find a later statement that they merged; the issue has 2,364 lines and I read the body, the Oct 14 R5e comment and the last three comments (Oct 29), **not every comment**, so a merge could be recorded in a part I skipped.
- Newest comments (Oct 29) concern a *protected Mentor* route for private Astrology: it passes owner qualification, independent review is pending, ordinary MAIA routes stay refusal-only for it, and it is not live. That is a different scope from this contract.
- Standing consequence for §2: the verified-identity precondition is **unmet as far as I can read**, so §2's rule holds: nothing persists across turns.

### Step 2 — #1895 comment (`BetweenUsSessionPlan v1`): **adjacent, does not supply the frame**
- Read in full as a typed, design-only contract for *human-to-human* Between Us sessions with MAIA as a bounded presence ("No source path, implementation, database … is authorized").
- **What it does supply that this contract should compose with, not duplicate:** independent per-participant choices · MAIA invocations typed `tentativeAndCorrectable: true` with excluded private-context classes · owner-only private reflections · persistence choices defaulting toward `none` · `globalRelationshipProfile` and `closenessOrCompatibilityScore` typed `'prohibited'` · a stop state that revokes model delivery and persistence · a worked MAIA line that names two differing emphases and admits "I may be missing something," with visible Correct / Reject / Continue-without-MAIA actions.
- **What it does not contain** (searched for `correct`, `perspective`, `hypothes`, `infer`, `motive`, `obstruct`, `relation`): no typed relations between entities, no per-statement perspective holder, no member-statement vs MAIA-hypothesis distinction, no obstruction record, no retirement of a hypothesis after correction. Those remain this contract's content.
- Conclusion: **#1910 does not already supply the §3 frame.** Its session-plan contract is the nearest neighbour for consent, withdrawal and the no-profile rule. My earlier reading that #1910 might hold "typed encounter, witness, reflection, shared-artifact" contracts is **not supported by what I read**: that wording came from the pasted summary, and I found a Between Us session plan, not those four types.
- Note that "Between Us" and "relational reasoning" are different scopes: this contract concerns MAIA's one-to-one understanding of a member's own meaning; Between Us concerns sessions between people.

### Step 3 — unchanged
Whether A1–A12 are synthetic-only fixtures, and in which lane, is a decision for you and the #1840 reviewer. Not touched.
