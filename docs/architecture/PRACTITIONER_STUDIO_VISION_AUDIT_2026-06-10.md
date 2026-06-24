# Practitioner Studio + Co-Lab — Vision Audit (2026-06-10)

**Read-only analysis. No code changed.** Supersedes the *substrate* claims in
`PRACTITIONER_STUDIO_INVENTORY_2026-06-06.md`, which understated what is built
(it reported the client schema absent and Vault dead — both wrong against current code).
The one thing that inventory got right and this audit confirms: **built ≠ used** —
practitioners have access but have not crossed into the Studio.

---

## The vision this audits against (Kelly, 2026-06-10)

- Not a better Teams. **Relational infrastructure for practitioners and helpers.**
- Organizing unit = relationships, communities of practice, cohorts, consultations,
  referrals, continuity — **not channels.** Channels are implementation details.
- A **professional home**: hold clients, peers, communities, collaborations, learning —
  without fragmentation.
- **Relationship Memory** = one shared primitive serving both Studio and Co-Lab.
- Studio and Co-Lab = **different surfaces on one continuity architecture**, not separate products.
- Reduce admin burden, preserve agency. **MAIA proposes; humans decide.**
- Success = practitioners feel more connected, supported, able to hold the people they serve.
  Not feature parity.

**The test applied to every recommendation below:**
*Does this help a practitioner feel more **accompanied** — not more **managed**?*

---

## Headline — and the correction to the working hypothesis

The Studio is **~80% built and ~5% used.** Several items the working brief lists as
*Missing* — **session preparation** and **Session Room** — already exist and are usable.
They are **hidden, not absent.** The 90-day work is overwhelmingly **surfacing, reframing,
and a few small builds — not a rewrite.** The one genuinely missing capability that matters
is **peer consultation / referral** (zero primitives in code). The one genuinely architectural
decision is the **Relationship Memory primitive** — and it must be made *before* the Studio
client-thread ships, or step 1 forks the second memory system the vision is trying to prevent.

Corrections to the hypothesized lists:
- "Missing → Session preparation surfaces" — **wrong.** `getSessionPrep` exists and is usable.
- "Missing → Session Room integration" — **half-wrong.** Session Room exists (crown jewel);
  it is *not joined to the client roster* — that join is the real gap, not the room.
- "Already Strong → Community identity" — **aspirational, not yet true.** Co-Lab is channels;
  there is no community-of-practice identity in code.

---

## 1. The 10 highest-leverage gaps (ordered by "accompanied" + 90-day leverage)

1. **The home screen is a developer's cockpit, not a practitioner's threshold.**
   `app/studio/page.tsx` shows "Agents Running / shipments / fires fought / /studio/code"
   to *every* practitioner, gated on nothing. The #1 activation killer. **Managed, not accompanied.**
2. **Session prep is invisible.** `lib/practitioner/sessionPrep.ts` (`getSessionPrep`) +
   `app/api/practitioner/clients/[clientId]/prep/route.ts` synthesize themes / commitments /
   last-session / safety — never surfaced as the one-click pre-session moment.
3. **No single "client thread."** The relationship is scattered across `clients/[id]`,
   Session Room, follow-up, digest, vault. The "hold the thread" promise exists in pieces.
4. **Continuity is regenerated, not stored** (the disappear-test gap). Commitments / themes /
   unresolved questions are MAIA inferences on read, not first-class rows → pull MAIA and the
   thread evaporates. This is the Relationship Memory primitive.
5. **Co-Lab organizes by channel, not relationship/community.** No communities-of-practice,
   cohorts, or circles as the visible ontology (`app/api/team/channels/route.ts`).
6. **Zero peer consultation / referral primitives.** The "hold one another" story has no
   objects in code (confirmed: searches for referral/consultation return only generic chat).
7. **Two-surface intake.** `Add Client` (`app/studio/clients/page.tsx` → row, no email) ≠
   `Client Portal` invite (`app/studio/portal/page.tsx` → email). Practitioners add a client
   and it goes nowhere.
8. **No "what did I miss?" digest** for a relationship or a community (depends on #4).
9. **No practitioner onboarding into the workspace** — the crossing from member-MAIA to
   practice-infrastructure is unguided (this is the activation gap, made concrete).
10. **No money front-door.** `app/api/stripe/membership/checkout/route.ts` is live but there is
    no pricing/checkout page, and `members.practitioner_tier` is never written by checkout.

## 2. What already exists that supports this vision (none needs rebuilding)

- **Session Room** — `app/studio/session-room/page.tsx` (1,614 LOC). Consent-gated, sealed-by-default
  memory, practitioner markers (Turning Point / Somatic Shift / Breakthrough), ask-MAIA rail,
  transcript → review → export, **client-aware** via `/api/studio/bookings`. The crown jewel.
- **Session-prep / briefing engine** — `lib/practitioner/sessionPrep.ts`,
  `app/api/studio/sessions/[sessionId]/briefing/route.ts`, cards `SessionPrepCard.tsx`.
- **Relationship data model** — `practitioner_clients` (link table; clients are distinct people),
  `sessions` (practitioner + client + time + notes), `practitioner_sessions.themes/insights`.
  Migrations `20260116000001`, `20260118_portal_services_tables.sql`.
- **Client lifecycle** — calendar (`app/api/studio/calendar/events`), bookings, follow-up
  (`app/api/studio/session-followup/{generate,send}` — consent + human-edit enforced),
  member-facing portal (`app/portal/[slug]/{claim,book,chat}`).
- **Co-Lab messaging substrate** — channels, private channels, DMs, invites, email notif prefs (all live).
- **MAIA presence** throughout — Live.
- **Structural-consent precedent** — schema-bound provenance flags (`is_breakthrough`,
  `crossing_must_be_false`) — the pattern the Relationship Memory scopes should reuse.
- **Money rails** — Stripe checkout API + webhook (real signature verify) + **role-gating enforced** (403).

## 3. Merely presentation / navigation — changeable cheaply (a surprisingly large bucket)

- Re-aim the `/studio` home by `portalType` (persona fix — the single biggest "feel" change).
- Surface the existing session-prep card on home + client detail + Session Room entry.
- Co-Lab nav: relationships / communities / cohorts as the *visible* ontology **over the existing
  channel tables** — channel becomes infrastructure, relationship becomes interface.
- Collapse two-surface intake to one.
- Hide showrooms (Marketing / Live Camera / Tools — `mockStats`, browser-only, `comingSoon`).
- A checkout button → the existing `/api/stripe/membership/checkout` route.

Most of the "soulful home" gap is **presentation over a substrate that already works.**

## 4. Requires real architectural work (the few that genuinely do)

- **Relationship Memory primitive** — the shared schema (Subject / Relationship / Context /
  Permissions / Time / Commitments / Artifacts), **scope as a schema-bound property**, and
  **Layer-3 inference-about-persons made unrepresentable** (no atom type for it). Decide this
  schema *before* the Studio client-thread build.
- **Peer consultation + referral objects** in Co-Lab (new domain primitives, not chat).
- **Session Room ↔ client roster join** — `scribe_sessions` is member-keyed, decoupled from
  `practitioner_clients`.
- **Self-hosted LiveKit** for in-platform A/V (if/when Sessions go video — sovereign, not Daily/Zoom).
- **Webhook → role/SKU grant** so a purchase grants the practitioner role.

## 5. What would make it indispensable within 90 days (the "refuse to leave" set)

Indispensability ≠ breadth. It is these few, felt:
- A practitioner-true **home** that, on open, shows *your people and your next session* — the
  "built for me" moment.
- One-click **"Prepare me for [Client]"** surfacing the existing engine — *"I feel more prepared."*
- One woven **client thread** — *"I remember my clients more deeply."*
- One real client brought in **end-to-end** (intake fixed) — rows > 0; the activation proof.
- **Visible belonging** in Co-Lab — your communities / cohorts / circles as living relationships,
  even before the deeper features — *professional home.*
- The **disappear-test win**: continuity stored as rows, so the thread persists without MAIA.

## 6. What should NOT be built (the constraint — lean here)

- **Don't rebuild** session prep or Session Room — they exist; surface them.
- **Don't build** Relationship Memory *features* (digests, "what did I miss") before the
  primitive *schema* is decided — but **do decide the schema now.**
- **Don't build** Slack/Teams parity, channel hierarchies, threading depth, enterprise admin.
- **Don't build** analytics / productivity dashboards / engagement metrics — go further than
  "don't build": make them **structurally unrepresentable** (the moat-as-constraint, not as promise).
- **Don't build** native WebRTC (Level-2 A/V) — embed self-hosted LiveKit if/when.
- **Don't build** the practitioner-reads-client's-MAIA-memory bridge — Sanctuary/consent
  foundational, not 90-day.
- **Don't build** Co-Lab enhancements currently branch-only (message-edit / attachments /
  push / SMS) — polish on a commons no practitioner uses yet.
- **Don't fix** the tier-gating *engine* — role-gating already enforces; just wire webhook→role.
- **Don't market** the four-story suite as if all four are Live (see claim-discipline below).

---

## Claim-discipline on the four-story campaign

Per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — *"we do not tell tomorrow's story as if it
were today's."* The four stories have **different claim-statuses**; launching all four as Live
would violate the canon.

| Story | Surface | Honest status | How to tell it in the 90-day launch |
|---|---|---|---|
| **Hold Your Practice** | Studio | **Live-able** once the home is re-aimed (substrate built) | **Lead with it.** "Never lose the thread of a relationship." |
| **Hold Yourself** | MAIA | **Live** | **Lead with it.** "A companion for the work of helping." |
| **Hold Your Sessions** | Session Rooms | **Live as continuity/scribe; not yet video** | "Never lose the thread of a session." *Not* "video sessions" until LiveKit ships. |
| **Hold Your Community** | Co-Lab | **Vision / Designed** — channels today; consultation/referral/communities-of-practice don't exist | **Do not tell as today's.** Invite people *into* the first circles as they form. |

Umbrella — **"The Studio for People Who Help People"** — is honest and strong. Keep it.
The 90-day campaign leads with **Practice + MAIA** (Live), frames **Sessions** as continuity
(Live, video coming), and invites practitioners *into* **Community** as it forms.

---

## Verification caveats (honest boundaries)

- The 0-real-client / 0-non-tester-usage finding is corroborated by the 2026-06-06 production
  attribution but was **not re-counted live** in this pass.
- "Session prep is not discoverable" is inferred from "built with no obvious nav entry," not
  confirmed by clicking the live UI.
- Whether `STRIPE_SECRET_KEY` is set in production was not verified (checkout 503s if unset).
- A/V absence in Session Room **was** verified this pass: 0 WebRTC/LiveKit/`<video>` hits;
  the room captures mic + tab audio (`getDisplayMedia`) and Whispers it — it scribes a call
  hosted elsewhere.
