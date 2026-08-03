# Coach Field Foundation — canonicality ledger

**Date:** 2026-08-02 · **Status:** Record + decision-ready. Founder designation required at §5.
**Observed:** trunk `origin/clean-main-no-secrets` @ `031fd8ad9` · `#902` head `632af7717`.
All claims below verified by `git show` / `git ls-tree` against **origin refs**, not the working tree.

---

## 1. The ledger (the thing that was missing)

```text
#898  feature/coach-facilitator-field-foundation
  Status:        MERGED 2026-08-02T20:28:23Z (merge 6884e66b0) → on trunk
  Role:          DESIGN DONOR
  Authorized:    NO  (see §3 — merged ≠ authorized)
  Superseded by: #902
  Residue:       database/migrations/20260802000001_coach_facilitator_field.sql — LIVE ON TRUNK

#902  feature/coach-field-integrated-foundation
  Status:        OPEN, not draft
  Role:          CANONICAL relationship model
  Migrations:    20260802000002_practitioner_client_relationship.sql
                 20260802000003_coach_field_process_structures.sql
  Supersedes:    20260802000001 (by explicit in-file declaration, line 12)
```

**Authoritative migrations:** `000002` + `000003`.
**Authoritative gate:** #902's `verify-coach-field-boundaries.ts` (30 matching-reason assertions).

---

## 2. Why #902 is canonical — decided on architectural ownership, not chronology

Against the founder's criteria, #902 satisfies the governing-model tests:

- Keyed on `practitioner_clients.id` **from the start**, argued from live-schema introspection.
- Relies only on `id` + `practitioner_id` existing; **introspects everything else**, with conditional
  backfills across all three legacy `practitioner_clients` variants.
- Does **not** recreate a competing identity model — it *extends* the existing spine additively
  (`ALTER TABLE practitioner_clients ADD COLUMN IF NOT EXISTS …` ×9), rather than creating a parallel one.
- Already implements the structural-only ruling: defers every content-bearing table **by name**, and
  excludes `coach_client_processes.title` because a process label can name a private matter
  ("grief work") — the semantic-capacity test applied field by field.
- Caught a real defect in #898's model: `practitioner_id` has **two referents** —
  `practitioner_clients` + `practitioner_client_notes` → `practitioners(id)`, but `client_invites` +
  `practitioner_sessions` → **`members(id)`**. #898's `access.ts` assumed `practitioners(id)`
  universally. #902 makes the confusion non-representable via branded types.
- Its stated reason #898's spine was wrong holds: keying both sides on `members(id)` would **orphan
  every existing practitioner-side record**, and an invited person with no account could not be represented.

---

## 3. ⛔ The correction the paper resolution misses: **#898 cannot be "closed as superseded"**

The lineage note says *"#902 is operative; #898 close as SUPERSEDED."* **There is nothing to close.**
#898 merged four hours before that determination. Supersession of a merged PR is not a PR-state
change — it is **a forward commit on trunk**.

### 3.1 The residue is executable, and it is on canonical trunk

`20260802000001_coach_facilitator_field.sql` is on `origin/clean-main-no-secrets`. Verified:

- It **CREATEs 22 `coach_*` tables** — the full rejected spine.
- It has **no do-not-run guard**. Its six `RAISE EXCEPTION` lines are *append-only trigger bodies*
  (runtime row protection), **not** a migration-level abort. It is a fully executable migration.
- #902 declares it *"a DESIGN DONOR, NOT AN EXECUTABLE MIGRATION… never authorized"* —
  but that declaration lives only in #902, which **has not merged**.

⭐⭐⭐ **Merged ≠ authorized.** Trunk currently carries a migration the operative lineage says was
never authorized to execute. That gap is not theoretical; it is one deploy wide.

### 3.2 It carries exactly the content surface the founder ruled must move out

The 08-02 "cleaner cut" (option b) ruled that every field capable of holding human expression leaves
the foundation. Verified present in the trunk migration:

| Line | Column |
|---|---|
| 485, 800 | `body TEXT NOT NULL` |
| 769 | `body TEXT` |
| 551 | `body_snapshot TEXT` (append-only 2nd plaintext copy of every published note) |
| 243, 484, 660, 799 | `title TEXT` |
| 137, 168, 199 | `description TEXT` |
| 102 | `reason TEXT NOT NULL` |

Tables include `coach_authored_notes`, `coach_client_personal_notes` (**the client's own private
notes**), and `coach_note_publication_events`.

**The ruling and the merge contradict each other.** The ruling said move client content out; the merge
landed it on trunk.

### 3.3 🔴 The live risk, and why the window is narrow

- The **quick** `deploy-maia` path runs **no migrations** — so this has probably not materialized yet.
- The **full** `deploy-production.sh deploy` **does** run migrations. The next full deploy of trunk —
  for any unrelated reason — creates all 22 tables **and ~15 plaintext client-content columns in
  production**, before any encryption contract exists.
- Worse, #902's §0 guard **refuses to run if donor tables contain data**:
  > `'Donor tables from 20260802000001 contain data: %. That migration was never authorized. '`
  So if a full deploy runs `000001` *and* any code path writes a single row, **#902 becomes
  unmergeable without manual intervention.**

⚠️ Correction to my own earlier statement: I said #902 "§0 DROPs the rejected spine." What it
actually does is `DROP FUNCTION … CASCADE` on four donor trigger functions plus the data-presence
refusal above. I did not verify a `DROP TABLE` sweep, and do not claim one.

---

## 4. Gate split — the collision was a signal, and the diagnosis holds

Two versions of `scripts/verify-coach-field-boundaries.ts` prove different propositions:

| | Proposition |
|---|---|
| #898 version | "The coach field exists and its behavioral boundaries hold." |
| #902 version | "The foundation exists and deliberately **excludes** client expression until encryption exists." |

One script cannot prove both. Proposed split (**not yet authorized**):

- **`verify-coach-field-foundation-boundaries.ts`** — identity · relationship ownership · lifecycle ·
  invitations · process structure · consent mechanics · **no plaintext content**.
- **`verify-coach-field-content-boundaries.ts`** *(future)* — encrypted notes · publications ·
  snapshots · client expressions · sharing artifacts.

⚠️ Whichever ships, keep #902's **matching-reason discipline**: every refusal probe must assert the
*reason* it was refused, not merely that it was.

---

## 5. Awaiting founder designation

| # | Question | Prepared answer |
|---|---|---|
| 5.1 | Is #898 canonical? | **No** — design donor, superseded. But it is *merged*, so the act required is a forward supersession commit, **not** a PR close. |
| 5.2 | Is #902 superseding? | **Yes** — on architectural ownership per §2. |
| 5.3 | Which migrations are authoritative? | `000002` + `000003`. `000001` must be **neutralized on trunk**, not merely superseded on paper. |
| 5.4 | Which gate is authoritative? | #902's, then split per §4. |
| 5.5 | 🔴 **How is `000001` neutralized, and how urgently?** | **Not prepared — needs your ruling.** Options: (a) revert the migration file on trunk now; (b) replace its body with an explicit abort; (c) fast-track #902 so `000002` lands before any full deploy; (d) accept the risk and freeze full deploys. |

⛔ **No implementation has been performed.** No migration was written, reverted, or run; no PR was
closed or merged; nothing was deployed. §5.5 in particular is a production-affecting act and is
**not** something this lane will take without an explicit instruction.

---

## 6. Q-A and Q-B — founder positions **stated, not ratified** (2026-08-02)

Recorded verbatim in substance so a later session does not mistake them for rulings:

- **Q-A:** *"My Journey is a client-authored perspective on a shared relationship process, not a
  second process object."* Relationship process object owned by the `practitioner_client`
  relationship; client journey view owned by member perspective; **the overlap is a view, not a
  duplicate record.** → *"should be formally ruled before implementation."*
- **Q-B:** *"The home is not 'your current program.' It is 'where your relationship with the work
  continues.'"* Empty state is **not failure**; the program is **one room in the house, not the
  house itself.** If Home only works when `program != null`, it is a dashboard, not an environment.

Both must be ratified before `/studio/clients` is built, because that page encodes all four decisions.

Related: `NOW_WHAT_PHASE_TRANSITION_RECONCILIATION_2026-08-02.md` ·
`COACH_FIELD_FOUNDATION_INVARIANTS_2026-08-02.md` (#902) ·
`COACH_FACILITATOR_FIELD_SPEC_2026-08-02.md`

---

## §5.6 Migration execution state — and how it was actually resolved

> **Architectural authority ≠ migration-runner authority.**
> Architectural supersession does not alter migration history. **A rejected migration that
> remains executable is an operational defect until neutralized.**

`scripts/run-sql-migrations.sh` does not read architectural intent. It reads a filename, checks
`schema_migrations`, and executes. For a window on 2026-08-02 trunk held both documentation saying
*"design donor, not executable"* and a migration file saying *"execute me"*, with nothing but
discipline between them and production.

### 5.6.1 Application state (verified 2026-08-02) — **Case A: never applied**

| Environment | `20260802000001` applied? | `coach_*` tables | Rows |
|---|---|---|---|
| **Production** (`GIT_COMMIT=7c9dd5192`, pre-#898) | **No** | **0** | — |
| Local dev | Yes | 17 present | **0 in every table** |

No member or practitioner data existed in this surface anywhere. Disposition was therefore
**drop-and-replace, not encrypt-in-place**, and neutralizing it destroyed nothing.

### 5.6.2 ✅ RESOLVED — by full revert (#910), not by abort-in-place

**PR #910** (`25255b3b4`, merged `32ddc1257`) **reverted #898 in full.** Seven files, 2,505
deletions: the migration, `lib/coachField/{access,notes,positionSharing}.ts`,
`scripts/verify-coach-field-boundaries.ts`, **and the spec and audit**.

**The hazard is neutralized.** The migration no longer exists on trunk and cannot execute.
Verified: no surviving trunk code references `coachField` — the revert left no dangling imports.

**Two axes, kept separate — the safety outcome and the governance path.**

> The rejected migration was neutralized **by revert rather than by in-place retirement**. This
> achieved the safety objective. The original neutralization analysis remains preserved as a
> migration-runner lesson (§5.6.3).

The ruling of 2026-08-02 selected a non-revert neutralization path (*"replace the body with a
deliberate abort; do not revert history; do not delete the migration"*). A concurrent lane selected a
full revert. The resulting trunk state satisfies the safety requirement. **The difference is
governance and process, not current architecture**, and the two should not be collapsed into one
verdict.

⛔ **Do not create a second corrective commit to simulate the originally-selected path.** The history
is correct as it stands; re-enacting the abort would make it harder to understand, not easier.

Consequences of the route taken, which the abort route would not have produced:

1. **No retired marker remains in `database/migrations/`.** A future lane reading only trunk finds no
   trace of the rejected lineage at the point where it would matter. The record now lives solely in
   the revert commit and in this ledger.
2. ⚠️ **The spec and the audit left canonical.**
   `COACH_FACILITATOR_FIELD_SPEC_2026-08-02.md` (331 ln) and
   `NOW_WHAT_DEVELOPMENTAL_HOME_AUDIT_2026-08-02.md` (219 ln) were deleted along with the code. Their
   *design* content is still the donor #902 salvages from, and they survive in git history and on the
   `feature/coach-facilitator-field-foundation` branch — but **they are no longer on trunk.**
   Per the standing three-durability-states distinction (*untracked ≠ pushed ≠ canonical*), the design
   record has moved back a state. Restoring them as explicitly-marked donor artifacts is an
   **unruled** question.
3. **Already-applied environments are untouched.** Local dev still holds 17 empty `coach_*` tables and
   a `schema_migrations` row for `20260802000001`. A revert cannot reach that; only a deliberate
   cleanup act can. Harmless today (all empty), and #902's §0 data-presence guard will **not** refuse
   on this state — but it is residue, and it is not recorded anywhere else.

### 5.6.3 ⭐ The durable finding — preserved because it outlives this incident

The abort-in-place approach was built and verified before #910 landed. Its central finding is
general, and applies to **any** future attempt to neutralize a merged migration:

> **A follow-up abort migration does not prevent creation.**
> `run-sql-migrations.sh` executes each migration in **its own transaction**
> (`psql -v ON_ERROR_STOP=1 -c "BEGIN;" -f "$f" -c "COMMIT;"`) — not one transaction for the chain.
> A later abort therefore lets the offending file **COMMIT first** and only then halts. The schema
> would already exist. Only editing the offending file itself prevents creation.

Measured, against a throwaway database using the runner's exact invocation: abort raised, **exit code
3**, `coach_*` tables created **0**. The runner skips by **filename**, so already-applied environments
are unaffected by a body change.

⚠️ Second-order trap, also general: filename ordering means a blocking abort in an early file also
blocks every **later** migration — including the corrective lineage meant to replace it. An
abort-in-place is therefore inherently **two acts**, not one, and the second must be scheduled.

### 5.6.4 Standing principle

> **A rejected architecture can remain in Git history. It cannot remain executable in the
> deployment path.** Preserving history and preventing future execution are both necessary, and
> they are different acts. #910 achieved the second. The first now rests on this ledger alone.

### 5.6.5 Disposition of the three residual findings

**1. No retired marker — ✅ ADDRESSED (this PR).**
Not by restoring the migration. A retirement record was added to `database/migrations/README.md`
under **Retired migrations**: status, reason, governing ruling, merge/removal SHAs, execution state at
removal, and replacement lineage. Purpose is **discoverability, not execution** — so a future author
who finds the migration in git history understands why it is absent instead of resurrecting it.

⭐ While writing it, a **second docs/runner asymmetry** was found and corrected in the same README:
it claimed *"a checksum (SHA-256) is recorded at apply time; editing a migration file after it has
been applied is detected as drift, not silently ignored."* **That is not implemented.** The runner
creates a `checksum` column marked *"for future compatibility"* and never computes, writes, or
compares one — the recording statement inserts `filename` only. Editing an applied migration **is**
silently ignored. Corrected to state the measured behaviour; **no checksum enforcement was
implemented** (that is a code change and out of this PR's scope).

**2. Spec and audit deletion — ⏳ UNRULED, with criteria fixed.**
Not restored to trunk in this PR. The decision is *not* "should they be preserved" (they are, in git
history and on `feature/coach-facilitator-field-foundation`) but **in what capacity**:

> Restore as the **active specification** only if it survives the lifecycle and content corrections.
> If it contains plaintext-content assumptions, superseded lifecycle assumptions, or rejected object
> models, restore it **only as historical evidence**.

On the record so far it contains all three (its `ProgramEnrollment`/`StageHistory` model reverses the
declared-by-arrival ruling; its storage model is the rejected plaintext surface). The provisional
reading is therefore **transitional artifact, not active specification** — but that determination
belongs with the #902 foundation review, which may supply the cleaner canonical specification path.
Marked as historical evidence in the README retirement record pending that review.

**3. Local dev residue — ✅ CLOSED, no action.**
The distinction holds and does not need reconciling:

| | Tables | Data | Migration ledger |
|---|---|---|---|
| **Production** | none | none | never applied |
| **Developer DB** | 17 empty rejected artifacts | none | records local experimentation |

⛔ **Do not over-clean local state** unless it interferes with the verification path. For #902
acceptance the verification database is rebuilt from zero anyway — which is also the standing remedy
for the shared-dev-DB evidence problem.

### 5.6.6 Scope boundary for this record

This document and PR #911 are a **governance correction**. Their scope is fixed at: canonicality
ledger · migration incident record · runner-semantics lesson · Q-A/Q-B status · the gate-split
*proposal*.

⛔ This is **not** the place where the gate split, the encryption lane, or the product-model decisions
get implemented. Each deserves its own bounded change.

---

## 7. Sequence

1. Review/merge **#911** as the historical correction.
2. Complete **#902** foundation review.
3. Rebuild the isolated verification environment.
4. Accept the foundation lineage.
5. Ratify **Q-A** (My Journey: projection vs co-owned object).
6. Ratify **Q-B** (Home before a program exists).
7. Build practitioner services.
8. Build `/studio/clients`.
9. Build the client home.
10. Conduct the end-to-end walk.

> **The finding worth carrying forward:** a migration can be absent from production and still be
> dangerous while it remains executable in the path to production.

---

## 8. #902 accepted — and the amendment control that arrived too late

**#902 merged 2026-08-02T22:59:55Z as `c0c8b0ba6`.** Both migrations
(`20260802000002_practitioner_client_relationship.sql`,
`20260802000003_coach_field_process_structures.sql`) are on trunk.

**Status: #902 is the accepted canonical foundation.** Two post-merge amendments are required.

⭐ **This is not a failed foundation acceptance. It is a governance/process gap exposed by
acceptance.** The fact pattern, kept in order:

1. #902 was accepted and merged.
2. The review findings were valid.
3. The review mechanism available was a **comment**, not an enforceable requested-change gate.
4. The merge occurred before the amendments landed.
5. The remaining changes are therefore **post-merge corrective amendments, not acceptance blockers.**

### 8.1 ⛔ Do not amend the merged migrations in place

The earlier rule — *"never reached production → amend directly in the draft lineage, no transitional
duplication"* — **was correct before merge and does not survive it.**

After merge the migration file is part of repository history. Editing it now creates a worse problem
than it solves:

- dev environments that already applied it **diverge silently**;
- the repository **no longer describes what was applied**;
- the checksum gap (§5.6.5) becomes actively harmful rather than merely undocumented.

⭐ **The checksum gap is real but is a separate infrastructure issue. It must not be "solved" by
pretending the merged migration never existed.** The safer path after merge is a **follow-up
corrective migration**.

### 8.2 Amendment 1 — constrained ambiguity representation

Trunk carries `practitioner_client_reconciliation.ambiguity_reason TEXT` (L424): unconstrained,
uncommented, populated by a CASE (L544–554) emitting one of four fixed English sentences.

The corrective migration must:

1. add the constrained field (`ambiguity_code` or equivalent, controlled vocabulary);
2. map the four known existing sentences to codes;
3. preserve **no arbitrary human text**;
4. remove or retire the unconstrained field after the transition.

⭐ **The point is not the column rename.** It is restoring the invariant:
**reconciliation metadata describes machine evidence, not human explanation.**
⚠️ Exact vocabulary is the owning lane's call — earlier code names posted to #902 were illustrative,
an existence proof that a closed vocabulary covers all four branches, **not** a prescribed set.

### 8.3 Amendment 2 — formalize the `provenance` contract

Partially pre-satisfied by the original author. Trunk already carries a `COMMENT ON COLUMN` (L445):
*"The evidence the classification rests on — candidate counts, invitation ids, whether the email was
verified. Recorded so a human resolving the row can see WHY it was queued."*

⭐ That comment is useful because it **reveals the intended semantic boundary** — it is evidence.
Missing: a closed schema expectation · an explicit prohibition on becoming a content surface · a gate
assertion.

The follow-up must add: documented allowed keys · validation at the write boundary · a test/gate
assertion.

### 8.4 ⏳ The provenance/email question — reframed, still unruled

Trunk writes raw `normalized_invitation_email` into `provenance` (L486).

⭐ **The question is not "can we hash the email?" It is: *what is provenance allowed to reveal, and to
whom?*** The answer depends on what provenance is *for*:

| If provenance is for… | Then prefer |
|---|---|
| **automated reconciliation** | `candidate_relationship_ids` · `match_basis` · `verification_state` · `email_verified` — non-human-readable identifiers |
| **human review** | different privacy implications entirely; requires an explicit decision, not a default |

Belongs to the corrective lane. ⛔ Do not resolve it by picking the technically convenient option.

### 8.5 Ownership — one foundation, forward-corrected

```
#902 foundation  →  post-merge corrective amendment PR  →  same foundation owner / reviewers
```

**Not** `new branch → new interpretation → new foundation fork`.

⭐ The foundation **proved its value by making the remaining correction small and visible.**
⛔ Do not reopen the foundation. The next act is a controlled amendment, not another architecture
debate.

### 8.6 ⭐⭐⭐ The governance lesson — its own lane, not this PR

> **A review comment is not a control.** It can say *"this should change."*
> It cannot enforce *"this must change before merge."*

Third instance in one day (#814's coordination comment · #911's abort race · this). The distinction
needs a **mechanism**, not more discipline. Candidates — **not authored, not ruled**:
required approval from foundation owners · `CODEOWNERS` for foundation paths · merge-queue rules ·
a required check that unresolved architectural amendments are tracked.

⚠️ Aggravating factor found here: GitHub **refuses a requested-changes review on a same-account PR**,
so on this repo the one native control for "must change before merge" is structurally unavailable to
a same-account reviewer. Draft status is the remaining native control — and it must be applied
*before* the merge window, not after.

⛔ **Do not mix this into the correction PR.** Separate lane.

### 8.7 The stronger rule, and why it replaces the earlier one

The pre-merge rule — *"if it has never reached production, amend in place"* — existed to prevent
**shipping a known defect**. It is correct in the draft lineage and it does not survive merge.

> **Once a migration is merged and potentially consumed by any environment, corrective history must
> be explicit.**

⭐⭐⭐ **The reason is the checksum gap, and it is decisive.** Because
`scripts/run-sql-migrations.sh` records `filename` only and never computes or compares a checksum
(§5.6.5), the system **cannot distinguish**:

```
migration changed intentionally    ⟺    migration drifted accidentally
```

An in-place edit is therefore not a "safe correction that nobody has applied yet." It is
**invisible divergence** — indistinguishable, by the only mechanism that could tell them apart, from
corruption. Every environment gets a visible transition instead:

```
000002 (historical truth, unchanged)  →  000004 (corrective amendment)
```

**not** `000002 (changed after the fact)`.

`20260802000004` is free on trunk (verified). `20260802000002_practitioner_client_relationship.sql`
stays exactly as merged.

### 8.8 What the two amendments actually are

Neither is new architecture.

- **Amendment 1 completes the architecture #902 already claims.** The schema currently permits human
  interpretation to enter a machine reconciliation record. The correction splits what was conflated:
  **machine classification → constrained code** · **human explanation → a separate future evidence
  surface.** Corrective migration · constrained codes · map existing known values · gate assertion.
- **Amendment 2 is narrower and gated on a ruling.** The existing column comment already establishes
  aligned intent (*"evidence the classification rests on"*). What is missing is: which **keys** are
  allowed · which **data classes** are allowed · whether human narrative is **explicitly forbidden**.

⛔ **Rule the email question before changing the schema.** The starting question is not *"can we hash
it?"* — convenience is not a reason to keep or transform a field. It is:

> **Does this artifact need the email itself, or only proof that a match occurred?**

⭐ If provenance exists to help **machines reconcile**, store machine evidence. If it exists to help
**humans understand**, it is approaching a notes/audit-content surface. **Those are different
objects**, and the answer determines the schema rather than following from it.

### 8.9 Lane ownership

**Foundation corrective amendment** — scope: ambiguity codes · provenance contract · gate assertions.
⛔ **No UI. No service expansion.**

⚠️ **Do not assign this to #911 unless its owner accepts it.** #911 is the governance/incident record;
absorbing an implementation scope would repeat the pattern this document exists to name.

Separate lanes, separately owned: **checksum enforcement** · **governance around merge controls**
(**#896** `fix/covenant-gate-severity`, OPEN — verified).

⚠️ **Unresolved reference:** the clean-next-state list cites *"#915 — identity inventory."*
**No PR #915 exists** (`gh pr view 915` → not found). Recorded as unresolved rather than guessed at;
the intended referent needs naming before it can be tracked.

### 8.10 The governance failure stated precisely

⛔ The missing capability was **not** *"reviewers need to comment more clearly."* It was:

> **The repository had no mechanism to prevent acceptance of a foundation change while known
> architectural amendments remained unresolved.**

A comment is a **signal**. A required review is a **control**. That is a mechanism gap, and it
belongs to the governance lane as **evidence, not blame**.

⭐ **Restraint that governs the corrective lane:** do not turn this correction into another foundation
redesign. **The foundation survived review.** This is finishing two edges the review correctly
exposed.

---

## 9. Lane map — verified state, and the referent rule

⭐⭐⭐ **A debt item needs a stable referent.** Not *"identity inventory exists somewhere"* but
*"identity inventory is tracked at [specific artifact] with an owner."* Until that exists it is an
**observation**, not tracked work. #915 was cited in a lane list and **does not exist** — a plausible
reference had begun functioning as a factual one. ⛔ **Do not allow a plausible reference to become a
factual reference.**

Applying that rule to this record's own output: the three lanes below existed only as prose here.
They now have referents. **None has an owner** — ownership assignment is the next durable step, and
it is not implementation.

| Item | Verified status | Scope |
|---|---|---|
| **#902** | Canonical foundation, **merged** `c0c8b0ba6` | Relationship foundation and invariants |
| **#911** | Open, **docs-only**, unmerged | Retirement ledger + methodology record |
| **#896** | Open (`fix/covenant-gate-severity`) | Cumulative covenant obligation behaviour |
| **#916** | Open, **no owner** | #902 post-merge corrective amendment |
| **#917** | Open, **no owner** | Migration integrity / checksum enforcement |
| **#918** | Open, **no owner** | Merge-control governance |
| ~~#915~~ | 🔴 **UNRESOLVED REFERENCE — no such PR or issue** | cited as "identity inventory"; referent needs naming |

### 9.1 ⚠️ #896 is not the merge-control lane — preserve the distinction

| | The question it answers |
|---|---|
| **#896** | *When multiple obligations apply, are they all evaluated?* → **gate semantics** |
| **#918** | *Can a foundation change merge while known unresolved corrections exist only as comments?* → **change authorization workflow** |

Related, not the same. ⛔ **"Governance lane" must not become a bucket for both** — collapsing them
would leave the authorization gap unaddressed behind a fix that never targeted it.

### 9.2 The principle behind the in-place-edit rule

The rule is **not** *"never edit migrations."* It is:

> **Once a migration may have been consumed, an edit without a trustworthy drift mechanism is
> indistinguishable from corruption.**

⭐ **The runner's behaviour determines the rule.** If the system cannot answer *"was this migration
changed intentionally?"*, then changing the file after merge **destroys evidence**. That is why
#917 is load-bearing rather than hygiene: implementing it changes which corrections are safe.

```
merged migration → known correction → new explicit migration → new evidence trail
```

### 9.3 Synthesis

> **A mature architecture is not one where nothing remains unresolved. It is one where every
> unresolved thing has a category, a boundary, and an owner.**

That is what stops unresolved questions from leaking back into implementation as assumptions.
By that standard this record is **two-thirds done**: every item above has a category and a boundary;
**#916, #917, #918 still lack owners**, and #915 lacks a referent.

---

## 10. Ownership — completing the chain

⭐⭐⭐ **referents → ownership → action authority.** The ledger established referents (§9). This
completes the chain. **It is not more governance; it is the administrative step that lets each lane
move without ambiguity.**

| Referent | Owner | Recorded |
|---|---|---|
| **#916** post-merge corrective amendment | **Founder-Steward (Kelly)** | assignee + comment |
| **#917** migration integrity / checksum | **Founder-Steward, until delegated** | assignee + comment |
| **#918** merge-control governance | **Founder-Steward, until delegated** | assignee + comment |
| **#915** | ⛔ **no owner, no scope — intentionally** | awaiting referent definition |

⭐ All three land with Founder-Steward **not because the founder must personally implement them**, but
because **ownership and execution are different dimensions**:

```
Founder-Steward owns the decision boundary
        ↓
executor may implement after authorization
        ↓
reviewers verify against the artifact
```

### 10.1 The four roles — separate dimensions, explicit overlap

| Role | Function |
|---|---|
| **Specification author** | defines what must be true |
| **Builder** | creates the implementation |
| **Executor** | performs the run/change |
| **Acceptor** | decides whether evidence is sufficient |

One person may occupy several. ⛔ **The overlap has to be explicit** — an unstated overlap is how a
builder's convenient choice becomes an acceptance, which is the failure this whole record documents.
Decisions marked *"surface for ruling"* belong to the **Acceptor**, never the Builder.

### 10.2 #915 stays unresolved on purpose

⛔ **Do not assign a guessed owner or scope.** It lacks the primary requirement of a tracked work
item — **a stable referent**. Ownership attaches only once #915 has a defined artifact, decision, or
defect boundary. Assigning an owner to an undefined scope would manufacture exactly the false
precision §9 warns against.

### 10.3 #896 / #918 — final sharpening

- **#896** is a **gate logic defect**: *obligations must compose with classification.*
- **#918** is an **authority workflow defect**: *who controls the act of merging when governance
  obligations exist.*

⭐ **A fixed gate does not automatically create a correct authorization workflow.** Adjacent, different
referents. Closing #896 must not be read as progress on #918.

### 10.4 ⚠️ Concurrency notice — all three lanes are now executing in parallel

Recorded because it is a live risk, not a hypothetical:

1. **#916 ⟷ #917 file collision.** Both touch `database/migrations/` and
   `database/migrations/README.md`. #916 adds `20260802000004`; #917 modifies the runner and the same
   README section. Expect conflicts; neither should assume it lands first.
2. **#917 can gate #916.** If checksum enforcement lands **fail-closed** with a `NULL = drift`
   policy, environments carrying NULL checksums stop before reaching #916's corrective migration.
   The NULL policy is therefore **a dependency of #916, not only a #917 decision.**
3. **#918 can gate both.** `CODEOWNERS` or branch protection landing first would gate its own
   siblings. ⭐ Sequencing implication: **#918's mechanism should land after #916 and #917 merge**, or
   it blocks the corrections that motivated it.
4. 🔴 **Shared dev database.** #916 and #917 both require DB verification, and this repo's worktrees
   share one dev database — the standing trap where a concurrent lane drops another's tables
   mid-gate. **Both lanes must use a branch-owned database**, not the shared one. Evidence produced
   against the shared DB is not repeatable and does not count.
