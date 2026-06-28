# Session Room Video — Phase 1 Scope

- **Status**: Scoped — not built. 2026-06-14.
- **Parent**: `SESSION_ROOM_VIDEO_SPEC_2026-06-14.md` (decisions ratified, §9)
- **Goal**: ship a sovereign session container around the practitioner's existing video, with no new media infrastructure.

## Product line (ratified)

*"With external video, MAIA can keep the session memory sovereign. It cannot make the video provider sovereign."*

## What Phase 1 delivers

Session Room becomes the host around an external call:

- Video provider setting (practitioner default + per-session override): Soullab Video (stub, disabled until Phase 3) · Zoom · Google Meet · Doxy · custom link.
- Session-agreement entry gate (Pre-session state): 5 presets + plain-language statement + mutual consent before begin.
- Always-visible agreement status bar (Active state).
- The existing scribe / notes / markers / continuity wired around the call (reuse).
- Closing ritual (Closing state): kept vs not-kept per agreement; closing persists only what the agreement permits.
- Continuity record updated per agreement (Continuity state).

## Explicitly OUT of Phase 1 (→ Phase 3)

Native WebRTC, signaling completion, self-hosted TURN, consent-aware recording capture, and the embedded in-room video tile. Phase 1 has no media infrastructure.

## The external-video reality (honest)

Zoom and Google Meet set `X-Frame-Options`/CSP that block embedding; Doxy and custom links are their own rooms. So Phase 1 "join video call" is a managed link-out (opens the provider in a new tab/window) while the MAIA container — agreement, status bar, scribe, notes, continuity — persists in Session Room alongside. The embedded in-room tile arrives with Soullab Video (Phase 3). Consistent with the product line: MAIA holds the sovereign container; the provider holds the media.

## Consent flow (the spine — build the migration against this)

Mutual consent is only real if the client sees and agrees to the plain-language statement *before* entering the session — never practitioner-attested. The migration and API are built around this flow, not just practitioner-side configuration.

**Acceptance gates** (all required):

1. Practitioner selects the session agreement mode.
2. System generates the plain-language agreement (see two-statement rule below).
3. Client opens the join link (scoped to `practitioner_clients`).
4. Client sees the agreement *before* any external video link.
5. Client accepts or refuses. Refusal ends the flow, reveals no link, and is recorded.
6. A consent event is recorded with actor, timestamp, mode, agreement version, and decision.
7. The external video link is revealed only after required consent is recorded — enforced at the API (the link is withheld server-side until `consent_client_at` is set), not merely hidden in the UI.
8. The Sanctuary / no-retention path records only the consent event (metadata: that consent occurred) plus date + duration — never session content.

**Two-statement rule (external providers).** The client gate shows two distinct statements so §4 stays honest at the point of consent:

- *MAIA retention agreement* — what MAIA will and won't keep.
- *External provider notice* — that the call runs on a third party with its own policies.

Example: *"MAIA will keep notes according to this agreement. The video call itself opens in Zoom / Google Meet, which has its own privacy and retention policies outside MAIA's control."*

For Soullab Video (Phase 3) there is no provider notice — the media is sovereign too.

**Agreement versioning.** The generated statements are frozen on the session record with an `agreement_version`; the consent event references that version. If the agreement template changes later, every past consent still proves exactly what was shown and agreed.

## Build order

1. **Migration** — agreement fields on the session record + `session_consent_events` (the Phase-1 subset of spec §5).
2. **Plain-language statement generator** — pure function `(agreement | custom flags, provider, version) → { maiaRetention, providerNotice? }`; two separate statements for external providers; reused by both gates.
3. **Agreement model + API** — set/get agreement, record practitioner + client consent, log consent events.
4. **Pre-session gate (practitioner)** — choose agreement, see statement, equipment check (reuse Studio Camera), begin.
5. **Client-facing gate** — join link → statement → agree → hand to external video.
6. **Active session** — status bar + provider link-out + existing workspace (scribe/notes/markers) wired.
7. **Closing ritual** — kept vs not-kept from agreement; persist only what's permitted; set `room_state`.
8. **Continuity record** — surface per agreement (reuse client history / `case_memories` / atoms).
9. **Provider setting** — practitioner default + per-session override.

## Reuse vs new

- **Reuse**: Session Room shell (`app/studio/session-room/page.tsx`), scribe/markers/insights (`supervision_*`), `session_artifacts`, `practitioner_clients`, continuity stores, Studio Camera (→ equipment check).
- **New**: the migration, the plain-language generator, the two agreement gates, the status bar, the closing ritual, the provider setting, `room_state` wiring.

## Data model (Phase 1 subset, built around the consent flow)

On the session record: `agreement_type`, `agreement_version`, `consent_flags` jsonb, `agreement_statement` text (MAIA retention), `provider_notice` text (external; null for Soullab Video), `consent_practitioner_at`, `consent_client_at`, `video_provider`, `video_link`, `room_state`.

`session_consent_events` is the append-only consent ledger (the spine): `session_id`, `actor` (practitioner | client), `action` (set | accept | refuse | change), `agreement_type`, `agreement_version`, `consent_flags` snapshot, `prev_agreement_type` (for changes), `at`. Minimal metadata only — no session content. Covers initial practitioner set, client accept/refuse, and mid-session changes.

(No `signaling_room_id` / recording-artifact fields — those are Phase 3.)

## Acceptance criteria

- Practitioner sets a default provider + link; can override per session.
- A session cannot begin without both practitioner and client acknowledging the agreement.
- The active agreement is visible throughout.
- Join opens the external call; the MAIA container persists alongside.
- Mid-session downgrade works; invoking Sanctuary prompts discard-or-keep before crossing.
- Closing persists only what the agreement permits — verifiable: a Sanctuary session leaves only date + duration; a Notes session leaves practitioner-scoped notes/markers/follow-ups, no transcript/recording.
- Continuity record reflects the agreement.
- All eight consent-flow gates pass (see Consent flow).
- Client can refuse; refusal reveals no link and is recorded.
- The external video link is never returned by the API before `consent_client_at` is set.
- Every consent event carries actor, timestamp, mode, agreement version, and decision.
- The client gate shows both the MAIA retention agreement and (for external providers) the provider notice.

## iOS / Capacitor

Phase 1 is mobile-friendly: link-out to external providers opens in the system browser; the agreement gates and scribe are standard routes. Native WebRTC concerns are Phase 3.

## Doctrine check

Increases agency (per-session agreement, mutual), pushes life outward (supports the real session), reduces centrality (MAIA = container/scribe, not the call). Pass.
