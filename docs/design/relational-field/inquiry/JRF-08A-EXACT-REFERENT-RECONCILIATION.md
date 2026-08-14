# JRF-08A — Exact-Referent Reconciliation

**PROPOSED — NOT RATIFIED** · steward: JARVIS · 2026-08-13 · **Building remains closed**

Ordered by the founder after JRF-08 was found to have run against the working tree rather than the
production referent. Every claim below is re-tested by ref-bound read against the exact SHA.

## Refs bound

| Symbol | SHA | Date | Standing |
|---|---|---|---|
| **P** — production / trunk | `22200f967` | 2026-08-13 | verified on `origin/clean-main-no-secrets` |
| **B** — inquiry tree | `d41b8b355` | 2026-08-11 | `feature/labtools-redesign`, HEAD, dirty |

`P` is `fix(relational): contain inferred rupture state at write and at read` — founder ruling
2026-08-13. **B predates P by two days.** The inquiry therefore searched a tree from before the
containment landed.

---

## The reconciliation matrix

| # | Claim | Ref tested | Production (`22200f967`) | Inquiry branch (`d41b8b355`) | Standing |
|---|---|---|---|---|---|
| 1 | `DECLARATION_CAPABLE_SOURCES` exists | exact SHA both | **EXISTS** — `lib/relationships/relationshipSignalService.ts:169`, plus `__tests__/ruptureContainment.test.ts` | **ABSENT** — 0 hits in `*.ts/*.tsx/*.sql` | ⛔ **INQUIRY FINDING RETRACTED** |
| 2 | Write containment exists | exact SHA | **EXISTS** — `:178`, `insertRelationalSignal` withholds `ruptureState` unless source proves member authorship | absent | ✅ established at P |
| 3 | `rowToSignal` read containment exists | exact SHA | **EXISTS** — `:285`, gates `ruptureState` on the same set; `:319`/`:346` are the only read paths | absent | ✅ established at P |
| 4 | DB `source` constraint operative | exact SHA | **EXISTS** — `20260409000010_member_relational_signals.sql:49` `CHECK (source IN ('maia_conversation','labtool_manual'))` | same | ✅ established, both |
| 5 | `relationship_field_state.elemental_dynamics` read with no writer | exact SHA | **HOLDS** — read `app/api/relationships/[id]/route.ts:43,76`; declared `20260403000001:30`; no writer found | same | ✅ established at P |
| 6 | Relationship ownership hole | exact SHA | **HOLDS** — `app/api/maia/relational-signal/route.ts:131-133` takes `body.relationshipId` with no ownership check | same | ✅ established at P |
| 7 | `relationship_essences` persists reusable assertions | exact SHA | **PRESENT** — `app/api/relationship-essence/route.ts`, `app/api/sovereign/app/maia/list/route.ts`, migration `20260115000004` | same | ⚠️ present at P; *behaviour* not established |
| 8 | Relationship surfaces production-reachable | exact SHA | **FILES PRESENT** — `app/relationships/page.tsx`, `app/relationships/[id]/page.tsx` | same | ⚠️ file-present ≠ reachable — **NOT ESTABLISHED** |
| 9 | Constitution + ratification brief trunk-reachable | exact SHA | ⛔ **ABSENT FROM TRUNK** | ⛔ **UNTRACKED** (`??`) | ⛔ **NO REPOSITORY CUSTODY** |

---

## R-1 · The central contradiction, resolved against the inquiry

Production is right. The inquiry was wrong.

```
22200f967:lib/relationships/relationshipSignalService.ts:169
  const DECLARATION_CAPABLE_SOURCES: ReadonlySet<string> = new Set();
```

with the comment at `:176-177` — *"Fail closed: withhold the relationship-state assertion unless this
source can positively prove member authorship. Today none can."* — and the same set gating the read
path at `:285`, above the note that *"the 97 historical rows keep their stored value untouched; they
simply stop being handed to anything that could speak them in the member's voice."*

**The containment is structural, fail-closed, present at both write and read, and carries a
118-line test.** JRF-02's finding — corroborated by JRF-01, four searches, one control — was **true of
`d41b8b355` and false of production.**

This is the exact failure the referent-discipline instrument names: *absence from a search is evidence
about the search.* Two invocations, two methods each, a working control — and all four searched the
wrong tree. **Corroboration across agents does not substitute for binding the ref.** The steward
verified custody (which branch HEAD sat on) and then failed to re-bind the *findings* to production,
which is the error being recorded here.

**Consequence: founder decision D-4 is DISSOLVED.** It asked whether a governing document may cite a
containment as structural with no code referent. The referent exists. The question was an artifact.

## R-2 · What survives unchanged

Rows 2–7 hold at production. Specifically **C-2 survives** (`elemental_dynamics` read on a
member-facing route with no writer — Earth and Fire), and the **ownership hole survives**
(`relational-signal/route.ts:131-133`). These were re-tested at `22200f967`, not inherited.

## R-3 · Air's retraction is vindicated, and must not be re-committed

`git diff --stat 22200f967..d41b8b355` shows the containment files as **deletions** — 295 lines
across `ruptureContainment.test.ts`, `formatRelationalContextForPrompt.ts`, and
`relationshipSignalService.ts`.

**This does not mean the branch deletes the containment.** It means the branch predates it. A diff
from a newer ref to an older one renders every later addition as a deletion. Air derived precisely
this false defect during the inquiry, caught it, and retracted it. **The steward re-encountered the
same artifact and is recording the correct reading rather than the alarming one.** Earth's custody
hazard (this tree lacks the containment) and Air's retraction (the containment is on trunk, there is
no defect) are both true and not in conflict.

⚠️ **NOT ESTABLISHED and not asserted:** what a merge of `feature/labtools-redesign` would do to these
files. A clean merge should preserve trunk's containment because the branch never touched it — but
that is a prediction, not a test, and this branch is dirty with deletions elsewhere.

## R-4 · The custody finding that outranks everything the inquiry produced

**A1, A2, A4 and A5 have no repository custody at all.** `git status --porcelain` returns `??` for
`docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md`, `docs/design/relational-field/`, and
`docs/governance/RELATIONSHIP_ROOM_CONSTITUTION_RATIFICATION_BRIEF_2026-08-13.md`. They are untracked
working-tree files — not on trunk, not on the branch, not in any commit.

The steward's opening verification confirmed these documents *existed* and bound them by path. That
satisfied the existence claim and **not** the custody claim. `exists ≠ committed ≠ pushed ≠ merged ≠
on trunk`. The founder's hold — *"the Constitution exists on this tree, but that tree is not trunk"* —
is confirmed, and is stronger than stated: they are on **no** tree in the repository.

Eleven invocations reasoned from four documents that a fresh clone does not have. Their content is
unaffected; their **standing as governing authority** is not established.

---

## Effect on the eight founder decisions

| # | Status after reconciliation |
|---|---|
| D-1 Release marks or destroys | **STANDS** — internal to A2, unaffected by ref |
| D-2 Correct extinguishes offerability | **STANDS** |
| D-3 A1 §5 vs A2 §8③ | **STANDS** |
| D-4 structural containment without referent | ⛔ **DISSOLVED** — referent exists at `22200f967:169` |
| D-5 structural reading requires a member act | **STANDS** — Fire's case is design-level |
| D-6 `retrieval_consent` scoping | **STANDS** — still the only irrecoverable one |
| D-7 does the taxonomy close at five | **STANDS** |
| D-8 strike "what is trying to emerge" | **STANDS** |
| **D-9 (new)** | **Must A1/A2/A4/A5 hold repository custody on trunk before any ruling binds them?** *Recommended: yes — commit before ruling. An untracked governing document cannot be cited, diffed, or relied upon by a second lane, and eleven invocations just reasoned from documents no clone contains.* |

**Everything else in JRF-08 remains PROPOSED — NOT RATIFIED**, and the production claims marked
second-hand there (all row counts, `relationship_essences` behaviour, surface reachability) remain
**NOT ESTABLISHED** — no database or runtime access was exercised at any point in this programme.
