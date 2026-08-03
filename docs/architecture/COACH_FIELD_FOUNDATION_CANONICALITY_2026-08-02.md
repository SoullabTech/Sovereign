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
