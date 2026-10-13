# Ganesha–Pro Boundary G2-1 — Member-Owned Individual Context

**Status:** Isolated code candidate; human review pending; production HOLD.
**Parent:** G1 candidate `4f9e4fc36e9323376c71e67873456f9d15044809`.
**Worktree:** `/Users/soullab/ganesha-pro-g2-individual-context-20261012`.
**Exact candidate revision:** obtain after normal governance-checked commit.
**Law:** accepted `docs/adr/010-personal-professional-portal-layers.md` and `docs/canon/MAIA_SANCTUARY_ECONOMY.md`.

## What is actually implemented

The individual is authenticated by the validated Soullab member session in `getMemberIdFromRequest`. An optional legacy Personal Studio row may be *read as a compatibility hint*, but is never required to establish personal identity. This preserves the Personal Field's constitutional membership boundary independently of Pro standing.

- `lib/auth/individualContext.ts` inspects **only active-session member-scoped metadata** from `practitioners` with an explicit `WHERE member_id = $1`. The lookup has no arbitrary request ID, email/slug guess, or `LIMIT 1`.
- Zero Personal Studio rows: individual identity resolves and legacy reference is absent.
- Exactly one active `portal_type='personal'` row: existing immutable reference may be returned *internally* for a future read-only compatibility adapter.
- Multiple Personal Studio rows: legacy reference is withheld as `ambiguous`, never guessed.
- Suspended/nonactive Personal Studio row: legacy reference is withheld as `unavailable`; baseline member identity is not revoked.
- An active professional row does not replace a personal legacy reference and cannot be inferred as a professional grant.
- `GET /api/ganesha/individual-context` returns only identity readiness, member ownership, a minimal legacy-status code, and `professionalStanding: 'not_evaluated'`. It does not return historical IDs, account details, or sensitive material; no storage or email side effects.
- The response explicitly declares **`contentAccess: 'not_assessed'`**. This is an identity primitive, **not** a claim that every legacy Personal Field screen now works.

## Source and compatibility constraints

**Neither the personal entry route nor existing Studio UI is changed.** Existing `/api/studio/personal/enter` still creates a practitioner-shaped compatibility row. No new member is routed into this G2 endpoint by the existing chooser. An arrival UI would require separate human-approved UX/contract evidence.

Installed catalog already witnessed `field_notes.practitioner_id` and `field_attention.practitioner_id` as `NOT NULL` FKs to `practitioners(id)` with `ON DELETE CASCADE`. They are untouched. `studio_changes`, `process_items` and other personal endpoints also need owner-by-member conversion or dual-read custody before calling Ganesha's personal workflows fully operational. Do not delete/convert any legacy personal practitioner records; do not backfill ownership by guessed email or arbitrary actor body.

`getCurrentPractitioner` still uses an arbitrary active-row `LIMIT 1` and is not an acceptable permanent professional selector for multiple contexts. G1's `requireProfessionalContext` is a **protective interim Pro gate**, not the future per-workspace grant system. G3 billing and independent Ganesha/Pro subscriptions are entirely held.

## Synthetic acceptance and review

- A new member, with **zero practitioner rows**, gets a member-owned context.
- Verified member with one old personal row gets the correct reference without changing its primary key.
- Professional-only, Personal + Pro, suspended Personal, two active Personal, and mixed suspended/active Personal rows have deterministic, fail-closed results.
- Arbitrary `memberId` in an URL or header does not become database lookup authority.
- Ganesha API with unauthenticated identity refuses before metadata read; database failure returns 503 without leaking exception.
- Ganesha API exposes no legacy identifier and no false `professionalStanding` or fully-working-content claim.

**No live database or member-content records were accessed in this G2 implementation.** Tests mock the trusted session resolver and database, so they prove local code behavior, not live deployment semantics.

## Next gates — independent of Andrea's response timing

1. **G2-2:** review old personal membership compatibility paths and member-owned Decisions/Field/Changes without rewriting or rekeying old rows.
2. **G2-3:** obtain acceptance for an additive member-owned Field notes/attention schema with FK deletion protections, old-reader fallback, privacy-safe restore and migration rehearsal before applying it anywhere.
3. **G2-4:** explicit Personal-to-Pro transition, verified professional context and deterministic multi-row resolution, without reviving suspended standing.
4. **G3:** independent Ganesha/Pro capability grants, source-verified billing metadata and distinct cancellation semantics. Existing subscriptions remain unchanged.
5. Independent human source review for G1 **and** G2 exact revisions before merge/production. G2 can continue as isolated tested code while reviewer responses remain pending.

**Disposition: engineering G2-1 candidate, REVISE/REVIEW, all production and G2 migration/activation work HOLD.** No JARVIS Work Unit, live member data, billing mutation, schema change, MAIA runtime change, or public deployment.
