# Contradiction & Gap Register

**Source of facts:** `…_EXISTING_SUBSTRATE_CENSUS_2026-09-06.md` (OBSERVED).
**This document interprets those facts. It authorizes nothing and repairs nothing.**
Severity is Jarvis's assessment, offered for founder adjudication — not a ruling.

## A. Contradictions — doctrine vs. code

| # | Contradiction | Severity | Evidence |
|---|---|---|---|
| **G-01** | **The founder gate is a UI gate, not an authorization gate.** `app/commons/circles/layout.tsx` calls `requireFounder()`; `accessMatrix.ts:504` grants the entire `/api/circles` surface to `minTier: 'free'`, and `/commons/join` is `public: true`. No API route imports `requireFounder`. **"Circles is not open for v1" is true of the UI and false of the API.** Not an inter-Circle leak — service-layer membership scoping holds — but the containment claim is narrower than it reads. | 🔴 **HIGH** | census §2.3 |
| **G-02** | **Feel → Contribute → Browse is enforced for inquiries, not for the shared feed.** `getInquiryWithResponses` returns `responses: []` before contribution; `listFeed` returns every non-revoked artifact to any active member with no precondition. The doctrine calls the order "non-negotiable." **Falsification §7 upgrades this from inconsistency to substantive defect:** contribute-before-see is the mechanism that makes collective intelligence real rather than performed. | 🔴 **HIGH** | census §3; `CIRCLE_SCALE_FALSIFICATION.md` §7.1 |
| **G-03** | **`response_count` is returned to the client**, against "No counts, percentages, or scores in any circle surface." | 🟡 MED | `inquiryService.ts:151` |
| **G-04** | **"MAIA inside a circle is a steward of coherence" — MAIA is not in a Circle at all.** Zero call sites; grep returns only Tailwind class names. `field_synthesis` is human-authored. Doctrine Principle 3 is 0% built. | 🟡 MED *(honest absence, not a false claim)* | census §4.5 |
| **G-05** | **"2-member minimum for theme surfacing" governs a mechanism that no longer exists.** Signals are hardcoded empty by the 2026-07-17 sovereignty correction; the constraint is unreachable and the `'integrating'` phase is unreachable from the pulse. | 🟢 LOW | census §4.4 |

## B. Structural gaps — schema/code incoherence

| # | Gap | Severity | Evidence |
|---|---|---|---|
| **G-06** | **`status='removed'` has no writer.** Removal is unimplemented. If ever set by hand, the leave-cascade would **not** fire and a removed member's artifacts would stay in the feed. | 🔴 **HIGH** *(latent)* | census §4.3 |
| **G-07** | **`visibility` and `invite_enabled` are inert.** Selected, never written or enforced. `'open'` visibility has no meaning in any code path. Schema implies a discovery model that does not exist. | 🟡 MED | census §4.2 |
| **G-08** | **An inquiry response cannot be withdrawn.** The only irreversible Personal→Circle crossing. Directly against "reversible at all times." | 🟡 MED | census §5 |
| **G-09** | **`status='integrating'` is a one-way door.** No transition out; `respondToInquiry` refuses non-`'open'`. | 🟢 LOW | census §4.8 |
| **G-10** | **`getCirclePulse`/`getCirclePulseLight` carry no internal membership gate** — correct at both current call sites, but no defence in depth. Every sibling service self-gates. | 🟢 LOW | census §2.2 |

## C. Absent prerequisites

| # | Missing | Blocks | Severity |
|---|---|---|---|
| **G-11** | **No discovery of any kind.** `listMyCircles` is the only listing. Interest declaration, search, outer membrane: 0% built. **The mandate's north-star verb — "find one another" — has no substrate.** | the entire requirement | 🔴 **HIGH** |
| **G-12** | **No Circle boundary verifier.** `verify-constitution-colab.ts` covers people · DMs · sessions · encounters · atoms · files. **Circles are absent from it.** No equivalent exists. | CIRCLE-03, and any founder-gate lift | 🔴 **HIGH** |
| **G-13** | **No Circle ↔ Co-Lab bridge.** `lib/circles/**` and `lib/team/**` share zero imports. | CIRCLE-07 | 🟡 MED |
| **G-14** | **No Constellation, Commons-of-Circles, fission, birth, or Circle-close substrate.** Only *inquiries* close; a **Circle** cannot. | CIRCLE-06/08 | 🟡 MED |
| **G-15** | **MAIA cannot offer to a Circle.** `app/maia/page.tsx:1894` and `RelationshipsPanel.tsx:85` only navigate. The mandate's "MAIA exchange → Circle" crossing does not exist. | the offering primitive | 🟡 MED |

## D. Record-keeping defects

| # | Defect | Severity |
|---|---|---|
| **G-16** | **Dangling canon reference.** `fieldPulseService.ts` cites `docs/architecture/CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md` as the authority for its sovereignty correction. **That file does not exist on this branch.** Same failure class as the `verify-colab-boundaries.ts` citation already flagged in `CLAUDE.md`: a governing document cited by code, unreachable by a reader. The *ruling* is intact and honored in code; its *record* is not. | 🟡 MED |
| **G-17** | **Five navigation entry points lead to a refusal screen** for every non-founder member. Not a defect if v1 closure is intended — but it is the current member experience of "Circles." | 🟢 LOW |

## E. Falsified assumptions from the opening mandate

| # | Assumption | Status |
|---|---|---|
| **G-18** | "2–200 people in one Circle" | ⛔ **withdrawn by founder** (Amendments A + B) before any output was written |
| **G-19** | "Commons Circle" (61–200) as a Circle geometry | ⛔ **likely category error** — founder-flagged; falsification §3 finds the working form at that scale is always *nested facilitated small groups*, never one enlarged room |
| **G-20** | "Scale changes the geometry, not the sovereignty model" | ⚠️ **true but insufficient.** Amendment B: at sufficient scale it changes the *object*, not merely the geometry |
| **G-21** | Implicit: size is the primary driver of Circle viability | ⛔ **falsified.** Size ranks **fifth** behind facilitation, purpose, interaction structure and duration; a 2025 systematic review (N=21,425) found size significant in only 7/17 studies (falsification §6) |
| **G-22** | Implicit: Dunbar's 150 can anchor an upper bound | ⛔ **falsified.** Re-analysis yields 95% CIs of 4–520 and 2–336; *"specifying any one number is futile"* |

## F. What is genuinely sound — recorded so it is not lost to inverse drift

Per the project's **inverse-drift discipline** (*"we didn't see X was Cat 6" is the other failure
mode*), the following are load-bearing and were built correctly:

1. **Identity resolution** — verified-session-only, with documented anti-impersonation hardening.
   Zero routes trust a bare `x-member-id`. (census §2.1)
2. **Membership scoping** — `getCircleWithMembership` applied consistently across every read/write
   path; deviations are deliberate and correctly scoped otherwise. (census §2.2)
3. **Consent + revocation cascade** — enforced on both leave and consent-withdrawal; revocation
   never touches the source item. (census §3)
4. **Contribute-before-you-see, server-side** — enforced in the service layer, not the UI.
   **Independently validated by the collective-intelligence literature** (falsification §7.1).
5. **The 2026-07-17 sovereignty correction** — inferred material severed from the shared field, in
   code, with the dead branch left visible rather than tidied away.
6. **`shared_artifacts`** — already the working prototype of the general typed crossing object.

**Nothing in §F is confirmed live.** No production rows were observed this session (census §0).
