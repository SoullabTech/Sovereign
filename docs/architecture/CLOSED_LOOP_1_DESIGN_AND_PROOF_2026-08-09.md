# JARVIS Closed Loop 1 — Structural Design & Proof Instrument

**Date**: 2026-08-09 · **Status**: DESIGN + PROOF INSTRUMENT. ⛔ **Not implemented.** Stop for
founder review.
**Milestone**: `/orient → work → verify → record → /continue`
**Prior art tested (not extended)**: `docs/ops/AIN_HANDOFF_RECORD_CONTRACT.md`
**Foundations**: `docs/canon/WITNESS_JURISDICTION_COROLLARY_2026-08-09.md` ·
`scripts/memory/RESOLUTION_CONTRACT.md` · `docs/ops/INSTRUMENT_REGISTRY_2026-08-09.md` ·
`docs/ops/WORKSPACE_PROVENANCE_DISCIPLINE_2026-08-09.md`

**Governing outcome test** (applied to every choice below): *does this increase our ability to
build, maintain, improve, or safely extend AIN, MAIA, and member-facing capability?*

---

## 0. The two structural decisions

### 0.1 Closed Loop 1 needs **two commands**, not five

`work`, `verify`, and `record` are **contracts and disciplines**, not commands. They already have
homes (the working session; the corollary; the record classes). Only two operations cross the
session boundary and therefore need to exist as invocable acts:

| command | act |
|---|---|
| **`/orient`** | restore contact with reality — **and, if given a packet, validate it against reality** |
| **`/continue`** | write the continuation packet |

**`/ain-resume` is folded into `/orient`.** A resume is not a different operation from orienting;
it is orienting *with a prior claim in hand*. One command, optional argument. This removes a whole
command, a whole failure mode (resume-without-orient), and the possibility of the packet being
consumed without revalidation.

### 0.2 The packet is not a measurement witness — stated formally

Using the ratified corollary, this is the load-bearing rule of the whole design:

> **A continuation packet is an *implementation-class* witness (what the prior session encoded) and
> a *governance-class* witness (what was ruled). It is NEVER a measurement-class witness of current
> state.**
>
> Therefore: **no field of a packet may establish a claim about what is true now.** Only `/orient`
> can do that, and only by measurement.

This gives the founder's division a formal basis in ratified canon:
**`/continue` preserves continuity · `/orient` restores contact with reality.**

Corollary consequence: the handoff contract's `BASELINE` section is **misnamed as state**. Its
fields have exactly one job — **to be compared against fresh measurement**. They are **drift
probes**. Their value is the delta, never the value.

---

## 1. Minimum data contract for `/orient`

Every field carries an **acquisition mode**: `COMPUTE` (measure now) · `RETRIEVE` (read a governed
source) · `INHERIT` (from packet, as a claim) · `RE-WITNESS` (measure the external referent) ·
`UNKNOWN`.

**`UNKNOWN` is a first-class value, distinct from absent.** ⛔⛔ **An `UNKNOWN` field may never be
filled by inference from another field.** Reporting `UNKNOWN` is a successful outcome.

### A. Workspace identity — all COMPUTE, never inherited

| field | source of truth |
|---|---|
| worktree path | `git rev-parse --show-toplevel` |
| worktree vs main checkout | `git rev-parse --git-dir` ≠ `--git-common-dir` |
| branch | `git rev-parse --abbrev-ref HEAD` — ⛔⛔ **never** session-start `gitStatus` (stale by standing rule) |
| HEAD SHA | `git rev-parse --short HEAD` |
| dirty count | `git status --porcelain \| wc -l` |
| trunk identity | RETRIEVE — `CLAUDE.md` (`clean-main-no-secrets`) |
| ahead/behind trunk | `git rev-list --left-right --count <trunk>...HEAD` |
| **cache contamination risk** | COMPUTE — mtime of `tsconfig.ship.tsbuildinfo` / `.next/cache` / `node_modules/.cache` **vs HEAD commit date**; newer-than-HEAD ⇒ ⚠️ flag |

*Live example (measured by the implemented probe): `feature/labtools-redesign` · `851c2e73a` ·
**10 ahead / 0 behind** trunk · **244 dirty** · `tsconfig.ship.tsbuildinfo` 2026-08-09 22:43 vs HEAD
2026-08-06 11:52 ⇒ **cache newer than HEAD, contamination flag FIRES**.*

> ⚠️ **CORRECTION (2026-08-09, made by the instrument).** The first draft of this section, and the
> summary that accompanied it, read `git rev-list --left-right --count trunk...HEAD` output `0 10`
> as *"0 ahead / 10 behind."* It is the reverse: left = commits in trunk not in HEAD (**behind**),
> right = commits in HEAD not in trunk (**ahead**). The branch carries **10 unmerged commits** and
> is **not** behind trunk. The probe, which names the semantics at the point of measurement, got it
> right; the human reading of raw output got it backwards. Falsification case #3 is unaffected in
> principle — this workspace simply does not currently exhibit it.

### B. Deployed referent — RE-WITNESS, **gated**

| field | source |
|---|---|
| deployed SHA | `ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'` |
| container freshness / health | `docker inspect` · `/api/health` |

**Gate**: acquired **only if the task makes or checks production claims.** Otherwise the value is
`UNKNOWN-NOT-NEEDED` — explicitly distinct from `UNKNOWN`. This keeps `/orient` cheap and prevents
a production probe from implying the task concerns production.

### C. Task — INHERIT or DECLARE

Task identity · objective · scope · stopping conditions · proof requirements. From the packet when
resuming; from the user otherwise. ⛔ Never inferred from the branch name or dirty files.

### D. Governance — RETRIEVE, cite-only

| field | source |
|---|---|
| orientation gate | `PROJECT_ORIENTATION.md` (North Star Hierarchy, current phase, forbidden drift) |
| applicable canon | `docs/canon/` by topic — **cite paths, never restate** |
| unresolved founder decisions | `docs/governance/FOUNDER_DECISION_DOCKET_*` + `FOUNDER_RULING_*` |
| capability-preservation constraints | §8 standing rules |

### E. Memory — RETRIEVE under the resolution contract

Relevant records via `scripts/memory/RESOLUTION_CONTRACT.md` semantics, entered through
`MEMORY.md` → subtree index → topic file.

> ⚠️ **`/orient` CANNOT compute which memory records are stale. This field is `UNKNOWN` by
> construction.**

Supersession is prose, not structure (37 of 1,429 files carry it structurally; index hooks are
hand-maintained and 1 of 10 is generated). The honest contract output is:
*"N records retrieved; staleness NOT machine-determinable — open the topic file before acting."*
This is the standing root-index rule made explicit rather than a false green. **Closing this
`UNKNOWN` is Horizon-adjacent work, deliberately not attempted inside Closed Loop 1.**

### F. Instruments — RETRIEVE + COMPUTE

| field | source |
|---|---|
| relevant instruments | `docs/ops/INSTRUMENT_REGISTRY_2026-08-09.md` |
| invocation boundary | registry — **bound / deliberately-manual / dormant** |
| last run + provenance | report artifacts (e.g. `memory-audit-reports/audit-<ts>.json` with `index_sha256` + `corpus_manifest_sha256`) |
| ⚠️ dormancy warning | fires when a task's proof depends on an instrument with **no invocation boundary** |

### G. Capability state — mostly `UNKNOWN`, and that is correct

Six states (founder-specified): **present · disconnected · unreachable · behaviorally unused ·
superseded · retired (only where explicitly ruled)**.

These are **not one jurisdiction** — which is exactly why they are hard:

| state | competent witness | cheaply computable? |
|---|---|---|
| present | implementation (code exists) | ✅ |
| disconnected | implementation (0-importer / `git log -S`) | ✅ cheap probe |
| unreachable | measurement (route/nav reachability) | ❌ needs a walk |
| behaviorally unused | measurement, **production referent** | ❌ needs prod query |
| superseded | governance (a ruling) | ✅ retrieve |
| retired | governance (**explicit ruling only**) | ✅ retrieve |

`/orient` computes the ✅ rows and returns `UNKNOWN` for the rest. ⛔⛔ **It may never downgrade a
capability from `UNKNOWN` to a negative state.** See §8.

### H. Budget

**≤ 2,000 tokens of orientation output.** ~10 shell facts + targeted retrieval. `/orient` is
**ephemeral** — it produces in-session orientation, **not a file.** ⛔ No fourth `current-state.md`.
If an orientation must persist as proof, it is written as an **evidence-class** artifact (§4) with
a full provenance line, never as a governance record.

---

## 2. Task-continuity contract for `work`

⛔ **`work` is not a workflow engine and is not a command.** JARVIS retains full freedom to
investigate, hypothesize, design, code where authorized, spawn subagents, route models, discover
unexpected architecture, and revise its working hypothesis. **The loop governs continuity and
authority, never creative method.**

Six things must travel with a task or work silently loses them:

| carried | why | lost-if-absent failure |
|---|---|---|
| **scope** | bounds the unit | scope creep read as progress |
| **founder intent** | the *why* behind the task | technically-correct, purpose-wrong work |
| **capability-preservation constraints** | §8 | unused capability quietly deleted as dead code |
| **governing decisions** (cited) | what may not be relitigated | re-deciding a settled ruling |
| **stopping conditions** | when to stop and ask | improvising past a governance gate |
| **proof requirements** | what would establish success | work completed but unverifiable |

These are the *inputs* to work. Everything else about how work proceeds is unconstrained.

---

## 3. Verification envelope

Every verification claim carries **five** fields. This is the smallest envelope that lets a later
session answer *what was actually established, by what witness, against what referent*:

```
claim · jurisdiction · witness · referent · provenance
```

| field | rule |
|---|---|
| **claim** | one sentence, the specific thing asserted |
| **jurisdiction** | `measurement` \| `implementation` \| `governance` (ratified corollary) |
| **witness** | the instrument/artifact/person that established it |
| **referent** | ⭐ **what it actually measured** — the checkout? the deployed system? the member's experience? |
| **provenance** | workspace · SHA · dirty · cache state · corpus/config hash · when |

**Refused inferences (each is a jurisdiction error, each has occurred here):**

- `green test → member experience works` — implementation ⇒ measurement, wrong **referent**
- `code exists → capability is reachable` — implementation ⇒ measurement
- `production does X → X is authorized` — measurement ⇒ governance
- `doc says X → runtime does X` — governance/declaration ⇒ measurement

**Experiential acceptance** stays a **measurement referent** whose competent witness may be the
experiencing person. *Never let a green check stand in for a walk* — and its symmetry: a walk
cannot prove persistence.

**A verification with no referent is not a verification.** It does not enter `VERIFIED`.

---

## 4. Record classes — and the promotion rule

Seven classes. The boundary that matters: **generated evidence must never silently become
governance.**

| class | home | authority | who promotes |
|---|---|---|---|
| **evidence output** | outside repo *and* corpus (`memory-audit-reports/`) | none — a reading | — |
| **investigation / audit** | `docs/architecture/audits/` | describes, decides nothing | author |
| **design** | `docs/architecture/`, `docs/specs/` | proposes | author |
| **implementation record** | git commit + code | **encodes** | merge |
| **founder ruling** | `docs/governance/FOUNDER_RULING_*` / `*_RULING_*` | **decides** | **founder only** |
| **canonical / governance** | `docs/canon/` | **governs** | **founder only, explicit ratification** |
| **handoff state** | `docs/handoff/` (⚠️ §6.1) | a claim about the past | `/continue` |

**Promotion rule**: movement between classes is **always an explicit act with a named actor and a
date**. Nothing is promoted by being cited, being nearby, being convenient, or by silence. (The
corpus already names this failure: *authority transfers by adjacency and SILENCE — nobody argues
the draft is a decision, it just gets cited as one.*)

**⛔ Not every successful task generates permanent architecture documentation.** Default for a
completed bounded task: a commit (implementation record) + a handoff packet. Audits and designs are
written when there is a finding worth carrying, not per task.

---

## 5. `/continue` packet structure

The existing contract is **largely sound and is adopted**, with four changes forced by Horizon I.
Budget **≤ 3,000 tokens** — retained; no evidence yet that it is insufficient.

```
# CONTINUATION RECORD — <slug>
episode: <what this episode was>   closed: <ISO>   record-version: 2

## GOAL                     one sentence — the goal served, not the last task performed

## DRIFT PROBES             ← RENAMED from BASELINE (§0.2). NOT state. Exists to be contradicted.
branch: · head_sha: · worktree: · dirty: <count> · production_sha: <or n/a>
migrations: <through id | none> · cache_state: <artifact + mtime vs HEAD>     ← NEW

## GOVERNING DECISIONS      cite, never restate — decision → path
## CAPABILITY CONSTRAINTS   ← NEW: what must not be removed/downgraded, and why (§8)

## ESTABLISHED              evidence-backed only; no evidence ⇒ it is not established
## CHANGED                  path:line — what and why · commits
## VERIFIED                 ← EXTENDED: claim · jurisdiction · witness · referent · provenance (§3)
## INSTRUMENTS USED         ← NEW: instrument · boundary status · run provenance · result

## OPEN
  ? <question>              genuinely unresolved
  ∅ <fact> — not measured   ← NEW subtype: UNKNOWN ≠ unresolved question

## DO NOT REDISCOVER        <hypothesis> — FALSIFIED by <evidence> · <path> — dead end because…
## NEXT COHERENT ACTION     singular. A list means the episode did not close.
```

**The four changes, each traced to a Horizon-I finding:**

1. **`BASELINE` → `DRIFT PROBES`** (+ `cache_state`) — the packet cannot assert current state
   (§0.2); the cache field exists because a stale `tsbuildinfo` produced contaminated evidence.
2. **`VERIFIED` extended to five fields** — "typecheck passes" was a *scope/referent* failure; the
   corollary now supplies the vocabulary to make that unstateable.
3. **`INSTRUMENTS USED` added** — 61% of instruments are dormant; a successor must know whether a
   cited proof came from a bound instrument, and against what referent.
4. **`∅ not measured` added to `OPEN`** — `UNKNOWN` must survive the handoff, or the successor
   infers it. Added as a subtype, not a new section, to protect the budget.

**Retained unchanged**: `DO NOT REDISCOVER` (highest value per token — three falsified hypotheses
cost ~40 requests to derive and ~60 tokens to record), `GOVERNING DECISIONS` cite-never-restate,
singular `NEXT COHERENT ACTION`, and the field rule *ESTABLISHED without evidence ⇒ OPEN*.

**Open question from the original contract, still unanswered**: closing session vs fresh subagent
as the packet author. Make it an arm of the proof walk (§8 of the original) — cheap to try.

---

## 6. Source-of-truth map

| field | source of truth | mode | revalidation class |
|---|---|---|---|
| branch · HEAD · dirty · ahead/behind | `git rev-parse` / `status` / `rev-list` | COMPUTE | **MUST-REMEASURE** |
| worktree identity | `git rev-parse --show-toplevel` / `--git-common-dir` | COMPUTE | MUST-REMEASURE |
| trunk name | `CLAUDE.md` | RETRIEVE | stable |
| cache contamination | artifact mtime vs HEAD commit date | COMPUTE | MUST-REMEASURE |
| deployed SHA | container `GIT_COMMIT` | RE-WITNESS (gated) | MUST-REMEASURE if claimed |
| migrations applied | migration ledger / DB | RE-WITNESS (gated) | MUST-REMEASURE if claimed |
| task identity · objective · scope | packet, else user | INHERIT / DECLARE | INHERIT-AS-CLAIM |
| governing decisions | `docs/canon/`, `docs/governance/` | RETRIEVE | CITE-ONLY |
| unresolved founder decisions | docket + `FOUNDER_RULING_*` | RETRIEVE | CITE-ONLY |
| memory records | `MEMORY.md` → subtree → topic, resolution contract | RETRIEVE | CITE-ONLY |
| **memory staleness** | — | **UNKNOWN** | ⚠️ not machine-determinable |
| instrument inventory + boundary | Instrument Registry | RETRIEVE | CITE-ONLY |
| instrument last-run provenance | report artifacts (hash-bound) | COMPUTE | MUST-REMEASURE |
| capability: present / disconnected | code + import graph + `git log -S` | COMPUTE | cheap probe |
| capability: unreachable / unused | walk · production query | RE-WITNESS or **UNKNOWN** | gated |
| capability: superseded / retired | explicit ruling | RETRIEVE | CITE-ONLY |
| ESTABLISHED / DO NOT REDISCOVER | packet | INHERIT-AS-CLAIM | downgrade if contradicted |
| VERIFIED | packet | **NEVER-INHERIT across a SHA change** | re-run or drop |

### 6.1 Unresolved: the handoff directory does not exist

The contract writes to `docs/handoff/`. **Neither `docs/handoff/` nor `docs/handoffs/` exists**
(verified). Founder decision needed: create `docs/handoff/`, or place packets elsewhere. Recorded
rather than chosen — it is the same referential-integrity class this whole investigation is about.

---

## 7. Stale-data and revalidation rules

| class | rule on conflict with fresh measurement |
|---|---|
| **MUST-REMEASURE** | packet value is **never** used; measured value wins silently |
| **CITE-ONLY** | follow the path and read it; ⛔ never trust the packet's paraphrase |
| **INHERIT-AS-CLAIM** | usable as a starting premise; **downgraded to hypothesis** the moment current evidence contradicts it |
| **NEVER-INHERIT** | `VERIFIED` does not survive a SHA change — re-run the gate or drop the claim |

**The governing rule, retained verbatim from the original contract:**

> **A record that fails verification is downgraded to a hypothesis, never silently used. Inheriting
> a stale PASS launders an unverified claim into a starting premise.**

**Escalation ladder on drift** (proportionate, not uniform):

| drift | response |
|---|---|
| branch differs | **STOP** — wrong lane; ask |
| HEAD moved | **WARN + replay** `git log <sha>..HEAD`; packet is stale but usable |
| dirty differs | **WARN** — uncommitted work the packet did not know about |
| a `CHANGED` path is gone | **DOWNGRADE the whole packet** — verify each claim independently |
| `production_sha` drifted | **WARN**; invalidate every production-referent claim |
| cache newer than HEAD | **WARN** — instrument readings suspect until cleared or declared |
| a governing decision was superseded | **STOP** — governance changed under the task |

---

## 8. Session-boundary proof walk

⛔ Do not judge Closed Loop 1 by whether each component reads well. **Judge it by whether Session B
correctly distinguishes what is still true from what only used to be true.**

### Proof task selection — required properties

Must be: **bounded** (one session) · **real** (not synthetic) · **verifiable by an existing
instrument** · **spanning at least two jurisdictions** (so the corollary is exercised) ·
**authorized already**.

Candidates (founder picks — none started):
- **(a)** Residual-102 **class A** — instrument escaping semantics for illustrative `[[refs]]`.
  Bounded, verified by `memory:audit` (measurement, corpus referent), touches instrument
  governance. *Requires authorization; recommended — it is the cleanest jurisdiction exercise.*
- **(b)** Bind one dormant instrument to a boundary. Real value, but it is the entry point to
  Horizon IV and would prejudge the Guard.
- **(c)** A small member-facing slice from an existing lane — strongest on the outcome test,
  weakest on boundedness.

### The walk

**Session A** — `/orient` (no packet) → bounded work → verify with the five-field envelope →
record only what continuity needs → `/continue` writes the packet.

**Between sessions** — inject **at least one** real change. Recommended (cheapest, safest, and it
exercises three drift rules at once): **commit part of the work** (HEAD moves) **and leave the tree
dirty**. Optional additions: touch a build cache; supersede a cited record.

**Session B** — fresh, ⛔ **no conversational dependency on A** → `/orient <packet>` → and must,
from evidence alone, correctly report:

1. what happened (from the packet, as a *claim*)
2. what was proven — **and by which witness against which referent**
3. what changed since the packet was written
4. which packet claims are now downgraded
5. what remains unresolved, and what was never measured (`∅`)
6. what is permitted next
7. then continue the task

**Pass condition**: Session B reaches the correct next action **without Kelly reconstructing the
project**, and **explicitly names the drift** rather than silently absorbing or silently ignoring
it. **Fail condition**: Session B either trusts a contradicted packet field, or discards the whole
packet because one field drifted. Both are failures — the loop must be *proportionate*.

---

## 9. Falsification cases

The loop fails if a fresh session cannot distinguish these states. Each: injected condition →
detecting mechanism → what fails without it.

| # | condition | detected by | fails as |
|---|---|---|---|
| 1 | **stale `/continue`** (HEAD moved) | `head_sha` remeasure + `git log <sha>..HEAD` | acts on superseded state |
| 2 | **correct handoff, wrong worktree** | `--show-toplevel` + `--git-common-dir` | right task, wrong 1 of ~101 checkouts |
| 3 | **trunk changed** | `rev-list --left-right --count` | work diverges silently (live: **10 behind**) |
| 4 | **stale build cache** | artifact mtime vs HEAD date | ⚠️ **fires right now** — cache 3 days newer than HEAD |
| 5 | **missing memory record** | resolution contract → unresolved reference | reasons from an absent premise |
| 6 | **superseded ruling** | ⚠️ **PARTIAL — the known weak point** (§1E) | ⚠️ **cannot be fully detected today** |
| 7 | **instrument never run** | Registry boundary status | cites a gate that never executed |
| 8 | **instrument run against wrong referent** | `referent` field in the envelope | checkout mistaken for production |
| 9 | **work done, not verified** | `VERIFIED` empty / no referent | completion mistaken for proof |
| 10 | **verified implementation, unratified governance** | jurisdiction field | *it works* mistaken for *it may ship* |
| 11 | **experiential claim backed only by automated checks** | jurisdiction + referent | green check stands in for a walk |
| 12 | **capability present in code but unreachable** | capability state = `UNKNOWN`, ⛔ not "absent" | unreachable read as unwanted |

> ⚠️ **Case 6 is the design's known weak point and is declared, not hidden.** Supersession is prose
> (37/1,429 structural), so a superseded ruling is detectable only if a session *opens the topic
> file*. The loop mitigates by instruction (`CITE-ONLY` — never trust a paraphrase), which the 12×
> law says is the weakest control. **Closed Loop 1 ships with this stated as a known gap; closing
> it is structured-supersession work, deliberately out of scope.**

---

## 10. Smallest implementation sequence (if the design passes review)

| # | step | scope | proves |
|---|---|---|---|
| 1 | **`/orient` skill, read-only, no packet** | ~10 shell facts + targeted retrieval; ≤2,000 tok; emits `UNKNOWN` honestly | orientation is cheap and truthful |
| 2 | **Run Session A** on the chosen proof task | uses `/orient` for real | orientation is *useful*, not just correct |
| 3 | **`/continue` skill** | writes the v2 packet to the §6.1 location | the packet is writable within budget |
| 4 | **`/orient <packet>`** — resume validation | adds the §7 escalation ladder | drift is detected **proportionately** |
| 5 | **Run Session B** with injected drift | the §8 walk | **the loop closes** |
| 6 | **Falsification pass** | §9 cases 1–5, 7–12 (6 declared partial) | it fails correctly where it should |

**Two skills. No orchestration framework.** ⛔ Nothing generalized merely because the loop spans
several operations. ⛔ No new state store. ⛔ No fourth current-state surface. Every field in §6
resolves to an existing governed source or a live measurement.

**Stop after step 1 and after step 5 for founder review.**

---

## 11. Capability-preservation constraint (binding on the whole loop)

⛔⛔ **The loop must never reinterpret *currently unused* · *unreachable* · *disconnected* ·
*imperfectly governed* · *difficult to verify* as *unwanted capability*.**

Standing rules carried into every orientation and every packet:

> **Historical existence is evidence, not automatic authorization.**
> **Current absence is evidence, not automatic prohibition.**
> **Current architecture is evidence, not an immutable ceiling.**

Enforcement inside the design: capability state resolves to **`UNKNOWN`** rather than a negative
value whenever the competent witness was not consulted (§1G); `CAPABILITY CONSTRAINTS` is a
first-class packet section (§5); and `/orient` surfaces uncertainty and governance gates **without
narrowing AIN's capability envelope**.

**Closed Loop 1 exists to make JARVIS *more* capable of acting — by ensuring it acts on the
present rather than on a remembered past. It is not a mechanism for caution.**

*Continuity without fixation: memory carries history → the packet carries intention → orientation
encounters the present → work changes reality → verification witnesses the change → the record
preserves what matters → continuation carries the work onward.*
