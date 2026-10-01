# H1 cohort gate — implementation witness — 2026-09-30

```text
Class: A programme · exposure implementation
Canonical baseline: cc1c5b4d79793dd7911d6aea0054e8c678d01bcb
Governing record: H1-EXPOSURE_CENSUS_AND_RULINGS_2026-09-30.md
Branch: feature/h1-cohort-gate-20260930
State: IMPLEMENTED · TESTED · PR CANDIDATE · NOT MERGED · NOT DEPLOYED
```

## Governed object

Only explicit Work-context arrival into Writer's Studio is cohort-controlled. Writer's Studio,
member manuscripts, member Works, H1-R2 multi-manuscript correctness and House threshold
presentation remain universal.

## Producer census

At the canonical baseline, the only live House producer of a Writer's Studio `work=` claim is
`studioArrivalFromHouse(work.id)` in `app/house/page.tsx`. `situatedManuscriptAddress()` can build a
`work=` address but has no non-test caller. No pre-H1 universal doorway depends on `/writers-studio`
reading `work=`. Therefore a non-admitted member can safely receive plain `/writers-studio`, and the
Studio can ignore a hand-typed `work=` claim without breaking an older doorway.

## Authority

`lib/access/houseStudioH1Access.ts` is a separate fail-closed authority using only:

- `HOUSE_STUDIO_H1_ENABLED=true`
- `HOUSE_STUDIO_H1_MEMBER_IDS=<explicit UUID list>`

It imports no EARLY-FIELD, lab or founder authority. The default in `.env.example` is closed.
Malformed configuration closes the whole cohort rather than partially trusting it.

`GET /api/house-studio/admission` derives identity only from `getMemberIdFromRequest()` and returns
only `{ admitted: boolean }` with `no-store`. The access matrix gives this endpoint its own exact
authenticated-member rule.

## Two-sided gate

**House:** the verified server member id decides whether a living Work link carries
`from=house&work=<id>`. Non-admitted members receive plain `/writers-studio`; when there is no living
Work, non-admitted members likewise receive plain `/writers-studio` rather than `?from=house`.

**Studio:** all four canonical pc3-live controllers consume `work=` only through
`useHouseStudioH1WorkClaim()`. The hook reflects the server answer, starts closed for a claim, and
returns no Work id on network failure, non-200, malformed body or refusal. Home holds its existing
"Opening Writer's Studio…" state while an explicit claim's admission answer is unresolved, so an
admitted arrival does not first masquerade as ordinary fallback.

## Evidence

- New H1 authority suite: **21/21 PASS**.
- Existing H1 suites plus new authority suite: **94/94 PASS** across 4 suites.
- `npm run check:design-canon`: **PASS** — 1 member-facing surface covered by 2 Experience Contracts.
- `npm run typecheck`: repository gate reports one diagnostic in `lib/stripe/config.ts:23` concerning
  the Stripe API version literal. A clean detached control at the exact canonical baseline
  `cc1c5b4d7` reproduces the same single diagnostic. No changed H1 file appears in the diagnostic
  set; this is therefore a canonical/environmental no-regression control, not an H1 regression.

## Rollback

Set `HOUSE_STUDIO_H1_ENABLED=false` and restart. House returns to plain Studio entry for everyone;
Studio ignores explicit `work=` claims for everyone. No manuscript, Work, Studio access or member
data is removed or hidden, and no migration exists.

## Not done here

No production environment was changed. No cohort member was configured. No merge or deployment is
authorized by this implementation record. Browser admission remains a separate witness on the exact
candidate/canonical lineage selected for rollout.
