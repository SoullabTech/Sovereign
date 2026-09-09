# TWO-DAY REPLAY MANIFEST

**Classified by FILES TOUCHED and resulting authority — never by commit subject.**
⛔ Read-only. Nothing cherry-picked, merged, or deployed.

```text
canonical   5b133abcd        source   bda87b27e   (246 ahead · 40 behind)
census      fef428a3b        this     the replay manifest it called for
```

---

## 1 · THE FOCUS RELEASE UNIT — 14 commits · 38 files

### 1.1 ⭐ IT CAN MOVE ALONE — established, not assumed

Three files in the unit are also touched by non-FOCUS commits. Only one is code:

```text
lib/sovereign/maiaService.ts
  ⚠️OTHER  ee4c14528  FIELD-TRUTH-02        +12/-1
  ⚠️OTHER  5da20457e  signal-lineage census  +2/-1
  ⚠️OTHER  097a21745  PFI-REPRESENTATION     +3/-1
  FOCUS    a5fbafc8a                        +42/-0
  FOCUS    69e9a7aa6                        +66/-5
  FOCUS    5d6e4c809                        +26/-3
```

**Tested rather than reasoned:** the combined FOCUS delta for that file was
applied against canonical **without** the three FIELD-TRUTH/PFI commits —
`git apply --check` → **APPLIES CLEANLY**. ⭐ **The coupling is apparent, not
real: the edits sit in different regions.** The FOCUS unit is therefore
replayable independently of the FIELD-TRUTH lane.

The other two shared files are running docs records
(`JARVIS-WS2-DEVELOP_D9_ORBIT_PROTOTYPE` — 20 other commits;
`FOCUS-DISCLOSURE-RECEIPT_CONTRACT` — 2). ⛔ Docs coupling, not dependency —
reconcile the text; do not import the other lanes to obtain it.

### 1.2 Commits, in dependency order

```text
REPLAY_REQUIRED   2601a8144  MAIA cognition harness boundary
REPLAY_REQUIRED   b6257f69f  WS-ROOM-01 — Writer's Studio is a real room
REPLAY_REQUIRED   0bd661046  WS-ROOM-02 — the membrane has three classes
REPLAY_REQUIRED   10cdc7bc4  disclosure receipt substrate          ⚠️ MIGRATION
REPLAY_REQUIRED   450f5c158  generalize to context receipts        ⚠️ MIGRATION §1.4
REPLAY_REQUIRED   740b89b2c  SUBSTRATE-A — retry authority, custody ⚠️ MIGRATION
REPLAY_REQUIRED   277432c18  REQUEST-ORDER-01                      ⚠️ MIGRATION §1.3
REPLAY_REQUIRED   6008c155d  required consent state + boundary
REPLAY_REQUIRED   93fd13abb  §3a surface contract
REPLAY_REQUIRED   7e6daea59  Focus cognition route
REPLAY_REQUIRED   a5fbafc8a  FOCUS-PRODUCER-01
REPLAY_REQUIRED   69e9a7aa6  FOCUS-PRODUCER-01A
REPLAY_REQUIRED   5d6e4c809  W1/W2 ghost-turn repair
REPLAY_REQUIRED   bda87b27e  record corrections + witness method    (head)
```

### 1.3 ⛔ `277432c18` IS NOT DOCS

Subject reads `docs:`. Files touched include
`database/migrations/20260909000001_context_disclosure_receipts.sql` **+9/-4**.
⭐ **This single commit is why the manifest is classified by files.**

### 1.4 ⛔ THE PAIR THAT MOVES TOGETHER

```text
10cdc7bc4   A  …/20260909000001_focus_disclosure_receipts.sql
450f5c158   D  …/20260909000001_focus_disclosure_receipts.sql
            A  …/20260909000001_context_disclosure_receipts.sql
```

Replaying the first without the second deploys a superseded migration under a
duplicated `20260909000001` prefix. **Both or neither.**

### 1.5 Files, by disposition

```text
MIGRATION  (1 surviving)
  database/migrations/20260909000001_context_disclosure_receipts.sql   REPLAY_REQUIRED
  …_focus_disclosure_receipts.sql                                      SUPERSEDED · deleted at head

CODE  (20 surviving)
  app/api/writers-studio/focus/route.ts
  app/api/members/delete-account/route.ts                              ⚠️ §3
  app/writers-studio/lab/maia/{layout,page}.tsx
  lib/disclosure/{contextDisclosureReceipt,disclosureBoundary}.ts
  lib/maia/canonical-turn/{policy,producerRegistry,types}.ts
  lib/provenance/requireConsentState.ts
  lib/sovereign/maiaService.ts                                         ⚠️ §1.1
  lib/writers-studio/{assembleFocus,canonicalWriterTurn,focusCrossing,
                      focusDisclosureSurface,harnessAccess,harnessContext,
                      membrane,writersStudioCognition}.ts
  scripts/witness/context-disclosure-substrate-witness.sql
  lib/writers-studio/disclosure/focusDisclosureReceipt.ts              SUPERSEDED · deleted at head

TESTS  (8 surviving)   disclosure ×2 · writersStudioRoom · focusCrossing ·
                       focusDisclosureSurface · focusHandoff · focusProducer ·
                       harnessBoundary
  …/disclosure/__tests__/focusDisclosureReceipt.test.ts                SUPERSEDED · deleted at head

DOCS  (6)  FOCUS-COGNITION-WIRING · FOCUS-DISCLOSURE-RECEIPT_CONTRACT ·
           FOCUS-DISCLOSURE-SURFACE-3A · FOCUS-PRODUCER-01_REPAIR ·
           REQUEST-ORDER-01 · D9_ORBIT_PROTOTYPE (shared — §1.1)
```

---

## 2 · SACRED INSTANCE 2 — ruled, per-file

**AUTHORITATIVE REPAIR: `4d92c4abc55edb3a4ae6bbe386157b398d15c19c`**
(branch `claude/sacred-instance-2-repair`, a direct child of canonical).

```text
4d92c4abc
  lib/memory/beads-sync/MaiaBeadsPlugin.ts                REPLAY_REQUIRED · authoritative
  lib/memory/beads-sync/server.ts                         REPLAY_REQUIRED · authoritative
  docs/SPIRAL_MEMORY_MESH_SPEC.md                         REPLAY_REQUIRED · authoritative supersession
  lib/memory/__tests__/sacredInstance2TaskBypassRisk.test.ts
                                                          REPLAY_REQUIRED · SOLE standing falsifier
  lib/memory/beads-sync/README.md                         REPLAY_REQUIRED · removes stale example
  docs/programme/SACRED-INSTANCE-2_REPAIR_2026-09-09.md   DOCS/RECORD · keep

2a3995600
  lib/memory/beads-sync/MaiaBeadsPlugin.ts                SUPERSEDED
  lib/memory/beads-sync/server.ts                         SUPERSEDED
  docs/SPIRAL_MEMORY_MESH_SPEC.md                         SUPERSEDED
  lib/memory/__tests__/sacredInstance2.test.ts            SUPERSEDED
                                                          ⛔ do not retain a second guard for one law
  docs/canon/THE_SACRED_IS_NOT_A_SYMPTOM.md               UNIQUE DOCS-ONLY RECORD
```

⛔ **Do not cherry-pick `2a3995600` to obtain the canon file.** After the
authoritative repair replays, reconcile the canon with the smallest docs-only act
that marks Instance 2 CLOSED and points at the surviving record and SHA. If
canonical already carries equivalent closure by then → **`ALREADY_CANONICAL`**,
make no duplicate.

> **A sacred subject may be the content of an encounter. It may not become
> evidence that the encounter is pathological.**
> **Measured bypassing may be evidence about an observed pattern. The subject
> matter of a task is not.**

---

## 3 · 🔴 AN OPEN CONSEQUENCE THE PR MUST NAME

The FOCUS unit adds its receipt table to `GOVERNED_CONTENT` in
`app/api/members/delete-account/route.ts` (added `10cdc7bc4`, renamed
`450f5c158`).

That list is **not** a deletion list. On canonical:

```text
route.ts:139   const CONTAINMENT_POSTURE: 'refuse' | 'proceed' = 'refuse';
route.ts:147   governedContentFor()  — read-only COUNT per table
               rows > 0  →  the deletion is REFUSED and surfaced
```

⭐ **So after this migration, any member holding a disclosure receipt will have
their account deletion REFUSED until adjudicated.**

⚠️ The commit's own comment reads *"without this line it would survive account
deletion the way audit_logs does"* — which describes deletion, not refusal. The
**act** is coherent under refuse posture (*"retention may be shared by decision,
not by accident"*); the **wording** points at the wrong mechanism.

⛔ **Not a defect ruling — a consequence that must be stated in the PR rather
than discovered in production.** Whether refuse-on-receipt is the intended
member experience is a founder question.

⭐ **Cross-lane note:** this is the same list B5 found `maia_turns` absent from.
Here the discipline was applied; there it was not. Same mechanism, opposite
outcome.

---

## 4 · NOT IN THIS REPLAY

```text
SEL-0 / DEVELOPMENTAL      separate unit · carries its OWN migration
                           20260908000001_developmental_reading_f7_eligibility.sql
ENCOUNTER / SEAM / G8      separate unit
ERASURE / PT-3 / GATE      separate unit
FIELD-TRUTH / PFI / RESONANCE   separate unit · §1.1 proves FOCUS does not need it
FIELD-SAFETY-COPY          separate unit
WS2-DEVELOP room copy      separate unit
EVIDENCE-NAMING-01A        58eb18998 · separate · not ruled here

B5 maia_turns remediation  aed7ebbb3 · record MAY merge as docs
                           ⛔ the 174,662-row deletion MAY NOT ride this deploy
#1275                      18d8c7004 · FROZEN
Lane A Focus receipt       56606ff3f · HOLD
```

---

## 5 · Requalification owed on the INTEGRATED SHA

⚠️ Canonical moved 40 commits since divergence. **The branch's green tests do not
transfer.**

```text
disclosure tests · C1–C6 · P1–P8 · H1–H3 · W1/W2 ghost-turn audit
canonical-turn tests · typecheck no-regression · check:no-supabase
protected-branch: build · check-diagrams · sovereignty ·
                  Axis 1 — authoritative adjudication
```

⛔ Do not resolve conflicts by mechanically preferring *ours* or *the old branch*.

## 6 · Standing

```text
census            ✅ fef428a3b
replay manifest   ✅ this document
cherry-pick       ⛔ NOT AUTHORIZED
merge             ⛔ NOT AUTHORIZED
deploy            ⛔ NOT AUTHORIZED
WRITERS_STUDIO_FOCUS_ENABLED   OFF
human witness                  UNSPENT
production                     UNTOUCHED
```

---

*Fourteen commits, one migration, one superseded pair, one mislabelled schema
change, one collision ruled, and one consequence that would have arrived as a
member's failed account deletion.*
