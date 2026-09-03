# CMT-01 · Participation Disposition Contract

**Lane**: CMT-01 — Canonical MAIA Turn Construction
**Artifact class**: type-contract refinement · **no behaviour change** · no live caller
**Ruling**: founder, 2026-09-03 (session-stated; recorded here so it is findable, not to promote its authority by recording)
**Answers**: census §12.2 — MIPA is **(b)**, a Phase 0 conceptual output that never landed as code. *"The canonical-turn work is precisely where participation becomes concrete."* This document is where it first becomes real.
**Typed form**: `lib/memory/participation/participationDisposition.ts` (contract version `pdc-1`)
**Pinned by**: `lib/memory/participation/__tests__/participationDisposition.test.ts`
**Depended on by**: `docs/programme/JARVIS-CDPI-01-CROSS-DOMAIN-PATTERN-INTELLIGENCE-01.md` (binds by path; may not redefine)

> ⛔ This is not the seam spec (CMT-01 deliverable 2). It does not pick candidate A/B/C, does not
> touch `getMaiaResponse()`, and does not decide the `meta` channel. It fixes the **closed set of
> dispositions** a canonical participation layer must use, and the invariants each carries, so
> that Step 2's typed constructor imports them rather than redeclaring them.

---

## The five dispositions

```text
AVAILABLE   Candidate has entered adjudication and may be considered.
            Not yet finally dispositioned.

HELD        Candidate was legitimately considered but is deliberately not allowed
            to enter the member-facing encounter on this turn.

OFFERED     Only a disclosure-safe doorway may enter the speaking context.

ADMITTED    The governed representation may participate in cognition / composition.

EXCLUDED    Candidate lacks sufficient provenance, authority, permission, or other
            eligibility to participate.
```

```text
provider returns candidate
        ↓
    AVAILABLE
        ↓
   adjudication
   ┌────┼───────┬─────────┐
   ▼    ▼       ▼         ▼
 HELD OFFERED ADMITTED EXCLUDED
```

## `HELD` ≠ `EXCLUDED` — load-bearing

```text
EXCLUDED   "This is not constitutionally eligible."
HELD       "This may be a legitimate hypothesis / candidate,
            but it does not belong in the encounter now."
```

The distinction is structural, not descriptive: the two carry **disjoint reason-code sets** in the
typed form, so a `HELD` entry cannot be constructed with an eligibility reason and an `EXCLUDED`
entry cannot be constructed with a judgment reason.

`HELD` gives structural expression to something central to the whole design:

> **Intelligence includes the capacity to know without displaying what is known.**

This differs from suppression-by-prompt because **the speaking model never receives the body.**

## `AVAILABLE` — tightened

Once `HELD` exists, `AVAILABLE` may no longer mean "quietly withheld." It means *available to the
adjudication layer and not yet finally dispositioned.*

> **For a completed turn, nothing remains `AVAILABLE`.** Every considered candidate receives one
> of the four final dispositions. `assertTurnDispositioned()` refuses a manifest that violates this.

## Invariants

1. `HELD` content does not enter canonical speaking composition. (`mayEnterSpeakingContext('HELD') === false`, pinned.)
2. `HELD` does not imply persistence. It is an **ephemeral participation disposition**, not a persistence category.
3. The manifest may record **class / count / reason** — never sensitive body content. The manifest entry type has no body field, and the runtime validator refuses unknown keys. This inherits CC-A's constitution verbatim (`lib/memory/provenance/turnMemoryProvenance.ts`): *identifiers, source classes, counts, booleans, versions and hashes only.*
4. `HELD` does not increase epistemic authority. A held candidate is exactly as authoritative as it was before adjudication.
5. A future turn may reconsider a held candidate under new evidence or member warrant. `HELD` is per-turn; it is not a standing verdict.
6. CDPI may **depend on** `HELD`; CDPI may **not define** it. The definition lives here and in the typed module only.
7. CDPI's F13 remains the proof that a computed, held hypothesis leaves **zero durable interpretive rows** — the manifest's `HELD` count is what lets F13 prove *both* that cross-domain intelligence genuinely ran *and* that no durable interpretation of the member was created.

## What `HELD` will serve beyond CDPI

- a cross-domain hypothesis recognized but not relationally invited (`NO_SURFACING_WARRANT`)
- historically relevant material where no return warrant exists (`NO_RETURN_WARRANT`)
- a potentially meaningful pattern too weak or contradictory to offer (`INSUFFICIENT_STRENGTH`, `CONTRADICTORY`)
- sensitive material appropriately retained outside the encounter (`SENSITIVE_RETAINED`)
- something analytically relevant that MAIA decides not to bring forward (`WITHHELD_BY_JUDGMENT`)

## Under CDPI's Reading-B ruling — what this makes provable

```text
DATABASE                     TURN MANIFEST
✅ observations              ✅ HELD count
✅ evidence relations        ✅ reason code
❌ PatternHypothesis row     ❌ hypothesis body
```

## Still open — carried forward, not decided here

- Whether the participation manifest may become a **durable record** (census §11; CC-A's explicit "not a store" constraint). This contract is agnostic: it types the entry, not its storage.
- The seam topology (A / B / C) and the `meta` channel — census §12.1.
- The producer set that feeds `AVAILABLE` — deliverable 2.

## Placement note

The typed module sits under `lib/memory/participation/` because (a) that path is inside the
application-wide typecheck gate (`tsconfig.ship.json`), and (b) the manifest inherits CC-A's
constitution, which lives in the sibling `lib/memory/provenance/`. Step 2 may relocate it; if it
does, update this document's *Typed form* line and the CDPI lane's binding path in the same
commit.
