# MAIA-RELATIONAL-FIELD-SHADOW-01 — ACT 1 seam census

**Status:** IMPLEMENTATION SEAM CHOSEN · CODE NOT YET DEPLOYED
**Base:** `fb391f20f`

## Existing precedent

`maiaService.ts` already launches local shadow-engine comparison after a primary MAIA response exists. That seam is fire-and-forget and gated by the learning `turnId`. The transport doctrine is useful; its Loop C semantics are not. `maia_engine_comparisons` feeds model-performance learning and therefore cannot carry this lane under SH-F10.

## Chosen seam

Relational-field shadow launches from the same post-primary learning integration region, only when `turnId > 0`, behind its own explicit `MAIA_RELATIONAL_FIELD_SHADOW=1` gate. The call is not awaited. The HTTP response object has already been constructed before launch.

Sanctuary already forces `turnId = 0`; therefore the new shadow cannot start for Sanctuary turns. Tests must keep that property explicit rather than inheriting it silently.

## Standing source

Ordinary chat currently has authorial provenance but no general claim-standing graph. Cut 1 therefore binds only what the substrate can say without interpretation:

1. current request = current member-authored evidence;
2. earlier current-session user turns = historical member-authored evidence / interpretive lineage;
3. no assistant turn becomes member evidence;
4. no model-generated relation becomes standing;
5. no cross-session retrieval enters Cut 1.

## Persistence choice

A dedicated table is required. Reusing `maia_engine_comparisons` would create an unauthorized path from relational-field research into Loop C model ranking. The dedicated table has no winner/rating/promotion fields and no runtime reader.

## Primary-response naming

`maiaService` can bind `turnId` and the canonical `exchangeId`. The `/list` route captures its final `sovereignText` as `sovereign_list_pre_http_return`; later route scrubs/repairs mean this must not be called exact member-visible egress.
