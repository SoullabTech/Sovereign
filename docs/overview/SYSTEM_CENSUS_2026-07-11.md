# SOULLAB SYSTEM CENSUS — 2026-07-11

**Ref**: `92026feaf` on `feature/now-what-maia-presence` — the **freeze commit**.
**Provenance**: readers ran against the working tree at `fcef6ff4a` + 95 uncommitted paths; that tree was then committed verbatim as `92026feaf`, so every finding is reproducible by checking out the freeze commit. Two audit items were closed pre-ratification in the follow-up commit `a61d6d1c1` (see §6); those two rows describe post-freeze state and name their commit.
**Delta discipline**: any development on this branch after `a61d6d1c1` invalidates affected stamps; record deltas against this document rather than silently re-reading.
**Method**: read-only census, findings-only; remediation commits are recorded, not silently absorbed. Derived from code first, docs second. Every stamp names its evidence.
**Standing header**: findings bind to the ref stated per row. Nothing in this document is ratified until Kelly's pass. This is the Codex's evidence base, not the Codex.

**Stamp vocabulary** (repo-level — "wired-live" means wired into live request paths *in code at this ref*; it does not assert production runtime behavior, which this census did not probe):

| Stamp | Meaning |
|---|---|
| LIVE | Route + persistence + gates wired into member-reachable paths |
| LIVE-PRESENTATION | Real page over real endpoints, but read-only/aggregating |
| FLAG-GATED | Live path exists behind an explicit flag or allowlist |
| HONESTY-GATED | Deliberately empty/mock surface, disclosed as such in code |
| SCAFFOLD / STUB | UI reachable but persistence absent or placeholder |
| SUBSTRATE | Built code with zero live callers |
| SPEC-ONLY | Authored document, no code |
| BRANCH-ONLY | Code exists on a branch whose commits are not ancestors of this ref |
| ATTESTED | True by founder attestation, not repo-verifiable (e.g. legal standing) |

---

## 0. The Constitutional Core — what makes the mirror trustworthy

The authority chain, as it actually exists in `docs/canon/` at this ref:

**Oath → Canon v1.1 → 16 Sovereignty Invariants → Direction of Authority → specialized canons → ADRs → Refusal Registry.**

- **MAIA_OATH.md** — root vow, first person: support, not substitute. No attachment-seeking, no command/diagnosis/prophecy, no simulated intimacy, no engagement-over-sovereignty. "I serve the person, not the model."
- **MAIA_CANON_v1.1.md** — ontology + **11 Absolute Prohibitions** (never persuade, never optimize engagement, never manufacture lack, never become authority over conscience, never defend herself, …) + the Quiet Test + §VIII Field-First Architecture (canonizes the deliberate disconnection of classical cognitive engines).
- **MAIA_SOVEREIGNTY_INVARIANTS.md** — **16 invariants**, enforceable (any feature violating them is invalid). Most load-bearing: 1 Authority Return, 4 No Emotional Capture, 6 Mirror Integrity, 8 Conductor Authority, 12 Design Burden, 13 Claim-Type Floor, 14 Cultural Sovereignty, 15 Authored Adaptation, 16 Recognition Integrity.
- **CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md** — the backbone: authority may only move upward through authored experience — Encounter → Reflection → Recognition → Living Field, within Developmental Ecology as medium. The member may jump around; the system may not. Ratified 2026-07-01 with Invariant 16.
- **MARKETING_CLAIM_DISCIPLINE.md** — Live/Designed/Vision ladder, Center of Gravity, Failure Test; `built ≠ wired ≠ surfacing ≠ verified`. This census is written under it.
- **REFUSAL_REGISTRY** (`docs/architecture/`) — candidate certification instrument, **not canon**: grades refusals by where their authority lives (A Structural / B Guarded / C Instructional). Test: "what would a hostile fork have to change?"

**AIN OS** is defined precisely in **ADR-013** (Proposed, 2026-07-08): *the operating system governing the world MAIA is given* — constitutional governance, memory orchestration, Context Assembly, Living Field state, consent. MAIA is the agent inside it. The regulatory-capacity extension (`AIN_OS_REGULATORY_CAPACITY_CANDIDATE_2026-07-09.md`) adds the inheritance chain: every deployment inherits constitutional safeguards and may only narrow, never widen.

**Census corrections to recollection**: there is **no ADR-011** at this ref. ADR-010's actual title is "Personal Field as base / Contribution Field as additive Co-Lab layer." `docs/canon/` holds 66 documents; the full list is in the canon inventory.

---

## 1. The Engine — MAIA runtime (Cat 6, per session anchor + committed docs)

Not re-derived this session; carried from the committed record (CLAUDE.md session anchor), labeled as such:

- Three voice modes (Talk / Care / Note); three processing tiers (FAST <2s / CORE 2–6s / DEEP 6–20s).
- Conversational memory Phase 2 reaches the prompt on FAST + CORE; DEEP blocked by the addenda-channel divergence (`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B).
- Corpus Callosum substrate — parallel multi-agent epistemic emission (8 voices) live on the FAST/CORE spine, default-on.
- Atoms loader + memory health + substrate monitor + spiral state persistence (Bridge D) — live.
- Sanctuary Mode — opt-in, enforced on the main spine at `maiaOrchestrator.ts:377,:803`, `MemberLiveContext.ts:334`, `MaiaWisdomProvider.ts:150`. **Peripheral gaps: see §6.**
- Sovereignty of providers: Claude primary, local Ollama fallback, local/self-hosted everything (minisforum, Caddy, Postgres).

---

## 2. The Member Arc — surfaces placed where they serve the unfolding

### 2.1 Encounter

| Surface | Stamp | Evidence |
|---|---|---|
| **What Now? room** | LIVE (presence layer FLAG-GATED) | `app/now-what/room/`; interview route assembles Field Context in-route from read-only loaders and **persists nothing** (`app/api/now-what/interview/route.ts:22-23`); presence composition behind `NOW_WHAT_MAIA_PRESENCE_ENABLED` (`:289,:386`), off = byte-identical baseline. Evidence crosses into the member's field only by explicit gesture → `member_field_note_threads` + append-only `member_field_note_events`; `can_be_shown_to_practitioner` defaults FALSE. |
| **Session history** (`/sessions`) | LIVE | Scribe/Witness history — solo / practitioner / third-chair containers, sealed/learning memory policy in UI. |
| **Studio Session Room** (scribe companion) | LIVE | `app/studio/session-room` — idle→recording→review with consent gate + memory policy. |
| **Open Session Room** (WebRTC) | LIVE, transport-only (Phase A) | `app/open/session-room/[roomId]`; join-token required — 403 "threshold proof required" without it; `authorizeRoomEntry` re-checks the consent row on **every** request; role server-derived; TURN credentials self-hosted coturn HMAC, **fails closed** (503) rather than third-party relay. No recording, no transcript, no memory write. |
| **Dream/Day Journal** | LIVE | `app/journal/` + `quick_journal_entries`; voice + typed + upload capture (`app/api/journal/quick/{audio,audio-file}`). Raw audio double-gated: paid tier (402) + explicit `storage_consent.audioServer` (default-deny 403). Dream is a content mode, not a separate route. Text→memory bridge **consent-gated as of `a61d6d1c1`** (`storage_consent.journalMemoryBridge`, default-deny) — §6.1. |
| **Field Lab** | LIVE, tester-gated at the crossing | `app/maia/field-lab/` — "bounded experimental ecology, NOT a beta-features showcase"; only persistence is the field-note crossing (`isMemberTester` checked at save); member free to leave with nothing. |

### 2.2 Reflection

| Surface | Stamp | Evidence |
|---|---|---|
| **Ideas** | LIVE | `app/maia/ideas/` → `member_ideas`, `member_idea_blocks`, `member_idea_recognition_events`. MAIA reads an idea thread **only** on explicit "Ask MAIA" (`maia_reflection` blocks writable only by that route) — never ambient. Decision-recognition behind a member-ID allowlist flag. Sanctuary check is a stub — §6.2. |
| **Decisions** | LIVE | `app/studio/decisions/` → `studio_decisions`, practitioner-scoped (401 without `getCurrentPractitioner`), AI council/mentor consult against field signals. Available personally via the Personal Portal lever (§3.3). |
| **Changes** | LIVE | `app/studio/changes/` → `studio_changes` + `change_iterations` + `change_experiences` + `change_experiments`; ownership `practitioner_id OR member_id` (CHECK constraint) — the schema itself admits personal use. |
| **Reflections** | LIVE ×3 (one name, three surfaces) | `app/dashboard/reflections` (journal/anchor), `app/oracle/reflections` (divination), `app/labtools/reflections` (capsule browser). Unrelated implementations sharing a name — Codex must not present them as one feature. |
| **Shadow Work** | **HONESTY-GATED** (as of `a61d6d1c1`) | Was worse than STUB: the page at freeze rendered **fabricated per-member data** (invented integration percentages and last-engaged dates) over no data source — it never called any API. Converted to an honest threshold per the Comms doctrine; the flow-serving API (`app/api/consciousness/shadow-work`, persists nothing) remains, sole other caller `ShadowWorkGuide.tsx`. §6.4. |

### 2.3 Recognition (member-declared, never synthesized)

| Surface | Stamp | Evidence |
|---|---|---|
| **Keeps / Kept** | LIVE | `app/maia/keep-capture/`, `lib/psyche/{keep-governor,conversational-keep}.ts`, `lib/library/keepIntent.ts` → `member_memory_atoms` + `member_keep_preferences`. **Two independent consent axes**: usage-authority ladder defaulting `only_when_i_ask` (MAIA never guidance-authoritative by default) and `return_preference` (`member_pulled` / `contextual_doorway` / `ritual_review_opt_in`) controlling surfacing. Ladder placement confirmed: Recognition-layer *gesture* over Reflection-layer substrate — the member's declaring act creates the atom's standing. |
| **Daily Anchor** | LIVE, structurally consent-gated | `member_daily_anchors.surface_preference` — the SQL predicate **is** the consent source (`loadRecentAnchors.ts:59-69`); `MAIA_ANCHOR_CONTEXT_ENABLED` kill-switch only; ownership-scoped writes; proven by refusal test **R08**. |
| **Breakthrough marking** | Wired/reachable (per session anchor) | Atoms `is_breakthrough` + route; stage-language discipline in force: not Live until a member-marked atom surfaces under authenticated load. |

### 2.4 Living Field

| Surface | Stamp | Evidence |
|---|---|---|
| **Living Field** | LIVE | `app/maia/living-field/` → `personal_living_fields` + `personal_living_field_versions` + `personal_living_field_sources` + `living_field_participant_consents`. Versioned, consent-tracked sources; sacred-register atoms structurally excluded from computation. |
| **Vision Studio (tab=field)** | LIVE | Spiralogic Interview — ephemeral composition ("does NOT persist anything"), phase-tagged field-note crossings; practitioner visibility defaults FALSE. |

**Shared substrate**: `member_field_note_threads` / `member_field_note_events` (append-only ledger, migrations `20260626000001` ff.) underlies What Now?, Field Lab, and Vision Studio — **one consent architecture, three doorways**.

### 2.5 Developmental Ecology

| Surface | Stamp | Evidence |
|---|---|---|
| **Co-Lab** | LIVE (attention layer partially) | `app/team/` + `lib/team/` → `team_dm_threads/_members/_messages`, `colab_channels`, `team_attention_items`. DMs/channels live, jurisdiction structural (`team_id` membership). Attention layer: **built with one live materializer** (`colab_message` via `ChannelService.ts:416`); mention/request/assignment feeders named-but-HELD. Human-created-only [S1], closure-only status. |
| **Commons / Circles** | LIVE | `app/commons/` → `commons_contributions`, `contribution_levels` (curator ≥2 gates review); `circles`, `circle_memberships` (member/helper/facilitator + `consent_mode`), `circle_invites`, `circle_inquiries`. Full API family exists at `app/api/circles/` incl. `[circleId]/{consent,invite,feed,pulse,inquiries}` (verified directly this session — an earlier sweep missed it). |
| **"Soul Comms"** | **NOT FOUND as named** | No such surface. Studio Comms (`app/studio/comms`) is HONESTY-GATED — "truthful empty state rather than fabricated history"; only live capability outbound SMS, content unpersisted by sovereignty choice. Real messaging is Co-Lab. The Codex should retire the "Soul Comms" name or mark it Vision. |
| **Relationship spaces / member portal** | LIVE (read) | `app/api/member/portal` reads the member's `relationship_spaces` + practitioner snapshots. |

### 2.6 The "infinite fields" capacity — the census's central stamp

**Designed/Vision, not Live.** `lib/masters/registry.ts:14-18` is a hardcoded in-memory array of three master fields (Jondi, Kelly, Nathan); a new field requires a developer authoring a file. No dynamic registration, no per-author DB row, no self-serve authoring path. What Now? **proved the pattern** (a complete field embodiment, live, in its own namespace); Vision Studio's Practice Field Editor and the practitioner Practice Field (§3.2) are the authoring surface taking shape; the Program Catalog spec is AUTHORIZED. Honest Codex framing: *the capacity What Now? demonstrated, generalization designed.*

---

## 3. The Practitioner World

### 3.1 Studio
- **Live, Postgres-backed, practitioner-scoped**: clients, sessions (+ voice notes, briefings), calendar, scheduling, Decisions, Changes. Every query bound to `practitioner_id`; 401 without `getCurrentPractitioner`.
- **Live-read**: caseload (action buttons are TODO stubs), groups, encounters.
- **Presentation-only**: review (hardcoded), metrics (no API calls).
- **Honesty-gated**: comms (§2.5).
- Studio home is explicitly "presentation over endpoints that already exist — no new backend."

### 3.2 Practitioner routes & Practice Field
- dashboard + containers LIVE (`/api/practitioner/practices`, tasks PATCH); **agreements SCAFFOLD** (placeholder data, "in production this would fetch…"); **billing MOCK**.
- **Practice Field** LIVE and status-gated: one per member (`practice_fields`, `ON DELETE RESTRICT`); AI draft assist is candidate-only, never auto-saved ("mirror not portrait"); **invites blocked (422) until the field is LIVE** — a practitioner cannot invite into an unauthored field.

### 3.3 Personal Portal
LIVE. `POST /api/studio/personal/enter` flips `studio_mode='personal'` or creates a minimal practitioner row (`portal_type='personal'`, modules `[decisions, changes, maia, vault, threshold, tools]`) — the member gets the same Studio primitives, self-directed. `lib/portal/tier.ts` is an explicit interim adapter (free|personal|pro → explorer|companion|practitioner), floor = explorer, no billing writes.

### 3.4 Jurisdiction finding
**No `requireFounder` gate exists anywhere in this cluster.** Authority is row-scoping all the way down — `practitioner_id`, `team_id`, membership rows, status gates. Authority lives in the schema, not in role checks. (Grade-A structural, in Refusal Registry vocabulary.)

---

## 4. The Outward Organs

### 4.1 Soul Portraits
- **LIVE (presentation, hand-authored)**: 10 individually whitelisted portraits (`lib/soulPortrait/portraits/*.ts`), noindex, consent-held; Mentor on only for Augusten (Path A). Theme family (classic + 5 elements) is schema-level presentation only — "theme never alters text/structure." Year Ahead sections and the 16-chapter literary *renderer* live, consuming hand-authored content.
- **BRANCH-ONLY**: the entire generation pipeline (`generatePortrait`, `generateYearAhead`, portrait store) — commits `f00c2a307`, `6d8166b5d`, `a2ac339e4` are **not ancestors of this ref**. Generator posture: "do not build yet" (Kelly).
- **SPEC-ONLY**: Path B (`SOUL_PORTRAIT_PATH_B_SPEC.md`, "awaiting go, no code"); its migrations exist only in worktrees.
- Standing flag inherited from the record: "living Ch X" framing violates the Mirror Invariant — member-pulled only.

### 4.2 Soullab Press
- **Book Studio** LIVE but founder-gated on every room (`requireFounder` — the one place it appears); docx import, EPUB/PDF render.
- **Manuscript render engine** (`lib/manuscript/`) — "one text, many formats."
- Flagship: *Elemental Alchemy*. Editorial canon: Doorway Method.
- **LLC + Library of Congress registration: ATTESTED** (Kelly, 2026-07-11) — external standing, not repo-verifiable; it changes Press's register from project to imprint.

### 4.3 Developmental Publishing System
CANDIDATE v0.2 (`docs/pitch/DEVELOPMENTAL_PUBLISHING_SYSTEM_CANDIDATE.md`), explicitly not canon. Thesis: a "third practice" — development happens while authorship never moves. Tier 3 (reflective editorial intelligence) FROZEN under the Mirror Invariant.

### 4.4 Outward framing
`docs/pitch/` (28 files) governed by the Claim Discipline; CASE_STUDY_LIBRARY v2 stamps every story Layer/CoG/Failure-Test. Public marketing landings live per the committed record (2026-07-10, claim-audited).

**Cross-cutting posture, quotable**: *live surfaces are static, hand-authored, or founder-gated; all generation and person-level synthesis is deliberately withheld pending explicit go.*

---

## 5. The Held / Planned / Probable Space

### Cat 1 — Preserved directions (held, not authorized)
Eight in `RELATIONAL_INTELLIGENCE_DIRECTIONS_2026-05-24.md`: Corrigible Pattern Attunement · Temporal Process Mapping · Member-Corrected Intelligence · Multi-Layer Memory Ecology · Tact Calibration (least-replaceable; sketched first when an arc opens) · Developmental Non-Closure · Sacred Mirror Infrastructure · Structural Humility (the convergence target).
**Seven** (not ten — see §6.7) in `PARTICIPATION_WITHOUT_FORECLOSURE_2026-05-24.md` §10: tact runtime · member-facing reshapeability · provisional-framing visibility · member-facing braiding · full-depth provenance recall · member-facing drift visibility · longitudinal pattern attunement.
Plus: Studio Steward model, Authority-Accrues-Through-Contact (self-retiring governance), RFI/UFI (anti-drift examples), practitioner spectrum & ecology, Portrait-as-Journey-lens, and the rest of the held register in memory.

### Cat 2 — Canonical primitives (interface targets, no runtime)
FIS Field State Primitive (6 dimensions; "does NOT authorize implementation") · Pattern Primitive (matching non-authorization clause).

### Cat 3/4 — Built substrate / dormant services (all zero live callers; none touch the live turn path)
| Service | LOC | Note |
|---|---|---|
| MAIAMemoryArchitecture | 2,351 | Observe only |
| QuantumFieldMemory | 810 | 0 persistence; rename+gut queued |
| ConsciousnessEvolutionService | 448 | rename → DevelopmentalTrajectoryService |
| CoherenceFieldService | 403 | dormant + doctrinally frozen |
| MorphicPatternService | 402 | Later — consent+aggregation gate |
| SomaticMemoryService | 329 | Later — explicit input source |
| AchievementService | 319 | reframe as practice |
| EpisodicMemoryService | 283 | **"Wire 1st" when freeze lifts** |

### Cat 5 — Frozen plans (explicit does-not-authorize; Kelly directive is the only lift)
- `COHERENCE_FIELD_WIRE_UP_SPEC` §0.C — observation-phase freeze ACTIVE; four lift conditions + explicit declaration; no leapfrog.
- `MEMORY_EXPANSION_PLAN` — 9-layer map: Meta **observed-runtime**; Conversational Phase 2 deployed (backend); Episodic dormant/Wire-1st; Semantic/Developmental/Relational/Symbolic/Somatic held; Field/Coherence most-deferred.
- Conversational Phase 2 spec — implemented backend-only; Phase 3 (semantic-vector ranking, synthesis, member UI) not authorized.
- Co-Lab attention feeders beyond `colab_message` — named so as not to be "silently smuggled into MVP."

### Candidates (exploration only, not canon)
Developmental Publishing System · Scope-of-Practice & Crisis Readiness · Circle Administrator role · Shared Work Configuration (Book Club v1) · Practitioner-Knowledge Provenance Gate B′ · Developmental Gates/Ecology (5-stage) · AIN OS Regulatory Capacity · Continuity-Contextuality Pattern (Context Assembly contract) · Attentive Stewardship · Authority Floor · Sovereign Placement.

### Vision tier
Neuropod portable field companion (MVP scope doc; hardware) · Member-Sovereign Horizon (MAIA on home hardware; sovereign-cloud value prop + full local deployment architecture) · Living Studio (orientation paper, "NOT to sell") · open-source / Nostr distributed-memory strategy · Origins/Vision spine (Elemental Alchemy + 12-phase Spiralogic).

---

## 6. Constitutional Audit List (inputs to the member-arc trace, session 3)

1. **CLOSED pre-ratification @ `a61d6d1c1`** — journal text auto-bridged into episodic memory + capsules on save with no consent flag (audio was gated; text was not — a live, unconsented write path on the platform's most intimate surface). Now default-deny behind `storage_consent.journalMemoryBridge`, mirroring the audio consent surface. **Open remainder: the member-facing toggle in `AccountSettings.tsx` (which already carries the storage-consent section) must ship before this deploys — gate + UI together, per the anchor-gate precedent. Until the toggle exists, the bridge is off for all members.** Session 3 verifies rather than discovers.
2. **Ideas' Sanctuary check is a placeholder** returning `false` — narrow exposure (idea reads fire only on explicit "Ask MAIA", so the missing check already sits behind a consent gesture). Open.
3. **`shouldPersistKeep` guard is unwired substrate** — defined + tested in `sanctuaryGuards.ts`, but the `app/api/library/keep` route it protects does not exist; zero exposure. Open.
4. **CLOSED pre-ratification @ `a61d6d1c1`** — Shadow Work rendered fabricated per-member data (invented integration levels and dates, no data source; the page never called any API). Converted to an honest threshold per the Comms doctrine: nothing recorded, nothing implied, doorway to the journal.
5. **"Infinite fields" must be claimed as Designed** — hardcoded 3-entry registry (§2.6).
6. Studio caseload TODO action stubs; practitioner agreements/billing scaffold — fine as-is, but the Codex must not stamp them Live.
7. **Docs-reconciliation item**: Participation-Without-Foreclosure §10 holds **7** held directions; the memory/record says 10. Reconcile in session 2.
8. Known from record: `WISDOM_IS_RECOVERED.md` cited by an earlier spec does not exist in the repo.
9. Pattern-level: **Sanctuary enforcement is strong on the main conversation spine, patchy on peripheral write paths** (items 1–3 are one species).
10. **Recorded absence: no age or minor-related gating exists anywhere at this ref.** The census surfaced consent gates, tier gates, tester gates, jurisdiction row-scoping, and one founder gate — no age gate, no minor-mode, no guardian-consent surface. If teen environments are in the platform's intended scope, this is a constitutional question, not a feature gap: a consent architecture calibrated for adults does not automatically transfer to minors (Invariant 14's ask-don't-assume applies to developmental stage as much as culture). Until ruled on, teen surfaces stamp **Vision-tier, constitutionally open** — the Codex must not imply readiness.

---

## 7. What this census did NOT verify

- **Production runtime state** — all stamps are repo-level at `fcef6ff4a`. Cat 6 runtime claims (corpus callosum rows, anchor gate live in prod, etc.) are carried from the committed session record, not re-witnessed tonight.
- `MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md` referenced as the authoritative service inventory but not re-read — follow-up in session 2.
- DEEP-tier addenda divergence carried from the record, not re-traced.
- The member-arc data trace (session 3) and the docs-tree reconciliation (session 2) remain to run; this document is session 1's deliverable only.
