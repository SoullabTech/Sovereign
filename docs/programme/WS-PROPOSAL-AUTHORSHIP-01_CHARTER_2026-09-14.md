# WS-PROPOSAL-AUTHORSHIP-01 — Charter + Predicate Preflight

**Date:** 2026-09-14 · **Branch:** `claude/bold-bohr-pmtynu`
**Subject:** the running Writer's Studio at `localhost:3100`, `/Users/soullab/MAIA-SOVEREIGN`,
runtime SHA **`377d811d1b06d9dfc3b142da2c080098d38fed0a`** (detached)
**Standing:** ⛔ **CHARTER ONLY.** No code · no schema · no migration · no repair authorized.

---

## 0 · ⚠️ Evidence class — read before relying on anything here

⛔ **The subject is not in this checkout.** `377d811d` is unreachable here;
`ProposedChange.tsx`, `canvas/ProposalWorkSurface.tsx`, `useProposedChange.ts` and any
`revision-proposal` route are **ABSENT**. Verified, not assumed.

```text
FOUNDER-READ     the three components, their tests, proposalWork.ts, the accept route,
                 and the live `manuscript_revision_proposals` schema of the running process
JARVIS-VERIFIED  only the absence above
```

⭐ Every finding in §1 is **founder-read evidence of record**. This charter reasons on it and does
not restate it as independently verified.

---

## 1 · Census findings (founder, 2026-09-13/14)

**F1 · `SHOW CHANGE` is mislabeled, not inert.** Its handler returns attention to the proposal
locus, and **the tests define it that way** — *"returns attention when the writer asks."* ⭐ The
tests are the authority on current intent, so this is a **name claiming more than the code does**
(BCS-M1). Two lawful repairs: rename to *Return to change*, or later give *Show change* real
disclosure behaviour. ⛔ Neither chosen here.

**F2 · The real change surface already exists and is deliberately shaped.**
`ProposalWorkSurface.tsx` renders the manuscript **once**, with removed/added wording at the
locus. ⭐ It avoids detached excerpts and duplicate Current/Proposed panels **because both already
failed founder walks.** ⛔ Do not reintroduce either shape as a "fix".

**F3 · Read-only was deliberately temporary.** The file states the staged wording becomes editable
at **Step 3**, and `proposalWork.ts` names `replacementText` as *"the field that becomes a
successor chain at step 3."* ⭐⭐ **Editable proposals were anticipated by the architecture. This
lane completes a plan; it does not overturn one.**

**F4 · The empty-body accept is an authority property.** `ACCEPT` sends only the proposal id; the
server loads ownership, base version, expected text, replacement text and target, and applies the
stored proposal through the existing section mutation. ⭐ **The browser cannot turn "accept this"
into "write this arbitrary text."**

**F5 · Acceptance is already atomic.** Lock proposal → lock Work → verify exact text → apply the
existing mutation → record acceptance and resulting version. Any failure rolls everything back.

**F6 · ⚠️⚠️ Schema-identity hazard.** The **running** database's `manuscript_revision_proposals`
is the Sep-13 EDITORIAL-WRITE shape:

```text
id · member_id · work_id · draft_id · base_version · operation · target_section_id
expected_text · replacement_text · decision_chain_id · created_at · accepted_at · resulting_version
```

⛔ **No proposal-succession columns exist.** A **different** table of the **same name** is defined
by an older Sep-10 migration in the checkout. ⭐ **Build against the observed running schema, never
against the checkout migration that merely shares its name** — a table name asserting a shape it
does not have is the same failure family this programme has repeatedly caught.

---

## 2 · ⚠️ Correction to Jarvis's proposed flow — recorded, not quietly replaced

I proposed that the writer's edit be saved **through the ordinary manuscript writing path**, with
acceptance then referencing that revision. ⛔ **That is wrong**, and the reason is decisive:

> **The edit would already have entered the Work before acceptance.**

⭐ The existing programme target says `Edit proposal` happens **while nothing has touched the
Work**. My shape would have dissolved the very boundary the lane exists to draw — acceptance would
have become a formality over text already written. The founder's geometry stands.

---

## 3 · The governing geometry

```text
frozen MAIA proposal            ≠   writer-authored proposal successor   ≠   accepted manuscript revision
system-authored · immutable         durable · versioned · NOT the Work       the Work
```

```text
MAIA's original proposal  ──edit──▶  member-authored successor  ──accept──▶  existing mutation ──▶ the Work
      frozen, system-authored            durable, still not the Work            atomic, verified
```

### ⭐⭐ The request-boundary law that preserves F4

```text
EDIT   request MAY carry writer-authored prose
       — because the writer is authoring PROPOSAL STATE, and nothing has touched the Work

ACCEPT request carries NO prose
       — only a selector the server verifies against durable state
```

⭐ This is the same principle BCS-01A just proved twelve times over: **authority comes from a
frozen reference, never from what a caller supplies.** Editing becomes possible without the
browser ever gaining the power to write arbitrary text into the Work.

### The surface law

> **MAIA proposes visibly → the writer edits proposal state → the writer explicitly accepts their
> exact proposal state → only then does it become the Work.**

⭐ The middle step is load-bearing: accept-or-reject alone makes the writer a reviewer of MAIA's
text; editing before accepting makes the resulting words the writer's own.

---

## 4 · Predicate preflight (BCS-M1) — before any schema

| Term | Predicate | Does NOT assert |
|---|---|---|
| **frozen MAIA proposal** | the system-authored wording as first offered, immutable thereafter | that it is current, preferred, or what will be accepted |
| **proposal successor** | a member-authored revision **of proposal state**, durable and versioned | ⛔ that anything entered the Work · that it supersedes the Work · that MAIA authored it |
| **proposal state** | the wording currently staged for this proposal, at a named successor | that it is manuscript content |
| **edit** | a member act authoring proposal state; carries prose | that acceptance occurred or is implied |
| **accept selector** | a reference resolving to **one exact** durable proposal state | ⛔ never the prose itself |
| **acceptance** | the member act by which a named proposal state enters the Work through the existing mutation | that MAIA authored the result |
| **decision chain** | the existing `decision_chain_id` lineage | ⛔ **unknown to this charter** — its current semantics are owed before reuse |

⛔ Words refused in advance: `applyProposal(text)` · any accept parameter carrying wording ·
`current_proposal_text` as a mutable column on the proposal row (a second truth beside its
successors) · `Current/Proposed` duplicate panels (F2).

---

## 5 · The lane's question

> **How does a MAIA-authored proposal become writer-authored Work without letting either the
> browser or MAIA bypass the writer's explicit revision and acceptance?**

### Owed before design

```text
1  the running schema, read directly — columns, constraints, indexes (F6)
2  `decision_chain_id` semantics — what the chain currently means and who writes it
3  the accept route's exact verification set, so a successor selector can be added
   WITHOUT weakening any check it already performs
4  the Step-3 note in proposalWork.ts, read in full rather than by its summary
5  the ProposalWorkSurface founder-walk history — what failed, so it is not rebuilt
```

### Not authorized by this charter

```text
⛔ no schema or migration        ⛔ no rename of SHOW CHANGE      ⛔ no accept-route change
⛔ no editable staging           ⛔ no surface redesign           ⛔ no borrowing of the
                                                                    Sep-10 same-named table
```

## 6 · Standing

```text
LANE              WS-PROPOSAL-AUTHORSHIP-01 — CHARTERED, not opened for build
SUBJECT           377d811d (Mac Studio runtime) — NOT present in this checkout
EVIDENCE          founder-read; Jarvis verified only the absence
JARVIS CORRECTION recorded §2 — the ordinary-writing-path shape was wrong
NEXT              census the five owed items against the running subject
CODE              NONE
```

> **Nothing may touch the Work until the writer accepts a proposal state they authored.**
