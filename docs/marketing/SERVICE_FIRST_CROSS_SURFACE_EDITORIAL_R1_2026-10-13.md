# Service First — Cross-Surface Editorial R1

**Status:** SOURCE CANDIDATE, human editorial/design approval pending. Not live/published and not a request to run ads.
**Authority:** founder-ratified `docs/canon/SOULLAB_LIVING_ORIENTATION_SYSTEM.md`, Service First amendment, canonical merge `2e836abc32853bf01bf8256062b561c2b7406378`.
**Source doctrine:** `docs/marketing/SERVICE_FIRST_BRAND_POSITIONING_CANDIDATE_2026-10-13.md` and `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`.

## Central promise

**For those in service to self and world.**
**Service First. Not Self Last.**
**People come alive helping others come alive.**

Soullab is not selling people a better self. It is making a place where their own becoming and participation in the world can deepen together. Someone's worth never depends on how much they do for others; the platform's responsibility is to support freely chosen care within a life, including self-care, rest, receiving help, and leaving the platform.

The brand can have a point of view **without imposing a moral obligation on members**. MAIA cannot become a proselytizer for this positioning.

## Surface-language map

| Context | Editorial line | Exact source state | Guardrail |
|---|---|---|---|
| Public Soullab | **For those in service to self and world.** | R1 proposed copy in `components/landing/HeroSection.tsx` | Not an exclusive membership requirement; nearby Platform copy protects belonging |
| Public campaign | **A life is not a project to perfect.** | Candidate public hero line; NOT a measured clinical claim | Do not assert self-inquiry is harmful or that every journal/therapy practice creates dependency |
| Public Platform | **Care for yourself and for the world both belong here; no one must prove their usefulness to belong.** | R1 proposed copy in `components/landing/PlatformSection.tsx` | Keep actual Live/Designed/Research facet status labels unchanged |
| MAIA public explanation | **Reflection and choice—never an assignment to serve.** | R1 proposed copy in `components/landing/MaiaSection.tsx` | No MAIA model-prompt, conversation-logic, memory or permission changes |
| Pro Studio Reflect | **Your well-being is not last.** | R1 proposed copy in `components/pro-studio/ReflectArrivalView.tsx`, behind existing separate beta invitation | This is client-free preview only; paid Reflect workspace not activated, free MAIA still the sole link |
| Ganesha Life Flow | **Tend your life as you participate in it.** | **Designed/editorial only**; no confirmed standalone live Life Flow route or grant | Not the legacy Ganesha Focus Garden tool; do not imply finished Ganesha product or assign “contribution” duties |
| Writer's Studio | **Let what you make live beyond the page when you are ready.** | Editorial extension only, no source edit in R1 | Author controls readiness, voice and publication |
| Community/Co-Labs | **Make and belong together, freely.** | Editorial extension only, no source edit in R1 | No virtue ranks, compelled exposure or service-score |

## Ganesha — future experience direction (not a live claim)

The desired Life Flow expression holds self and world as one ecological field, without dividing people into “self work” and “service work”. Suitable language:

**A life lived in relationship.** Your care for yourself, your home, the people you love, your work, and the world can meet in one place—at the pace you choose.

What Ganesha should **not** say: “Find your contribution,” “Discover how you must serve,” or “Track how you give back” as compulsory milestones. Do not borrow the existing `components/ganesha/FocusGarden.tsx` agent voice as proof that Life Flow has shipped. Ganesha has a named future product direction and separate legacy tool references; their identities and access gates must be resolved before public capability claims.

## MAIA — interpretation firewall

MAIA remains Soullab's *one relational voice*, governed by the Oath and the non-persuasion and human-authorship canons. **Service First governs what the platform is for, not what MAIA is supposed to tell any individual to do.** MAIA must not detect self-centeredness, infer a vocation, award service credit, generate “help someone today” prompts without member invitation, or optimize for an outward action. The public description may explain the relationship's limits, not invent the behavior.

No prompt, inference pipeline, steering algorithm, memory capture or model-provider instruction is modified in this candidate.

## Pro Studio — sustain the helpers

**Supporting those who help others come alive includes supporting their own lives.**

Pro Studio should return actual time, informed judgment, trust, boundaries and autonomy to helpers. The R1 Reflect preview may invite self-reflection without clients, case records, professional data storage, or paid activation. Marketing must never imply an EHR, case-management permission, dedicated paid Reflect capability or clinical compliance already exists. Future prices, subscriptions, export tooling, practitioner scheduling and client records remain separate qualified work.

Words to protect: **“Your well-being is not last.”** The service language must not pressure professionals into unpaid labor, burnout, sharing client details or leaving themselves out of care.

## Campaign priority and implementation sequence

1. **Belief and invitation:** `A Life Is Not a Project to Perfect.` — editorial campaign candidate, not an ads request. Include self-world reciprocity and a nonjudgmental tone.
2. **Credibility:** Explain Sanctuary Economy, authorial sovereignty, consent and claim transparency with evidence tied to deployed capabilities.
3. **Product distinction:** MAIA free relational parity; Ganesha Life Flow Designed; Pro Studio Reflect client-free invite only; Practice/Collective, paid Reflect, gifts/billing and unshipped Studio features not presented as Live.
4. **Listening:** Consent-based interviews with a small helper cohort. Ask whether they feel understood **and free to decline**, not whether Soullab has persuaded them to change their lives.

## Rejection criteria

Reject copy that:
- Says anyone **ought** to serve, brands introversion or rest as avoidance, or confuses being useful with being worthy.
- Treats Frankl as proof of Soullab efficacy, or collapses Blackfoot/Siksika traditions into his account. Frankl is philosophical lineage; Lawrence (2025) discusses Maslow's 1938 Siksika visit.
- Guarantees healing, transformation, completion, altruism, business profitability, clinical compliance, or productivity gains.
- Presents research/design prototypes as live offerings, misstates MAIA relationship depth by price, or promotes dependence on Soullab.
- Invokes MAIA automatically as a brand spokesperson, or makes product libraries and tools into separate speaking personas.
- Starts an ad, email campaign, production rollout, billing operation or member/clinical data collection without separate approval.

## Release standing

This document, source copy changes and synthetic visual tests form **R1 editorial/implementation evidence**, not a public campaign or permission to merge. Founder editorial review and governed release checks must precede any website change. MAIA runtime, Ganesha substrate, professional data and subscriptions remain unchanged.

## Site metadata and no-JavaScript boundary — R1c

The root Next.js layout previously exposed the older platform description even while the updated landing message rendered after browser hydration. R1c aligns server-readable search and social-share descriptions to the ratified Service First purpose, including the assurance that nobody must prove usefulness to belong. Existing title, site identity, social imagery, entry gesture and routing remain unchanged. Because the metadata is attached to the shared root layout, human review should confirm it also fits routes that inherit the site-level description.

The Next.js static homepage currently sends a client-rendered shell rather than the landing's full body text in raw HTML. Updating metadata does **not** cure that pre-existing no-JavaScript body-content limitation. Do not claim full no-JavaScript accessibility or indexable body copy without a separately scoped server-rendering repair. Rendered browser output and private Reflect gating must be tested against the final exact Next.js build.
