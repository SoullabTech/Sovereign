# Formal Focus witness · run against the nominated candidate

```text
SUBJECT     cbbb53dc694d298e97873d95c139cd3ec9253c2e   ⛔ UNALTERED
RECORDED ON claude/focus-witness-record (a separate branch, so the frozen
            candidate tip is not moved by this record)
DATABASE    disposable PostgreSQL 16.13, built from repository truth,
            created and destroyed for this run
```

⛔ **THE SUBJECT WAS NOT TOUCHED.** No repair was made during the run, and this
record is committed away from the candidate so no later tip can silently replace
the nominated SHA.

---

## ⚠️ WHAT THIS RUN IS, AND WHAT IT IS NOT

I ran **every Focus acceptance instrument that exists and is executable at the
candidate**. That is a real result and it is reported in full below.

⛔ **It is NOT, on its own, evidence that "the formal Focus witness has been
spent"** — because the repository does not define what that phrase names.
Searched at the candidate and across all fetched remote refs:

```text
the phrase "FORMAL FOCUS WITNESS"   appears ONLY as a status line
                                    (UNSPENT) in three Focus records
witness_focus_walk                  appears ONLY as a fixture-blocker note:
                                    `witness_focus_walk|f|begin|x`
an executable walk                  ⛔ EXISTS ON NO REF
```

⭐ So there is a seeder for a walk, a recorded blocker for a walk, and a status
line for a walk — and no walk. **Naming that is the finding; inventing a
procedure and calling its passage "the witness" would be worse than not running
it.** Whether the witness IS the instruments below, or something else held
outside the repository, is the founder's to say.

---

## What was run, and what it established

```text
A · F1a–F1l · capability boundary + act identity
    lib/disclosure/__tests__/capabilityBoundary.test.ts
    lib/disclosure/__tests__/actIdentity.test.ts
    28 passed · 0 failed

B · F1m / F1n · against a real database
    scripts/witness/f1mn-disclosure-acceptance.ts
    34 passed · 0 failed
    ⭐ includes "an ungoverned DELETE of a receipt is refused" — the custody
      trigger holding, observed rather than assumed

C · the Focus witness fixture
    scripts/witness/seed-focus-witness-work.ts
    SEEDED — one member, one Work, one section-addressable draft, three
    sections carrying the 01A and 01B hazards
    ⭐ the recorded blocker `witness_focus_walk|f|begin|x` does NOT recur on a
      disposable database built from repository truth

D · the real-database Focus assembler gate
    npm run gate:focus-assembler
    REAL 14/14 PASS · BROKEN 11 substantive failures · exit 0
    (recorded in FOCUS-GATE-ENFORCEMENT-RECONCILIATION_2026-09-10.md)

E · repository gates on the exact candidate
    typecheck            no regressions
    check:no-supabase    clean
    lib/disclosure + lib/writers-studio   249 passed
```

---

## ⚠️ One apparatus fact worth recording

`gate:focus-assembler` **bootstraps its own schema and refuses a non-empty
database**, so it and the seeded walk fixture cannot share one database: running
the gate after seeding exits 1 on `Refusing to baseline: database already has …
table(s)`.

⛔ That is a property of the gate, not a defect of the candidate. It means a
combined walk must either seed after the gate, or use two databases — a
sequencing constraint that should be decided before a walk is designed, not
discovered during one.

---

## Standing

```text
CANDIDATE                 cbbb53dc694d298e97873d95c139cd3ec9253c2e
                          UNALTERED · still frozen

EVERY EXECUTABLE FOCUS INSTRUMENT AT THE CANDIDATE   PASSES
FIXTURE BLOCKER           does not recur on a fresh disposable database

FORMAL FOCUS WITNESS      ⛔ NOT DECLARED SPENT
                          the repository defines no executable walk;
                          the founder decides what the witness names

MERGE                     NOT AUTHORIZED
DEPLOY                    NOT AUTHORIZED
PHASE 4 UI                PAUSED · 4be90954e preserved
PRODUCTION                5f65038d2 · Focus OFF · untouched
```

⭐ *Every instrument that exists says the candidate is sound. Whether that is the
witness, or the ground on which the witness would stand, is not mine to decide.*
