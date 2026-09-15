# JARVIS-KP-01 · ACT 3 — AUTHORITY-PROVENANCE CENSUS

**Lane:** `JARVIS-KP-01` — Shared Operational Knowledge Plane
**Act:** ACT 3 — Authority-provenance census only (opened by founder act, 2026-09-15)
**Date:** 2026-09-15
**Performed by:** Claude (agent)
**Predecessors:** ACT 1 (`cc902341`) · Dispositions (`4baf1c2e`) · ACT 2 (`7940e252`)

---

## 0. Standing and custody

**Question:** *When the repository asserts `subject + axis + value`, what existing evidence tells an
agent why that assertion has standing?*
⛔ **Not:** *how should we encode it?*

```
ACT CUSTODY ........ ⚠️ NONCONFORMING — branch refused by committed policy; core.hooksPath unset
AUTHORITY STANDING . ⛔ not increased by this commit or push
CUSTODY DEFECT ..... ⚠️ ongoing, not cured
```

⛔ Reliance is not custody. This record cannot certify its own compliant execution.

---

## 1. ⚠️ A method failure caught mid-act, reported before its results

The first trace run reported that four ratified canon documents "first appear" in a single merge on
2026-09-06 — **after** their claimed ratification dates. That reads as devastating evidence that
ratification claims have no acts behind them.

**It was an artifact of the instrument.** This container holds a **shallow clone**: 233 commits, all
dated 2026-09. Every file's history terminated at the clone boundary.

After `git fetch --deepen=2000`: **5,851 commits**, root `d0a99cabc 2025-11-23 "Initial clean commit
without secrets"`.

⭐⭐ **Finding P0 — provenance has two horizons, and an agent sits inside both without being told.**

| Horizon | Boundary | Consequence |
|---|---|---|
| **Clone horizon** | shallow by default in this environment | an agent cannot distinguish *"no act exists"* from *"the act is beyond my horizon"* |
| **Repository horizon** | `clean-main-no-secrets` begins 2025-11-23 at a secrets-scrubbed root | nothing before that date has ancestry on the canonical branch **at all** |

⛔ **This is the exact shape of the failure acceptance test 1 forbids, inverted**: not mistaking an
authority word for standing, but mistaking a *carrier limit* for an *absence of authority*. The
false finding was one sentence away from being recorded as fact.

⭐ Every trace result below was re-run after deepening. ⚠️ The second horizon was **not** crossed and
cannot be from here: acts before 2025-11-23 are unreachable on this branch by any depth.

---

## 2. ⭐⭐⭐ The principal finding: the substrate already exists, is enforced, and is empty

`.ain/` contains a working machine-readable epistemic claim system, CI-enforced and fail-closed.

### 2.1 What exists

| Component | Location | Status |
|---|---|---|
| Claim records | `.ain/claims/*.json` | **1 file** |
| Append-only ledger | `.ain/epistemic-ledger.jsonl` | **2 rows** |
| Adjudicator | `scripts/builder/epistemic-ci.mjs` | present |
| Guard | `scripts/builder/epistemic-guard.mjs` | present, blob-pinned |
| Authoritative CI gate | `.github/workflows/jarvis-epistemic-guard.yml` | **branch-protection-required** on `clean-main-no-secrets` and `main` |
| Founder ruling behind it | 2026-08-16, quoted in both files | recorded |

Declared flow:

```
target canonical SHA → canonical ledger history (trusted prior state)
                     → CI adjudicator ◀── PR claim record(s)
                     → independently computed result
                     → compare against the PR's proposed ledger delta
```

**FAIL CLOSED**, blocking on: missing claim · malformed claim · guard unavailable · refused claim ·
history mutation · ledger-delta mismatch.

### 2.2 ⭐⭐ It already answers ACT 3's question — in executable code

`epistemic-guard.mjs` classifies evidence by kind, and **names which kinds constitute authority**:

```js
const AUTHORITY_KINDS = new Set(['founder_ruling', 'ratified_canon']);
```

```js
// Evidence whose whole content is a human assertion about the system. Never sufficient,
// alone, for a claim about what the running system does.
const WEAK_KINDS = new Set([
  'code_comment', 'filename', 'naming_convention', 'import_graph',
  'architecture_doc', 'historical_assertion', 'project_memory', 'worker_claim',
]);
```

Full known set (22 kinds): the eight weak kinds above, plus `runtime_route_trace` · `edge_trace` ·
`endpoint_proof` · `production_observation` · `db_query` · `log_marker` · `telemetry_label` ·
`indexed_row_coverage` · `known_retrieval` · `executable_gate` · `founder_ruling` ·
`ratified_canon` · `deployed_commit` · `incident_record`.

⭐ Note what `WEAK_KINDS` contains: **`filename`, `architecture_doc`, and `project_memory`** — the
three carriers ACT 1 independently identified as most misleading (the 59 inflation-named root files;
the undated architecture corpus; the dangling assistant-memory citation). **An executable guard had
already classified them as never-sufficient, and ACT 1 rediscovered it from the other end.**

### 2.3 ⭐⭐⭐ And it has one row

```
row 1  type: genesis      2026-08-16T15:49:18.333Z   prior_authoritative_rows: 0
row 2  type: transition   claim_id: JARVIS-ADMISSION-001
                          HYPOTHESIS → OBSERVATION   verdict: PERMITTED
                          assertion: "The epistemic guard proof harness reports 49 passed
                                      and 0 failed against guard blob cd015f5b9…"
                          evidence_keys: ["executable_gate", …]
```

⛔ **The only claim the system has ever carried is a claim about its own installation.** In the
thirty days since, every lane in this repository — S3, Circles, WS2, W4/W5 — asserted standing in
prose records instead.

⭐ The genesis row also states, unprompted, the discipline this lane has been operating under:

> *"Claims made before this point were not adjudicated by this control and are **NOT retroactively
> represented**."*

⚠️ **Scope, quoted exactly, because the gate states it and it must not be inflated:** a green run
establishes *"Axis 1 enforced in authoritative CI against submitted, well-formed claim records"* and
**NOT** that claims are true, **NOT** that fabricated evidence is detected (*"evidence fields are
self-declared; form and class are checked, not veracity"*), **NOT** that inadmissible claims cannot
enter by another route.

⛔ **This act does not propose using, extending, populating, or wiring this system.** It is
censused because it is the repository's own answer to ACT 3's question, and no census of authority
provenance that omitted it would be honest.

---

## 3. Trace results — does an authority word have an act behind it?

**Method:** take documents asserting standing; attempt to locate the act in a durable carrier
**other than the document's own assertion**.

| Document | Asserts | Act located? |
|---|---|---|
| `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` | `Ratified canon — 2026-07-01` | ✅ **YES** — `bc4cb3041` *add (**proposed** backbone)* → `6a2a4c8f6` *reconcile per 2026-07-01 audit* → **`07fdb31fa` `canon: ratify Constitutional Direction of Authority (load-bearing)`** |
| `RECOGNITION_INTEGRITY.md` | `Canon — placed as Invariant 16` | ✅ **YES** — `49c5c3236` *place Recognition Integrity into Sovereignty Invariants (Invariant 16)* |
| `CLAIM_STATE_AUTHORITY.md` | `Promoted 2026-09-05 (steward ruling)` | ✅ **YES** — `canon(claim-state): separate ruling authority from evidentiary state`, same date; the claim also **names the act kind** |
| `VERIFICATION_STATES.md` | `Ratified: 2026-07-01` | ⛔ **NO** — five authoring commits, all **2026-06-30**; no ratifying act on any date, in the file's history or the repository's |

⭐⭐ **Finding P1 — a ratification act is a real, locatable object for some documents and absent for
others, and the document text reads identically in both cases.** `Ratified: 2026-07-01` on
`VERIFICATION_STATES.md` and `Ratified canon — 2026-07-01` on `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`
are indistinguishable as prose. One has a commit that performs the act. One does not.

⚠️ ⛔ **This does not establish that `VERIFICATION_STATES.md` was never ratified.** Per P0, the act
may sit in a carrier this agent cannot reach — an oral founder act, a session, a pre-2025-11-23
commit. **The finding is that the act is not locatable, which is a statement about traceability,
never about validity.** Distinguishing the two requires an authority this act does not hold.

### 3.1 Rate

Across 5,851 commits, **11** perform an explicit ratification/adjudication act in the message
(`canon: ratify …`, `docs(s3): ratify …`, `docs(circles): … ratify FR-14`). ⭐ The pattern is
consistent and legible where used: **the ratifying act is a separate commit from the authoring
commit**, and the verb is in the subject line. It is simply not used for most standing claims.

---

## 4. Does standing derive from a carrier, an act, a person, or a witness?

**All four, in different combinations.** Observed forms:

| Form | Standing derives from | Example |
|---|---|---|
| **Act-borne** | a discrete commit performing the act | `07fdb31fa canon: ratify …` |
| **Person-borne** | who performed it | `Founder Acceptance · Founder-Steward only`; `steward ruling` |
| **Witness-borne** | an execution against reality | S3-O1 production witness; Co-Lab gate `33 passed · 0 failed` |
| **Carrier-borne** | location + declared class | a file being *in* `docs/canon/` |
| **Enforcement-borne** | a gate that refuses | `AUTHORITY_KINDS`; branch protection; `typecheck:baseline --accept-current` |
| **Self-asserted** | the document saying so | `Status: Canon` with no locatable act |

⭐ **Finding P2 — carrier-borne standing is the weakest and most used.** Nothing about being in
`docs/canon/` confers ratification: ACT 2 found that directory holding ratified canon, candidates,
drafts, working doctrine and one `Recorded, not ratified` document side by side. **Location reads as
authority and is not.**

---

## 5. ⭐⭐ Composite authority — discovered, not flattened

Acceptance test 2 was right to require this. Standing is frequently established by **several
carriers jointly, none sufficient alone**, and the records say so explicitly.

**Observed composite: `WS2-08 BUILD-08A` closure**

```
founder ruling ──┐
PR merged as 03e9d89a ──┤
migration applied 13:36:01Z ──┼── together: ACCEPTED
production witness on runtime 50302f5d ──┤
F1·F2·F3·F6a·F6b ALL PASS ──┘
```

⭐ And the same record **refuses** to let one member stand alone: *"deploy established by state
evidence; transcript not recovered, non-blocking"* — a named gap inside an accepted composite.

**Observed composite: `I0.5` acceptance** — requires **two independent witnesses**, canonical
candidate *and* production state, with the ruling stated in advance: *"On both green the ruling is
ACCEPTED AS CURRENT DEPLOYED STATE."*

⭐⭐ **Finding P3 — where authority is composite, the composition is declared in advance and the
members are named.** This is the strongest provenance practice in the repository. It is also
entirely prose, per-lane, and reinvented each time.

⭐ **Finding P4 — sequence is itself load-bearing.** The 2026-09-07 drift finding turns on order,
not content: *"a deploy must not edit the schema ahead of the ruling that authorizes it."* The same
artifacts in a different order produce a different standing. ⛔ Order is preserved nowhere mechanically.

---

## 6. Does the repository distinguish *"this document says X"* from *"X has authority"*?

⭐ **Yes — explicitly, repeatedly, and in three independent places.**

1. `CLAIM_STATE_AUTHORITY.md`: *"Evidence licenses; it does not itself edit the public record."*
   Verdicts `PASS · FAIL · **INVALID**`, with INVALID licensing nothing in either direction —
   *"treating INVALID as PASS is the single most likely way this canon gets defeated."*
2. `THREE_AUTHORITY_CHAINS.md`: evidence for one chain is *prerequisite* to the next and may not
   *substitute* for it. *"18/18 persistence gates pass"* is a prerequisite for acceptance, **not**
   an acceptance.
3. `epistemic-guard.mjs`: `WEAK_KINDS` — *"evidence whose whole content is a human assertion about
   the system. Never sufficient, alone."*

⛔ **Finding P5 — the distinction is thoroughly ruled and mechanically unavailable.** A reader
encountering `Status: Canon` receives the document's assertion about itself with no marker
distinguishing it from an assertion backed by a locatable act.

---

## 7. How is supersession presently established?

| Mechanism | Observed | Strength |
|---|---|---|
| In-place prose edit marking the superseded clause | dominant — 56 `SUPERSEDED` uses | ⭐ excellent human discipline; ⛔ machine-invisible |
| Dated successor record | common in `docs/programme/` | ⚠️ requires knowing the successor exists |
| Commit ancestry | always present | ⛔ records *changed*, never *superseded* |
| `supersedes` / `superseded_by` field | ⛔ **none** | — |
| git tags / notes | ⛔ **0 / 0** | — |

⭐ The repository's practice is notably good: superseded claims are **retained and marked**, not
deleted — ACT 1 recorded the 2026-09-07 bullet correcting two of its own earlier readings in place.
⛔ **Supersession is therefore established by an author's discipline at write time and is
unrecoverable by anything except reading.**

⚠️ One structural exception: the `.ain` ledger blocks **history mutation** — the only mechanically
enforced supersession-adjacent control found.

---

## 8. Inherited vs explicitly granted authority

| Mode | Example | Verdict |
|---|---|---|
| **Explicitly granted** | founder act naming a SHA; `Class A/B/C`; `--accept-current` | ⭐ traceable |
| **Inherited by location** | file placed in `docs/canon/` | ⚠️ not authority (P2) |
| **Inherited by merge** | ⭐⭐ *"merging a migration to the production branch is, in effect, authorizing it to be applied by whoever deploys next"* | ⛔ **latent, unintended, already caused a production drift** |
| **Inherited by citation** | a record citing an accepted predecessor | ⚠️ the defect the custody disposition prohibits — reliance is not custody |
| **Environment-conferred** | branch policy not enforced where the hook is absent | ⛔ *absence of the gate is never evidence of compliance* |

⭐⭐ **Finding P6 — the most consequential authority transfer in the system is inherited and
undeclared.** Merge-to-canonical converts repository write into deferred production schema
authority. It is not named in any claim, carries no act, and is discoverable only by reading a
2026-09-07 incident record.

---

## 9. Which signals have enforcement, and which are prose?

| Signal | Enforcement | Where |
|---|---|---|
| Evidence-kind classification incl. `AUTHORITY_KINDS` | ✅ **blocking CI, fail-closed** | `epistemic-guard.mjs` + workflow |
| Ledger history integrity / delta match | ✅ blocking | `epistemic-ci.mjs` |
| Correction anatomy — 7 rungs required | ✅ blocking (`G6`) | guard |
| Type-debt baseline movement | ✅ refuses without `--accept-current` | `typecheck:baseline` |
| Supabase / vendor / provenance bans | ✅ `check:*` scripts, pre-commit | `package.json` (14+ checks) |
| Constitutional verifiers (Co-Lab 33/0/0 etc.) | ✅ exit-coded | `scripts/verify-*` |
| Deploy provenance + lane token | ✅ fail-closed | deploy scripts, Dockerfile |
| Covenant / sovereignty / canonical-PR gates | ✅ CI workflows | `.github/workflows/` |
| **`Status:` headers** | ⛔ **none** | canon convention |
| **Programme `Standing:` blocks** | ⛔ **none** | prose |
| **`Ratified:` dates** | ⛔ **none** | prose |
| **Cat 1–6** | ⛔ **none** | anchor + dangling memory |
| **Branch policy** | ⚠️ **conditional on environment** | hook absent here |

⭐⭐ **Finding P7 — enforcement and standing are inversely correlated.** Everything enforced concerns
*code, deployment, and bans*. Almost nothing enforced concerns *whether a governance claim has
authority* — except the one system holding a single row about itself.

---

## 10. Acceptance-test self-audit

| # | Test | Result |
|---|---|---|
| 1 | Fails if it treats an authority word as evidence that standing was validly acquired | ✅ **PASS** — every claim was trace-attempted; §3 separates located from not-located; §3 explicitly refuses to convert *not locatable* into *not ratified*. §1 reports an instrument failure that would have produced exactly this error. |
| 2 | Fails if it assumes every standing claim has one authoritative carrier | ✅ **PASS** — §5 documents two composites with named members and declared composition; §5 P4 records that sequence is itself load-bearing. |

---

## 11. Standing

```
JARVIS-KP-01 · ACT 3 — AUTHORITY-PROVENANCE CENSUS ............. COMPLETE

Provenance horizons found ...................................... 2 (clone · repository root)
Instrument failures caught and reported ........................ 1 (shallow clone, §1)
Standing-derivation forms observed ............................. 6
Ratification acts locatable .................................... 3 of 4 traced; 11 across 5,851 commits
Composite-authority instances documented ....................... 2, members named
Enforced authority signals ..................................... 1 system, 2 ledger rows
Unenforced standing signals .................................... all prose conventions

⭐⭐⭐ PRINCIPAL FINDING
The machine-readable authority substrate this lane was reaching toward
ALREADY EXISTS, is branch-protection-required, fail-closed, scoped with
unusual honesty, already names which evidence kinds constitute authority,
and contains exactly one claim — about its own installation.

⛔ NO authority schema · NO frontmatter · NO registry · NO IDs
⛔ NO new authority class · NO ratification protocol
⛔ V6 NOT filled · NO ⏳ unruled transition filled
⛔ NO enforcement designed · NO hook or guard change · NO repository repair
⛔ NO claim record authored · NO ledger row proposed · `.ain/` UNTOUCHED
⛔ NO source file modified outside this record

ACT CUSTODY .................................................... ⚠️ NONCONFORMING, DISCLOSED
MACHINE-READABLE GRAMMAR ....................................... ⛔ NOT OPEN

STOP CONDITION: census returned. Awaiting founder adjudication.
```

⭐ **What this changes for the lane.** ACT 1 asked where knowledge lives; ACT 2 found the axes were
already adequate and only the subject was unstated. ACT 3 finds that the fourth element — *what act
gives a value standing* — is not merely unclassified. **It was classified, built, enforced, and then
not used.** ⛔ Why it was not used is not a question this census can answer from carriers, and it is
the question the next act would have to face before any grammar is designed: a substrate that exists
and goes unused is evidence about adoption, not about encoding.
