# PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-00 · CUSTODY / INHERITANCE

```text
LANE            PHASE-1-WHOLE-ORGANISM-CENSUS-01
STEP            P1-00 · CUSTODY / INHERITANCE
TYPE            RECORD ONLY
DATE            2026-09-14
LANE MODE       CENSUS ONLY
AUTHORITY       READ / TRACE / CLASSIFY / SYNTHESIZE
NOT AUTHORIZED  REPAIR · DESIGN · SCHEMA · MIGRATION · RUNTIME CHANGE · DEPLOY · MERGE ·
                STRATEGIC KERNEL DRAFTING
SCOPE OF ACT    P1-00 only. P1-01 NOT begun. No organism census performed.
RESULT          ⭐ CUSTODY PASS — with two declared exceptions and four founder items.
```

This artifact establishes **what this lane is examining** before any census claim is made. It
contains no organism findings. Nothing here classifies a capability, traces a call path, or
describes what MAIA does.

---

## 1 · Census subject

| Field | Value |
|---|---|
| Repository | `SoullabTech/Sovereign` |
| Canonical branch | `clean-main-no-secrets` |
| Canonical full SHA | `1a5554300e855d3581085849301a39cbb10ab385` |
| Canonical short SHA | `1a555430` |
| Canonical tip subject | `Merge pull request #1295 from SoullabTech/claude/ws-disclosure-orientation-transport-01` |
| Census branch | `claude/quirky-lovelace-yxaes0` (session-designated) |
| Census branch SHA | `1a5554300e855d3581085849301a39cbb10ab385` |
| Worktree | `/home/user/Sovereign` — primary checkout, **not** a linked git worktree |
| Working tree state | **CLEAN** — `git status --porcelain` returns 0 lines |
| Divergence from canonical | `origin/clean-main-no-secrets..HEAD` = **0** · `HEAD..origin/clean-main-no-secrets` = **0** |

**The census subject and canonical are the same commit.** The census branch is not ahead of
canonical, not behind it, and carries no commits of its own.

### 1a · Correction recorded, not deleted

An earlier reading inside this same act reported the census branch as **133 commits ahead of
canonical**. That was false. It rested on a stale remote-tracking ref (`origin/clean-main-no-secrets`
pinned at `6345b8e0` by the container's shallow initial fetch). After
`git fetch --depth=200 origin clean-main-no-secrets` the ref advanced `6345b8e0..1a555430` and the
divergence resolved to zero in both directions.

Recorded rather than silently corrected, per the strategic register's own C1–C3 discipline: *a
record that quietly edits its own findings cannot be trusted to report on anyone else's.* The
mechanism matters more than the miscount — **a divergence claim computed against an unrefreshed
remote-tracking ref is a statement about the container's fetch depth, not about the branch.**

---

## 2 · Inherited unmerged implementation work

```text
CONFIRMED: NONE.
```

Evidence: `git rev-list --count origin/clean-main-no-secrets..HEAD` → `0`, computed after the
canonical ref was refreshed. There is no commit on the census branch that is not already on
canonical. **This lane inherits no implementation work, no candidate, no unmerged repair, and no
pending migration of its own.**

This is a stronger custody position than the flow requires, and it should be preserved: any commit
this lane makes beyond record-only census artifacts becomes immediately visible as divergence from
canonical.

---

## 3 · Strategy inheritance — frozen strategic recovery

| Field | Value |
|---|---|
| Frozen reference (as named by the founder) | `ee3e4c47` |
| Resolved full SHA | `ee3e4c476f0151680313034eb32e65c18247f6ec` |
| Resolution | tip of `refs/heads/claude/nice-volta-fogiyw` |
| Carrying document | `docs/strategy/SOULLAB_STRATEGIC_EXCLUSION_REGISTER_CANDIDATE_2026-09-13.md` (684 lines) |
| Register status line | `⭐ FROZEN — strategic recovery COMPLETE FOR NOW, not finished forever (founder, 2026-09-13)` |
| Kernel-producing set | **6 — ALL ADJUDICATED** |

### ⚠️ CUSTODY FINDING C-1 — the comparison subject is not in canonical custody

```text
docs/strategy/SOULLAB_STRATEGIC_EXCLUSION_REGISTER_CANDIDATE_2026-09-13.md

  present on   claude/nice-volta-fogiyw @ ee3e4c47
  ABSENT from  clean-main-no-secrets  @ 1a555430
  ABSENT from  the census subject     @ 1a555430
```

Verified by `git ls-tree -r --name-only <ref> -- docs/strategy/` against both refs: the directory
exists on both and contains no file matching `EXCLUSION`.

**Why this matters to P1-06 and not before.** The six strategic choices this census must eventually
compare the organism against live on an unmerged branch. The census can proceed — the branch is
fetchable and the register is readable at a pinned SHA — but the comparison in P1-06 will be made
against a document that **the canonical repository does not contain**. A future reader walking
canonical alone cannot reconstruct what the census compared against.

⛔ **Not repaired here.** Merging the register to canonical is a governance act with its own
authority question, and this lane's mode is CENSUS ONLY. Named, pinned, routed to the founder as
item **D-P1-01**.

### 3a · The inherited strategic set, pinned

Recorded here so that P1-06 compares against a fixed text rather than a remembered one. Each is
quoted from the register at `ee3e4c47`; the line reference is to that file.

| # | Entry | LEVEL · CLASS | CHOICE (as written) |
|---|---|---|---|
| 1 | **X-05** · Circles scale by multiplication, not enlargement (L331) | STRATEGIC · CHOSEN AGAINST | *"Collective scale through multiplication and nesting of small fields."* |
| 2 | **X-16** · The full memory field (L215) | STRATEGIC · DEFERRED — accepted, not doctrine | *"Arena-by-arena activation, each with its own Phase 2-equivalent spec."* |
| 3 | **X-19** · System-inferred trust does not silently become relational authority (L312) | STRATEGIC *(retained)* · DEFERRED — evidence-and-authority-gated | *"System-inferred trust does not silently become relational authority."* |
| 4 | **X-21A** · Member-facing field / coherence surfaces (L232) | STRATEGIC · DEFERRED | *"Withhold every member-facing 'field state,' 'coherence,' 'RFI' or 'UFI' surface."* |
| 5 | **X-21B** · Claims of RFI / UFI / field intelligence (L240) | STRATEGIC · UNPROVEN | *"Even once a surface becomes technically possible, the ontological claim stays evidence-gated."* |
| 6 | **X-29** · Member-first experience; practitioner-led initial distribution (L255) | STRATEGIC · CHOSEN AGAINST | Member experience as the primary lived product; market entry initially through practitioners. ⚠️ **AUTHORED, not recovered** — every substantive field is founder-authored on the accepting act and *"none may later be re-marked [R]."* |

**Three inherited standing rules carried into this lane verbatim:**

1. **X-16** — `reopen condition satisfied ≠ feature authorized`. Satisfying a condition means the
   question may be asked again, nothing more.
2. **X-16 REVIEW FLAG** — the §0.C criteria were written 2026-05-24 and have not been revisited.
   Per correction C3 in the register, the live risk is **stale reopen criteria, not missing ones**.
3. **X-21B** — the CAN/CANNOT claim table. Episodic shipping does not license the ontology.

### 3b · F9 is an acceptance condition, not work authority

The register's F9 records that the stronger half of X-29's acceptance condition — client-private
material *unrecoverable by construction*, with a practitioner unable to **infer its existence**
through metadata or derived signals — **could not be located in the repository**, and that the one
three-way visibility table found disclaims itself as *"not a ruled access model."*

Per the flow's own boundary: this lane may **record** F9-relevant evidence if the whole-organism
census naturally encounters it. It **may not** open a privacy programme, an assurance project, or a
metadata-inference repair under this authority.

---

## 4 · Governing programme records

Identified as governing **for custody purposes only**. Classification of what each source settles
and does not settle is **P1-01 work and has not been performed.**

### 4a · Constitutional / canon layer
| Record | Standing |
|---|---|
| `docs/canon/MAIA_OATH.md` | The irreducible standard |
| `docs/canon/MAIA_CANON_v1.1.md` | Governs all changes |
| `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` | Relational constitution · Invariant 16 ratified 2026-07-01 |
| `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` | Backbone constraint — authority moves upward only |
| `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` | Deep-Intelligence Gate |
| `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` · `CLAIM_STATE_AUTHORITY.md` | Representation and claim-state movement |

### 4b · Session anchor
`CLAUDE.md` — the session anchor and priority thread. Custody note: the anchor is **itself a
governed record that carries superseded text marked in place** (e.g. the 2026-09-07 production
witness marked `⛔ SUPERSEDED`, and the S3 route-integration bullet's last three clauses marked
`⚠️ SUPERSEDED as of 2026-09-14T15:20Z`). P1-01 must read supersession markers, not prose order.

### 4c · Standing programme records at the census subject
Present in `docs/programme/` at `1a555430`. Listed as inheritance context; **not read for content
in this act.**

---

## 5 · Independently active lanes — MUST NOT BE ABSORBED

Each of the following is a separate lane with its own custody, authority and stop conditions. This
lane may **observe** their artifacts as repository evidence. It may not continue them, complete
them, repair them, or treat their standing as settled by this census.

| Lane | Standing at `1a555430` (per `CLAUDE.md`) | Boundary for this lane |
|---|---|---|
| **`JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01`** | Phase 1 whole-organism map **CENSUS IN PROGRESS** | ⚠️ **See C-2 below — direct collision** |
| `JARVIS-PUBLIC-ACCOUNTED-FOR-01` | Publication lane; PR #1239 DRAFT, merge/deploy NOT AUTHORIZED | Do not adjudicate or alter its claims |
| `JARVIS-CIRCLES-01` / `CIRCLE-05 · INVOKE` | I0.5 ACCEPTED as current deployed state; **I1 HOLD**; CA-08 open | Do not open I1; do not decide CA-08 |
| `S3` (section-scoped disclosure authority) | ✅ PRODUCTION CLOSED; candidate `637c115d1` live | Closed — do not reopen |
| `WS-DISCLOSURE-ORIENTATION-01` / `-CONTINUATION-SURFACE-01` / `-PAUSE-PROTOCOL-01` | Writer's Studio disclosure lane; named as the next work | Do not enter |
| `CMT-01` (Canonical MAIA Turn) | M0–M2 ACCEPTED; **M3 explicitly unauthorized** | Do not open M3 |
| `WS2-08` (Hierarchical Manuscript Structure) | 08A CLOSED/ACCEPTED; **08B HOLD** until explicit founder act | Do not open 08B |
| `COACHING-TEMPLATE-EXTRACTION-01` | Named; **lane NOT opened** (Anti-Drift freeze holds) | Do not open |
| **Strategic exclusion recovery** | **FROZEN** @ `ee3e4c47`; kernel NOT DRAFTED | Read-only inheritance; ⛔ no amendment |

### 5a · Routed-out findings — open, owned by nobody, must not be adopted

The following were deliberately routed out of their finding lanes without opening a repair lane.
*The lane that finds a defect does not thereby own it* — and neither does this one.

| Finding | Record |
|---|---|
| Thread-store concurrent turn collision (`appendTurn` `MAX(turn_index)+1`) | `docs/programme/THREAD_STORE_CONCURRENT_TURN_COLLISION_FINDING_2026-09-14.md` |
| Rollback primitive (swap recreates nine containers; recovery restores one image) | `S3-O1_PRODUCTION_OBSERVATIONS_2026-09-14.md` |
| Migration-runner transaction boundary + unguarded ledger `INSERT` | same record, observation (3) |
| Migration ledger arithmetic (52 ledger filenames with no current file) | same record, observation (2) |
| **Merge-to-canonical is latent schema-deploy authorization** (BRANCH GATE) | `CLAUDE.md`, 2026-09-07 — ⛔ lane not opened |
| **Branch-policy authority** | `docs/programme/BRANCH_POLICY_AUTHORITY_FINDING_2026-09-13.md` — see exception E-2 |

### ⚠️ CUSTODY FINDING C-2 — a prior, incomplete whole-organism census already exists

```text
docs/programme/MAIA_WHOLE_ORGANISM_MAP/00_RANKED_MAP.md

  Phase       1 of JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1
  Date        2026-09-06
  Status      CENSUS IN PROGRESS
  Authority   Synthesis v0.2 (accepted, not doctrine)
  Completion  "this file is completed when all thirteen subsystem pages exist"
  Gate result "§0 · Acceptance gate result — (pending — agents running)"
```

Pages present at `1a555430`: `01_canonical_turn` · `02_elemental_corpus_callosum` ·
`04_conductor` · `05_voice` · `06_relationships` · `07_now_what` · `08_practice_fields` ·
`TEMPLATE`. **Seven of thirteen.** `03` and `09`–`13` are absent. The acceptance gate has never
been recorded as passed.

This is a **name, scope and subject collision**: two lanes both claiming a *Phase 1 whole-organism
census* of the same system, under different authorities (Synthesis v0.2 there; the six frozen
strategic choices here), with different evidence schemas (WALKED/READ/UNKNOWN there;
LIVE/PARTIAL/…/UNKNOWN here) and different comparison subjects.

**Three things this lane must not do, stated so that doing them later reads as a breach:**

1. ⛔ **Must not absorb it.** Its seven pages are the other lane's evidence, produced under the
   other lane's method and acceptance gate. Citing them as *this* census's findings would import
   an unpassed gate.
2. ⛔ **Must not complete it.** Writing `03` or `09`–`13` would be continuing a lane this one does
   not own, under an authority this one does not hold.
3. ⛔ **Must not silently supersede it.** An abandoned census that stays in canonical looking
   current is a documentation-drift defect. Whether it is superseded, resumed, or closed is a
   **founder ruling** — item **D-P1-02**.

⚠️ **What this lane may do:** read those pages as ordinary repository evidence of what a prior
census *recorded*, with its status (`CENSUS IN PROGRESS`, gate pending) always carried alongside
the citation. A page from an unaccepted census is evidence that a claim was written, never evidence
that the claim was accepted.

---

## 6 · Declared exceptions

### E-1 · The clone is shallow — historical provenance may be unanswerable here

```text
.git/shallow            3 grafts
commits reachable       1088
working tree            COMPLETE (6,920 .ts/.tsx files · 944 API routes · 480 migrations)
```

**The census subject's working tree is complete and is fully available to the census.** What is
truncated is *history*. Consequences to hold:

- `git log`, `git blame`, and "when did this become dormant?" questions may return **UNKNOWN** for
  reasons of fetch depth rather than repository truth.
- `git merge-base` and `--is-ancestor` across independently fetched shallow branches are
  **unreliable** and must not be reported as findings. (Observed in this act: `--is-ancestor`
  returned false between `ee3e4c47` and HEAD where the honest answer is *not computable at this
  depth*.)

⭐ **Rule adopted for this lane:** a census claim resting on git history must state the depth it was
computed at, or be marked `UNKNOWN`. **Shallow-clone silence is never evidence of absence.**

### E-2 · The census branch is not on the committed branch allowlist, and the gate is absent

```text
scripts/check-branch-allowed.sh:18
  main|clean-main-no-secrets|phase4.6-reflective-agentics|feature/*|fix/*|chore/*)

census branch    claude/quirky-lovelace-yxaes0     ← NOT MATCHED
core.hooksPath   (unset)
.git/hooks/      no non-sample hooks installed
```

This is the **BRANCH-POLICY AUTHORITY FINDING of 2026-09-13**, unchanged and still live. The
session-designated branch is a `claude/*` branch; the committed policy does not admit it; and the
hook that would enforce the policy is not installed in this container, so the declared gate will
not run.

⭐ **The interim rule in force is applied here rather than relied upon silently:** *absence of the
branch hook is never evidence of branch-policy compliance.* This artifact will be committed to the
designated branch because that is the branch this session is bound to, and the fact that nothing
refuses it is recorded as **the reason to doubt, not the reason to proceed.**

⛔ **Not repaired.** Adding `claude/*` to the script would answer the open question **Q1** silently
while purporting to fix **Q2** — the exact move the finding forbids. Routed as item **D-P1-03**.

### E-3 · Census branch naming diverges from the lane name

The founder named the lane `PHASE-1-WHOLE-ORGANISM-CENSUS-01`; this session is bound to
`claude/quirky-lovelace-yxaes0` and instructed never to push elsewhere without explicit permission.
The designated branch is therefore recorded as **the census branch of record**, and the lane name
lives in the artifact filenames (`PHASE-1-WHOLE-ORGANISM-CENSUS-01_*`) rather than in the ref.
A differently-named ref requires an explicit founder instruction — item **D-P1-04**.

---

## 7 · Acceptance — G0

| Gate | Requirement | Result |
|---|---|---|
| **G0** | Exact subject SHA, branch and worktree recorded | ✅ **PASS** — `1a5554300e855d3581085849301a39cbb10ab385` · `claude/quirky-lovelace-yxaes0` · `/home/user/Sovereign` · clean |

Supplementary custody assertions, all verified in this act:

- ✅ Canonical ref and full SHA established, **after** refreshing a stale remote-tracking ref.
- ✅ Working tree clean — 0 modified, 0 untracked.
- ✅ Frozen strategic reference `ee3e4c47` resolved to a full SHA and a named branch, and the
  carrying document read at that SHA.
- ✅ Zero inherited unmerged implementation work.
- ✅ Independently active lanes enumerated with explicit non-absorption boundaries.
- ⚠️ Two custody findings recorded (**C-1**, **C-2**).
- ⚠️ Three exceptions declared (**E-1**, **E-2**, **E-3**).

```text
P1-00   CUSTODY PASS
```

**PASS means: this lane knows precisely what it is examining, what it inherits, what it must not
absorb, and where its evidence is weak.** It does not mean the custody situation is good — C-1 and
C-2 both describe a repository in which a governing document and a competing census are each
sitting somewhere other than where a reader would look for them.

---

## 8 · Founder items opened by custody

These are recorded now so they do not have to be rediscovered at P1-07. **None blocks the census
from beginning.**

```text
D-P1-01   The frozen strategic register — the document P1-06 must compare the organism
          against — exists only on claude/nice-volta-fogiyw @ ee3e4c47 and is absent from
          canonical. Should it be brought into canonical custody before P1-06 runs?
          FOUNDER:  [ ] APPROVE   [ ] REFUSE   [ ] AMEND   [ ] REQUEST FURTHER EVIDENCE

D-P1-02   A prior Phase 1 whole-organism census (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1,
          7 of 13 pages, gate pending, status CENSUS IN PROGRESS) sits in canonical.
          Is it superseded by this lane, resumed by its own lane, or closed?
          ⛔ This lane will neither absorb nor complete it under any answer but an explicit one.
          FOUNDER:  [ ] APPROVE   [ ] REFUSE   [ ] AMEND   [ ] REQUEST FURTHER EVIDENCE

D-P1-03   The census branch is a claude/* branch, which the committed allowlist does not admit,
          and the enforcing hook is not installed here. Carried as a declared exception.
          ⛔ Do not answer Q2 (how branch law becomes authoritative) by editing the allowlist.
          FOUNDER:  [ ] APPROVE   [ ] REFUSE   [ ] AMEND   [ ] REQUEST FURTHER EVIDENCE

D-P1-04   Census branch naming: keep the session-designated ref, or create a ref named for
          PHASE-1-WHOLE-ORGANISM-CENSUS-01?
          FOUNDER:  [ ] APPROVE   [ ] REFUSE   [ ] AMEND   [ ] REQUEST FURTHER EVIDENCE
```

---

## 9 · Standing after this act

```text
P1-00 · CUSTODY / INHERITANCE        ✅ COMPLETE — PASS
P1-01 · GOVERNING SOURCE READ        ⛔ NOT BEGUN
P1-02 · PARALLEL ORGANISM CENSUS     ⛔ NOT BEGUN — no worker dispatched
P1-03 … P1-07                        ⛔ NOT BEGUN

STRATEGIC RECOVERY                   FROZEN @ ee3e4c47 — untouched
STRATEGIC KERNEL                     NOT DRAFTED
F9                                   ACCEPTANCE CONDITION ONLY — no programme opened
PRIOR WHOLE-ORGANISM MAP             UNTOUCHED — not absorbed, not completed
REPOSITORY SOURCE                    UNCHANGED — no lib/, app/, database/ or scripts/ edit
PRODUCTION                           UNTOUCHED
```

The next authority-bearing act is the founder's instruction to open **P1-01 · GOVERNING SOURCE
READ**, or to rule on the items above first.
