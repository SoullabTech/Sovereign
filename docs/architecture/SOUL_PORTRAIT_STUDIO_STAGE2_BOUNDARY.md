# Soul Portrait Studio — Stage 2 Boundary (Generator inside Consent)

**Status:** CANDIDATE · boundary-only · 2026-07-05 · keystone ratified
**Does NOT authorize build. No implementation.** This defines the *shape* of Stage 2 so that,
when it is authorized, it lands inside the consent architecture rather than around it.
Governed by `SOUL_PORTRAIT_CONSENT_ARCHITECTURE.md` — **RATIFIED 2026-07-05** as the keystone
boundary; Stage 2 itself remains boundary-only and unauthorized (Kelly 2026-07-05: draft tier
only, no publishing, no mentor, no consent event, no delivery).

---

## Reframe

Stage 2 is **not** "build the generator." Per the consent architecture it is:

> **A generator that operates inside the already-defined consent architecture.**

The generator's constitutional position is the **None / draft** consent tier: it produces an
owner-only draft and nothing more. **Generation ≠ consent ≠ delivery.**

---

## What already exists

The generator is built, local-only, inert (commit `55af496e8`):
- `lib/soulPortrait/generator/generatePortrait.ts`
- `POST /api/soul-portrait/generate` — owner-only; creates a `pending`, unpublished draft;
  records no consent; enables no mentor; publishes nothing.
- `/soul-portrait/preview/[id]` — owner-scoped after Stage 1.

So it **already stops at draft.** Stage 2 is not new construction — it is *confining and
hardening* the existing generator to the consent boundary, plus practitioner-assisted review.

---

## Stage 2's constitutional position (the boundary)

The generator lives at the **None / draft** tier:

- It **creates** the artifact (`immutable_text`) as a `pending`, unpublished, owner-scoped draft.
- It **records no consent** — the `soul_portrait_consents` ledger is written only by the
  separate, later consent flow, never by generation.
- It **delivers nothing** — no publish, no live link, no mentor, no subject-facing surface.
- Its output is **owner-scoped** — Stage 1's guarantee holds through generation.

**Generation is not authorization.** Producing a portrait *about* someone is not consent to
use it about them. The draft is inert until the subject (or guardian) authorizes it in a
later stage.

---

## In scope — when Stage 2 is authorized (not now)

1. **Confine** the generator structurally to the draft tier: it may only write
   `consent_state='pending'`, `published_at NULL`; it may never write a consent event or publish.
2. **Practitioner-assisted** generation — the practitioner reviews and edits the drafted text
   before it is anything. A human stays in authorship (sovereignty).
3. **Traceability Covenant** — chart data only; fresh prose; no reproduction of source
   interpretation; no fabricated placements.
4. **Verifier(s)** — the generator writes only owner-scoped drafts and records no consent
   (falsifiable, in the manner of Stage 1's leak verifier).

---

## Out of scope — the boundary (each later, each its own gated stage)

- Consent **recording** (the consent flow) · **delivery** / live link / share link ·
  PDF-as-product · **mentor** dialogue · any **subject-facing** surface · any consent tier
  above None. All of these are governed by the consent architecture, not by the generator.

---

## Provenance (open, inherited)

The generated text is **system-authored** (Claude), then **practitioner-reviewed**, then
write-once after publish. Two-field provenance (`authored_by` = system|practitioner;
`authority_class`) remains **pending** — Stage 1 deferred it, and Stage 2 is where it becomes
worth recording, because generation introduces a *system* author distinct from the reviewing
practitioner. Flag, don't build yet.

---

## Refusals Stage 2 must enforce (become tests when it ships)

1. The generator writes only `pending`, unpublished, owner-scoped drafts.
2. The generator records **no** `soul_portrait_consents` event.
3. The generator publishes nothing and enables no mentor.
4. A draft is readable only by its owner (Stage 1's owner-scoping holds through generation).

**Constitutional Completion:** each capability ships with the refusal that bounds it, or
neither ships.

---

## Deploy posture

Boundary only — no implementation. The generator stays inert, local-only. Building Stage 2,
and later shipping it, requires the Co-Lab release gate (client data). The consent architecture
must be ratified first — Stage 2 leans on it entirely.
