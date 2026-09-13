# WS-PROPOSAL-INTERACTION-01 — RUNTIME CUSTODY + RESPONSIBILITY CENSUS

**Date:** 2026-09-13 · **Stage:** census closed, law frozen, **NO REPAIR AUTHORIZED**
**Separate from:** BCS-01A (closed; untouched)
**Census branch:** `claude/exciting-brown-346wkb` (this record only — no code changed)

---

## 1 · Intake (founder act, verbatim intent)

Observed defect: `SHOW CHANGE` does not expose the proposed change.

Founder intent: MAIA proposes visibly → writer may edit the proposal → writer accepts
their resulting version → only then may it alter the Work.

---

## 2 · Runtime custody census — **ANSWERED**

### 2.1 The surface is NOT on the branch this session was opened against

At `claude/exciting-brown-346wkb` @ `e1c6f527` the strings `SHOW CHANGE`,
`PROPOSED CHANGE`, `KEEP UNCHANGED`, `ACCEPT CHANGES` and any reader of a
`proposal` URL parameter are **ABSENT**. So is any prose-level proposal substrate.
The only `proposal` machinery here is WS2-05B/06A **structure** proposals, which
carry no prose by construction (`assertNoProse`, `proposalStore.ts:15`).

⚠️ This clone is **shallow (272 commits)**, so `git log -S` over history proves
nothing. The negative above is asserted about **tree state at the tip**, which is
complete, and about **every remote branch tip** (below), which was fetched in full.

### 2.2 Method

All **1,368** remote heads shallow-fetched and grepped. Exactly **one** branch
carries `app/writers-studio/ProposedChange.tsx`.

### 2.3 The answer

| Fact | Value |
|---|---|
| **Branch** | `claude/s3-implementation` |
| **HEAD** | `845b814df297444bd6c6d768c6bfc1146eb47e55` (`845b814df2`) |
| **Dated** | 2026-09-13 |
| **Lane name in-source** | `EDITORIAL-WRITE-01A` / `EW-F1` / `EW-F2` |
| **Not on** | `clean-main-no-secrets`, this session's branch, or production |

⭐ **The screenshot is code, not data, and it is code that moved TODAY.** Twelve
commits dated 2026-09-13 sit on this branch, and the last three are all attempts at
the observed defect:

```
845b814df2  fix(studio): reveal the locus through the room's seam, not the banned DOM call
8f0610a2ac  fix(studio): the system performs the comparison, in every view the writer uses
377d811d1b  fix(studio): the proposal renderer must actually reach the surface that calls it
```

⛔ **Therefore the defect may already be partly repaired at `845b814df2`, and
`localhost:3100` may have been serving an earlier tip.** Before any repair, the
exact SHA the founder's dev server was running must be established — the census
cannot settle it from here, and a fix authored against the wrong tip repairs nothing.

⛔ **Port 3100 is not this app's configured port.** `next dev` uses `${PORT:-3000}`;
the only `3100` in the tree is a disabled MCP server (`lib/mcp/config.ts:79`). The
founder is running with an explicit `PORT` override. Recorded, not treated as causal.

---

## 3 · Responsibility census — **ANSWERED**

### 3.1 The trace, end to end

```
?proposal=<uuid>
  → requestedProposalId(searchParams)          app/writers-studio/canvasIdentity.ts
  → useProposedChange(proposalId)              app/writers-studio/useProposedChange.ts
  → GET /api/writers-studio/revision-proposal/[id]
  → preview.ts  (SERVER-derived StagedChange)  lib/manuscript/revisionProposal/preview.ts
  → { sectionLabel, sectionId, range{space,start,end}, operation, changeCount }
  → ProposedChange.tsx        (the decision panel)
  → ProposalWorkSurface.tsx   (the Work, with the locus marked in place)
  → POST .../accept  — EMPTY BODY
  → acceptRevision()                           lib/manuscript/revisionProposal/store.ts
  → saveSectionInTransaction()  ← the single existing mutation path
```

### 3.2 Where each thing comes from

- **Original manuscript text** — the Work's own renderer. `ProposalWorkSurface`
  renders the section body **once**, read-only, in reading flow.
- **MAIA's proposed change** — the stored proposal's `expected_text` /
  `replacement_text`, held **server-side only**. Today `operation` is
  CHECK-constrained to the single value `delete_exact_text`.
- **How the change is represented to the writer** — **not as a diff panel.** The
  change is embedded at its exact locus inside the real prose, retained text and
  departing text visibly distinguished. ⭐ The stated law: *"The Work is the
  comparison surface. The proposal is rendered into it without yet becoming it."*
- **Persistence / versioning / undo** — untouched and reused. Acceptance builds no
  second mutation path; it is an authorization gate in front of
  `saveSectionInTransaction`, which already owns the draft lock, the stale-base
  refusal and the one version increment.

### 3.3 ⭐ Does `ACCEPT` apply a hidden payload or what the writer saw?

**Neither, and that is the finding.** The browser sends an id in a path and
**nothing in a body** — the accept route does not parse a body at all. The server
re-reads the stored proposal and requires `expected_text` to occur **exactly once**
at the named target, through `applyExactlyOnce`, *the same guard the preview
consumed*. Preview and acceptance therefore cannot disagree.

So there is no hidden payload overriding the writer — **and equally no channel by
which a writer edit could travel.**

### 3.4 ⭐⭐ `SHOW CHANGE` is a navigation gesture, not a reveal

`onShowChange` → `showProposedChange` → `moveToProposal()`. It returns the writer's
attention to the already-marked locus. It was **never built to open the proposed
text in the panel** — EW-F1 deliberately removed prose from the panel after the
founder's own report (*"I'm trusting edits I don't understand"*), under the rule
*evidence belongs in the Work, decision belongs in the panel*.

⛔ **So the observed defect is ambiguous between two very different failures, and
the repair differs completely:**

1. **Mechanical** — the locus mark or the reveal does not render, so there is
   nothing to move to. (The 2026-09-13 commits are attacking exactly this.)
2. **Semantic** — the gesture works as designed, and the design does not match what
   the founder means by "show me the change."

**The census refuses to choose.** That is a founder ruling, and it is the one thing
blocking step 8.

---

## 4 · Interaction law — **FROZEN**

```
MAIA proposal
    ↓
writer sees exact proposed change
    ↓
writer may modify it
    ↓
writer explicitly accepts
    ↓
accepted visible text enters Work
```

```
proposal              ≠  manuscript change
viewing               ≠  accepting
editing proposal      ≠  editing Work
MAIA authors suggestion ≠ MAIA authors final Work
acceptance            =  writer ruling
```

### ⛔ 4.1 The law is NOT satisfied today, at one specific link

| Law | State at `845b814df2` | |
|---|---|---|
| MAIA proposes visibly | Marked in place in the Work | ✅ |
| Original remains visible/comparable | Section rendered once, in flow | ✅ |
| **Writer may modify the proposal** | **Structurally impossible** | ⛔ |
| `Keep unchanged` changes nothing | Local close; no write, no proposal state | ✅ |
| Accept writes what the writer saw | Same guard for preview and act | ✅ |
| No hidden payload override | No body exists to carry one | ✅ |
| MAIA has no direct write path | Single gated mutation path | ✅ |
| Provenance: MAIA proposed, writer ruled | `accepted_at` + `resulting_version`, written together | ✅ |
| History recoverable | Existing version chain, unchanged | ✅ |

⭐⭐ **The gap is a deliberate sequencing decision, not an oversight.**
`ProposalWorkSurface.tsx` states it plainly: *"That distinction carries the weight at
step 3, when the proposed wording becomes editable."* The branch is at EW-F2 step 2.
The founder's requirement **is** step 3.

⛔ **And the current shape actively forbids it.** "The browser does not send the edit
back" is load-bearing *against* writer editing as much as against a malicious client.
Admitting a writer-edited proposal means opening a write channel the substrate closed
on purpose. **That is an architectural ruling, not a repair**, and it is the real
content of this lane.

---

## 5 · Predicate preflight

| Term | Predicate | Status |
|---|---|---|
| `proposal` | durable row: member · work · draft · base_version · operation · target · expected_text · replacement_text | EXISTS |
| `proposed text` | `replacement_text`, server-held, never transported | EXISTS |
| **`writer-edited proposal`** | **no predicate, no column, no channel** | ⛔ **UNCONSTITUTED** |
| `accepted version` | `resulting_version`, written with `accepted_at` in one statement | EXISTS |
| `unchanged` | panel-local close; no row, no history | EXISTS, **local only** |
| `proposal provenance` | `decision_chain_id` (nullable) + acceptance pair | PARTIAL |
| `writer ruling` | the accept POST itself | EXISTS |
| `applied manuscript revision` | `saveSectionInTransaction` version increment | EXISTS |

⛔ **`result` and `final` are refused** — neither has a predicate on this branch.
⛔ **Durable rejection is NOT `Keep unchanged`.** Declining is currently invisible to
history. Naming them as one thing would be the first inflation in this lane.

---

## 6 · Falsifiers (predeclared, **none run**)

- F-01 hidden payload differs from displayed proposal → **RED**
- F-02 writer edits proposal, accept writes MAIA's original → **RED**
- F-03 opening `SHOW CHANGE` alters the manuscript → **RED**
- F-04 `Keep unchanged` creates a manuscript revision → **RED**
- F-05 any API writes a proposal into the Work without adoption → **RED**
- F-06 accepted text not traceable to a writer ruling → **RED**
- F-07 ⭐ preview says "1 change" where acceptance refuses → **RED** *(the FOCUS-W3 shape)*
- F-08 ⭐ `SHOW CHANGE` pressed and nothing becomes visible → **RED** *(the observed defect, stated falsifiably)*

---

## 7 · ⛔ SEPARATE FINDING — LATENT SCHEMA DRIFT ON THAT BRANCH

Two **different, incompatible** migrations create the **same table name**, both with
`CREATE TABLE IF NOT EXISTS`:

| Migration | Columns |
|---|---|
| `20260910000004_manuscript_revision_proposals.sql` | `manuscript_id · section_id · thread_id · produced_in_turn_index · proposed_text · reason · based_on · read_state · coverage · origin · authority · producer · input_fingerprint · derived_from_candidate_* · declined_at` |
| `20260913000002_manuscript_revision_proposals.sql` | `work_id · base_version · operation · target_section_id · expected_text · replacement_text · decision_chain_id · accepted_at · resulting_version` |

⛔ **Whichever runs first wins; the second silently no-ops and raises no error.** The
runtime schema then depends on migration ordering, and the code expects the
`20260913000002` shape. A database that already applied `20260910000004` would give
column-not-found at runtime, not a migration failure.

⛔ **Not repaired here.** It is on another lane's branch and was not authorized.
It is recorded because a proposal-interaction repair authored without knowing this
could be debugged against the wrong cause.

---

## 8 · Standing

⛔ **NO REPAIR PERFORMED. NO CODE CHANGED. NOTHING DEPLOYED.**
⛔ **Step 8 (minimal repair) is BLOCKED on two founder acts:**

1. **Which SHA was `localhost:3100` serving?** — three same-day fixes may already
   have changed the answer.
2. **Mechanical or semantic?** — is `SHOW CHANGE` failing to reveal a locus it was
   built to reveal, or working as built against a design the founder is now
   overruling?

⭐ **And one ruling the lane cannot avoid:** writer editing of a proposal requires
opening a write channel that EDITORIAL-WRITE-01A closed deliberately. Either
EW-F2 step 3 is opened, or the law's third line is amended. **The census does not
choose.**

> *The broken button is the observed entrance. Where authorship changes hands is the
> responsibility — and today it changes hands with the writer unable to touch what
> they are ruling on.*
