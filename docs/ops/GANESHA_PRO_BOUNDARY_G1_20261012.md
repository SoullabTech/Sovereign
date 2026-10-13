# Ganesha Life Flow / Pro Studio — G1 Security Boundary Candidate

**Date:** 2026-10-12
**Exact source parent:** `663829d95ce586b01fe5fcb51e28a8ff00a86e3a`
**Isolated branch:** `fix/ganesha-pro-boundary-g1-auth-20261012`
**Exact candidate SHA:** bind externally after the governance-checked commit; no merged revision is implied.
**Implementation status:** Candidate engineered with synthetic focused tests. Independent human review, product authority, source-current compatibility and deployment approval **NOT GRANTED**.

## Founder product boundary / accepted architecture

- Ganesha Life Flow / Personal Portal serves **individuals**. It is not a variant of a practitioner account.
- Pro Studio serves **practitioners**, with progressive scope **Reflect → Practice → Collective**.
- Free MAIA offers full depth and relational continuity regardless of payment; commercial value may attach to optional capacity, operational work, integrations and professional infrastructure.
- Both products share one member identity and House but have independent entitlements; consented Relationship Spaces are a scoped crossing, not an implicit grant.
- Sources: `docs/adr/010-personal-professional-portal-layers.md`, `docs/canon/MAIA_SANCTUARY_ECONOMY.md`, and implementer-authored `GANESHA_PRO_BOUNDARY_01_R1b_2026-10-12.md` in conversation attachment.

## G1 changes actually made

| Seam | Bounded candidate remedy | Synthetic witness |
| --- | --- | --- |
| Legacy Stellium owner | `lib/auth/requireProfessionalContext.ts` validates session-based tier/role, active practitioner owned by the same member and non-`personal` portal type; compares any claimed ID without disclosing foreign existence. | 9 helper negative/positive tests, 6 listing tests, 7 detail tests, 3 chart/MAIA tests |
| Studio session create | `INSERT ... SELECT` from `practitioner_clients` guarded by same practitioner; optional service must also belong; zero-row insert causes 404 BEFORE contact lookup, notification, calendar. Contact lookup includes practitioner ID. | 5 synthetic tenant/session tests |
| Existing legacy checkout | Require validated session, reject mismatched body member IDs, arbitrary customer email/redirects, and invalid billing intervals; Stripe metadata always carries real signed-in member. Existing pricing, products and webhooks unchanged. | 6 mocked Stripe tests; zero live checkout |
| Practitioner create/check | Creation derives member identity and Pro tier from verified source rather than POST body; existing Personal Studio row returns named transition HOLD instead of overwriting/deleting it; POST check is signed-in-member-only. | 9 synthetic signup/check tests |
| Team-scoped Field | Shared Field notes and attention read/write require appropriate team role; malformed IDs rejected instead of falling back to personal storage. Personal-only entries remain writable. | 8 team-scoped tests |
| Client portal | Sign-in requires client's practitioner slug to match exact requested portal; invite claim links client, practitioner, member and slug; one-time claim + client credential update are conditional and atomic in a transaction; session uses canonical `practitioners.id`. | 7 synthetic portal tests |
| Sensitive Pro reads | Birth-chart and client-session MAIA preparation authenticate professional owner BEFORE retrieving client data or invoking LLM. | 3 synthetic model/chart tests |

**Tests:** 96 passed / 11 suites on isolated G1 pass-set (9 new suites plus 2 existing session-identity/auth suites); `tsc -p tsconfig.typecheck.json --noEmit` PASS; `git diff --check` PASS.

**Separate baseline exceptions:** Broad 14-suite run reported 128 passed, two assertions failed and one suite failed to load. All three failure classes reproduced on **unchanged parent**:
1. `lib/auth/__tests__/authBoundaryMiddleware.test.ts` imports missing `middleware`.
2. `lib/auth/__tests__/handlerGuardCoverage.test.ts` lists untriaged `/api/ain/` and `/api/admin/writers-studio` scopes.
3. `app/api/studio/sessions/[sessionId]/voice-notes/__tests__/route.test.ts` expects `Practitioner not found` but existing route returns `Practitioner not found for member`.
These are not green tests and must not be reinterpreted as acceptance.

## Direct advisory model challenge (NOT JARVIS / human review)

A locally running `jarvis-qwen3-coder:65k` was supplied selected exact G1
source files, no account records or secrets, and asked for independent
authorization findings. The model returned **PROVISIONAL HOLD** with six
"confirmed" concerns. Each was mechanically checked against source:

1. Alleged nonbinding `claimedPractitionerId` — **REJECTED as incorrect**:
   `lib/auth/requireProfessionalContext.ts:45-57` compares the claim to
   `identity.practitionerId` from the authenticated member's active row
   and refuses mismatch with 404.
2. Alleged foreign client permitted by INSERT — **REJECTED**:
   `app/api/studio/sessions/route.ts` includes both
   `owned_client.id = $2` and `owned_client.practitioner_id = $1`
   as SQL predicates of the *same atomic INSERT...SELECT*.
3. Alleged foreign service permitted — **REJECTED**:
   the service EXISTS predicate requires
   `owned_service.id = $3` **and** `owned_service.practitioner_id = $1`.
4. Potential team scope in booking — **SOURCE-CONSTRAINED, RETEST LATER**:
   `lib/team/sessionTeamScope.ts:23-36` maps the exact practitioner to
   `member_id` and calls `ensureOwnCoLab(memberId)`, not arbitrary
   caller-selected `team_id`. Verify under a real synthetic org hierarchy.
5. Team role vs client object rights — **VALID POLICY SEPARATION**:
   `hasTeamRole(identity.memberId, teamId, ...) ` gates the Team's Field
   note/attention scope. That role never authorizes individual client,
   portal, or Relationship Space data; explicit per-object sharing remains
   a future Collective gate. No cross-practice read from this helper
   was demonstrated.
6. Alleged bypass in chart owner lookup — **REJECTED**:
   the chart route now calls the same server-bound
   `requireProfessionalContext` before reading the client row.

This model output is **advisory only**. Its broad HOLD on deployment agrees
with the already binding release prohibition, but its unsupported specific
cross-tenant assertions are not adopted as security evidence. The exact
new patch still needs independent human review and real compatibility tests.

## Boundaries **not** resolved by G1

1. **Source review of remaining Stellium handlers:** marketing, persona/training, integrations, communications, settings and other endpoints still require exact actor/subject traces; a handler can have a legitimate independent guard rather than the new helper. Do not claim the entire `/api/stellium` corridor is hardened.
2. **Professional product entitlement:** the old `members.tier='pro'` and verified practitioner role are a transitional safety check, NOT the independent Ganesha / Pro Reflect / Practice / Collective capability resolver. `portal_type='personal'` compatibility records must not be converted/deleted.
3. **Personal-to-Pro migration:** named HOLD. Professional signup will not convert an existing Personal Studio legacy row. A non-destructive, custody-backed additive transition is G2.
4. **Client session token lifecycle:** signed portal sessions remain valid until token expiry unless another component revokes them. Consent withdrawal, session invalidation, credential reset, and real client-portal recovery are not fully proved by these tests.
5. **Booking/session write-back:** `practitioner_sessions.practitioner_id` points at `members.id` while Studio booking write-back passes a `practitioners.id`. Must reconcile the existing `studio_session_id` bridge under separate tests; no source rows rekeyed in G1.
6. **New product billing:** legacy checkout remains callable on its existing source path, with old prices and account-wide `members.tier` webhook updates. It is NOT safe to represent it as Ganesha/Pro dual-product billing. Product-specific grant provenance, cancellation and price decisions are separate G3/G5 gates.
7. **Independent human review:** all G1 tests are synthetic mocks. No real member, client, Stripe, user conversation, clinical note, calendar event, MAIA model service or production mutation was used. Full independent security review and source currentness are owed before merge/release.
8. **Deployment integration:** this candidate targets `663829d95c`; reconcile with subsequent Writer's Studio, Soullab Mail and other reviewed changes on a separate integration candidate. It cannot replace the public image.

## Evidence and acceptance gates

- Re-run the 9 new targeted suites; prove every foreign practitioner/client ID is refused before a resource read, write, model call or outbound network action.
- Run the professional checkout negative tests without real Stripe credentials.
- Prove the actual SQL claims and conditions on disconnected synthetic PostgreSQL under concurrency, then obtain a reviewed backup/old-reader-compatible transition where schema change is needed.
- Obtain an independent human review of the **exact commit**, including source and test evidence and a PASS / REVISE / HOLD verdict. Model-generated review is advisory only.
- Gate G2 isolates historical Personal Studio rows; G3 introduces independent product capability provenance; G4 checks actual individual/professional/coexistence user journeys; G5 requires product/billing human decisions and explicit production cutover authorization.

**Disposition: REVISE / HOLD production, billing and Pro/Ganesha activation.** This commit authorizes no migrations, mail, payment, member-data operations, merges or releases. JARVIS canonical Work Units and production were not touched.
