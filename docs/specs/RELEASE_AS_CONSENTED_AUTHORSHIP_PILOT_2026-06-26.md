# Release as Consented Authorship — Beta Pilot (Pre-registration)

**Status:** v1, beta-gated (`labs.preview`). Pre-registered 2026-06-26, with the build.
**Domain:** Recognition (governs *standing* — what becomes part of the enduring relationship).

## The idea
Most software treats deletion as administrative. This treats **release as a member-authored act**: when a member releases an authored artifact, the *event* of release may become part of their story — **iff the member chooses that recognition**. The content is always deleted; only the *fact* of release (+ the member's own optional note) is recorded. Remembering an **act** ≠ retaining its **object**.

## Pilot scope (smallest correct boundary)
- **Artifact:** one type — the elemental journal entry (`elemental_journal_entries`), a general authored artifact (chosen so a positive result is more likely to generalize than a dream's symbolic specificity).
- **Gate:** `labs.preview` (beta/tester cohort only). Non-testers: delete is **byte-unchanged**.
- **Surface:** augment the existing DELETE at `app/api/community/elemental-alchemy/journal/route.ts` (+ `lib/elemental-alchemy/journalService.ts:deleteJournalEntry`).

## The gesture (neutral microcopy — the system asks, never asserts)
> **Remember this release?**
> ○ No — delete completely
> ○ Yes — remember that I chose to release it
> Optional note: ____

The system does not assert the act *belongs* in the member's story; it asks whether the *member* wants it to. Recognition stays entirely on the member's side. Default = silent delete.

## Constitutional guarantees (enforced structurally, not by discipline)
1. **No secret retention.** A non-recognized release records nothing.
2. **Non-reconstructability (structural).** `released_artifacts` has **no column capable of holding artifact content** — only `member_id`, `artifact_type`, a capped member-authored `note` (≤500 chars, the member's *own* words, explicitly not the content), `released_at`. It cannot reconstruct the released entry. "Recognition without retention" cannot decay into "retention in disguise."
3. **Two human locks + ownership.** Recognition requires (a) the member's explicit choice, (b) the `labs.preview` entitlement, and (c) the authenticated member releasing their *own* entry.
4. **Content always released.** Deletion is the substantive act and always occurs; recognition is the secondary, best-effort record of the act (a record-failure never blocks the release).

## Technical acceptance (proves it WORKS)
- Non-tester / no-recognition → content gone, **0** `released_artifacts` rows.
- Tester + recognition → content gone, **exactly 1** row, no content stored.
- A released artifact **cannot be reconstructed** from the retained row (structural: no content column; note capped).
- `npm run typecheck` clean; targeted test green. Isolated worktree off `633b07088`.

## Graduation gate — beta success ≠ adoption (Kelly, 2026-06-26)
Beta → GA is contingent on **technical correctness AND experiential evidence**, **not frequency**:
> Did members voluntarily choose recognized release, and describe it as **meaningfully different from ordinary deletion** ("I wanted the moment, not the content"), such that the distinction between *remembering an act* and *retaining its object* corresponds to lived experience?
- **Rare-but-meaningful** → graduate.
- **Rare-and-unremarkable** → a valuable **null**: the Recognition mechanism is sound, but this expression doesn't meet a common-enough need → do NOT graduate. Not a failure — exactly what beta is for.
- The Field Lab observation prompt for this feature asks the *experiential* question, not a usage counter.

## Pre-registered prediction (judge against this, not adoption)
Usage will likely be **much lower than intuition suggests — and that is fine.** Value = on the rare genuine transition, the architecture recognizes the act without violating the release of the content.

## Out of scope (v1)
All other artifact types · member-facing "view my releases" surface (fast-follow) · auto/inferred recognition · retaining released content · Attention domain · edit-rate.
