# Step 2 · the runtime-port census

**Lane** `claude/proposal-authorization-runtime-port`, base `d2263e8be`.
**Status** CENSUS / DESIGN RECORD. ⛔ **Read-only. No implementation, no rename,
no new name chosen, no test touched.**

> ⭐⭐ **B6 proved the new database can exist truthfully. This lane must prove
> the application knows how to speak to it without resurrecting the object we
> removed.** The branch state is precise: **schema-valid, programme-incompatible.**

> ⭐ **A mechanism can become historical. An obligation cannot disappear without
> an explicit disposition.**

---

## 0 · A record refinement, and one correction to the consumer list

⚠️ **The earlier census was a DIRECT PERSISTENCE/TABLE DEPENDENCY CENSUS**, not a
complete runtime census. It enumerated files naming the table. ⛔ Several
consumers never name it — they consume the *object* through
`proposalWork` / `preview` — which is exactly why the first pass missed them.
Renaming the earlier record accordingly.

⚠️ **And one item on the expanded list is NOT a dependency.**
`lib/manuscript/proposalChain/store.ts` matches `revisionProposal` only inside a
comment citing `store.ts:211` as the blanket-catch defect not to copy. ⛔ **Step
1 has no runtime dependency on the old object, and must not acquire one.**

**The true consumer set — eleven files, four tiers:**

```
PERSISTENCE   revisionProposal/store.ts
CONTRACT      revisionProposal/contract.ts
DERIVED READ  revisionProposal/preview.ts · revisionProposal/proposalWork.ts
ROUTES        revision-proposal/[id]/route.ts · …/accept/route.ts
              manuscripts/[id]/write-state/route.ts
CLIENT/UI     writeStateClient.ts · ProposedChange.tsx
SCRIPTS       ew-f2-stage-proposal.ts · editorial-write-01-propose-o26.ts
              ew-f2-authority-census.ts
TESTS         revisionProposal.test.ts · executionAuthority.test.ts
              consentSurface.test.ts · proposalWorkMode.test.ts
```

---

## 1 · Consumer census

| consumer | believes exists | act | old fields consumed | new owner of that fact | survives? | obligation / matrix | must move to | before schema merge? |
|---|---|---|---|---|---|---|---|---|
| `revisionProposal/store.ts` | `manuscript_revision_proposals` with wording **and** authority on one row | authorize **+** execute | `expected_text` · `replacement_text` · `execution_authority` · `decision_chain_id` · `accepted_at` · `resulting_version` | **split**: wording → `ProposalVersion` · binding + receipt → `Authorization` | ⛔ **SPLIT** | A2 A3 B7 B10 B11 B12 | store **and** execution | ⭐ **YES** |
| `revisionProposal/contract.ts` | `ExecutionAuthority` is a real axis | vocabulary | `inspection_only \| member_acceptance` | ⛔ **nothing** — the axis is gone | ⛔ **RETIRE the axis**; `applyExactlyOnce`/`occurrences` survive | A1 A4 A6 A7 B4 | pure contract (already there) | ⭐ **YES** |
| `revisionProposal/preview.ts` | one row answers *fits* **and** *may cross* | preview | whole row | `Authorization` + a Work reading | **SPLIT** | A5 B14 B15 F1-4 | integration | no |
| `revisionProposal/proposalWork.ts` | authorization acceptability defines whether proposal work exists | proposal work | `preview.state === 'acceptable'` | ⭐ **`ProposalChain` + `ProposalVersion`** — not the authorization at all | ⛔ **SPLIT** — R6 | R6 · B14 | integration | no |
| `…/revision-proposal/[id]/route.ts` | a proposal id is previewable | preview | id → preview | ambiguous: an **offer**, a **chain**, or an **authorization** | **RENAME + RE-AIM** | CS-7 CS-9 | integration | no |
| `…/[id]/accept/route.ts` | accepting a *proposal* writes the Work | execute | id only | ⭐ the act is **execute an authorization**, and the authorization already exists | **RE-AIM** | A3 CS-1 CS-2 CS-8 | execution | no |
| `write-state/route.ts` | `?proposal=` selects proposal work | mount | `ProposalWorkTarget` | chain + version | **RE-AIM** | PW-2 | integration | no |
| `writeStateClient.ts` | `ProposalWorkTarget` shape | transport | type only | follows `proposalWork` | **FOLLOWS** | PW-2 | integration | no |
| `ProposedChange.tsx` | ⚠️ **declares its OWN `ProposalPreview`** incl. `executionAuthority`; has `isInspectionOnly()` | render | `executionAuthority` | ⛔ **nothing** | ⛔ **`isInspectionOnly` RETIRES** | A5 CS-8 | integration | no |
| `ew-f2-stage-proposal.ts` · `editorial-write-01-propose-o26.ts` | can stage a row directly | staging | insert | chain + version + authorization | **REWRITE** | — | scripts | no |
| `ew-f2-authority-census.ts` | `resolveProposalWork` | census | target | follows | **FOLLOWS** | — | scripts | no |

⭐⭐ **Only two consumers must move before the schema branch merges** — the store
and the contract's authority axis. Everything else is integration, and the
integration lane is already held for other reasons. ⚠️ That is the smallest
honest unblock, not a claim that the rest is optional.

---

## 2 · The five functions, as semantic objects

⛔ **Names deliberately not chosen here.** The question is what each *does*.

### `proposeRevision()` — ⛔ **DOES NOT SURVIVE. It is two acts wearing one name.**

```
  records exact replacement wording        → an authored formulation
+ records the executable Work binding      → a permission
+ sets execution_authority                 → an axis that no longer exists
```

⭐⭐ **In the new ontology those are `appendAuthoredVersion()` and an authorizing
act, and they are performed by DIFFERENT PARTIES AT DIFFERENT TIMES** — MAIA or
the writer authors wording; only the member authorizes. ⛔ **There is no reason
to assume one function replaces it, and a single successor would re-fuse exactly
what Step 2 separated.**

⚠️ **And its `executionAuthority ?? 'inspection_only'` fail-safe has no
successor**: the safe default is now *no row*.

### `acceptRevision()` — **SPLITS INTO TWO, and the boundary has moved**

```
OLD   lock proposal · check authority · check staleness · read section ·
      exact-once guard · mutate · write receipt          ← all one function

NEW   authorize    member act · resolveGuard · create the authorization row
      execute      consume the stored authorization · guard still holds ·
                   mutate · receipt
```

⭐ **The old function's step 1 ("was this ever allowed to cross?") disappears**,
because a row's existence answers it. ⛔ **Steps 2–7 survive intact and remain
ONE TRANSACTION** — B10/B11 are untouched by this split.

### `previewProposal()` — **SPLITS along R6**

It answers two questions in one verdict: *does this still fit the Work* and *may
this cross*. ⛔ **The second is now answered by existence.** What remains is a
Work-fit question — and per **R6** it must stop being the definition of whether
collaborative work exists.

⚠️ **`mayAccept()` likely has no successor either**: it currently means
`acceptable && member_acceptance`, and the second conjunct is gone.

### `resolveProposalWork()` — ⛔ **MUST CHANGE ITS SUBJECT**

Today: *`previewProposal(...).state === 'acceptable'` or null.* So a writer
cannot discuss a proposal whose executable binding lapsed — **R6's exact
prohibition.** Its new subject is the **chain and its versions**, and
executability becomes a separate, non-gating fact.

⚠️ **Its `replacementText: ''` is a placeholder for wording it does not have.**
In the new ontology the wording is on the selected `ProposalVersion`, so the
field is not ported — it is **replaced by a version reference.**

### `mayCrossIntoTheWork()` — ⛔ **NO SUCCESSOR. Hypothesis CONFIRMED.**

```
OLD   row + authority flag  →  ask whether it may cross
NEW   no authorization row  →  cannot cross
      authorization row     →  member permission exists
```

⭐ The predicate had exactly one call site of consequence
(`store.ts:153`) and one mirror in the surface (`ProposedChange.isInspectionOnly`).
⛔ **Both retire.** The obligation they served (A1/A4/A6) is satisfied by
construction, and the matrix already records that.

⚠️ **`occurrences()` and `applyExactlyOnce()` are the exception in that file:
they are pure Work-fit law, not authority, and they survive unchanged.** They
are already re-expressed in `revisionAuthorization/contract.ts`; ⛔ **whether the
two copies converge or one is retired is a port decision, not a census finding.**

---

## 3 · The two broken suites, assertion by assertion

⛔ **Do not make these green by pointing them at `.sql.retired`, skipping,
deleting, restoring the archived filename, or adding a compatibility
view.** Any of those manufactures apparent compatibility with an object we
deliberately retired.

### `executionAuthority.test.ts` — 12 assertions

| assertion | class | where |
|---|---|---|
| only `member_acceptance` may cross | **HISTORICAL ONLY** | the axis is gone; A1 |
| `acceptRevision` refuses `inspection_only` | **HISTORICAL ONLY** | A1 |
| ⭐ refuses it **BEFORE** asking about the Work | ⭐ **PORT REQUIRED** | the *ordering* law survives: existence/ownership is asked first, before any manuscript read — A2 |
| authority read from the row, never the caller | ⭐ **PORT REQUIRED** | A3 — store |
| an absent authority is the one that cannot write | **ALREADY PROVEN** | absence; schema witness §9 + contract falsifiers |
| `mayAccept` asks the authority | **HISTORICAL ONLY** | A5's successor is integration |
| ACCEPT rendered conditionally, never greyed | **INTEGRATION REQUIRED** | A5 |
| the panel says what the proposal IS FOR | **INTEGRATION REQUIRED** | A5 |
| ⭐ never asserts an effect the same panel denies | **INTEGRATION REQUIRED** | A5 · B14 |
| accepted inspection-only row unrepresentable | **ALREADY PROVEN** | A6 — no columns to express it |
| the vocabulary is closed | **ALREADY PROVEN** | A7 — witness test 4, transposed to `operation` |
| ⭐⭐ cannot be promoted in place | **ALREADY PROVEN** | A9 — witness test 7, widened |
| rows backfilled honestly | **HISTORICAL ONLY** | A10 — N/A, no protected legacy rows |

### `revisionProposal.test.ts` — EW/CS/F1 assertions

| assertion | class |
|---|---|
| `EW-1` before acceptance nothing moved | **ALREADY PROVEN** (B1) |
| `EW-2` preparing/reading is inert | **ALREADY PROVEN** (B1) |
| `EW-3` stale base refuses | **PORT REQUIRED** — execution (B2) |
| ⭐ `EW-4` the version alone never authorizes | **PORT REQUIRED** — execution (B3) |
| ⭐⭐ `EW-5` twice is ambiguous | **ALREADY PROVEN** — pure guard (B4) |
| `EW-6/7/13` the change and only the change | **PORT REQUIRED** — execution (B5) |
| `EW-8` one write, one version advance | **PORT REQUIRED** — execution (B6) |
| ⭐ `EW-9` one change, once | **ALREADY PROVEN** — witness 6b/6c (B7) |
| `EW-10` another member's is absent | **ALREADY PROVEN** — witness 3 (B8) |
| `EW-11` no second write path | **PORT REQUIRED** — execution (B9) |
| ⭐⭐ `EW-15` one `TransactionClient` | **PORT REQUIRED** — execution (B10) |
| ⭐⭐ `EW-12` failed write leaves it UNSPENT | ⭐ **PORT REQUIRED** — execution (B11) |
| ⭐ `EW-16` receipt whole, CHECK not deferred | **ALREADY PROVEN** — witness 5/5b (B12) |
| `EW-14` writes no standing, no decision | **ALREADY PROVEN** — witness §9 (B13) |
| `o26` the first lawful change | **HISTORICAL ONLY** — a specific past act |
| ⭐⭐ `CS-3` preview and acceptance share the guard | **INTEGRATION REQUIRED** — ⚠️ **and NOT as it was** (B14 · R6) |
| `CS-4` a moved Work offers no gesture | **INTEGRATION REQUIRED** — ⚠️ R6 reshapes it |
| ⛔ `CS-5` the preview never computes an alternative | **INTEGRATION REQUIRED** (B15) |
| `CS-6` an accepted proposal previews as accepted | **INTEGRATION REQUIRED** |
| `CS-9` unknown ≡ another member's | **ALREADY PROVEN** — witness 3 |
| `F1-4` names a place, carries no prose | **INTEGRATION REQUIRED** (B16) |

### Tally

```
ALREADY PROVEN          12
PORT REQUIRED            9      store 2 · execution 7
INTEGRATION REQUIRED    10
HISTORICAL ONLY          5
─────────────────────────────
                        36 assertions · ⛔ 0 without a disposition
```

⭐ **`EW-12` is the one to watch.** *A failed manuscript write leaves the
authorization unspent* is the single most consequential obligation still
unproven in the new architecture, and ⛔ **schema cannot prove it** — it is a
transaction property, and it belongs to the execution seam.

⛔ **What happens to the two files is NOT decided here**, per the ruling.

---

## 4 · The merge gate, restated from this lane's evidence

⛔ **`d2263e8be` must not merge**, and the census sharpens why: on a clean
database B6 passes while `store.ts` still issues
`INSERT INTO manuscript_revision_proposals` — **trading an ontology collision
for a runtime/schema collision.**

⭐ **The smallest honest unblock is TWO files**, not eleven:

```
revisionProposal/store.ts       split: authorize ⇄ execute
revisionProposal/contract.ts    retire the ExecutionAuthority axis
                                (keep occurrences / applyExactlyOnce)
```

⚠️ Everything else is integration, already held. ⛔ **Not a proposal to merge
after two files — a statement of what the runtime/schema collision actually
requires.**

---

## ⛔ Standing

```
runtime-port census        COMPLETE — 11 consumers · 5 functions · 36 assertions
functions that survive     occurrences · applyExactlyOnce
functions that split       proposeRevision · acceptRevision · previewProposal
                           resolveProposalWork
functions with NO successor  mayCrossIntoTheWork · mayAccept · isInspectionOnly
obligations without a disposition   ⛔ ZERO

implementation             ⛔ NOT AUTHORIZED
the two red suites         ⛔ UNTOUCHED — not skipped, not deleted, not re-aimed
schema branch merge        ⛔ HOLD
Step 2 closure             ⛔ HOLD
route · UI                 ⛔ HOLD
production                 UNTOUCHED
maia_focus_witness         FROZEN
```
