# Session Room → Co-lab Wire — Specification

**Status:** PROPOSED (spec only — no code authorized by this document)
**Date:** 2026-06-06
**Trigger:** Kelly directive — spec the recording→Co-lab wire as the higher-leverage move over runtime verification, because it "helps define what the platform becomes."
**Companion:** `docs/architecture/COLAB_VS_ECHO_GAP_MAP_2026-06-06.md` (this is gap #2 — "highest leverage; both halves already exist").

---

## Status calibration (read first)

This is a **design spec**, not an implementation. Nothing here is built. The house ladder applies: *built ≠ wired ≠ surfacing ≠ verified.* Every "reuse X" claim below cites a seam confirmed to exist in the codebase (file/table named); every "would add" item is proposed and unbuilt. Where a decision is doctrinal, it is routed to Kelly, not locked here.

---

## 0. The workflow (Kelly's frame)

```
Session Room → Recording/transcript → Co-lab channel → Team discussion → Tasks/decisions → Memory/continuity
```

Echo treats "drop a recording into a channel" as a *feature*. Here it is a *workflow seam* connecting five subsystems that already exist independently. The spec's job is to connect them **without** letting the connection become a consent or sanctuary leak. The load-bearing principle:

> A session artifact entering a channel is a **publication act**, not a memory act. The drop must carry its provenance, require explicit authority on both ends, and never silently become a standing source.

---

## 1. The seams that already exist (so this is generalization, not greenfield)

| Role | Existing seam | What it gives us |
|---|---|---|
| **Source** | `maia_sessions` (`mode` continuity\|sanctuary, `status`, `summary` JSONB, `themes` TEXT[]) + `session_insights` + `session_artifacts` + `voice_notes`/`session_voice_notes` + `studio_session_markers` | Structured, already-extracted session output at varying rawness |
| **Source governance** | Session Summary Pipeline (`20260209000001`) — *"Sanctuary sessions are NEVER summarized"*; sanctuary → `summary=NULL`, turns deleted | Sanctuary already cannot produce a summary artifact |
| **Existing drop precedent** | `app/api/studio/session-followup/generate` + `/send` | "session output → composed payload → delivered elsewhere" already exists (to client); the channel is a new sink for the same shape |
| **Sink + non-human-post precedent** | `app/api/team/channels/[channelId]/maia-reflect/route.ts` | A system actor (`sender_type='maia'`) inserts a `team_messages` row, threaded, gated by `requireChannelAccess()` |
| **Field-shaped channel semantics** | `TeamChannel.archetype` / `responseMode` / `purposeBlock` (`lib/team/types.ts`) | The destination already has practice-shaped meaning — a drop can respect channel intent |
| **Message classification precedent** | `MessageKind = build\|question\|decision\|insight` + `senderType` (`lib/team/types.ts`) | New `session_*` kinds extend a pattern, not invent one |
| **Standing-source / entrustment precedent** | atoms `is_breakthrough` (`/api/sovereign/atoms/[id]/breakthrough`); "standing source" (`lib/wisdom/wisdomGuidePrompt.ts`); Entrustment Covenant (`docs/specs/ENTRUSTMENT_COVENANT_PROTOCOL_2026-06-05.md`) | The artifact-vs-standing-source distinction already has a built primitive to mirror |

**Implication:** the drop is `session-followup/generate` (compose) → `maia-reflect`-style insert (post). The genuinely new parts are: a provenance tier-picker, a sanctuary floor, the `session_*` message kinds + payload, a render card, and a *separate* standing-source promotion gesture.

---

## 2. The five decisions (your questions, answered)

### 2.1 Provenance — *what enters the channel?* → tiered ladder, least-raw is default

Not all session output has the same privacy weight. Locked tiers, lowest-exposure first:

| Tier | Content | Source | Default? | Consent step |
|---|---|---|---|---|
| **T1 Theme** | `themes[]` only ("grief, threshold, naming") | `maia_sessions.themes` | — | one tap |
| **T2 Summary** | the JSONB `summary` | `maia_sessions.summary` | ✅ **default drop** | one tap + preview |
| **T3 Insight/Decision** | selected `session_insights` rows | `session_insights` | — | per-item select |
| **T4 Transcript** | full transcript text | turns / transcript store | — | explicit confirm + "this is raw" warning |
| **T5 Recording** | audio artifact link | `session_artifacts` / Vault | — | explicit confirm + "this is raw" warning |

**Rule:** the drop UI defaults to **T2 (summary)**. T4/T5 (raw) require an escalating confirmation. Rationale: the platform should make the *interpreted, consented* layer the path of least resistance and the *raw* layer a deliberate act — the inverse of how a generic file-share tool behaves.

### 2.2 Authority — *who can create the drop?* → dual authority, explicit human only

A drop requires **both** ends:

- **Source authority** — the actor is the session owner/facilitator (`maia_sessions.member_id` / facilitator of record).
- **Sink authority** — the actor has post access to the target channel: `requireChannelAccess(channelId, memberId)` (the exact gate `maia-reflect` uses).

| Actor | v1 | Why |
|---|---|---|
| Session facilitator (with channel access) | ✅ | owns both ends |
| Channel admin (not in session) | ❌ | sink authority ≠ source authority; can't publish someone's session |
| Participant (non-facilitator) | ⚠️ held | needs a participant-consent model first |
| **Automatic system event** | ❌ **explicitly excluded in v1** | session-completion is **not** consent to broadcast — see consent-boundary bug class (`project_consent_boundary_bug_class`) |

Auto-drop is a Cat-1 held direction, not a v1 feature. *Do not treat "session ended" as "publish this."*

### 2.3 Sanctuary — *does Sanctuary content ever flow into Co-lab?* → **DOCTRINAL DECISION REQUIRED (Kelly)**

Two facts and one tension:

1. **Operationally, there is nothing to drop.** Sanctuary sessions have `summary=NULL`, turns deleted, never queued for summary. T2–T5 simply do not exist for a sanctuary session. T1 themes also are not extracted. So the *default* behavior is already correct by absence.
2. **The hard floor (recommended default):** the drop endpoint refuses any session with `mode='sanctuary'` for **all** tiers, returning `403 sanctuary_ineligible`, *even on explicit request* — enforced by a `mode` check, not by relying on artifact-absence.

**The tension with your sketch.** You wrote *"explicit participant action → export allowed."* That aligns with the canonical boundary *"Sanctuary protects against imported context, not conscious choice"* (`project_sanctuary_imported_context_boundary`). But it collides with **Sanctuary Invariant #6** (CLAUDE.md): *"Nothing from a Sanctuary session can be saved, extracted, inferred, or converted into long-term memory, under any circumstances, including by user request during the session."*

Resolution the spec proposes (yours to ratify):
- The "conscious choice" carve-out applies to a *standing source the member chose* (guide/mode/voice) — **not** to *content generated inside* a sanctuary container. Session content is the imported-context side of the line, so #6 governs.
- Therefore **v1 = hard floor, sanctuary ineligible, no exception.** If you want a narrow "I explicitly choose to carry this one thing out of sanctuary" path, that is a *new* doctrinal authorization, specified separately, and it would still be moot for recording/transcript (deleted) — it could only ever apply to a member-authored note made *with foreknowledge*, never to retained session content.

→ **Locked pending Kelly:** hard floor in v1. The exception is not designed here.

### 2.4 Semantic message kind — *generic attachment, or typed?* → typed, extends the enum

Extend `MessageKind` and `senderType` rather than bolting on a file-attachment concept:

```
MessageKind:  build | question | decision | insight          (existing)
            + session_summary | session_insight | session_decision | session_recording   (new)

senderType:   member | maia                                  (existing)
            + session                                        (new — system-authored drop)
```

A drop renders as a **structured session card** (source session, tier badge, provenance, "open in Session Room" link), not a generic upload. This matches the existing lightweight-classification pattern (quiet by default, badge when meaningful).

### 2.5 Continuity — *channel artifact, or standing source?* → **artifact by default; standing-source = separate consent gate**

This is the decision that "affects retrieval, memory, and how MAIA participates later," so it gets the strictest treatment.

- **Default = channel artifact.** A drop is a `team_messages` row: visible, scrollable, reactable, threadable — and **inert**. It does **not** enter any recall/memory substrate; MAIA's channel reflections do **not** treat it as standing context.
- **Standing source = a second, explicit act.** Promoting a drop to "standing source for this Co-lab" is a *separate* gesture (mirror of atoms `is_breakthrough`), consent-gated, provenance-carrying, and itself sanctuary-checked. Only then can future `maia-reflect` calls in that channel, and team recall, draw on it.

**Why split them:** the drop action is consent to *publish to the channel*. It is **not** consent to *shape future generation*. Collapsing the two is the consent-boundary bug class verbatim (one action treated as consent for a different action). The split also re-uses the Entrustment Covenant frame: standing-source status is an *entrustment* ("place it in the Co-lab's care"), verifiable later, not a side effect of posting.

---

## 3. Architecture — the wire

```
[Session Room]
  maia_sessions (mode, status='completed', summary, themes)
  session_insights / session_artifacts
        │  (1) eligibility gate: mode != 'sanctuary' AND status='completed' AND source-authority
        ▼
[Compose]  reuse session-followup/generate pattern → payload at chosen tier (default T2)
        │  (2) sink gate: requireChannelAccess(channelId, memberId)
        ▼
[Post]  INSERT team_messages (sender_type='session', message_kind='session_*', payload JSONB, parent_id?)
        │  (mirrors maia-reflect insert)
        ▼
[Channel]  renders Session Card  ──reactions / thread / tasks (existing)
        │  (3) SEPARATE consent gate (optional, later)
        ▼
[Standing source]  promote → atoms-style registration scoped to channel/Co-lab → MAIA recall/participation
```

(1)+(2) = v1. (3) = v1.1, behind its own consent gate.

---

## 4. Schema deltas (PROPOSED)

```sql
-- extend message kinds (mirror 20260321000004_team_message_kinds pattern)
ALTER TABLE team_messages DROP CONSTRAINT IF EXISTS team_messages_message_kind_check;
ALTER TABLE team_messages ADD CONSTRAINT team_messages_message_kind_check
  CHECK (message_kind IN ('build','question','decision','insight',
                          'session_summary','session_insight','session_decision','session_recording'));

-- structured drop payload (provenance is mandatory, never stripped)
ALTER TABLE team_messages
  ADD COLUMN IF NOT EXISTS source_session_id TEXT REFERENCES maia_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS drop_tier TEXT CHECK (drop_tier IN ('theme','summary','insight','transcript','recording')),
  ADD COLUMN IF NOT EXISTS drop_meta JSONB;   -- { sourceMode, dropAuthorId, droppedAt, artifactRef }

-- standing-source promotion (v1.1) — mirror atoms is_breakthrough
ALTER TABLE team_messages
  ADD COLUMN IF NOT EXISTS is_standing_source BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS standing_marked_by UUID REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS standing_marked_at TIMESTAMPTZ;
```

`senderType='session'` added to `lib/team/types.ts` (`MessageKind` union + `TeamMessage.senderType`).

---

## 5. API surface (PROPOSED)

| Route | Method | Purpose | Gate |
|---|---|---|---|
| `/api/studio/sessions/[sessionId]/drop-targets` | GET | channels this facilitator may drop into | source-auth + per-channel `requireChannelAccess` |
| `/api/team/channels/[channelId]/session-drop` | POST | create the drop (`{ sessionId, tier }`) | **sanctuary floor** + dual authority |
| `/api/team/messages/[messageId]/standing-source` | POST/DELETE | promote/demote a drop to standing source (v1.1) | channel admin + sanctuary recheck |

The POST mirrors `maia-reflect/route.ts` almost exactly (access check → fetch source → INSERT `team_messages`).

---

## 6. Safeguards (the floor set)

1. **Sanctuary floor** — `mode='sanctuary'` → `403 sanctuary_ineligible`, all tiers, no exception (pending §2.3 ratification). Checked on `source_session_id`, not on artifact presence.
2. **Dual authority** — source-owner AND `requireChannelAccess`; both or refuse.
3. **Provenance never stripped** — every drop persists `source_session_id` + `drop_meta.sourceMode` + tier + author. (Matches recall-path provenance discipline, `project_recall_path_facet_provenance`.)
4. **Artifact ≠ standing source** — drop never auto-enters memory/recall; promotion is a separate consent gate.
5. **Least-raw default** — UI defaults to T2; T4/T5 require explicit "this is raw" confirm.
6. **No auto-drop** — explicit human action only in v1.

---

## 7. Observability

```
[Co-lab/session-drop] { sessionId, tier, channelId, sourceMode, authorPrefix, standingSource:false }
[Co-lab/session-drop REFUSED] { reason: 'sanctuary_ineligible' | 'no_source_auth' | 'no_channel_access' }
[Co-lab/standing-source] { messageId, channelId, markedByPrefix }   // v1.1
```

Phase-1 (observe) before Phase-2 (influence): ship the drop + markers first; do not wire standing-source → MAIA recall until drop volume is observed and the promotion gate is verified.

---

## 8. Staging / verification ladder

- **Stage 1** — schema + route exist; `curl` a summary drop into a test channel; row present with provenance. *(reachable)*
- **Stage 2** — sanctuary session returns `403 sanctuary_ineligible`. *(floor verified)*
- **Stage 3** — drop renders as a Session Card in `ChannelView`; facilitator drops under real auth. *(surfacing)*
- **Stage 4** — standing-source promotion gate built + a promoted drop surfaces in a later `maia-reflect`. *(continuity live)*
- Until Stage 3: **drop = built/wired, runtime-unverified.** Until Stage 4: **standing-source = not started.**

---

## 9. Open questions (Kelly's domain)

1. **§2.3 sanctuary exception** — hard floor (recommended) vs. a narrow conscious-choice carve-out. Doctrinal; collides with Invariant #6.
2. **Which Co-lab surface?** This spec targets `/team` (channels). The `/studio/teams` shared-field surface is a different sink — out of scope until the two-surface question (gap map §"two surfaces") is resolved.
3. **Client-facing channels** — if a Co-lab channel ever contains the client, a session drop crosses practitioner↔client boundaries and needs the comms-spine PHI/consent model, not this. v1 = practitioner-internal channels only.
4. **Participant (non-facilitator) drops** — needs a participant-consent model; held.

---

## 10. What this is NOT

- Not auto-export. Not a sanctuary exception. Not a generic file-attachment feature. Not a memory feature (the drop is publication; memory is a separate, gated second act). Not the `/studio/teams` surface. Not client-facing in v1.
