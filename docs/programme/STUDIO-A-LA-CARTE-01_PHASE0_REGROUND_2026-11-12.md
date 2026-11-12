# STUDIO-A-LA-CARTE-01 — Phase 0: re-ground on canonical (2026-11-12)

**Standing:** read-only census. ⛔ Authorizes no change. Phases 1–5 remain `PROPOSED`.
**Code read at:** `origin/clean-main-no-secrets` @ `76c9558a40`. Every row below was re-read there.
**Parent:** `STUDIO-A-LA-CARTE-01_FOUNDER_RULING_R1_2026-11-12.md` (R1 standalone doorways · R2 naming).

## 1. Corrections to the earlier audit (`92f6902577`)

- ⭐ **A product-shaped entitlement now exists for Writer's Studio.** `lib/auth/entitlements.ts:32`
  `EntitlementKey = 'labs.preview' | 'writing.wholeWork'`. `writing.wholeWork` is the Writer's Studio
  Free/Pro line, sourced from `lib/auth/wholeWorkEntitlement.ts`: everyone while `WS_PRO_GATE_ENABLED` is
  off, the pilot always, otherwise `members.tier = 'pro'` (`entitlements.ts:43-46`). Callers check the
  entitlement, not the tier. **This is the template for the other three studios.**
- Sound Studio is present on canonical at `app/listen/*` (absent from the older checkout).

## 2. Shared infrastructure (confirmed)

| Item | Canonical state | Bearing on R1/R2 |
|---|---|---|
| Product-ownership table | None: no `CREATE TABLE` for entitlement/product/purchase in `database/migrations` | Phase 1 needs one (or another source per key) |
| Stripe webhook | Ignores anything with `metadata.type !== 'membership'` (`app/api/stripe/webhook/route.ts:126,188,231`) | Phase 2: add studio product handling |
| Tier vocabularies | `MemberTier` free/personal/pro and `LimitsTier` free/member_plus/studio_pro (`lib/auth/tierAccess.ts:28,39`); patron + legacy tiers (`app/api/stripe/checkout/route.ts:21,25`); `member_settings.circle_tier` (`lib/entitlements.ts:7,15`) | Studio access should not read any of them directly — resolve via entitlement keys |
| Root chrome | `BetaBanner` + `MaiaPresence` on every route (`app/layout.tsx:205-225`) | Phase 3 studio shell must sit outside or suppress them |
| Subdomains | `proxy.ts:321` reserves only `www, api, oldhead, app`; others → `/fields/<slug>` | Reserve `writer, sound, astrology, guide` |
| Caddy hosts | Explicit per-host blocks (e.g. `maia.`, `chart.`, personal `jondi.`, `kelly.` …) | Each studio host needs its own Caddy block |

## 3. Per studio

| Studio (R2 name) | Routes today | Admission today | MAIA room? | Layout | Owner lane (latest record found) |
|---|---|---|---|---|---|
| Writer's Studio | `/writers-studio`, `/press/*` | Beta roster `lib/writersStudio/betaAccessServer.ts` (proxy gate); Pro via `writing.wholeWork` | Not a governed room | `app/writers-studio/layout.tsx` | `WRITERS-STUDIO-CONVERGENCE-01` (2026-09-21) · `WRITER-SOURCE-INTAKE-LIFT` H1 (2026-11-03) |
| Sound Studio | `/listen` | Env allowlist `SOULLAB_LISTEN_BETA_MEMBER_IDS` (`lib/listening/listenBetaAccess.ts:13`) | Yes, `/listen` (`lib/maia/presence/place.ts:104`) | none (root only) | `SOUND-STUDIO_WS-RELATIONAL_DEPLOY_THREE_MIGRATION_REVIEW_PLAN_2026-11-11.md`; `LISTEN-*` records. No priority-log entry found |
| Guide Studio (was Pro Studio) | `/pro-studio` (intro), `/pro-studio/reflect`, practitioner app `/studio` | Reflect: env `PRO_STUDIO_REFLECT_BETA_ENABLED` / `_MEMBER_IDS` (`app/pro-studio/reflect/page.tsx:32-33`); intro passes everyone as `'absent'` | `/studio` and sub-rooms are governed (`place.ts:96-100`) | none for `/pro-studio` | `PRO-STUDIO-REFLECT-PREVIEW-01_BETA_SEPARATION_2026-10-12.md`. No priority-log entry found |
| Astrology Studio (was Pro Astrology) | `/astrology/*`, `/astrology/pro-preview` | `lib/astrology/testerGate.ts` (free pages); `lib/astrology/proAccess.ts` (Pro) | Not a governed room | `app/astrology/layout.tsx` (MaiaBoundaryLayout) | `ASTRO-PRO-04 · MAIA-GUIDE-R1` (2026-11-11, PR unmerged) |

## 4. Not established (stated, not guessed)

- **Field-slug collisions** for `writer / sound / astrology / guide`: needs a read of the fields table on
  production. Not run — production DB reads were not authorized in this session.
- Whether `/api/astrology/pro/*` handlers each re-check Pro access (earlier audit could not confirm).
- Sound Studio and Guide Studio have no priority-log owner entry; their lane owner must be confirmed
  before Phase 1 touches their admission.

## 5. Recommended next unit (for authorization)

**Phase 1 design only (docs):** an entitlement key per studio, shaped by capacity as the header of
`lib/auth/entitlements.ts` requires, each following the `writing.wholeWork` pattern (flag-off = current
behaviour, pilot always, purchase source when on), plus the purchase-source table they would read.
No migration, no code.
