# Auth-Surface Theme Audit — 2026-07-21

Closing the visual seams left by the UnifiedAuth transition (2026-06-04).
Ruling: **teal = retired language; Soullab Core navy = canonical**
(`docs/canon/SOULLAB_THEME.md`: `bg-soullab-core` page, navy glass card,
`maia-navy-850/700` inputs, `maia-navy-700` primary, amber errors).

UX test applied throughout: *people should never feel like they left the
house* — arrival → sign in → reset → success → return, one environment.

Method: token sweep (`teal-*`, `#A0C4C7`, `#7FB5B3`, light-glass cards) across
auth/onboarding routes and components; import-graph liveness check per hit;
browser verification on the dev server for every Tier A surface.

## Already migrated

| Route | Status |
|---|---|
| `/reset-password` | Migrated to navy this session (all 4 states + loading fallback), browser-verified |
| `/signin`, `/signup` | Navy since UnifiedAuth (canonical reference) |
| `/welcome-back` | Already navy (`bg-soullab-core`) |
| `/test-elemental`, `/begin` | Already redirect to `/signin` (teal explicitly retired in-file) |

## Tier A — live in real flows, teal/legacy. **Migrate first.**

| # | Route | Component | Current theme | Reached from | Canonical replacement |
|---|---|---|---|---|---|
| A1 | `/oauth-success` | `app/oauth-success/page.tsx` | Light mint-green gradient, red error boxes (a *third* language, neither teal nor navy) — browser-verified | Every Google/Apple sign-in redirect, success **and** failure (`app/api/auth/signin/{google,apple}/callback`) | `bg-soullab-core` + navy card; amber error style |
| A2 | `/magic-link` | `app/magic-link/page.tsx` | Teal gradient + teal glass card — browser-verified | Every emailed magic link (`app/api/members/magic-link`, `lib/email/sendEmail.ts`, mobile allowlist, backend auth) | Same navy kit as `/reset-password` |
| A3 | `/magic-link-success` | `app/magic-link-success/page.tsx` | Teal gradient + glass card — browser-verified | End of the magic-link flow | Same |
| A4 | `/resume` | `app/resume/page.tsx` | Teal gradient (authed view only; unauth bounces to navy `/signin` — verified) | `/continue` | Same |

A1–A3 are the exact vulnerable-moment surfaces: a member mid-authentication
lands in an older visual language that reads as different-system / possibly
phishing. Highest priority.

## Tier B — live invite doors, decision needed before styling

| # | Route | Component | Current theme | Note |
|---|---|---|---|---|
| B1 | `/partner/[slug]` | `SacredSoulInduction` (heaviest teal component in repo, ~80 teal tokens) | Full teal induction | Reached only from externally shared partner links. Decide: migrate SacredSoulInduction to navy, or replace the partner door with a navy arrival card (the `/now-what/arrive` pattern). Recommend the latter — the induction predates the canonical surface and `/test-elemental`'s in-file comment says it "should never appear" in entry flows. |
| B2 | `/partner-welcome` | `app/partner-welcome/page.tsx` | Teal gradient | Zero internal inbound links — confirm whether any partner emails/docs point at it; if none, retire (redirect) rather than restyle. |

## Tier C — routable orphans. Redirect (the `/test-elemental` pattern), don't restyle.

| # | Route | Component chain | Note |
|---|---|---|---|
| C1 | `/soul-gateway` | `RitualFlowOrchestrator` → `SageTealDaimonWelcome` + `SacredSoulInduction` | No inbound links anywhere. Unauth already bounces to navy `/signin` (verified), but an authed member hitting the URL gets the full teal ritual. |
| C2 | `/onboarding/facet` | `FacetRouter` + `FacetRouterSimplified` | No inbound links anywhere. |

## Tier D — dead code. Delete, not migrate.

Nothing imports these (old `app/signin/page.tsx` is `.DISABLED`):

- `components/auth/SignInCard.tsx` — the "SignInCard still teal" observation resolves to deletion
- `components/auth/QRLoginDisplay.tsx`
- `components/auth/SyncAccountPrompt.tsx`
- `components/onboarding/WelcomeBackPage.tsx`
- `components/onboarding/ScrollingWisdomIntro.tsx`

Once B1/C1/C2 land: `SacredSoulInduction`, `SageTealDaimonWelcome`,
`RitualFlowOrchestrator`, `FacetRouter`, `FacetRouterSimplified` also become
deletable, retiring ~90% of remaining teal in auth-adjacent code.

## Recommended migration order

1. **A1 `/oauth-success`** — every OAuth sign-in lands here, including failures.
2. **A2 + A3 magic-link pair** — one PR; email is the default auth action.
3. **A4 `/resume`**.
4. **C1 + C2 redirects** — two-line changes, close the orphan doors.
5. **B1/B2 ruling from Kelly**, then implement.
6. **Tier D deletion sweep** — after B/C, so nothing is deleted while still referenced.

## Out of scope (noted, not audited)

Teal in ~45 non-auth files: `app/studio/*` (15 pages), admin, community,
consciousness-computing, labtools, book, maia/community. Studio has its own
dark-class system — teal there may be intentional accent, not retired scheme.
Separate audit if desired.
