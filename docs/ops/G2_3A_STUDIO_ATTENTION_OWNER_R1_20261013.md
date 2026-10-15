# G2-3A / ATTENTION-OWNER-01 — old Studio Attention cross-practice reference isolation

**Date:** 2026-10-13
**Type:** Isolated defensive source candidate + synthetic evidence. **NOT a release signoff.**
**Exact parent:** `ea0e778ecb4dd1ac04754d6e8d23751d3dfe09c2` (G2-2 member-owned read-only continuity).
**Branch:** `fix/ganesha-pro-g2-attention-owner-20261013`.
**Exact candidate SHA:** include in review issue after normal governed commit.
**Human review:** outstanding on G1/G2. **Merge, installation, member-data, billing, and production changes HOLD.**

## Confirmed source problem in the older Studio route

Existing `app/api/studio/field/attention/route.ts` stored a caller's `refId` without checking the referenced Change or Decision's owner, then returned `COALESCE(c.title,d.title,fa.label)` after left-joining by source ID only. A practitioner A who had an Attention entry pointing to practitioner B's source ID could therefore receive B's title. This was proved on fictional in-memory SQLite values and is not evidence of actual member exposure.

Separately, `app/api/studio/field/attention/options/route.ts` took a team ID without verifying the member was still in that team; the options included client-scoped titles under the practitioner's record without an explicit object-scope check.

## Exact repair scope

- `lib/studio/field/attentionOwnerPredicates.ts` centralizes the SQL used both by Studio Attention and its source-exact PostgreSQL witness.
- On GET, source titles are resolved only for an owned Change or Decision in the exact practitioner/member/team/client-free context. Own personal Decisions use `decision_scope='personal'` and `personal_member_id` with no team/client/practitioner owner. Professional decisions require the correct practitioner UUID, exact team scope and no client link.
- Previously stored foreign, removed or now-unavailable references **remain in custody**, but appear as neutral `Reference unavailable`, without cached title, exposed target UUID, or actionable link. Authored notes remain unchanged.
- POST uses a **single parameterized `INSERT ... SELECT` statement** with object-owner `EXISTS` predicates and stores the source's verified *current* title, not the caller-supplied label. A foreign/missing/client-scoped source yields **zero rows and HTTP 404**, before any persisted placement.
- Team membership is checked both in route admission and **inside the SQL statement**: GET accepts viewer/member/admin/owner; POST only member/admin/owner. This blocks stale grants following revocation between the two operations. With no team, the member's private Attention does not require a team.
- Attention options GET requires current team membership for a supplied team ID, SQL revalidates it at read time, excludes client-linked sources and contradictory member-owner Changes.
- GET and options failures return explicit 503 with `private, no-store`; a backend outage can no longer masquerade as an empty Personal Field. Sensitive driver errors are not logged or returned.
- **No migrations, table alteration, subscription grant, or member-history rewrites.** These are the existing Studio handlers, not the new Ganesha ownership lane.

## Disconnected witness

`scripts/witness/attentionOwnerSourceSql.ts` extracts exactly the SQL constants the route executes. `scripts/witness/attentionOwnerPg16.py` launches only a previously installed `postgres:16-alpine` image with `--network none`, `--rm`, no mounts, and fictional member/practitioner/team/source IDs. It proves:

1. Personal GET returns actual current titles for the actor's sources; six pre-seeded foreign, clinical, contradictory member and stale cached references return `gone=true` with NULL resolved title.
2. Team GET and mixed scopes do not resolve sources from another team.
3. Seven denied POST controls covering foreign Change/Decision, foreign personal Decision, clinical/client context, contradictory member ownership and member-only Changes.
4. Owned Change/Decision POST uses verified source title; member-authored free notes remain possible.
5. Revocation of Change ownership after an Attention entry exists neutralizes its title without deleting the authored Attention row.
6. A guessed team ID, then a legitimately granted team **revoked mid-flow**, is denied at GET and POST SQL time.
7. Temporary PostgreSQL container removed and absent after the test; no real records or credentials.

## Focused and combined regression results

- New `attentionReferenceOwner.test.ts` covers route ownership negatives, non-leak outputs, atomic INSERT, contextual team roles, secure options, no-store and 503 failure honesty.
- Existing G1/G2 test suites remain in the combined run.
- The earlier 3 unrelated baseline failures are still separately tracked in G1; do not call the entire repository green.

## Review and release boundaries still owed

- Independent human review of this exact branch and parent source, including roles, tenant/object privacy, regression behavior, and current PostgreSQL constraints.
- Multi-workspace professional resolver: `getCurrentPractitioner` still uses the legacy active-row selection and is not an independent Professional capability grant.
- The direct database owner rules do not replace relationship consent or comprehensive client-record authorization.
- User-facing Studio/House desktop and mobile behavior after 503/non-link neutral states needs authenticated **synthetic** staging acceptance.
- G2-3A schema ownership migration, true old/new reader compatibility, raw backup restore with signed deletion ledger replay and zero-resurrection proof are **separate gates**. A generated-equivalent PostgreSQL schema witness may establish useful preliminary semantics, but does not execute the original archived ZIP byte-for-byte or authorize installation.
- G3 independent Ganesha/Pro entitlements, separate cancellation semantics, and production cutover remain held.

**Assessment:** narrow isolated repair and source-exact fictional PostgreSQL tests prepared; **REVISE / HOLD merge and production until independent acceptance**.
