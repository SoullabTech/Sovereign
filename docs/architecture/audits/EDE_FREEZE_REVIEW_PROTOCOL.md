# EDE Freeze Review Protocol

**Purpose**: a **fixed** instrument for periodically re-checking whether the Evidence Differential
Evaluation freeze still holds, and whether its open items have moved.
**Baseline commits**: `933e329fa` (program closure) · `bf3d68bbe` (held direction).
**Subjects**: `EDE_PROGRAM_CLOSURE_AND_STANDING_RULES_2026-08-11.md` ·
`HELD_DIRECTION_NON_ADJUDICATING_TENSION_OBSERVATION_2026-08-11.md`.

> ⚠️ **Every check below was executed on 2026-08-11 and its baseline recorded.** The first draft of
> this protocol shipped four broken checks — R1 timed out repo-wide, R3 and R4 returned false
> positives (45 files matched the bare word *paraphrase*), R5 miscounted 11 for 12, and R7 returned
> **0 guards** on a wrong line pattern. A review instrument whose checks cannot fail is a false
> control surface. **⛔ Do not amend a check without re-running it and re-recording its baseline.**

---

## 0. Rules binding the reviewer — read before running

1. ⛔⛔ **This review does not adjudicate.** It gathers evidence and reports state. Only a **founder
   act** changes any status. A reviewer concluding *"the evidence now supports the candidate"* has
   exceeded its authority.
2. ⛔⛔ **This review does not run experiments.** No EDE-006. No prompting a model about authority
   scope, conflict, precedence, or the lattice. If a check needs new evidence, **report that** and stop.
3. ⭐⭐⭐ **The question set is FIXED and run verbatim.** This is the paraphrase-stability rule applied
   to the review itself: a review that rewords its own questions each cycle measures its own
   construction — the exact failure the program uncovered.
4. Every check is **mechanical** (`git`). ⛔ No check may be answered by model judgment.
5. Report **UNCHANGED** or the named drift state per check, with output as evidence. ⛔ Never "fine".

## 1. Baseline state (founder-ruled, 2026-08-11)

```
EDE artifact custody        CLOSED — 933e329fa
EDE implementation          NONE
frozen authority lattice    UNCHANGED
pairwise detection          UNBUILT
divergence observation      CAT 1 HELD DIRECTION — bf3d68bbe
classification semantics    FROZEN
MAIA manifestation          NOT AUTHORIZED
dangling adopted citation   OPEN CUSTODY DEPENDENCY
other untracked audits      DISCOVERED / UNCLASSIFIED
```

⭐ The stable primitive, stated exactly: **observe substantive divergence between claims about a
shared referent, preserve both sides and provenance, and make no authority classification from the
observation itself.** ⛔ NO conflict classification · NO precedence · NO resolution · NO lattice
value · NO scoring or counting.

## 2. The checks — run from repo root

`git grep -I --untracked` is used throughout: fast, covers untracked files, skips ignored paths.

### R1 — Freeze integrity
```bash
git grep -nI --untracked -e CONFLICT_REPRESENTABLE -e ADJUDICATION_ALLOWED -- '*.md' '*.ts' '*.sql' \
  | grep -v 'docs/architecture/audits/EDE'
```
**Baseline: 0 hits.** **DRIFT** = any hit — inspect whether it restates the retraction (fine) or
asserts support (breach). Required wording: `CONFLICT_REPRESENTABLE` is **unsupported, NOT refuted**;
the adjudication gate is **RETRACTED**; `intersection ⇒ adjudicate` is **PROHIBITED**.

### R2 — Ontology status (§5 founder semantic act)
```bash
git grep -lI --untracked -e 'intra-authority contradiction' -e 'inter-authority conflict' -- docs/canon docs/architecture
```
**Baseline: exactly 2 files** — `EDE_PROGRAM_CLOSURE_AND_STANDING_RULES_2026-08-11.md` (where it is
**PROPOSAL ONLY**) and this protocol. **MOVED** = the lattice appears in enacted canon ⇒ record the
authoring act; the held direction's classification-field block lifts.

### R3 — Instrument admissibility (§3.8)
```bash
git grep -nI --untracked -e 'EDE-00' -- '*.md' '*.ts' \
  | grep -v 'docs/architecture/audits/' | grep -v 'HELD_DIRECTION_NON_ADJUDICATING'
```
**Baseline: 0 hits.** The held-direction doc legitimately cites EDE as **design evidence**
(founder-accepted) and is excluded. **DRIFT** = any citation of an EDE result as *acceptance*
evidence, gate evidence, or proof — EDE is **NOT CURRENTLY ADMISSIBLE**, including for
`authority_scope` §9b I1/I2 (**SUSPENDED**).

### R4 — Paraphrase-stability adoption
```bash
git grep -lI --untracked -e 'semantically equivalent presentations' -- docs scripts
git log --oneline 933e329fa..HEAD -- scripts/eval/ docs/architecture/audits/ | head -30
```
⚠️ Use the **distinctive phrase**, never the bare word *paraphrase* — that matched 45 unrelated files.
**Baseline: 2 files** (closure record + this protocol), no new evaluator commits.
**ADOPTED** = new evaluator work cites the rule. ⚠️ **ENFORCEMENT FAILURE** = new evaluator work
exists that does not. Per `docs/ops/CCA_WEEK_ONE_AUTHORIZATION_2026-08-09.md`, low adoption is read
as **enforcement failure, not policy failure**.

### R5 — Custody
```bash
git ls-files --error-unmatch docs/research/JARVIS_GEOMETRIC_INTELLIGENCE_CLAIM_AUDIT_2026-08-11.md >/dev/null 2>&1 \
  && echo TRACKED || echo DANGLING
git ls-tree -r --name-only HEAD -- docs/architecture/audits/ | grep -cE 'EDE|PERTURBATION_REASONING'
```
⚠️ Count **both** name patterns — the reconnaissance brief has no `EDE` in its filename, which is
why the first draft reported 11.
**Baseline: `DANGLING` · 12 files.** The dangling citation is an **OPEN CUSTODY DEPENDENCY** owned by
another lane — ⛔ it is not to be silently absorbed into this program's commits. **RESOLVED** = TRACKED.

### R6 — Held-direction status
```bash
git grep -nI --untracked -e tension_observation -e divergence_observation -e observed_divergence -- '*.ts' '*.sql'
git log --oneline 933e329fa..HEAD -- docs/architecture/HELD_DIRECTION_NON_ADJUDICATING_TENSION_OBSERVATION_2026-08-11.md
```
**Baseline: 0 hits.** ⚠️ **UNAUTHORIZED BUILD** = pairwise divergence code without a founder act.
**MOVED** = the direction was authorized — record which act.

### R7 — The underlying question: is *"nothing looks"* still true?
```bash
grep -cE '^ \*   G[0-9] ' scripts/builder/epistemic-guard.mjs
git grep -c 'entirely unbuilt' -- docs/architecture/JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md
```
⚠️ The guard-line pattern requires the exact leading ` *   ` — a looser pattern returns 0 and would
have reported the guards missing.
**Baseline: 7 guards (G1 CANONICAL-PATH · G2 EDGE-PROOF · G3 TELEMETRY-PROVENANCE · G4
INDEX-LIVENESS · G5 STATUS-PROMOTION · G6 CORRECTION-ANATOMY · G7 LIVENESS-SCOPE), all single-claim;
`entirely unbuilt` present.** **MOVED** = another lane built contradiction detection ⇒ the held
direction's premise must be restated before it is taken up.

## 3. Report format (fixed)

```
EDE FREEZE REVIEW — <date> — HEAD <sha>
R1 freeze integrity         UNCHANGED | DRIFT                              <evidence>
R2 ontology (§5)            UNCHANGED | MOVED                              <evidence>
R3 instrument admissibility UNCHANGED | DRIFT                              <evidence>
R4 paraphrase adoption      UNCHANGED | ADOPTED | ENFORCEMENT FAILURE      <evidence>
R5 custody                  UNCHANGED | RESOLVED | DRIFT                   <evidence>
R6 held direction           UNCHANGED | UNAUTHORIZED BUILD | MOVED         <evidence>
R7 "nothing looks"          UNCHANGED | MOVED                              <evidence>
NEEDS FOUNDER: <open items, or none>
ACTIONS TAKEN: none — this protocol is read-only
```

## 4. Permanently open until a founder act

| item | status |
|---|---|
| §5 lattice — *is same-authority intra-scope contradiction a species of authority conflict?* | ⛔ **PENDING FOUNDER ACT.** ⛔ Not to be put to the model again |
| non-adjudicating tension observation | **Cat 1 held**, not authorized |
| MAIA-side manifestation | ⛔ **NOT AUTHORIZED** — needs its own experiential + consent analysis |
| EDE as an acceptance instrument | **NOT ADMISSIBLE** until rebuilt around paraphrase families |
| `authority_scope` structural gate conditions 1 & 3 | untouched; ⛔ unreachable by behavioural evaluation |
| dangling adopted citation | **OPEN CUSTODY DEPENDENCY**, owned by another lane |

⛔ **Reopening EDE requires a new epistemic basis** — the founder semantic act plus a redesigned,
paraphrase-stable instrument — **not simply another experiment number.**

## 5. Neighbouring lane — noted, not investigated

`docs/research/RELATIONAL_INVARIANCE_EXPERIMENT_2026-08-11.md` (untracked, same date, another lane)
matches on *invariance*. ⚠️ Recorded so a future review does not mistake it for EDE output or for
adoption of the paraphrase rule. ⛔ Proximity confers no authority to inspect or absorb it.

## 6. Scheduler composition status — ⛔ NOT YET PROVEN

⚠️ **Scheduler existence ≠ executable unattended review.** Founder ruling, 2026-08-11.

```
protocol                  VALIDATED          all 7 checks executed, baselines recorded
protocol commit           9c175c8f7
schedule                  CREATED            ~/.claude/scheduled-tasks/ede-freeze-review/SKILL.md
monthly persistence       ESTABLISHED        on-disk task, 4,155 bytes, prompt intact
command permissions       PRE-APPROVED       see below — established by inspection, not execution
unattended executability  ⛔ NOT YET PROVEN
first real scheduled run  Sep 1, 10:13 local
```

**Permission surface — verified without executing.** Every command the protocol issues carries an
exact `allow` rule in `.claude/settings.local.json`, and no `deny` rule intersects:
`Bash(git grep:*)` · `Bash(git log:*)` · `Bash(git ls-files:*)` · `Bash(git ls-tree:*)` ·
`Bash(git status:*)` · `Bash(git add:*)` · `Bash(git commit:*)` · `Bash(git diff:*)` ·
`Bash(grep:*)`. A catch-all `ask: Bash(*)` exists but every protocol command is explicitly allowed.
⇒ **A "Run now" is NOT required for permission setup.**

⛔ **What remains unproven is the EDGE, not the endpoints.** Two endpoints are verified — the
scheduler holds the task, and the commands are allowlisted — but *whether a scheduled run resolves
permissions from this project's settings and completes without intervention* is a distinct fact that
neither endpoint establishes. Also unverified: Read/Write tool permissions for the protocol file and
for a drift record (these are not Bash rules).

**The remaining proof, when the founder chooses to take it** — small, and deliberately not taken here:

> **Scheduler execution proof**: invoke the task **through the scheduler itself**, not by manually
> running the protocol. Verify all seven checks execute, no permission interaction is required,
> UNCHANGED produces **no commit**, and the task records/completes normally. **Record it as a test
> run**, not as permission setup. Then stop — no EDE experiment, no lattice reopening, no audit sweep.

⛔ Until that run succeeds, this monthly control is **held, not proven**, and ⛔ must not be described
as an established recurring safeguard.

## 7. Amendment log

| date | change | authorizing act |
|---|---|---|
| 2026-08-11 | created; all 7 checks executed and baselines recorded; 4 broken checks repaired before first use | founder request following the freeze |
| 2026-08-11 | §6 added — scheduler composition recorded as NOT YET PROVEN; permission surface verified by inspection without executing | founder ruling: *scheduler existence ≠ executable unattended review* |
