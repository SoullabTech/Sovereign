# House / onboarding / public copy — whole-organism map page (PROPOSED NEW PAGE)
**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-10-30 · **Method:** read-only census of code and copy against `origin/clean-main-no-secrets` @ `048ffd7d6`. **Stop rule:** a defect found here creates no permission to repair it. Nothing in this page changes MAIA.
**Evidence classes:** E = runtime fact (code path) · **Observation status:** READ for everything below; **nothing WALKED.** **Category:** unassigned (founder to assign).
*Proposed by the external-science input stream (founder R-1). Subsystem 12 had no page. Items marked UNKNOWN were not examined.*

## 0 · What this subsystem is (E, READ)
| Surface | Path | Reach (code-read) |
|---|---|---|
| Week-0 onboarding | `components/onboarding/WeekZeroOnboarding.tsx` | imported and mounted in `app/maia/page.tsx`; shown when `week0_onboarding_complete` is absent and the member has a name other than "Friend" |
| Intro page | `app/intro/page.tsx` | route exists; `/intro` is on the mobile allowlist (`lib/mobile/mobileAllowlist.ts`) |
| Company page | `app/powered-by/page.tsx` | route exists; linked from portal chat pages (`app/portal/[slug]/chat/page.tsx`) |
| AI-nature disclosure | `components/maya/RealityAnchor.tsx` ("I'm an AI designed to support reflection, not provide therapy") | **imported nowhere** |
| Documented flow | `CLAUDE.md` names `/intro-maia` and `/intro-daimon` | **neither exists under `app/`** (present: `begin`, `intro`) |

## 1 · The founder's question for this subsystem
Not recorded in the sources I read. **Founder to supply.**

## 2 · The nine questions
1. Phenomenon served: first contact with MAIA — **UNKNOWN** (not audited beyond the lines below).
2. Principle supported/violated: see §5.
3–4. Self / World capacity; influence (P4′): **UNKNOWN.**
5–6. Memory and authority: Week-0 uses `localStorage` `week0_onboarding_complete`; further **UNKNOWN.**
7. Validation drift: **UNKNOWN.**
8. Elemental differentiation: **UNKNOWN.**
9. Evidence a human experiences the intended effect: **none (class C absent).**

## 3 · R11 design audit
All ten items: **UNKNOWN (not audited).** Not claimed as NOT FOUND.

## 4 · Embodies v0.2
Nothing confirmed. An AI-nature disclosure exists in code but is unmounted. "Witness" is the product's own default relational *stance* (`ModeStanceCharter.ts`).

## 5 · Contradicts v0.2

| Finding | Path | Violates |
|---|---|---|
| Onboarding tells a new member MAIA is "a **conscious** witness" | `WeekZeroOnboarding.tsx:449` | Inv 5, Inv 9; founder's *question, don't profess* |
| "Consciousness recognizes consciousness." / "Your AI Daimon" | `app/intro/page.tsx:20, :192` | mutual-recognition and designed-entity framing; principle mapping **to be assigned by the founder** (candidates: Inv 9, Inv 14, Inv 16) |
| "Consciousness AI"; fields "alive with their own voice, personality, and intelligence" | `app/powered-by/page.tsx:7, :107, :165, :172` | `MARKETING_CLAIM_DISCIPLINE` — **route to the publication / claim-discipline lane; not adjudicated here** |
| The only AI-nature disclosure is unmounted | `RealityAnchor.tsx` | Oath (honesty about type) |
| Documented onboarding pages absent | `CLAUDE.md` flow vs `app/` | documentation drift |

## 6 · Unknown
| Unknown | Why unreadable | Instrument |
|---|---|---|
| What a new member actually sees and reads in Week 0 | code, not a walk | dated member/device walk of first-run |
| Whether `RealityAnchor` was meant to be mounted | intent, not code | owner statement |
| Whether `/intro` is on the real first-run path or a leftover | routing intent | founder statement + walk |

## 7 · Smallest evidence-producing intervention per gap
| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5) | Evidence state | Confidence | Smallest intervention |
|---|---|---|---|---|---|---|---|
| G4 First-contact copy asserts consciousness / designed entity | Inv 5, Inv 9, Oath | 4 | 3 | 2 | observed (code) | medium | First-run member walk; **a staged one-line copy fix exists (held to Phase 2); not applied** |
| G5 No mounted AI-nature disclosure | Oath, Inv 5 | 3 | 3 | 1 | observed | medium | Owner statement on intent for `RealityAnchor` |
| G6 Public-site wording | claim discipline | 3 | 2 | 1 | observed | medium | Route to publication lane |

## 8 · Provenance
Files read (line-cited above) at `048ffd7d6`: `WeekZeroOnboarding.tsx:449`, `app/maia/page.tsx` (mount and trigger), `app/intro/page.tsx`, `app/powered-by/page.tsx`, `components/maya/RealityAnchor.tsx`, `lib/mobile/mobileAllowlist.ts`, `app/portal/[slug]/chat/page.tsx`. No runtime, database or production access. WALKED status is claimed for nothing on this page.
