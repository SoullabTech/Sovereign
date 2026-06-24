# CO-LAB REVEAL AUDIT

**Date**: 2026-06-10
**Type**: Read-only audit — *do not build*
**Standard applied to every surface**: *Does this help a helper care for someone — or help a helper be cared for?*
**Question**: Does Co-Lab currently organize around **channels** or around **helping relationships**?
**Companion (vision register)**: [`CO_LAB_NORTH_STAR.md`](./CO_LAB_NORTH_STAR.md) — *companionship in service*: the governing design filter and need-first direction this audit feeds into. Deferred until after Studio (#401) ships and practitioner behavior is observed (see its observation gate).

> **Answer, up front**: Co-Lab organizes around **channels**, and its default surface is a *software/operations team* workspace, not a practitioner one. But the audit's load-bearing finding is the opposite of "we must build the practitioner network from scratch." Much of the practitioner substrate **already exists** — latent channel metadata, a request/attention loop, and a nearly-complete referral backend — and was simply never surfaced or re-homed for the practitioner persona. **The reveal is mostly a presentation + seeding + gating problem, not a build problem.**

---

## Claim-discipline legend

Per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` and the project's *built ≠ wired ≠ surfacing ≠ verified* doctrine:

- **BUILT** — schema + service code exists.
- **WIRED** — reachable through a live route/UI.
- **SURFACING** — a member actually sees/uses it in the running app.
- **ABSENT** — does not exist.
- **VERIFY** — asserted from migration/code reading by a locate-only pass; re-confirm against the running route/DB before relying on it.

This audit names which tier each piece sits at. The discipline: *do not let "BUILT" read as "SURFACING."*

---

## PART 1 — AUDIT (current state)

### 1. Channel structure — **channel-organized; staff-shaped by default**

**Data model** — table `team_channels` (`database/migrations/20260321000001_team_messaging.sql`):
`id, team_id, slug, name, description, channel_type ('text'|'announcement'), is_private (default false), created_by, archived_at, timestamps`
— plus practitioner-flavored metadata added in `20260322000001_team_channel_archetypes.sql`:
**`archetype` ('checkin' | 'field_note' | 'practice' | 'cohort' | 'venture' | 'general'), `response_mode` ('witnessing' | 'reflection' | 'advice' | 'open'), `purpose_block` (text), `prompt_scaffold` (jsonb)`.**

**Seeded channels** (idempotent `ON CONFLICT (slug) DO NOTHING`):
- **`soullab` team**: `general, exec, ops, dev, design, random` — an internal staff/ops structure.
- **`all-practitioners` team** (`20260609000002`): `announcements, general, introductions, support` — a generic community structure.

The screenshot's **Bugs / Marketing / Strategy** channels are **user-created** on top of the staff seed. Nothing in the seed is shaped like *consultation, case reflection, referral.*

**The buried lede**: the `archetype` / `response_mode` / `purpose_block` columns are **BUILT** practitioner scaffolding (a channel can already declare "this is a *practice* space whose response mode is *witnessing*"). They are **not SURFACING** — the rail renders channels as a flat list and ignores this metadata. *The persona intent exists in the data model and was abandoned at the presentation layer.*

> **Standard test**: Default rail organized around `exec/ops/dev/strategy` → does this help a practitioner care for someone? **No.** It helps a software team ship.

---

### 2. DM experience — **1:1 in practice; group-capable in schema**

Tables (`20260321000002_team_dm_threads.sql`): `team_dm_threads (id, created_at)`, `team_dm_members (dm_thread_id, member_id, last_read_at)` — a **junction table that allows n members** — `team_dm_messages (id, dm_thread_id, sender_id, body, edited_at, deleted_at, attachments jsonb, created_at)`.

Reality: `findOrCreateDMThread()` (`lib/team/DMService.ts`) **hardcodes exactly 2 members**; `DMView.tsx` assumes 1:1. Any member can DM any other member (no restriction). No subject/topic, no archival concept — feels ephemeral.

> **Standard test**: 1:1 private support between two practitioners — **partial yes**. But a DM is the wrong shape for *shared* consultation (it can't gather several peers around one situation as a durable record).

---

### 3. Decisions surface — **a real provenance loop; the most "practitioner-adjacent" thing already shipped**

"For You → ✓ Decisions" is a view over **`studio_decisions`** with Co-Lab provenance (`20260606000001_colab_decision_task_provenance.sql`): `source_message_id, source_channel_id, captured_by_member_id, title, context, status ('draft' | 'consulting' | 'complete' | 'archived')`. Route `/api/team/decisions`; UI `components/team/TeamDecisionsView.tsx` at `/team/decisions`. A channel message can be **captured into a decision**, channel-access-scoped, and **converted to a `studio_task`** (closes discuss→decide→do).

Note the `status` enum already contains **`'consulting'`** — a consultation concept is *latent in the decisions model.* **WIRED/SURFACING.**

---

### 4. Notification model — **event × channel; team-activity vocabulary; expandable without migration**

Preferences table `member_notification_preferences` (`20260609000003`): keyed `(member_id, event_type, channel, enabled)`; **stores only overrides**, defaults live in `lib/team/notificationTypes.ts`. Events today:
`dm_received, mentioned, thread_reply, channel_activity`. Transports: **`in_app` (LIVE)**, **`email` (LIVE, Resend `team@soullab.life` via `lib/email/sendEmail.ts`)**, **`sms` (DORMANT — schema only)**, **push (STUB — no VAPID/subscription)**. Notify call-sites: `DMService.ts`, `ChannelService.ts`.

The vocabulary is **generic team activity** — no `consult_request`, `referral_received`, `needs_response`. **Crucially: new events are code-only (no migration)** because defaults live in code. So adding practitioner events is cheap *when* warranted.

---

### 5. "For You" — **the seed of person-centered orientation (already SURFACING)**

`attention_items` (`20260606000002`), kinds **`mention | request | assignment | thread_reply`**, recipient-scoped, polled at `/api/team/attention`, rendered by `components/team/ForYou.tsx`. This is exactly the user's intuition: a surface that orients around *a person's participation*, not around channels. **The `request` kind already exists** — i.e. "someone is asking something of you" is a shipped primitive. This is the strongest existing foundation for a practitioner reframe.

---

### 6. Consultation possibilities — **strong primitives, no practitioner-framed home**

- **Threads** (`team_messages.parent_id` self-FK; `ThreadPanel.tsx`): durable, multi-member, attributed, searchable. **This is the right primitive for "situation posted → several practitioners reply → reusable consultation record."** BUILT + WIRED + SURFACING.
- **Mentions** (`/@(\w+)/g` in `lib/team/attention.ts`): functional but minimal — no autocomplete, plain-text, no expertise lookup. Good for *callout*, useless for *discovery*.
- **`message_kind='request'` → `attention_items.kind='request'`**: an "ask the room" loop already exists end-to-end.
- **`studio_decisions.status='consulting'`**: a consultation status exists in the decisions model.

**What's missing is not mechanism — it's framing and a home.** There is no channel, label, or entry point that says *"bring a client situation here."*

> ⚠ **Canon flag (consent/containment)**: channel/thread messages are **not de-identified**. A "difficult client" consultation thread would put client material into shared storage with none of the de-identification the referral stack already enforces (see §7). Any consultation surface must carry the same client-confidentiality discipline — this is a sovereignty constraint, not a polish item.

---

### 7. Referral possibilities — **the crown jewel is already BUILT (backend + API); it has ZERO UI**

This is the headline. `database/migrations/20260121_trusted_colleagues.sql` + `lib/practitioner/trustedColleagues.ts`:

- **`practitioner_directory_profiles`**: `is_listed, accepting_referrals, display_name, location, bio, modalities[], tags[], languages[], accepts_sliding_scale`.
- **`practitioner_connections`**: mutual-accept graph (`requester_id, recipient_id, status pending/accepted/declined/blocked`).
- **`referral_requests`**: full lifecycle (draft→sent→received→accepted/declined→closed), **de-identified by default** (`client_age_range, client_pronouns, presenting_themes[], urgency, constraints[]`), **explicit consent required** to share name/contact, note privacy enforced per side. Connection required before referral (invariant).
- **API LIVE**: `GET /api/practitioner/referrals/directory` (search by modality/tag/location/sliding-scale), `/api/practitioner/referrals/profile` (CRUD own profile).

**Status: BUILT + (API) WIRED, but NOT SURFACING — there is no UI anywhere** (`/studio/referrals`, directory browse, compose, inbox all ABSENT), and it is **entirely disconnected from Co-Lab** (lives in the `practitioner`/`studio` namespace, not `team`).

> The consent/de-identification posture here is **canon-aligned out of the box** — it already models exactly the boundary discipline MAIA requires. This is the single most valuable, most overlooked asset in the audit.

---

### 8. Practitioner onboarding experience — **none, for Co-Lab specifically**

`/team` (`app/team/layout.tsx`) is gated on **authentication only** (valid `maia_session`/`maia_member_id`) — **no team-membership enforcement live on main**. First run → redirect to `/team/general` → land in `#general`, **no welcome card, no empty-state, no guidance**. Persona data exists (`members.is_practitioner` `20260107000001`; `practitioners` table `20260116000001`; `/api/auth/whoami` returns `isPractitioner`) but Co-Lab's structure does not read it to shape the experience. A practitioner's first Co-Lab moment is an empty `#general` inside a staff workspace.

---

## PART 2 — IDENTIFY

### 1. Current persona break

The **default and first** Co-Lab surface is the `soullab` *staff/ops* workspace (`exec/ops/dev/design/strategy/marketing/bugs`). The practitioner "home" is a **separate, thin `all-practitioners` commons** with generic community channels (`introductions/support/general`) — not shaped around caring for clients either. **Two personas are conflated into one channel-shaped tool, and the one that loads first is the builder's.** Persona data to fix this exists (`is_practitioner`) and is unused at the structural layer.

### 2. What practitioners actually come to Co-Lab for (mapped to infra tier)

| Practitioner need | Existing infra | Tier |
|---|---|---|
| "I have a difficult client — I need **consultation**" | threads + `message_kind='request'` + `attention.kind='request'` | BUILT/WIRED — **no practitioner-framed home** |
| "Who works with **X**? I need a **referral**" | `practitioner_directory_profiles` + `referral_requests` + search API | BUILT + API-WIRED — **no UI, not in Co-Lab** |
| "I need **support** / a private word" | 1:1 DMs; `#support` commons channel | WIRED/SURFACING (generic) |
| "I want to **learn from peers / case reflection**" | threads + channel `archetype='practice'/'cohort'/'field_note'` | metadata BUILT — **not seeded/surfaced** |
| "What needs **my response**?" | `attention_items` ("For You"), `kind='request'` | SURFACING — **not labeled for practitioners** |

**None of these is a from-scratch build. Every one maps to something already built and merely unsurfaced or unframed.**

### 3. Existing infrastructure that can support **consultation**

Threads (durable multi-party record) · `message_kind='request'` + `attention_items.kind='request'` (the "ask the room" loop, end-to-end) · `studio_decisions.status='consulting'` · channel `archetype`/`response_mode`/`purpose_block` (to declare a space *as* a consultation space) · mentions (callout). **Mechanism is sufficient; framing and a home are missing.**

### 4. Existing infrastructure that can support **referral**

The entire trusted-colleagues stack (§7): directory profiles, mutual-connection graph, consent-gated de-identified referral requests, and a working search API. **~Backend-complete, UI-absent, Co-Lab-disconnected.** Closing this gap is *surfacing*, not *building*.

### 5. Smallest "Track A" equivalent

Mirroring Studio Track A (*re-home + re-label, zero new backend, zero-state-first*), the smallest reveal that helps a practitioner care for someone:

**Track A — Co-Lab practitioner reveal (no new tables, no new backend):**
1. **Practitioner-framed participation rail.** Expand "For You" into the surfaces the persona actually thinks in — *Decisions · Mentions · Needs Response · Consult Requests · Referrals* — **fed entirely by existing `attention_items` (incl. `kind='request'`), `studio_decisions`, and `referral_requests`.** Pure presentation over data that already exists.
2. **Seed one consultation-shaped channel** in the practitioner commons (e.g. *Case Reflection* / *Consultation*) using the **existing** `archetype`/`response_mode`/`purpose_block` columns — no schema change. Threads inside it are the consultation record.
3. **Read-only referral directory view** wired to the **existing** `GET /api/practitioner/referrals/directory`. Browse peers by modality/location/accepting-referrals. No compose flow yet — just make the invisible visible.

**Explicitly NOT Track A** (defer): referral compose/consent/inbox UIs; connection request/accept UX; new notification events (`consult_request`, `referral_received` — code-only when warranted); group-DM-ification; any change to the auth/membership gate; populating directory profiles (a separate, consent-gated step).

**Sequencing**: per the user's own directive and Studio precedent — *Studio ships and is observed first; Co-Lab reveal follows.* This audit is the pre-work so the next move is visible, not a license to start.

---

## PART 3 — Honest uncertainties (re-verify before any build)

The discovery pass was locate-only (Explore agents); confirm these against running code/DB before relying on them:

1. **VERIFY** — that practitioners are actually routed to the `all-practitioners` team at runtime (asserted from migration, not traced in live routing).
2. **VERIFY** — exact home of `requireChannelAccess` (`lib/team/permissions.ts` vs `ChannelService.ts`).
3. **VERIFY (security)** — auth-hardening on `/api/practitioner/referrals/*`. Given this repo's recent admin-route-auth history, **do not assume these routes are guarded** — audit before surfacing anything that exposes practitioner identity.
4. **VERIFY (populated ≠ built)** — whether `practitioner_directory_profiles` has any opted-in rows in prod. A directory of zero listed practitioners helps no one; populating it is its own consent-gated step, not a UI task.
5. **Module boundary** — the referral stack lives in `practitioner`/`studio`, **not** `team`. Wiring it into Co-Lab crosses namespaces; re-check identity/auth assumptions at the seam.
6. **Canon** — a real-client consultation surface needs the **de-identification discipline the referral stack already encodes** (§6 flag). Treat client confidentiality as a gating invariant, not a later refinement.

---

## One-line summary

*Co-Lab is a channel-shaped staff tool with a thin practitioner commons bolted on — but the practitioner network it could become is largely already built (latent channel archetypes, a request/attention loop, and a consent-grounded referral backend) and simply unsurfaced. The next move is a reveal, not a rebuild: re-home and re-label what exists, smallest-first, after Studio ships and is observed.*
