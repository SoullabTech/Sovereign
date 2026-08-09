# Prerequisite #0 — Production → Trunk Reconciliation Report

**Date:** 2026-08-09
**Authorization:** Founder, 2026-08-09 — "Prerequisite #0 is production → trunk reconciliation. No new product implementation until that report."
**Outcome:** **No reconciliation was required. Nothing was lost.** The premise of Prerequisite #0 rested on an error in the audit, corrected below.
**Product changes made:** none.

---

## 0. CORRECTION TO THE AUDIT'S §0

The rehabilitation audit stated that production `b1399f693` was *"NOT an ancestor of `clean-main-no-secrets` (trunk)"* and that sixteen Now What? commits were live in production but absent from trunk.

**That comparison was run against the *local* `clean-main-no-secrets` ref, which is stale by 402 commits.** Against the real trunk it is false:

```
git merge-base --is-ancestor b1399f693 origin/clean-main-no-secrets  →  TRUE
```

**Production is already on trunk.** It was merged there by the ordinary PR process. All sixteen Now What? commits — including `ca8d1cac9` "the five-room ontology" — are on `origin/clean-main-no-secrets`. Verified individually: 15/15 checked commits report `on-origin-trunk`.

| Ref | Tip | Date | Contains prod? |
| --- | --- | --- | --- |
| `origin/clean-main-no-secrets` — **the real trunk** | `ced4ab513` | 2026-08-06 | **yes** |
| `clean-main-no-secrets` — local ref, **stale** | `f9a7326f1` | 2026-08-03 | no |
| production container | `b1399f693` | 2026-08-05 | — |

The local ref had not been advanced since 2026-08-03 even though the repository's last fetch was 2026-08-09 17:59. The audit read a ref that had stopped moving and reported it as trunk.

The finding was real in one respect and inverted in another: there *is* a lineage problem, but it is a **stale local ref**, not lost production work. **There is no lineage to recover.** Steps 1–3 of the authorized sequence resolve to "nothing to reconcile"; the substantive residue is in §3 below.

### The direction of staleness is also inverted

Production is **behind** trunk, not ahead:

- commits `origin/clean-main-no-secrets` has that production lacks: **4**
- commits production has that `origin/clean-main-no-secrets` lacks: **0**

One of the four touches Now What?: **`808d5b6ba fix(now-what): name each room once, from the registry`** — 5 files, 26 insertions. It fixes a real member-visible defect found during the 2026-08-06 production acceptance walk: a member met *"Coaching Room"* at the signed-out door of `/now-what/coaching` and *"My Coaching"* on the map — the same place, named twice. Four instances; three renderers, only one of which read the registry. **This fix is merged and undeployed.**

---

## 1. RECONCILED COMMIT GRAPH

```
7c9dd5192 (2026-08-01, PR #868)  ── merge-base of everything below
   │
   ├─► [the five-room work: 16 commits incl. ca8d1cac9]
   │        │
   │        └─► ac5e4b981 ─► 251c717db ─► b1399f693 (PR #972)  ◄── PRODUCTION (deployed 2026-08-06 03:58Z)
   │                                          │
   │                                          └─► +4 commits (incl. 808d5b6ba)
   │                                                   │
   │                                                   ▼
   │                                          ced4ab513 (PR #992)  ◄── origin/clean-main-no-secrets = CANONICAL TRUNK
   │
   ├─► f9a7326f1  ◄── local clean-main-no-secrets — STALE ref + 18 unpushed doc commits
   │
   └─► 851c2e73a  ◄── feature/labtools-redesign — working branch, 402 behind trunk
```

---

## 2. PRODUCTION-ONLY FUNCTIONALITY PRESERVED

**All of it — by the ordinary merge process, before this session began.** The now-what file lists of production and canonical trunk are **identical**; the only content delta is `808d5b6ba` (5 files, 26 insertions, trunk ahead).

Preserved and verified present on canonical trunk:

- The five-room ontology (`ca8d1cac9`) — My Question · My Work · My Coaching · My Story · The Room
- The placing gesture and question-gesture persistence (`f6606b8a8`, `3a13e5634`)
- The warm register / navy removal (`b7af060d9`, `76a5e5c45`, `597e326f2`)
- Direction B wordmark + brand directions for Larry (`82030aacd`)
- Daily thought band (`06c5b2649`)
- The room registry `lib/nowWhat/rooms.ts` and its retired-route redirects
- Six-domain provenance comment marked pending Larry validation (`daa3c54fa`, `1d8edcc7c`)

### Evidence preservation (non-destructive, no cleanup performed)

Two refs were created so nothing can be lost regardless of later decisions. Neither moves any existing branch:

| Ref | Points at | Protects |
| --- | --- | --- |
| `rescue/prod-deployed-b1399f693` | `b1399f693` | the exact deployed production tree |
| `rescue/local-trunk-docs-2026-08-03` | `f9a7326f1` | the 18 unpushed local-trunk commits (§3.1) |

---

## 3. CONFLICTS REQUIRING FOUNDER JUDGMENT

Three. None were acted on.

### 3.1 Eighteen unpushed commits sitting on the local trunk ref

`git cherry` reports all 18 as genuinely absent upstream (`+`), not equivalents. All are dated 2026-08-03, all are `docs`, **none touch `now-what` code**. They were committed directly onto a local branch named `clean-main-no-secrets` and never pushed.

Representative: `7b868d8f3 docs(specs): Larry Practice Workspace v1 UI/UX specification — draft, not ruled`; `c83627605 docs(now-what): client environment map — seven rooms, six columns each`; `5b05d1f7c docs(ain-os): entry architecture — one house, doors per relationship`; `08375b704 docs(now-what): the rooms in the house — delta only, prior IA left canonical`.

**The hazard is not the content — it is the ref name.** A branch called `clean-main-no-secrets` that is not trunk will mislead the next reader exactly as it misled this audit. Several of these documents also predate the five-room ratification and describe a *seven-room* environment; if they are recovered as-is they will re-enter as an incomplete referent — the specific failure the founder's direction warns against.

**Judgment needed:** push these onto trunk as a docs branch, retire them as superseded by the 2026-08-05 ontology ruling, or preserve as evidence only. Separately: the local ref should be repointed at origin, which is safe only once the 18 commits have a decision.

### 3.2 `/now-what/admin` — a practitioner stewardship surface that exists only on the working branch

`app/now-what/admin/page.tsx` (371 lines) and `app/api/now-what/admin/route.ts` (159 lines) exist on `feature/labtools-redesign` and on **no other ref** — not trunk, not production, not the local trunk ref. Introduced by `ab57d848b feat(now-what): practitioner stewardship surface — authority at the API, Monitor as translation health` and `95cfae2e8`.

This is genuine unmerged work, reachable from ClientHome's "Practitioner" door on that branch. It is the only substantive Now What? capability anywhere in the repository that is **not** on canonical trunk.

**Judgment needed:** does the practitioner stewardship surface survive into the rehabilitated product (§16 "My Practice"), and should it be reconciled onto trunk now as evidence, or held?

### 3.3 The working branch is a divergent, superseded Now What?

`feature/labtools-redesign` branches from `7c9dd5192` (2026-08-01) and is **402 commits behind** canonical trunk. It does not contain the five-room work. Its now-what diff against trunk is **852 insertions / 1,782 deletions across 23 files** — merging it as-is would delete `work/page.tsx`, `practice/page.tsx` and `home/page.tsx` and restore the superseded eight-door `ClientHome`.

Per the founder's direction, this branch is **not** the authoritative future state. It also carries substantial *non*-now-what work in the current dirty working tree (practitioner-field docs, `lib/team/sessionTeamScope.ts`, studio changes, `PROJECT_ORIENTATION.md`).

**Judgment needed:** the branch's now-what work is superseded, but its practitioner-field and studio work may not be. It should be separated before any rebase, not rebased wholesale.

---

## 4. CANONICAL NOW WHAT? BASELINE

**`origin/clean-main-no-secrets` @ `ced4ab513`** is the canonical baseline. Verified, not assumed.

Room registry — `lib/nowWhat/rooms.ts`, single source of truth:

| key | name | route | exposure |
| --- | --- | --- | --- |
| `home` | Home | `/now-what` | open |
| `map` | Map | `/now-what/map` | open (the wordmark, not a nav pill) |
| `question` | My Question | `/now-what/questions` | open |
| `work` | My Work | `/now-what/work` | open |
| `coaching` | My Coaching | `/now-what/coaching` | open |
| `story` | My Story | `/now-what/field` | open |
| `room` | The Room | `/now-what/room` | open |

### Proof the five-room experience is intact (founder step 5)

Run in an isolated worktree at `ced4ab513`:

```
PASS lib/nowWhat/__tests__/rooms.test.ts
PASS lib/nowWhat/__tests__/invitationGate.test.ts
PASS __tests__/now-what-withdraw-practitioner-visibility.test.ts

Test Suites: 3 passed, 3 total
Tests:       60 passed, 60 total
```

The registry suite asserts precisely what the founder asked to be proven, including:

- *DISK → REGISTRY: every route directory is a room, a known non-room, or a real redirect*
- *retired routes actually redirect — no shadow rooms*
- *the five rooms are exactly the ratified ontology*
- *the five-room ontology carries no gated rooms — held capabilities are not advertised (ruling D-E)*
- *shell and map cannot describe different environments (structural)*
- *every route the map links is a registered room*

The disk→registry test is the mechanical guarantee that the ontology cannot silently drift. It passes on the canonical baseline.

### Note on the map

`/now-what/map` is a **registered open room** on canonical trunk, and the registry test asserts *"every route the map links is a registered room."* Retiring the map from the member experience is therefore a **registry change with test consequences**, not a route deletion. Cheap, but it must be done through `rooms.ts` — that is the mechanism that keeps the map and the house from disagreeing again.

---

## 5. THE FIVE OPEN REHABILITATION QUESTIONS, AGAINST THE CANONICAL BASELINE

Re-asked against `ced4ab513`. Answers unchanged by reconciliation except where noted.

1. **Client identity — `stellium_clients` vs `practitioner_clients`.** Unchanged and now the first genuine structural hazard. Confirmed on canonical trunk: `/api/portal/[slug]/book` writes `stellium_clients`; `/api/now-what/home` reads `practitioner_clients`. Per founder direction, nothing client-dependent proceeds until this is settled, and no third model is created.
2. **Enrollment vs position.** Unchanged. `field_program_positions` carries the Catalog §8 boundary (no practitioner read, ever; departure hard-deletes). Enrollment must be its own relationship beside it.
3. **Assistant naming for Larry's product.** Unchanged; still hard-coded. See Q5.
4. **Larry's authored content.** Unchanged. No Larry-authored corpus in the repository. The unattributed posture on the six dimensions is intact on canonical trunk (`daa3c54fa`, carried by `1d8edcc7c`) and should stay until validation exists.
5. **`fieldContext`.** Unchanged — threaded through every route on canonical trunk. **Newly sharpened:** the hard-coded practitioner identity is worse than the audit reported. `NowWhatRoom.tsx`'s `OPENING_FRAME` names **Kelly** to the member in a ~700-word block, and the room registry has no practitioner dimension at all. Deriving practitioner identity from the relationship is therefore not a copy edit — it needs a resolved practitioner in the room's data path, which is blocked on Q1. **Q1 gates the Kelly/Larry fix.**

---

## 6. WHAT PREREQUISITE #0 ACTUALLY LEAVES TO DO

The authorized six-step sequence resolves as:

| Step | Status |
| --- | --- |
| 1. Establish exact history of `b1399f693` and the 16 commits | **done** — all on canonical trunk |
| 2. Safest reconciliation path | **not required** — already reconciled upstream |
| 3. Classify production-only changes | **done** — zero production-only changes remain; §3 lists the real residue |
| 4. Reconcile without redesigning | **no-op for production**; §3.1–3.3 await founder judgment |
| 5. Prove the five-room experience survives | **done** — 60/60, incl. disk→registry |
| 6. Stop and report | **this document** |

Remaining, pending founder judgment only — no product work:

- **R1.** Decide the 18 unpushed local-trunk commits (§3.1), then repoint the local `clean-main-no-secrets` ref at origin. Safe only in that order.
- **R2.** Decide `/now-what/admin` (§3.2) — the one unmerged Now What? capability.
- **R3.** Decide how to separate the working branch's superseded now-what work from its live practitioner-field/studio work (§3.3).
- **R4.** Deploy `ced4ab513`, or at least `808d5b6ba`, so production stops showing a member two names for one room. This is a deploy decision, not product work.

Rehabilitation begins from `ced4ab513` once R1–R3 are ruled and Q1 (client identity) is settled.

**Standing note, per founder:** production is the authoritative *implementation* referent, not automatically the authoritative *product design*. Whether My Question / My Work / My Story are distinct environments, filtered views, or a combination remains open — the audit's §H recommendation (consolidate to Notes with labels) is a proposal, not a ruling.

---

## 7. FOUNDER RULINGS — 2026-08-09 (Prerequisite #0 closed)

Prerequisite #0 accepted as complete. `origin/clean-main-no-secrets @ ced4ab513` recorded as the **canonical Now What? development baseline**. Production `b1399f693` is a normal ancestor, four commits behind; **there is no production lineage to recover.**

**Ruling 1 — the 18 unpushed commits (R1).** Do **not** merge, recover, or fast-forward them as a unit. Preserve `rescue/local-trunk-docs-2026-08-03` as historical evidence. Their **seven-room documents predate the five-room ratification and are historical/proposal material**, not current architecture, unless a document is individually shown to remain current. *The misleading branch name must not establish authority.* The stale local ref should eventually be renamed or archived so it cannot masquerade as trunk again — but only after any still-useful commits are individually classified.

**Ruling 2 — `/now-what/admin` (R2).** Do **not** merge or rebase the 402-commit-behind working branch. Open a **narrow salvage trace for `/now-what/admin` only**: provenance; actual capabilities; data/API dependencies; audience; whether "admin" in fact means practitioner stewardship; overlap with current Studio/practitioner surfaces; conformance to the five-room ontology; and whether its proper home is **My Practice, Studio, or nowhere**. If valuable, **transplant or reimplement onto current trunk from evidence — never by merging the stale branch.** No transplant yet.

**Ruling 3 — practitioner identity (R3).** The hard-coded Kelly copy is a correctness defect but is **gated by Q1**. Do **not** patch `"Kelly"` → a dynamic string independently. First resolve the canonical practitioner/client relationship and the correct identity source for the room — otherwise the text gets fixed while the wrong identity substrate is hardened.

**Preserved finding.** Retiring `/now-what/map` from the member experience is a **registry/ontology change governed through `lib/nowWhat/rooms.ts` and its tests** — not merely deleting a page. `map` is a registered open room and the suite asserts *"every route the map links is a registered room."*

**Governance lesson, founder-stated.** *The system's tests were more trustworthy than the branch names.* The room registry and its invariants told the truth; the stale local ref created the false narrative. Names and documentation drift; **executable relationships must remain the stronger witness.** This is the failure mode AIN's engineering governance should increasingly guard against.

**Next deliverable:** Q1 as a decision instrument → `Q1_CLIENT_IDENTITY_DECISION_INSTRUMENT_2026-08-09.md`. No product implementation until Q1 is ruled.
