# Service First — Cross-Surface Editorial & Implementation R1

**Date:** October 13, 2026
**Standing:** isolated, source-only candidate; **NOT LIVE**, not marketing publication, not a MAIA runtime change, not a beta admission change.
**Base:** canon merge `2e836abc32853bf01bf8256062b561c2b7406378`, not the older pre-canon source.
**Founding authority:** `docs/canon/SOULLAB_LIVING_ORIENTATION_SYSTEM.md` — “Service First. Not Self Last.” and the right not to identify as “of service” to belong.
**Review classification:** Class A stewardship/claim representation (public self/world purpose, MAIA nonpersuasion and clinical-adjacent professional copy); no expansion of data or runtime authority.

## Why this scope

Founder requested editorial and implementation consistency for the Soullab brand, Ganesha, MAIA and Pro Studio. The honest first step is **copy where a source-backed public/preview surface exists**, paired with a designed-only Ganesha brief. A marketing claim or a founder-ratified canon does not automatically authorize a new member experience or MAIA instructions.

## Exact proposed change

| Surface | Source | Proposal | What remains unchanged |
|---|---|---|---|
| Soullab landing hero | `components/landing/HeroSection.tsx` | “For those in service to self and world”; “A life is not a project to perfect” | Soullab identity; existing Home CTA, secondary understanding CTA and site entry |
| Soullab Platform | `components/landing/PlatformSection.tsx` | Explicit equal legitimacy of caring for self/world, no usefulness test, founding signature; readable facet copy | Existing member facets, their status labels, route gesture |
| Public MAIA section | `components/landing/MaiaSection.tsx` | “Never ... an assignment to serve”; member chooses what matters | MAIA model/prompt, live encounter route, provider and conversation behavior |
| Pro Studio Reflect preview | `components/pro-studio/ReflectArrivalView.tsx` | Care for helpers includes rest/boundaries: “Your well-being is not last” | Beta invite gate, free MAIA encounter link, no paid Reflect, no client record |
| Ganesha Life Flow | `docs/marketing/SERVICE_FIRST_CROSS_SURFACE_EDITORIAL_R1_2026-10-13.md` | An editorial direction, “A life lived in relationship” | No new route, product grant, Ganesha Focus Garden or AI agent voice |
| Other offerings | Same editorial direction | Writer readiness and community co-creation as future listening | No Writer/Collective source, member profiles or memory changed |

## Screenshot and browser custody

- Local static fixture bundled the **actual amended React components** with real React 19, framer-motion, and project Tailwind utility classes. Next Link/Image replaced only with semantic local stand-ins, not claimed as full production Next.js or installed marketing fonts.
- Screenshots at 1280×850 and 390×844 for Hero, Platform, MAIA, and Reflect (8 files in `docs/design/contracts/screenshots/service-first-expression-r1/`).
- 24 of 24 browser checks PASS. They cover exact copy, Home CTA, absence of auto-MAIA calls, retained free MAIA link, explicit paid Reflect nonavailability, visible Platform text and no document overflow at both sizes. Zero external network requests or JS page errors.
- An initial 390px fixture had 44px horizontal overflow from the pre-existing MAIA aura (`w-[520px]`) and black-on-dark facet text from `text-white/42`. The candidate confines that aura horizontally and uses a supported `text-white/60` opacity; retest: 0px overflow and readable facet text.
- 22 of 22 focused Jest regression/contract tests PASS across public landing, new Service First textual boundary, Pro Studio Reflect session and beta gate. The installed Jest dependencies came from the older development checkout; the actual JSX was compiled and inspected in the separate fixture, not a revision-matched full Next.js build.

## Independent review questions

1. **Brand:** Does this sound like an invitation to people in service to self and world, rather than telling anyone they ought to serve? Is “A life is not a project to perfect” clear without dismissing therapy, healing or self-reflection?
2. **MAIA:** Does the public explanation preserve MAIA's nonpersuasion, member-authored meaning and one relational voice? Reject any request to propagate “service” into automatic model prompts or outcome optimization.
3. **Ganesha:** Is the distinction between designed Life Flow and legacy Focus Garden explicit? If yes, hold a separate Ganesha product definition before implementing or advertising it.
4. **Pro Studio:** Does “Your well-being is not last” sound supportive without pressure or implied client data storage? Maintain beta flag, isolated member entry, unpaid client-free preview and free MAIA parity.
5. **UX:** Are both mobile and desktop copy and contrast acceptable? Confirm the narrow 520px aura clip doesn't damage the holoflower. Authenticate the real Next.js staging screen before release.
6. **Claim discipline:** Preserve Live/Designed/Vision, no universal efficacy claim from Frankl, no indigenous-knowledge appropriation, no unsupported product capability or clinical guarantee.

## Release gates and rollback

- Commit/review may proceed on an isolated branch with canonical Service First exact base. **Do not auto-merge because the canon itself was ratified.**
- Complete version-matched full application build and authentic staging visual walk; human founder editorial/visual adjudication; approved operator release and rollback.
- If separately authorized for release, a **source-only revert** of the four copy/style changes restores old public wording; no migrations/data operations exist in this change. Do not use PR #1810 Pro Studio Settings or other beta releases to infer permission.
- No ads, campaign creation, outbound invitations, production website update, billing, model prompts, provider calls, MAIA client encounter or real member records touched.

**R1 disposition:** coherent human-facing wording prepared for evaluation; claim and constitutional safeguards remain controlling; public publication stays **HOLD**.
