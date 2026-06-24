# Studio Home — "Reveal the Practitioner's World" (Build Spec)

**2026-06-10 · design spec, not code.** Grounded in `PRACTITIONER_STUDIO_VISION_AUDIT_2026-06-10.md`.
All wiring below was **verified present on disk** this session.

**Framing:** not *"rebuild the cockpit"* — **reveal the practitioner's world.** The substrate exists;
the work is re-centering the *experience* on people, sessions, continuity, community, and MAIA.

**The litmus test (apply to every widget):** *Does this help a practitioner care for someone?*
If not → remove it, or move it deeper. **Standard: accompanied, not managed.**

**Current state (verified):** `app/studio/page.tsx` renders `useTriageItems` / `useAgentTasks` /
`delegateAgent='maia-dev'` / urgent-triage counts — a developer dashboard shown to every practitioner
regardless of `portalType`. This is the single biggest persona break and the likely activation killer.

---

## The five cards

| # | Card | What they feel | Wires to (VERIFIED existing) | Build |
|---|------|----------------|------------------------------|-------|
| 1 | **My People** | "These are my people." | `app/api/studio/clients/route.ts` + `app/api/studio/bookings/route.ts` | **Presentation.** Upcoming sessions, recently-active, needs-follow-up, new invitations. |
| 2 | **Prepare Me** | "I'm ready for them." | `lib/practitioner/sessionPrep.ts` + `app/api/practitioner/clients/[clientId]/prep/route.ts` + `app/api/studio/sessions/[sessionId]/briefing/route.ts` + `components/stellium/SessionPrepCard.tsx` | **Pure surfacing — smallest, highest-leverage, habit-forming.** Engine + card already built; make it impossible to miss. |
| 3 | **My Threads** | "This relationship lives here." | `app/api/practitioner/clients/[clientId]/digest/route.ts` + atoms (`app/api/sovereign/atoms/[id]`) | **The ONE non-presentation card.** v1 = existing-data proxy (commitments, breakthroughs, digest). The *real* thread = the Relationship Memory primitive (see build order). Do not fake the rest. |
| 4 | **My Communities** | "I belong somewhere." | `app/api/team/channels/route.ts` | **Presentation = visible belonging now.** Render circles/cohorts/collaborations as living relationships over existing channel data. Deeper features (consultation/referrals) are **Forming** — label honestly. |
| 5 | **MAIA (living presence)** | "Good morning — here's your day." | Composes from existing: sessions (bookings/calendar) · follow-ups (`session-followup`) · threads (digest) | **Presentation over existing + a greeting composer.** Not a chat icon — a morning orientation that offers the next prep. |

---

## Navigation (the new IA)

`Home · People · Sessions · Community · Memory · MAIA`

- **Sessions** = Session Room (`app/studio/session-room/page.tsx`, verified) + preparation.
- **Memory** = My Threads / continuity (rides on the primitive).
- **Remove from the practitioner's nav:** Marketing, Live Camera, Tools, Operations — the audit
  confirmed these are showrooms (`mockStats`, browser-only, `comingSoon`). They can live in a
  builder/ops portal; they must not define the practitioner's first impression.
- **Mechanism:** `lib/studio/moduleDefinitions.ts` already filters by `portalType` via
  `getVisibleModules` — so this is a **config/gating change, not new infrastructure.** The current
  triage/agent home moves to the builder portal; the practitioner default becomes the five-card reveal.

---

## Build order (primitive-first — corrected from the 5-step list)

- **Step 0 — the in-MAIA doorway** (the crossing). In member-facing MAIA (where practitioners
  *already are*), a propose-don't-dispose offer: *"want me to keep this with [client] / prep you for
  next time?"* This is the only move that converts existing engagement; the home is where they land
  *after* it fires. Small, separate build.
- **Track A — the home reveal (parallel, presentation, no memory dependency):** home shell +
  My People + Prepare Me + My Communities + MAIA greeting + nav re-aim. All wire to verified existing
  endpoints. This is the bulk of "the rebuild" and it is mostly presentation. Fast.
- **Step 4 BEFORE My Threads is real — define the Relationship Memory primitive:** schema ·
  scope-as-schema-bound-provenance · Layer-3 (inference-about-persons) unrepresentable · consent ·
  disappearance-test. My Threads ships in Track A as an honest existing-data proxy; the *true* thread
  lands on the primitive. (Building the thread before the primitive = the two-memory-systems fork.)
- **Then:** client-thread on the primitive → **Consultation + Referrals** (the genuinely-missing
  Co-Lab capabilities).

---

## Claim-discipline inside the product

Even in-app, cards carry honest status: **My Threads** shows real commitments/breakthroughs (full
continuity is *becoming*); **My Communities** is visible belonging now, consultation/referrals
*forming*. The home should never imply a capability the click won't deliver.

---

## Implementation gate (explicit)

This is a design spec. When ready to build:
1. **Clean branch off `clean-main-no-secrets`** — *not* the current dirty `fix/studio-calendar-timezone-edit` tree.
2. **Presentation-first:** reuse the verified endpoints above; add no new backend for Track A.
3. **Gate nav by `portalType`** in `moduleDefinitions.ts`; move triage/agent surfaces to the builder portal.
4. **Verify in browser** (real practitioner portalType) before any claim of "done."

Say go and I'll start with Track A (the five-card reveal over existing endpoints) on a clean branch.
