# STUDIO-A-LA-CARTE-01 — Founder rulings R1 (Studios as standalone doorways) + R2 (naming) (2026-11-12)

**Standing:** R1 ruling of principle **TAKEN** (founder, in session, 2026-11-12: *"Take YES, bounded"*).
R2 naming **TAKEN** (founder, in session, 2026-11-12: *"Guide Studio"*), §2a.
**Authorizes:** the principle below only. ⛔ No implementation, migration, billing/Stripe change,
domain, Caddy change, onboarding change, merge or deploy is authorized by this record. Every phase in
§4 is `PROPOSED` and needs its own authorization.
**Code read at:** canonical `origin/clean-main-no-secrets` @ `76c9558a40` (citations in §2 re-checked
there; the wider audit ran on an older checkout `92f6902577` and is marked where not re-checked).
**No prior ruling** on à-la-carte studios was found in `docs/PRIORITY_THREAD_LOG.md`.

---

## 1. Question put to the founder

> May a Studio (Writer's Studio, Sound Studio, Pro Studio, Pro Astrology) be offered, purchased and
> entered as its own branded product — with its own front door, sign-up and visual shell — while the
> shared Soullab identity runs underneath it invisibly, and MAIA / Field / Soullab membership remain
> OFF by default until the person explicitly connects them?

### Why it reached the founder
1. **No existing instrument settled it.**
   - `docs/programme/SOULLAB-CONSTELLATION-01.md` Doorway laws 1 (standalone excellence), 2 (no ontology
     toll), 7 (declining costs nothing) and 8 (audience-specific invitation) support standalone doors.
   - Law 3 (*"Doorways reuse Soullab identity, MAIA, trust, and continuity rather than becoming isolated
     SaaS products"*) and the `CLAUDE.md` Onboarding invariants 1–2 (*"Universal flow"*, *"Single entry
     point — New users start at `/begin`"*) assume one shared entry and a present MAIA.
2. **Two competent implementers would differ** (studio-owned sign-up with MAIA off, vs. everyone through
   `/begin` and the MAIA shell). The code cannot decide it.

## 2. Ruling R1 — YES, bounded

1. **One identity.** Every studio sign-up creates a normal `members` row. No shadow accounts, no second
   identity system. Precedent: `app/api/now-what/register/route.ts` (*"the environment's own front
   door"*; *"one identity system — no shadow accounts"*).
2. **Opt-in by default-off.** MAIA, the Field and Soullab membership are off inside a studio until the
   person explicitly connects them; connecting is revocable.
3. **No crossing without consent.** Nothing moves between a studio and MAIA memory / the Field in either
   direction before that consent. Sanctuary invariants are unchanged. Consistent with
   `docs/canon/MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md` (a Field Object comes into being only through an
   explicit human declaration).
4. **Onboarding invariant amended in reading, not broken.** `/begin` remains the single entry *to
   Soullab/MAIA*. Each studio may have its own entry *to that studio*. A studio member who later connects
   to Soullab meets the universal MAIA onboarding at that point.
   ⚠️ The `CLAUDE.md` invariant text itself is **not edited** by this record; amending it is a separate act.
5. **Law 3 is read as "shared organism underneath", not "shared chrome on top".**

### Not decided by R1 (held)
- Prices, bundles, and which of the existing tier vocabularies survives.
- Brand relationship beyond naming ("by Soullab" endorsement treatment). Naming itself → R2, §2a.
- How MAIA appears inside a connected studio (named presence vs. unnamed engine).

### Alternatives declined
- **NO** — studios stay inside Soullab; separate marketing only.
- **YES, unbounded** — separate identity/infra per studio. Conflicts with Law 3; recreates shadow accounts.

## 2a. Ruling R2 — naming convention (TAKEN, 2026-11-12)

Founder direction in session: every doorway is named **"<X> Studio"**, each with its own subdomain.
Founder choice for the practitioner studio: *"Guide Studio"*.

| Studio (product name) | Replaces | Host (proposed) |
|---|---|---|
| Writer's Studio | — | `writer.soullab.life` |
| Sound Studio | — | `sound.soullab.life` |
| Astrology Studio | Pro Astrology | `astrology.soullab.life` |
| Guide Studio | Pro Studio | `guide.soullab.life` |

Bounds:
1. **"Guide" carries no authority claim.** Copy for Guide Studio must hold the vow *no coercion, no guru
   stance*: the practitioner using it guides their own work with their clients; neither the Studio nor
   MAIA is positioned as a guide over the person. All copy goes through
   `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`.
2. **Free/Pro remain tiers inside a Studio, not Studio names.** (e.g. Astrology Studio may still have a
   Pro level; Writer's Studio keeps its Free/Pro plan policy.) ⚠️ Inference from the rename, not a
   separate founder statement — confirm before relying on it.
3. **Names only.** ⛔ No route, component, table, code identifier or existing record is renamed by R2;
   `/pro-studio`, `/studio`, `/astrology/pro-preview`, `/listen` stay as they are until a lane is authorized.
4. **Subdomain collision must be closed before any host goes live.** `proxy.ts:321` reserves only
   `www`, `api`, `oldhead`, `app`; every other `<slug>.soullab.life` is rewritten to `/fields/<slug>`.
   `writer`, `sound`, `astrology`, `guide` must be reserved, and existing Field slugs checked for
   collision, as part of Phase 4.

## 3. Current-state facts relevant to R1 (code says)

- Root layout wraps every route in `BetaBanner` and `MaiaPresence` (`app/layout.tsx:205-225`).
- Pro Studio: *"The paid entitlement source does not exist yet"* (`app/pro-studio/page.tsx:13-14`).
- Capacity-keyed entitlement layer exists (`lib/auth/entitlements.ts`), separate from the legacy
  `circle_tier` resolver; reconciliation explicitly deferred in its header.
- Sound Studio lives at `app/listen` on canonical.
- Reported by audit on `92f6902577`, ⚠️ **not re-checked on canonical**: no product-ownership table in
  `database/migrations`; Stripe webhook handles only `type:'membership'`; at least five tier
  vocabularies; per-studio admission is by beta allowlists (env vars, `ops_contacts`, `members.tester`);
  no studio-specific host routing (precedents: `proxy.ts` subdomain rewrite, Caddyfile `chart.soullab.life`).

## 4. Phased outline — `PROPOSED`, each phase separately authorized

| Phase | Work | Gates / done when |
|---|---|---|
| 0 | Re-ground on canonical: re-verify §3 items, locate each studio's owner lane; restore lanes via existing owners, no new lanes. | Gap table with SHA-bound citations for all four studios. |
| 1 | Product-entitlement model: a table of which studios a person holds, resolved via `lib/auth/entitlements.ts` capacity keys. | Migration review; Co-Lab gate if invitations/roles touched; Sanctuary economy (memory/depth never tier-gated). No studio gate reads `tier`. |
| 2 | Billing: Stripe products per studio + bundles; webhook writes entitlements; beta allowlists replaced only where each owner lane agrees. | Test-mode purchase → entitlement → access, end to end, dev stack. |
| 3 | Studio shell without Soullab chrome; studio-owned sign-up on the Now-What pattern. | Claim Discipline on copy; Sovereignty Invariant Check; Writer's Studio F6 live-walk. Device witness. |
| 4 | Per-studio domains (`writer.` · `sound.` · `astrology.` · `guide.soullab.life`) via proxy + Caddy, self-hosted on minisforum; reserve these subdomains in `proxy.ts` and check Field-slug collisions first. | Production-witnessed at a named deployed SHA. |
| 5 | "Connect to Soullab" consent bridge, explicit and revocable. | Consent review; Sanctuary invariants; Co-Lab gate; connect and disconnect both witnessed. |

**Out of scope throughout:** pricing decisions, brand naming, campaigns, any change to MAIA cognition.
