# Landing Refresh — Red-Line Sheet (2026-07-18)

**Status: KELLY-RULED 2026-07-18 — all rulings applied; PR open; merge + deploy stop for Kelly's final visual review.**

## Kelly rulings (2026-07-18, applied)

1. **Bridging sentence approved verbatim** — it is an inquiry, not a claim of demonstrated outcome. Inquiry section restraint preserved: no College reference, no partnership implication, no Institute language, no inflated transformation claim, no forced CTA.
2. **Book date**: *Elemental Alchemy* has shipped (Amazon: Kindle, paperback, hardcover). Copy now reads "available now in Kindle, paperback, and hardcover"; kicker "Upcoming from Soullab Press" → "From Soullab Press". No new projected dates. LoC registration / wider distribution milestones stay separate and do not make existing editions sound unavailable.
3. **Three flagged cards stay Architected** (Care Lens, Relational Context Bridge, Dialectical Scaffold). **Public-Live evidence test (Kelly, standing):** a card may claim Live only when the capability (1) is deployed in production, (2) is reachable through an intended member/practitioner flow, (3) performs the described behavior, (4) has been directly verified, (5) is not merely latent infrastructure. Concept-exists-in-code/papers/prompts is not evidence. This is a judgment about what the public can presently encounter and verify, not about finishedness.
4. **Plain-language bucket definitions added** so the ledger explains its own claim grammar: Live = "Available and working in the platform now." · Architected = "Designed or partially implemented, but not yet a complete public experience." · Research = "An active field of inquiry, not a released capability."
5. The 7·7·1 ledger proceeds — each Live item held against the same public-evidence test.
6. Dedicated branch off `clean-main-no-secrets` → PR → **stop before merge/deploy** for Kelly's visual review.

Occasion: Kelly has applied to the final College of Extraordinary Experiences (Oct 12–16, 2026, Kliczków Castle). The directors and community will likely visit soullab.life. Goal: the site reflects where we actually are — and the inquiry that relates us to them — without a single inflated claim. This audience detects inflation professionally; the claim discipline IS the credibility asset.

---

## 1. BUG FIX — capabilities counts read "0 live · 0 architected · 0 research" (live defect)

**What visitors see today** on soullab.life under *"Honest about what's built"*: `0 live · 0 architected · 0 research`, and the expandable capability list renders three empty buckets. The worst possible artifact under that exact heading.

**Cause**: `components/landing/ResearchSection.tsx` filters `INNOVATIONS` on `publicBucket`, but `lib/data/portfolio.ts` never carried that field (the section was written against a schema that never landed; the ~755-error TS baseline let the missing `PublicBucket` export slide through).

**Fix applied (this draft)**: added `PublicBucket` type + `publicBucket` field + assignments below. New footer: **7 live · 7 architected · 1 research**.

### Bucket assignments — EACH ONE IS A PUBLIC CLAIM; red-line individually

| Capability | Bucket | Grounding |
|---|---|---|
| Awareness-Level Routing | **available_today** | FAST/CORE/DEEP + awareness routing live in prod |
| Relational Safeguards | **available_today** | refusal registry R01–R20 live; consent gates prod-verified |
| Sanctuary Mode | **available_today** | live + S1/S2 hardening deployed `33ec88ac6` |
| Spiral State Persistence | **available_today** | Bridge D deployed |
| Spiralogic Governor | **available_today** | conductor live in prod |
| Sovereign Infrastructure | **available_today** | self-hosted stack, live |
| Multi-Modal Voice | **available_today** | voice conversation is the live core product |
| Dialectical Scaffold | architected | in prompt architecture; no isolated prod verification → under-claimed deliberately. **Bump if you rule it live.** |
| 4-Phase Relational Sequencing | architected | same reasoning as above |
| MAIA Mentor | architected | mentor conversions gated on your real-auth walk (House Presence memory) |
| Knowledge Field | architected | platformKnowledge UNWIRED awaiting your voice pass (Jeeves memory) |
| Care Lens System | architected | Talk/Care/Note modes are live, but the *lens-switching system* as described lacks its own verification → under-claimed. **Bump if you rule it live.** |
| Relational Context Bridge | architected | conversational recall is VERIFIED live, but the described *cross-surface lens persistence* is broader than what was verified → under-claimed. **Bump if you rule it live.** |
| White-Label Engine | architected | practitioner platform v0 deployed, but "white-label for orgs/brands" is ahead of evidence |
| AIN Relational Field Intelligence | **research** | RFI is Cat 1 preserved-direction, explicitly NOT built — the canonical anti-drift example. Research is the only honest bucket. |

Direction of error chosen: **under-claim, flagged** — three cards marked "Bump if live" await your ruling.

## 2. NEW SECTION — "The question beneath the work" (InquirySection)

File: `components/landing/InquirySection.tsx`, placed after *What it is like*, before the studios. Quiet, serif, same grammar as NarrativeSection. Full copy in the component — four paragraphs ending on your sentence:

> *Extraordinary experiences may change people. The deeper question is what allows those changes to become a life.*

**Claim-discipline check**: the section makes inquiry claims, not capability claims — its center of gravity is the question we are actually living (true), not features. Failure test: if a College director reads it and then uses MAIA, nothing in the section over-promises what they'll meet. **Your sentence is used verbatim — confirm you want it public.** No sentence-initial negation.

## 3. FLAGGED, NOT CHANGED — needs your facts

- **Elemental Alchemy: "available June 1, 2026"** — it is July 18. If the book shipped, the copy should say *available now*; if delayed, it should say the true state. I could not verify from the repo, so I changed nothing. **This stale date is the second thing a careful visitor notices.**
- **Pipeline section**: "Partner Portals — COMING SOON," "Community Commons — IN PROGRESS" — confirm these still describe reality.

## 4. HELD (deliberately not done)

- No mention of the College anywhere on the site — the relationship is at rung 0; the site inspires by resonance, never by courtship.
- No "After the Castle" essay on the site yet — essay is the first artifact, separately red-lined, then linkable from the Inquiry section.
- No Institute language — [[project-ain-institute-living-inquiry]] is sealed; public naming of an Institute is a sitting, not a landing tweak.

## 5. Files touched (all uncommitted, current working tree)

- `lib/data/portfolio.ts` — PublicBucket type + 15 assignments
- `components/landing/InquirySection.tsx` — NEW
- `components/landing/SoullabLanding.tsx` — wires InquirySection
- this sheet

**Publish path after red-line**: dedicated branch off `clean-main-no-secrets` → PR (Class B is not triggered — no accessMatrix change — but covenant template applies) → merge → quick deploy → prod-verify counts + section render + zero console errors.
