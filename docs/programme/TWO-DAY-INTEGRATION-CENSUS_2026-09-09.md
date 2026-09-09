# TWO-DAY INTEGRATION CENSUS — Sept 8–9

**READ ONLY.** Nothing merged, nothing cherry-picked, no code changed.

```text
canonical   clean-main-no-secrets @ 5b133abcd
source      feature/jarvis-ws2-sel0-production-discovery-2026-09-08 @ bda87b27e
divergence  246 ahead · 40 behind          (verified: git rev-list --left-right --count)
range       2026-09-08 10:22Z → 2026-09-09 22:54Z
```

⛔ **Do not merge the source branch wholesale.**

---

## 1 · ⭐ 246 COMMITS IS NOT 246 THINGS TO DEPLOY

```text
DOCS        187    76%   records · censuses · rulings · constitutional text
CODE         51    21%
MIGRATION     5     2%   touching 3 migration files, 2 surviving at head
TESTS         3     1%
```

⭐ **Three quarters of the lane is the written record.** That is not overhead —
it is most of what would be lost — but it is also not a deployment.

## 2 · 🔴 TWO COLLISIONS A SUBJECT-LINE MANIFEST WOULD MISS

### 2.1 ⭐⭐ A SCHEMA CHANGE INSIDE A `docs:` COMMIT

```text
277432c18  docs: REQUEST-ORDER-01 — the ordering claim is refuted, not confirmed
           database/migrations/20260909000001_context_disclosure_receipts.sql | 9 ++-
           docs/…/FOCUS-DISCLOSURE-RECEIPT_CONTRACT_2026-09-09.md
           docs/programme/REQUEST-ORDER-01_2026-09-09.md
```

⛔ **Classified by its subject, this is DOCS ONLY — and replaying it as such would
drop nine lines of schema.** Every classification in a replay manifest must be
made from **files touched**, never from the commit subject.

### 2.2 A SUPERSESSION INSIDE THE FOCUS CHAIN

```text
10cdc7bc4  A  database/migrations/20260909000001_focus_disclosure_receipts.sql
450f5c158  D  database/migrations/20260909000001_focus_disclosure_receipts.sql
           A  database/migrations/20260909000001_context_disclosure_receipts.sql
```

⛔ **Replaying `10cdc7bc4` without `450f5c158` deploys the superseded migration
under a duplicate `20260909000001` prefix.** Both must move together or neither.

### 2.3 🔴 AND A THIRD, ACROSS LANES — Instance 2 is repaired TWICE

```text
2a3995600  (source branch)  fix(beads): SACRED-AS-SYMPTOM Instance 2
4d92c4abc  (claude/sacred-instance-2-repair, off canonical)  fix(sacred): Instance 2
```

Both touch **the same three files** — `docs/SPIRAL_MEMORY_MESH_SPEC.md`,
`lib/memory/beads-sync/MaiaBeadsPlugin.ts`, `lib/memory/beads-sync/server.ts` —
and each adds its own differently-named falsifier for the same invariant.

⛔ **Two independent repairs of one defect. They will conflict on every shared
file, and merging both leaves two guards for one law.** One must be chosen and
the other explicitly withdrawn — a founder act, not a merge resolution.

## 3 · THE FOCUS RELEASE UNIT — 14 commits of the 246

Dependency-ordered. ⭐ **This is the whole chain, not `a5fbafc8a → bda87b27e`.**

```text
PREREQUISITES (Writer's Studio as a canonical room)
  2601a8144  feat(writers-studio): the MAIA cognition harness boundary
  b6257f69f  feat(canonical-turn): WS-ROOM-01 — Writer's Studio is a real room
  0bd661046  feat(writers-studio): WS-ROOM-02 — the membrane has three classes

DISCLOSURE SUBSTRATE  (carries the migration)
  10cdc7bc4  feat(disclosure): Focus disclosure receipt substrate          MIGRATION
  450f5c158  refactor(disclosure): generalize to context receipts          MIGRATION  ⭐ §2.2
  740b89b2c  fix(disclosure): SUBSTRATE-A — retry authority, custody       MIGRATION
  277432c18  docs: REQUEST-ORDER-01 …                                     MIGRATION  ⭐ §2.1
  6008c155d  feat(provenance): required consent state and the boundary

SURFACE + RUNTIME
  93fd13abb  feat(writers-studio): §3a Focus disclosure surface contract
  7e6daea59  feat(writers-studio): the Focus cognition route
  a5fbafc8a  feat(writers-studio): FOCUS-PRODUCER-01 — canonical participation
  69e9a7aa6  fix(writers-studio): FOCUS-PRODUCER-01A — true handoff, no bypass, one posture
  5d6e4c809  fix(writers-studio): W1 RCN exclusion telemetry, W2 no ghost turn
  bda87b27e  docs: two record corrections, and the witness method fixed     (head)
```

**Migration that must run before FOCUS can lawfully cross anything:**
`database/migrations/20260909000001_context_disclosure_receipts.sql`

## 4 · SEPARATE RELEASE UNITS — classified, not scheduled

⛔ None of these is FOCUS, and none should ride in on its PR.

```text
SEL-0 / DEVELOPMENTAL     15b7bb8e-era selector + 64e439f66 runtime
                          ⭐ carries its OWN migration:
                          20260908000001_developmental_reading_f7_eligibility.sql
ENCOUNTER / SEAM / G8     702a4e90f · ad1d8ff96 · 35d0f81d1 · 41bb132c0 · f6a8a3dc8 …
ERASURE / PT-3 / GATE     936ba7daf · 0d97e79f1 · f232a15ba · 86265c89a · 05780ab84 …
FIELD-TRUTH / PFI / RESONANCE   79905a1c6 · ee4c14528 · 10522fb19 · 62c38f43e · 097a21745 …
FIELD-SAFETY-COPY         0f8191eb2 · 5eab0feb6
SACRED / EVIDENCE-NAMING  2a3995600 · 58eb18998            ⛔ collides — see §2.3
WS2-DEVELOP room copy     cd1235d37 · 6237c3214 · 56d0ac264 …
```

## 5 · ⛔ WHAT STAYS OUT

```text
B5 maia_turns remediation   claude/maia-turns-derivative-custody @ aed7ebbb3
                            census + ruling only · ZERO production mutation
                            ⛔ the 174,662-row deletion must NOT ride this deploy
#1275 Field integration     18d8c7004 · FROZEN
Lane A Focus receipt        56606ff3f · HOLD
```

⭐ The B5 **record** may merge as documentation. The **act** may not.

## 6 · Requalification the integrated SHA must pass

⚠️ **Canonical has moved 40 commits since divergence, so the branch's green tests
do not transfer.** Requalify on the merged result, not on the source.

```text
disclosure tests · C1–C6 · P1–P8 · H1–H3 · W1/W2 ghost-turn audit
canonical-turn tests · typecheck no-regression · check:no-supabase
protected-branch checks: build · check-diagrams · sovereignty ·
                         Axis 1 — authoritative adjudication
```

⛔ **Do not resolve conflicts by preferring "ours" or "the old branch"
mechanically.** Forty canonical commits are a moved subject, not noise.

## 7 · Sequence

```text
1  FREEZE bda87b27e as the evidence head — no further work piled on
2  fresh integration branch FROM canonical 5b133abcd   ⛔ do not merge the source
3  this census                                          ✅ done
4  replay manifest — classify by FILES TOUCHED, never by subject (§2.1)
5  replay onto canonical · reconcile conflicts there
6  requalify the integrated SHA (§6)
7  ONE bounded PR naming: evidence head · replayed subjects ·
   deliberate exclusions · the migration · flag OFF · witness unspent
8  merge → FULL deploy with FOCUS still OFF (the migration must run first)
9  verify deployed runtime == merged SHA → seven-step witness → only then enable
```

## 8 · Standing

```text
census            ✅ COMPLETE — read only
replay manifest   ⛔ NOT WRITTEN — next act, after this is reviewed
merge             ⛔ NOT AUTHORIZED
cherry-pick       ⛔ NOT AUTHORIZED
WRITERS_STUDIO_FOCUS_ENABLED   OFF
human witness                  UNSPENT
production                     UNTOUCHED
```

---

*Two hundred and forty-six commits, fourteen of them a release. The other work is
real; it is simply not this deploy — and the three collisions above are the ones
that would have shipped quietly.*
