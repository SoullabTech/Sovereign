# FOCUS INTEGRATION CANDIDATE

**One dependency-complete FOCUS release unit, replayed onto current canonical.**
⛔ Not merged. Not deployed. Route OFF. Witness unspent.

```text
manifest basis   a3f166a2387f740e99a70e9b73572fa664b92f35
canonical base   5b133abcde3a5c8aeced1094fb4ba14fa35a949e
material drift   NONE — canonical unchanged since the manifest
branch           claude/focus-integration-candidate
```

---

## 1 · The 14 manifest items

```text
REPLAYED   2601a8144 → e31eac5cc   MAIA cognition harness boundary        (resolved)
REPLAYED   b6257f69f → 0f44921af   WS-ROOM-01 — a real room               (resolved)
REPLAYED   0bd661046                WS-ROOM-02 — three-class membrane      (resolved)
REPLAYED   10cdc7bc4 → 857d41e7f   disclosure receipt substrate           (resolved)
REPLAYED   450f5c158                generalize to context receipts
REPLAYED   740b89b2c                SUBSTRATE-A
REPLAYED   277432c18                REQUEST-ORDER-01  ⭐ carries schema
REPLAYED   6008c155d                required consent state + boundary
REPLAYED   93fd13abb                §3a surface contract
REPLAYED   7e6daea59                Focus cognition route
REPLAYED   a5fbafc8a                FOCUS-PRODUCER-01
REPLAYED   69e9a7aa6                FOCUS-PRODUCER-01A
REPLAYED   5d6e4c809                W1/W2 ghost-turn repair
REPLAYED   bda87b27e                record corrections + witness method

already represented   0
conflicted (unresolved) 0
```

### 1.1 Conflicts, and how each was reconciled

Four conflicts, all `DU` (absent on canonical, modified by the replayed commit),
all in **documents**, none in code, schema or tests.

```text
docs/programme/JARVIS-WS2-DEVELOP_D9_ORBIT_PROTOTYPE_2026-09-09.md
  ⛔ NOT IMPORTED. A WS2-DEVELOP running record edited by 20 other commits.
  The manifest classified it docs coupling, not dependency; importing it would
  have pulled another lane's record in through a FOCUS commit.

docs/programme/FOCUS-DISCLOSURE-RECEIPT_CONTRACT_2026-09-09.md
  ✅ KEPT, by content. This one IS a FOCUS document.
```

### 1.2 ⚠️ A MANIFEST GAP, FOUND BY REPLAYING IT

The FOCUS contract document is **created by `dd81b1ce7`** — *"docs: Focus
disclosure receipt — minimal contract (design only)"* — which is **not among the
14**.

⭐ **The unit is dependency-complete for executable state and was not complete for
its own documents.** Resolved as the ruling directs — *resulting-tree
requirements, not blind cherry-pick success* — by restoring the document's
content rather than importing the commit. ⛔ No executable consequence; recorded
so the manifest is not believed to be more complete than it was.

## 2 · Required final migration state — verified

```text
✅ PRESENT   database/migrations/20260909000001_context_disclosure_receipts.sql
✅ ABSENT    20260909000001_focus_disclosure_receipts.sql     (superseded)
✅ ABSENT    20260909000001_maia_turns_member_identity.sql    (B5 — out)
✅ ABSENT    20260908000001_developmental_reading_f7_eligibility.sql  (SEL-0 — out)
```

**Exactly one migration.** No B5, SEL-0, FIELD/PFI, Encounter or D8/D9 file was
imported.

## 3 · Cross-lane boundaries

```text
lib/sovereign/maiaService.ts
  FOCUS regions only. The FIELD/PFI edits were never on this branch and canonical
  behaviour outside the FOCUS additions is unchanged.

app/api/members/delete-account/route.ts
  Carries ONLY the FOCUS registration of context_disclosure_receipts.
```

### 3.1 🔴 RECORDED AS DIRECTED — the deletion consequence

> **Under the current refusal posture, a future member holding a
> context-disclosure receipt may have account deletion refused until that custody
> case is adjudicated.**

`CONTAINMENT_POSTURE = 'refuse'`; `governedContentFor()` counts and a non-zero
count refuses. ⛔ **Not solved here.**

⭐ It does not block a dark deploy: with the route OFF no receipt can be minted,
so the population is empty. It must be resolved **before broad activation**.

## 4 · Requalification — on the integrated tree

```text
typecheck            229 errors · baseline 239 · NO REGRESSIONS
                     (identical to canonical base — no error introduced)
check:no-supabase    clean
disclosure · writers-studio · canonical-turn · provenance
                     12 suites · 312 tests · 0 failed
app/writers-studio · lib/memory
                     26 suites · 458 tests · 0 failed

invariants present   C1 C2 C3 C4 C5 C6 · P1–P8 · H1 H2 H3 · W1 W2
```

⛔ **No newly introduced failure.** No pre-existing failure needed classification
— nothing failed.

## 5 · Standing

```text
WRITERS_STUDIO_FOCUS_ENABLED   OFF   (route requires === '1'; asserted in test)
human Focus witness            UNSPENT
production                     UNTOUCHED
B5                             UNTOUCHED
SEL-0                          UNTOUCHED
FIELD/PFI                      no branch work imported
#1275                          FROZEN
```

**Candidate ready for PR: YES** — 34 files, one migration, all gates green, no
lane bleed, and the two consequences that must appear in the PR body are recorded
above (§1.2 manifest gap, §3.1 deletion posture).

⛔ Merge and deploy remain unauthorized.
