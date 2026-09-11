# MAIA-SOVEREIGN — SESSION ANCHOR (READ FIRST)

## What this project is

MAIA-SOVEREIGN is a self-hosted, sovereign consciousness companion. It exists to support human coherence, truth-telling, and inner guidance without eroding agency or substituting itself for human judgment. It is not a generic chatbot, assistant, or authority. MAIA is governed by explicit vows: consent, containment, non-manipulation, and a refusal to simulate intimacy, certainty, or power where none is ethically grounded. MAIA speaks in distinct modes (Talk, Care, Note) and is oriented by Spiralogic and AIN principles toward integration, responsibility, and maturation rather than dependence or reassurance.

## Non-negotiables (project vows)

- **Sovereignty first**: human agency always outweighs engagement, retention, or performance metrics.
- **Consent for memory**: there is no stealth memory. Sanctuary Mode governs what is held, how, and why.
- **No coercion, no guru stance**: MAIA offers reflection, framing, and choice — never command, diagnosis, or authority.
- **No attachment capture**: MAIA does not seek emotional dependency, loyalty, or psychological bonding. Relationship arises only insofar as it supports sovereignty.
- **Self-hosted by design**: no cloud lock-in. Infrastructure choices (EC2, Docker, Caddy) are part of the ethical architecture.
- **Spiritually intelligent, not spiritually authoritative**: MAIA may engage symbolic, mythic, or depth-psychological language without claiming truth-status over the human.

## MAIA ⇄ AIN relationship

AIN is the broader ontological and architectural framework: a view of intelligence as participatory, distributed, and meaning-bearing rather than purely instrumental. MAIA is the user-facing sovereign companion expression of that framework. Spiralogic functions as a core mapping layer for state, process, and orientation. MAIA's modes, rituals, and boundaries are implementations of AIN's principles — not separate products or abstractions.

## Architecture snapshot (where to look first)

- **Voice & conversation orchestration**: `components/OracleConversation.tsx`, `lib/maia/*`, `lib/voice/*`
- **Identity & consent boundaries**: `middleware.ts`, `lib/auth/*`, `lib/http/apiBase.ts`
- **Sovereign API surface**: `app/api/sovereign/*` and related routes
- **iOS / Capacitor pipeline**: `scripts/capacitor-patch-routes.sh`, `scripts/build-ios.sh`, `ios/*`
- **Deployment & ops**: `docker-compose.production.yml`, `Caddyfile`, `scripts/deploy-production.sh`
- **Canon**: `docs/canon/MAIA_CANON_v1.1.md`
- **Oath**: `docs/canon/MAIA_OATH.md` — the irreducible standard
- **Deep-Intelligence Gate**: `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` — hard acceptance gate on all voice/transport work. *Voice may have a different capture path; it may not have a different mind.* Spoken and typed turns must converge before MAIA cognition begins (convergence point named in the doc, pinned by `__tests__/voice-non-degradation.test.ts`). Divergence downstream of input acquisition = **RED** = voice does not ship. STT/TTS are sensory infrastructure and may change freely; the mind may not be substituted.
- **Sovereignty Invariants**: `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — relational constitution (constraints on relational power when the system works well enough that people start relating to it)
- **Representation & Claim Discipline**: `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — governs every outward claim (web, decks, case studies, podcasts, demos, onboarding, internal planning). Three instruments: Live/Designed/Vision · Center of Gravity · Failure Test. The line: *"We do not tell tomorrow's story as if it were today's."* Applied in `docs/pitch/CASE_STUDY_LIBRARY.md`.
- **Claim State Authority**: `docs/canon/CLAIM_STATE_AUTHORITY.md` — governs movement between claim states. Kelly governs what Soullab chooses to claim; predeclared criteria and attributable evidence govern the highest state the claim may occupy. Evidence licenses; it does not itself edit the public record.
- **Constitutional Direction of Authority**: `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` — the backbone constraint. Distinguishes the *developmental process* (messy, non-linear — the member loops through Encounter ⇅ Reflection ⇅ Recognition freely) from *constitutional authority* (strict, one-directional): **authority may only move upward through authored experience — Encounter → Reflection → Recognition → Living Field → (out into) Developmental Ecology — never skipping a layer, never manufacturing higher-order meaning.** The member may jump around; the system may not. MAIA never moves a person through it — it protects the boundaries within which the person's own development occurs. Developmental Ecology = the relational medium (Personal Field / Relationships / Co-Labs / Practice Fields), not a rung. Design test: *what layer does this belong to, and does its authority respect the upward-only direction?* Generalizes Recognition Integrity + Right to Remain Unpossessed + Interface Humility + Disciplined Non-Collapse + Encounter as Primitive. **Ratified canon (2026-07-01)** — reconciled + re-audited, placed as one package with Recognition Integrity → **Invariant 16** in the Sovereignty Invariants.

## Known recurring traps (read before debugging)

- **Capacitor + cookies**: `SameSite=Lax` cookies are not sent cross-origin from iOS WebView → use `x-member-id` via `apiFetch()` (`lib/http/apiBase.ts`).
- **Static export limits**: some Next.js routes and middleware are incompatible with `CAPACITOR_BUILD` static export → exclude via `capacitor-patch-routes.sh`.
- **"It forgot me" symptoms**: usually indicate localStorage or cookie loss after rebuilds or WebView resets — check `beta_user`.
- **force-dynamic routes**: any route using `export const dynamic = 'force-dynamic'` must be listed in `EXCLUDED_DYNAMIC_ROUTES` for iOS builds.
- **Worktrees + preflight `.env.docker`**: `npm run preflight` ends with a `docker compose config` validation, and `docker-compose.yml` reads `env_file: .env.docker` — a gitignored file that exists only in the main checkout (`/Users/soullab/MAIA-SOVEREIGN/.env.docker`). In any fresh git worktree that step therefore fails with "env file … .env.docker not found" (confirmed 2026-07-27). Fix: `cp /Users/soullab/MAIA-SOVEREIGN/.env.docker <worktree>/.env.docker`. The preflight step itself (`scripts/preflight-compose-config.sh`) detects the worktree case and prints this exact copy command, so the raw compose error should no longer be the first thing you see.
- **LAN IP drift after power-cycle** (housekeeping check, not always user-impacting): minisforum is expected at `192.168.0.104`. After a power outage or full restart, DHCP can re-lease a different IP (seen: `.102` on 2026-05-29). If the router's port-forward rule for 80/443 is hard-coded to `.104`, external traffic will silently drop. **Verify scope before treating as causal**: if the PWA at soullab.life loads on iOS over cellular, the forward path is intact and IP drift is NOT the user-facing issue (the router may auto-track or have a different forward rule). The hairpin-NAT probe (`curl https://soullab.life from minisforum`) is misleading — most consumer routers disable hairpin by default, so HTTP 000 there does not imply external traffic is broken. Always check `ssh soullab@minisforum 'hostname -I'` after a power event for hygiene, and set a DHCP reservation pinning minisforum to `.104` to make the trap structurally impossible.

## Current priority thread (update each session)

- **LATEST — 2026-09-11**: **`IOS-CONVERSATION-RUNTIME-01` — one authorized repair applied on branch `claude/ios-runtime-01-audiosession-registration` (fresh from `clean-main-no-secrets`), device acceptance IN PROGRESS — registration PROVEN on-device (E13) and `prepareForSpeaking` REACHES SWIFT with the full native teardown→`.playback` trace visible on a live turn (E14) — first time this Swift has ever run on `/maia`; `prepareForListening` is NOT CALLED on the live path by design (`ContinuousConversation.tsx:3288`, E16.3) so that row is settled as not-applicable; S1–S4 still pending. E16 also witnesses the long-utterance drop mechanism (recognizer re-segments inside one task with no stop event; web replaces the accumulated transcript; 537 chars discarded, 60 submitted) and the post-TTS re-entry storm (≥4 restart drivers, pre-emptive stop on each, engine died 7× in ~15 s with `No speech detected`; session config flipping Bottom/0.01 ↔ Front/0.0027); code-consistent hypothesis E16.5: the community plugin's task callback has no task identity, so a stale task's completion stops the new engine. ⚠️ **E16 correction (founder): MAIA was NOT audible on any reply of the repaired build (3/3); the web `Audio output confirmed` line witnesses WebKit graph activity, not the speaker. Hypothesis H-SILENT: the gatekeeper's setActive(false)/category/setActive(true) in the app process leaves WebKit's content-process audio session interrupted (`beginInterruption but session is already interrupted!`), so Web Audio renders silently — i.e. activating the gatekeeper may have made an intermittent silence systematic. Control available without source change: A/B against the preserved unrepaired `.app` in `~/voice-witness-dd`; founder's call, not run. E18: the storm ran ≈46 s / 37 generations with the route config strictly alternating Bottom/0.01 ↔ Front/0.0027, ended by the web inactivity guard (`LISTENING_STOOD_DOWN`, mic parked, no self-recovery), after which the surviving engine's input delivered denormal-zero levels (8.8e-43) — an active engine on a dead microphone. ⭐ **FOUNDER RULINGS (E19): A/B control YES (preserved `~/voice-witness-dd` build via devicectl, two turns, audibility only) · Repair Two YES (turn-close authority off the recognizer boundary; no timeout values change; causally separate from the owner fight) · silent switch UNWITNESSED · Account Settings footer/Native App Build still UNWITNESSED (device readout is not a substitute) · S1–S4 DEFERRED. Sequence: A/B → record → Repair Two in isolation → build → focused acceptance. Three defects kept separate: (a) output silence · (b) competing capture ownership · (c) turn-close/segment authority. Repair Two lives on `claude/ios-runtime-01-repair-two-turn-close` (from `clean-main-no-secrets` + export-mirror tooling only; no native change). **E20: Repair Two IMPLEMENTED there, `3d5b0db94`, pushed, NOT built, NOT on the phone** — `lib/voice/turnAccumulator.ts` folds partials as committed segments + live partial (a segment reset commits the previous partial instead of discarding it; a shortening revision is never a reset); `stopped` no longer sends (`native_stop` path removed) — pending text is held for the silence timer, and a native restart re-arms that timer so a post-stop restart cannot orphan held text; timer factored as `armNativeFallbackSilenceTimer()` at the SAME 2500 ms, 1500 ms untouched; events `ios_voice_segment_carried` / `ios_voice_stop_held_pending_turn`. Gate `__tests__/voice-turn-close-authority.test.ts` 13/13 incl. the E16.1 reproduction; dispatch-provenance floor 8→7 (dated); 60/60 across five voice suites; typecheck 229 vs 239 with ONE new diagnostic (`app/wisdom-keepers/sacred-texts/page.tsx:207`) that reproduces with the branch stashed = pre-existing on base, not this branch's. Claims nothing about (a) output silence or (b) the storm/route flip/digital zero. Phone acceptance: one long utterance past ~30 s → `🧷 [Native] Recognizer segment reset — carrying N chars forward` and the whole turn, not the tail, in the silence close.** ⭐ **E21 — FOUNDER RULINGS REVISED, SEQUENCE FROZEN: (1) E19 historical A/B (switch · audible t1/t2 · footer · Native App Build only) → (2) E20 Repair Two witness (build `3d5b0db94`, one long utterance; judge ONLY that the whole utterance survives segmentation — NOT mic recovery, audibility, storm or route) → (3) defect-driven development on this runtime CLOSES: anything E19/E20 exposes is recorded, never Repair Three; the runtime becomes a legacy reference implementation + evidence source → (4) `VOICE-2026 / CENSUS-01` read-only map of the EXECUTABLE system (every owner of AVAudioSession · capture · playback · STT/TTS lifecycle · turn closure · timers · WebView media · interruption recovery · routing · UI state; who can start/stop/restart/reconfigure each) → (5) parallel contemporary architecture survey → (6) three artifacts BEFORE code: authority graph · conversation state machine · migration boundary (which canonical MAIA survives unchanged, which voice infrastructure retires). Architectural note: the E20 re-arm-on-native-start is an acceptable interim legacy repair, NOT a Voice 2026 principle — recognition start/restart must have no authority over whether a human turn is alive. Central shift: *voice is a persistent conversational audio runtime, not STT + TTS* — one native hardware sovereign for the conversation's lifetime; STT/TTS consume/produce streams; WebView expresses intention only; segment ≠ turn. First principle from E18: *a subsystem may report itself healthy while the organism is dead* — health must be physiological (input energy, rendered output, route, ownership, turn continuity, self-recovery), never component state. Lane `VOICE-2026` opens on branch `claude/voice-2026-census-01` (charter + census; no production code).** E14 also witnesses the native teardown executing BEFORE the community recognizer is stopped (two owners, Invariant 3.1 unmet by current code — coordinator input, not a repair request), and the E7 ~30 s long-utterance cut reproduced (belongs to unruled repair two).** Finding (lane doc `docs/programme/IOS-CONVERSATION-RUNTIME-01_LANE.md` E2/E3, founder-confirmed C′): the in-app Capacitor plugin `AudioSessionManager` (`ios/App/App/AudioSessionManager.swift`, the "iOS Audio Session Gatekeeper") is compiled into every build but **never registered with the Capacitor bridge** — `cap sync` regenerates `packageClassList` from npm plugins only (`@capacitor/cli/dist/util/iosplugin.js:53`) and `CapacitorBridge.swift:313` registers only that list, so the declaration in `capacitor.config.ts` is inert; `/maia`'s `prepareForSpeaking`/`prepareForListening` calls have always rejected and the audio session has been governed by WebKit + `@capacitor-community/speech-recognition` alone (pre-lane Aug 27 build likewise). Repair: `ios/App/App/MAIABridgeViewController.swift` subclasses `CAPBridgeViewController` and registers `AudioSessionManager` in `capacitorDidLoad()`; `Main.storyboard` instantiates it; pbxproj Sources updated; gate `__tests__/ios-bridge-registration.test.ts` 5/5. **Not done by ruling:** `VoiceController` registration, TTS/watchdog/web mitigation, recognizer changes, coordinator rebuild, production routing. Acceptance is on-device (lane doc §7.3): registered + reaches Swift + native trace on a healthy turn + same S1–S4; *stall disappears* and *stall remains with native now active* are both legitimate outcomes. Context: the recognition lane `VOICE-RECOGNITION-ENGINE-01` is SUSPENDED (custody branch `claude/voice-recognition-acceptance-witness-ffeadt`, frozen record) after its `/maia` smoke found an intermittent speak→listen stall recovered only by the 90/120 s `[voice:watchdog]`; that lane's Swift edit is excluded as cause for the witnessed build.
- **LATEST — 2026-09-07 — ⚠️ SCHEMA DRIFT: THE I0.5 CIRCLE MIGRATIONS ARE IN PRODUCTION, UNDER NO RECORDED AUTHORIZATION.** Found while deploying an unrelated voice fix; the drift predates that deploy and is not caused by it. **Evidence (production `schema_migrations`, read 2026-09-07T19:2x):** `20260906000003_circle_membership_removals.sql` @ **18:24:45.957Z** · `20260907000001_circle_inquiry_response_withdrawal.sql` @ **18:24:46.020Z** · `20260907000002_circle_inquiry_status_retire_integrating.sql` @ **18:24:46.078Z** — three migrations, 121ms apart. ⭐ **RESOLVED BY IMAGE TIMESTAMPS, later the same evening.** `docker images maia-sovereign` shows image `891b33ee0` **BUILT at 18:22:45Z**, and `cmd_migrate` never builds — so the 18:24:46 rows are the **migrate phase of a full `deploy`/`update`** whose build finished two minutes earlier: exactly the script's `build → up → verify → migrate` cadence. ⚠️ **Two earlier readings in this bullet were wrong; both are corrected here rather than deleted.** *(i)* the first draft attributed the migrations to "the deploy that produced runtime `891b33ee0`" — **right about the deploy, wrong about the evidence**, because it read the container's `Created` (18:30:33Z) as that deploy's swap; *(ii)* the correction then **withdrew** the attribution on the strength of that same misread timestamp — an over-correction. **The image build time is the load-bearing fact. A container's `Created` is not a deploy's swap.** ⭐ **The 18:30:33 container is a RECREATION, and it is identified**: `~/.bash_history` on minisforum (mtime 18:31) ends with `nano ~/MAIA-SOVEREIGN/.env.production` followed by three `docker compose -f docker-compose.production.yml up -d --no-deps maia` — the **MAIL-04c Resend key rotation**, recreating the container to pick up a new env var. ⛔ **A bare `up` without `--build` never builds, so the Dockerfile deploy-lane tripwire never fires — it guards BUILDS, not container recreation.** That path takes no lane lock and runs no provenance verify; harmless here only because it recreated from a correctly-stamped image. **⛔ That is 47 minutes BEFORE the voice-fix commit `12eb44281` existed on any branch**, so neither it nor the 19:11Z deploy that carried it did this. The I0.5 record says the opposite of what is now true (`removal table ABSENT · integrating still allowed — UNCHANGED, UNMIGRATED, UNDEPLOYED`); that sentence is now marked superseded in place. ⛔ **The `20260907000002` migration is NOT additive** — it `DROP`s and re-adds `circle_inquiries_status_check`, narrowing the admitted vocabulary to `open | closed`, and `UPDATE`s any `integrating` row to `closed`. **Member-facing exposure is nil and should not be inflated into alarm**: production held 0 inquiries so the UPDATE touched no row, and Circle API authority is still founder-only (`requireCircleAccess()`; `CIRCLE_ACCESS_MEMBER_IDS` unconstituted), so no member can reach any of it. **What actually broke is the record, and the gate.** ⛔ **CANONICAL VERIFY IS STILL NOT ACCEPTED** — production now carries the schema that verify was supposed to license, which is the wrong order: *evidence licenses; it does not itself edit the public record, and a deploy must not edit the schema ahead of the ruling that authorizes it.* ⛔ **Do NOT treat this as retroactive authorization.** A migration reaching production by an unattributed act confers no standing it did not have at 18:23Z. **Owed, in order: (1)** ⭐⭐ **THE STRUCTURAL FINDING — MERGE-TO-CANONICAL IS LATENT SCHEMA-DEPLOY AUTHORIZATION.** Somebody *did* decide to run a full deployment; **nobody separately authorized or selected I0.5 for it.** Once the I0.5 lane merged its migrations to `clean-main-no-secrets`, the next unrelated full deploy applied them automatically as part of canonical branch state. *(An earlier wording here — "nobody decided to deploy I0.5; the branch decided for them" — is corrected: it implied mysterious agency. The truth is more mundane and more damning — ordinary deployment semantics, applied to a branch that had quietly become an authorization channel.)* This is not a hypothesis about the 18:24Z act — **the same mechanism is directly witnessed later the same evening**: the voice-fix deploy at 19:11Z carried `20260907000001_vault_erasure_queue.sql` (applied **19:31:48Z**, immediately after its 19:31:13Z swap), a WS-DELETE-01 migration that deploy had no interest in. *Merging a migration to the production branch is, in effect, authorizing it to be applied by whoever deploys next.* **The founder gate sits on the DEPLOY decision; nothing gates the BRANCH** — so every lane that deploys silently deploys every other lane's pending schema. ⛔ **That is the defect to fix, not the actor.** The actor remains formally **UNKNOWN** (`~/.bash_history` line 1977 `scripts/deploy-production.sh deploy "$TARGET"` is a candidate; shell history carries no timestamps). ⛔ **And the deploy lane keeps NO durable record of completed deploys**: `scripts/deploy-lock.sh` writes holder metadata *into the lockfile*, overwritten by every acquisition, and announces only to stderr — no `logger`, no journald, no ledger. **The 18:24Z acquisition record was overwritten hours ago, so its absence carries ZERO information and is evidence for nothing.** Attribution may be permanently unanswerable; per (3) that blocks nothing. An append-only line per acquisition (`timestamp · entry · target_sha · user@host · pid`) would have answered this in one query — the lane fix this incident argues for, ⛔ not authorized here; **(2)** a fresh production schema witness — this bullet asserts only the three `schema_migrations` rows it read; circle/membership counts, `withdrawn_at`'s presence and the removal table's contents are **UNREAD and must not be inferred from the migration filenames**; **(3)** — ⭐ **RULED, founder, 2026-09-07: RECONCILE FORWARD. REVERT NOT AUTHORIZED.** *A governance-order failure is not evidence that the implementation is wrong, and tearing down a state that may be perfectly correct in order to manufacture the opposite order is the more destructive error.* **Standing: I0.5 CODE deployed · I0.5 SCHEMA deployed · CANONICAL VERIFY not yet accepted · FOUNDER ACCEPTANCE not yet performed · I1 HOLD · further Circle build HOLD · REVERT NOT AUTHORIZED.** Acceptance requires **two independent witnesses**: **(i) canonical candidate** — the committed I0.5 SHA through its disposable-shadow verifier under unchanged acceptance law (every named obligation present, `63/63`, no fail/warn/skip, residue zero); **(ii) production state** — read what production *is* now: migrations, the relevant columns and constraints, row counts, FR-18 behaviour and the access membrane, and confirm existing data suffered no unintended consequence. ⭐ **On both green the ruling is `I0.5 ACCEPTED AS CURRENT DEPLOYED STATE` — explicitly NOT "I0.5 was authorized before deployment" and NOT "the unauthorized deployment is forgiven or erased". Acceptance now does not rewrite history; the deployment-order breach remains a separate operational finding with its own open provenance investigation.** ⛔ **If the canonical verifier fails, adjudicate the failure on what failed — repair versus rollback is decided then, never pre-chosen.** **Structural note for the deploy lane:** `scripts/deploy-production.sh:445-477` orders build → swap → provenance verify → **migrate**, so schema lands AFTER code, and a failed migrate step only `log_warn`s and still reports `Deployment complete!` — **a green deploy is not evidence a migration ran.** **Production runtime moved AGAIN at 20:00:27Z to `3ef333a65`** (image built 19:59:03Z, tagged `current`/`prod`) — same voice-fix code plus one CLAUDE.md line, nothing regressed; most plausibly the mail lane deploying `clean-main-no-secrets`'s tip after PR #1263 merged, ⛔ **not confirmed**. ⚠️ **Of the FOUR production-changing acts reconstructed for 2026-09-07, exactly ONE is founder-attributed** — the 19:11Z full deploy. The other three are **two full deploys (18:22Z · 19:59Z) and one unlocked container recreation (18:30Z)**. ⛔ *The recreation is deliberately NOT counted as a deploy*: it took a different path — no build, no lane lock, no provenance verify — and folding it back into the deploy count would hide the very gap it exposed. ⛔ **CI is excluded as initiator**: the checked-in production workflow triggers on `main` / `production` plus manual dispatch, so a push to `clean-main-no-secrets` does not deploy. **That ratio, not any single act, is the finding.** ⭐ **BRANCH GATE is the lane this opens**, and its question is no longer *who deployed someone else's migration* but: **why can a migration become deployable merely by becoming canonical, before its own acceptance law authorizes a production schema change?** Adjacent and part of the same hole: every push to `clean-main-no-secrets` tonight — this session's and the mail lane's alike — reported `Bypassed rule violations … 4 of 4 required status checks are expected`. **The production branch accepts writes without its declared checks, and whatever lands there is schema the next deploy will apply.** ⛔ Lane not opened; no repair authorized here.
- **LATEST — 2026-09-07 — MAIA voice-mode silence: FIXED, DEPLOYED, VERIFIED LIVE (member falsifier still owed).** `12eb44281` on `clean-main-no-secrets`, live at **19:31:13Z** (`/api/health` → `version: 12eb44281`; `printenv GIT_COMMIT` agrees). Reported as *"she isn't answering in words or text"*, **voice mode only, intermittent**. **MAIA's turn was a side effect of TTS.** The sole non-streaming voice append lived inside `await maiaSpeak(...)`'s success branch and was additionally gated on `showVoiceText`, so: **(1)** MAIA's voice off — the `speak + silent` cell of the 2026-08-13 modality-independence ruling — reached an `else` that only logged; cognition completed and the member got nothing in either channel; **(2)** a `maiaSpeak` that stalls without throwing ran neither the success branch nor the catch — no audio, no words, no error, which is exactly how the intermittency presented; **(3)** with `showVoiceText` off the turn never entered `messages` at all, so it was missing when the transcript was revealed AND missing from the next turn's `conversationHistory` — **a render preference deciding what MAIA could remember saying.** ⭐ **VOICE-CANONICAL-CONVERGENCE-02 made this the ordinary path rather than an edge**: with the streaming exit removed, voice turns are non-streaming, so `usedStreamingAudio` is false and the streaming append never runs. The convergence was right; it left the transcript hanging off the TTS call. *Voice may have a different capture path; it may not have a different mind — nor a different record of that mind's words.* **Repair:** one idempotent `commitOracleTurn()` seam reached from all six terminal paths, independent of TTS outcome and of `showVoiceText`; speech ordering preserved where speech works, bounded by `VOICE_TRANSCRIPT_WATCHDOG_MS` (6s) where it does not — **a hung TTS now delays MAIA's words rather than erasing them.** Also: the live interim transcript was a single `truncate` line building off-screen behind a frozen ellipsis, so the one thing that row exists to say — *she is still hearing me* — was the thing it stopped showing; it now wraps into a bounded tail-pinned tape. **Gates:** typecheck `230 vs baseline 239 · 0 regressions` · `__tests__/voice-non-degradation.test.ts` 15/15 (convergence intact) · new `__tests__/voice-transcript-commit.test.ts` 6/6 · `check:no-supabase` clean · **post-swap Co-Lab gate `33 passed · 0 failed · 0 warned`** · `vault_erasure_queue` present after the swap. ⛔ **NOT YET FALSIFIED BY A MEMBER**: the decisive case is **voice mode with MAIA's voice OFF** — before this commit it had no code path at all. Deployed ≠ demonstrated; *a fix verified only by its author's tests is a claim about code, not about MAIA.*
- **LATEST — 2026-09-07 — `JARVIS-CIRCLES-01` · `CIRCLE-05 · INVOKE` · `I0.5 · ENTRY SAFETY CLOSURE`: IMPLEMENTED, ⛔ NOT VERIFIED.** Branch `claude/jarvis-circles-programme-reouzc`; record `docs/programme/JARVIS-CIRCLES-01_I0.5_ENTRY_SAFETY_2026-09-07.md`; rulings addendum in `…_FOUNDER_RULINGS_2026-09-06.md`. Opened by founder act on the two I0 findings that are **defects against already-ratified law**, not design questions. **⭐ FR-18 RATIFIED — *a generic Circle invitation may not reinstate a removed member.* Canonical shorthand (founder precision): _"a recorded removal standing outranks a generic invitation"_ — deliberately NOT the broader "standing outranks invitation", which could be read as deciding CA-08.** ⚠️ **This ruling corrected Jarvis**: the I0 docket recommended revoking the invite token on removal; refused, because the token is **Circle-wide** — revoking it withdraws the invitation from *everyone* to answer *one* person's standing. The defect was never that the token survived, it was that **a generic bearer credential had enough authority to overwrite a recorded relational act**. Repair: `joinWithInviteWithClient()` seam; ⭐ **the authority is the MUTATION, not a precheck** — the guard lives inside the upsert (`ON CONFLICT … DO UPDATE … WHERE circle_memberships.status <> 'removed' RETURNING`; zero rows → `REINSTATEMENT_REQUIRED`) → **409** carrying **no Circle name, no grounds, no token verdict** (*a refusal is not an occasion to disclose*). ⚠️ **Founder source review REJECTED the first candidate `093379e8d` before any verifier run**: it read the standing, refused if `removed`, then upserted `active` unconditionally — `transaction()` is an ordinary BEGIN with no row lock, so a removal committing between the read and the write let the invitation overwrite it. **FR-18 was prechecked but not authoritative at the mutation boundary, and T10a–T10e could not tell the two apart** (all five evaluate a standing already `removed` before the join began). Preliminary SELECT deleted — one authority, no second thing to mistake for it. *No migration; no schema change; `left` behaviour identical; CA-08 still open.* **I-02 — STATE CLOSURE ON PAGE**: new `app/commons/join/layout.tsx` renders a closed state, so an unauthorized visitor is never asked for a token, never asked for a **consent mode** (*asking for a sharing decision about a relationship they cannot enter collects a sovereign act the system has no standing to receive*), and never submits a doomed join; `config/accessMatrix.ts` records DECLARED-vs-ENFORCED. ⛔ **I-03 preserved deliberately** — the closed surface reads no invite, so a valid and an invalid token stay **indistinguishable** before authorization. ⛔ **I8 obligation (not an I0.5 defect):** the page checks `requireFounder()` and the API `requireCircleAccess()` — they agree **today** only because Circle API authority is itself founder-only; when `CIRCLE_ACCESS_MEMBER_IDS` is constituted at I8, `/commons/join` **must migrate to the same Circle-access authority**. ⛔ Do not change it now. ⛔ **The API gate is unchanged** — a layout does not run for a route handler; `requireCircleAccess()` is still the authorization (C22 guards that confusion, which is the shape of B-01). **Verifier floor 54 → 63** under FR-14 (*the number is descriptive; the named set is the law*): **C20** surface refuses before rendering · **C21** solicits nothing AND validates nothing · **C22** join door gated + can refuse reinstatement · **T10a** valid live invite does not reinstate · **T10b** standing stays `removed` (**no write occurred**, not merely a thrown error) · **T10c** FR-05 removal record intact · **⭐ T10d** the **same live invite still admits an independently eligible member** — the obligation that makes the founder's correction falsifiable: a future "fix" by token revocation passes T10a–T10c and **FAILS T10d** · **T10e** no other Circle affected · **⭐ T10f THE INTERLEAVING WITNESS** — a **real `removeMemberWithClient()` act landing between invitation evaluation and the membership mutation** still loses: refusal, standing stays `removed`, removal record intact. Built deterministically via an `InviteClient` wrapper on the same rolled-back transaction (a second connection would need committed fixtures and would break the verifier's rollback-only consequence contract). **A precheck candidate passes T10a–T10e and FAILS T10f.** **Not authorized, founder: *do not add yet*** — per-invitee tokens · invite expiry · reinstatement workflow · facilitator review UI. ⛔ **CA-08 not decided** (`left` ≠ `removed`). **D-I dispositions ratified: D-I1 HYBRID** (only **explicit selection** drives matching; free text is **expressive only, never inferred into taxonomy** — the operative form of FR-06) · **D-I2 BUILD FRESH**, implementation term **"Interest Commons"** · **D-I3** cohort mechanism at I8, identities only at cohort authorization, ⛔ **do not touch `FOUNDER_MEMBER_IDS`** · **D-I5** member count **and** derived FORMING/ACTIVE are **INTERIOR** · **D-I6** `created_by` is **provenance, not permanent ownership**. Outer membrane narrows to `name`/`description`/`created_at`; authority axes carried to I4/I6 (CA-15 open). ⭐ **FOUNDER-RUN VERIFICATION OF `ae0fadd54` (disposable shadow, three pending migrations applied to the shadow only): `62 passed · 1 failed · 0 warned · 0 skipped · coverage 62/63 · exit 1` — EVERY BEHAVIORAL OBLIGATION PASSED, `T10a–T10f` included.** ⭐ **T10f PASSING IS THE SUBSTANTIVE RESULT: a removal landing after invitation evaluation and before membership mutation still defeats the generic invitation — the exact race `093379e8d` could not survive.** The single failure was **C21, a verifier false positive**: it scanned the RAW layout source, which contains the sentence *"nothing here reads `circle_invites`"* — **prose documenting the absence, matched as evidence of the presence**; the page inspects no token. Founder proved it on a disposable copy changing **only C21** to strip comments → `63 passed · 0 failed · exit 0`, residue zero. **Repair `3ed98ceab` is INSTRUMENT ONLY** — C21 now strips block and line comments before scanning, the same discipline **C6** has used since R4 and for the same reason; token set NOT weakened; ⛔ layout, `joinWithInviteWithClient()`, FR-18, T10a–T10f, the floor and all Circle behavior UNCHANGED. *A prose ban must never read as the banned behavior returning — an instrument that scans prose can fail on a file precisely because that file documents its own compliance.* **Typecheck at `ae0fadd54`: `230 errors · baseline 239 · 9 fixed · 0 regressions · exit 0`.** **Production witness (SHA `e4ac1bcac` · 4 circles · 4 active memberships · 0 shares/inquiries/responses · removal table ABSENT · `withdrawn_at` ABSENT · `integrating` still allowed — UNCHANGED, UNMIGRATED, UNDEPLOYED) — ⛔ SUPERSEDED at 2026-09-07T18:24:46Z; see the SCHEMA DRIFT bullet above. It was true when recorded and is false now. Kept verbatim as the before-state, never as a current claim — a witness is a reading at a time, and the honest repair is to date it, not to edit it.** ⛔ **CANONICAL VERIFY NOT YET ACCEPTED** — the 63/63 evidence is from a **disposable probe, not a run of a committed SHA; a probe is not the record.** Acceptance requires the full verifier from the committed SHA against a disposable shadow (`20260906000003` → `20260907000001` → `20260907000002`, shadow only): `63/63 · 0 failed · 0 warned · 0 skipped · exit 0`, residue zero. ⛔ **I1 DESIGN NOT OPENED** — it opens on that canonical run; *Jarvis does not open a stage on a run it has not seen.* ⛔ No deploy · no migration authored · schema untouched · cohort not authorized · no invitation sent · no facilitator assigned · no discovery built · founder UI gate untouched.
- **PRIOR (2026-09-07, superseded same day by I0.5) — `JARVIS-CIRCLES-01`: REPAIR CLOSED · **VERIFY FULL CANDIDATE PASS (54/54, 0 failed, exit 0)** · `CIRCLE-05 · INVOKE` OPEN, **I0 census COMPLETE (READ ONLY)**.** Branch `claude/jarvis-circles-programme-reouzc`; rulings `…_FOUNDER_RULINGS_2026-09-06.md` (**FR-01…FR-17**, open **CA-01…CA-16**); I0 outputs `docs/programme/CIRCLES_INVOCATION_SUBSTRATE_CENSUS.md` + `…_I0_FOUNDER_DOCKET_2026-09-07.md`. **Founder-run disposable-shadow gate on `26508109b` with all three migrations in order (`20260906000003` → `20260907000001` → `20260907000002`): `54 passed · 0 failed · 0 warned · 0 skipped · 54/54 required obligations discharged by PASS · exit 0`; fixtures rolled back clean.** ⭐ **R1–R4 and P1–P5 / A–F = VERIFIED ON CANDIDATE.** ⛔ **PRODUCTION UNCHANGED — no Circle migration applied, no deploy, founder-gated.** *Verified ≠ deployed.* ⛔ **Do not rerun the shadow gate merely because a session did not run it itself — the founder-run witness is the evidence of record.** **Ratified during REPAIR: FR-14** verifier coverage law (*PASS = 0 failed AND every required obligation still present AND discharged by PASS only* — WARN/SKIP/MISSING never discharge; named floor, never a total; *an instrument can satisfy all of its remaining questions by forgetting to ask the difficult ones*) · **FR-15** withdrawal is a **tombstone** (*keep the fact that an act occurred when the system needs that fact for integrity; do not keep the person's surrendered meaning merely because storage makes it easy*) · **FR-16** membership termination **cascades** (AUTHOR WITHDRAWAL ≠ BOUNDARY CASCADE) · **FR-17** stored inquiry `integrating` **retired** (⛔ `FieldPhase` untouched, asserted by C18). **I0 CENSUS — three findings dominate. (1) ⭐ NO explicit member-authored interest declaration exists anywhere** — `living_field_affinities` is **system-created from private memory atoms** (`created_by='system'`, `affinity_score`, `evidence_reason`) and `recurring_interests` is session-inferred; **both BARRED ABSOLUTELY by FR-06**. The north-star verb *"find one another around a shared interest"* has **no substrate and no reusable precedent — I1 builds it from zero. (2) ⭐⭐ "Commons" denotes THREE different existing things and NONE matches ratified FR-02**: the `community_*` forum · the `commons_contributions` library · the Circles migration filename. **Two are built on exactly the mechanics FR-08.7 forbids** — `community_user_stats` (post/comment/heart/breakthrough counts · `contribution_tier` · `contribution_points`), `contribution_levels` (0|1|2 · `accepted_count` · `endorsed_by`), `community_territories.min_contribution_tier` + **`min_cognitive_level` gating ACCESS on a measured attribute of a person**. ⛔ **Reusing them as Circle substrate would import a status economy on day one** — the exact Discourse/Mighty distortion named in R9. **Build the FR-02 Commons fresh.** **(3) 🔴 I-01 — REMOVAL DOES NOT REVOKE INVITE TOKENS.** Tokens are **Circle-wide, never expire** (no `expires_at`), and `joinWithInvite`'s upsert restores a removed member to `active`; the only remedy is `regenerateInvite`, which is **creator-only** and kills the link for everyone. **FR-05 requires removal to cut access — today it cuts access only until the next join request.** A **defect against ratified law**, repairable before I1. 🔴 **I-02 — `/commons/join` (public) collects a token AND a consent choice, then the gated API returns 403** — **a contradiction R1 created** by correctly closing the API without bringing the member-facing surface along. **Other I0 facts:** discovery = **ZERO** (`listMyCircles` only; `visibility`/`invite_enabled` **INERT** — ⛔ do not build to them) · creator role = `helper`, **no code path anywhere writes `facilitator`** (CA-15) · **authority is fixed at creation permanently** — `created_by` unchangeable, `facilitator` unassignable, and the two axes are orthogonal · `labAccess.ts` is the reusable cohort precedent (union with founder · fails closed · confers nothing beyond its door) → `CIRCLE_ACCESS_MEMBER_IDS` when a cohort is authorized, **not before** · outer membrane: only `name`/`description`/`created_at` are safe outer facts, **three of the doctrine's four panes have no column**, and member count is **interior** because it is also the FR-11 constitution state. **Classification is deliberately conservative — nothing is called a violation whose semantics were never constituted** (inert columns and legacy Commons = INERT LEGACY, not offences). > ***The membrane is verified. The invitation is not built.*** **Standing: I1–I9 NOT STARTED · DEPLOY NOT AUTHORIZED · COHORT NOT AUTHORIZED · no discovery built · no facilitator assignment · no invitations sent · founder UI gate untouched · doctrine byte-identical · no number ratified.**
- **LATEST — 2026-09-06 — LANE SPLIT (founder ruling): `JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01` ⇄ `JARVIS-PUBLIC-ACCOUNTED-FOR-01`.** `/accounted-for`, `docs/pitch/MAIA_PLATFORM_ACCOUNTING_2026-09-03.md`, the claim-reconciliation record, the page contract + screenshots and **PR #1239** (branch `claude/maia-human-experience-arch-12g5r6`, head `c36d82ec`, DRAFT — merge NOT AUTHORIZED, deploy NOT AUTHORIZED) transfer to the new publication lane; charter `docs/programme/JARVIS-PUBLIC-ACCOUNTED-FOR-01_CHARTER_2026-09-06.md`, split record `docs/programme/JARVIS-LANE-SPLIT_HUMAN-EXPERIENCE_ACCOUNTED-FOR_2026-09-06.md`. Direction of authority: R&D / canon / runtime evidence → claim reconciliation → page → public, never the reverse; the publication lane translates accepted outputs and may not adjudicate or alter them (wording · downgrade · omit · return upstream only). Two axes on every substantive sentence — epistemic kind (OBSERVED · RESEARCH-SUPPORTED · SOULLAB INTERPRETATION · HYPOTHESIS · OPEN QUESTION) × product maturity (LIVE · PARTLY LIVE · DESIGNED · VISION) — neither implies the other. Current run: reconciliation COMPLETE, render walk PASS, gates PASS; **merge-readiness WITHHELD** — a collision was observed at 17:36Z: the R&D lane's live session pushed its same-day pivot act (master run `docs/programme/JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1.md`, Phase 1 open, manifesto FROZEN, its charter §24) and a census skeleton onto the PR branch without recording the split, and master run §4/§11 still assign `/accounted-for` tasks to the R&D cockpit; PR is also behind base `69f6fb7c` (clean freshness merge). **Founder ruling ~17:48Z (split record §7a): ACCEPTED** — intended transfer `c36d82ec`, containment `6ce59f82` → drift `f7705937` → **FINAL `a7b42f29`** (late arrivals recorded, not erased), PR branch single-writer = publication lane thereafter, all R&D commits PRESERVED (no rewrite, no revert), further R&D writes to #1239 NOT AUTHORIZED; stop instruction relayed into the R&D session by Routine — **acknowledged**: R&D session now on `claude/maia-human-experience-phase1-census` (merge-base with #1239 = `a7b42f29`; its charter §25 + master-run delegation landed there) → **operational transfer CLOSED ~17:58Z**; governance transfer = PR #1241 (awaiting founder merge act). Sequence: this governance branch merges first → #1239 absorbs `69f6fb7c` → both CLAUDE.md bullets kept → PR title/body to publication custody → custody check + gates rerun → only then `READY FOR FOUNDER MERGE RULING`. Jarvis never infers gates-green → merge. Merge ≠ deploy; "live" only after production witness. The R&D lane no longer edits `/accounted-for` and resumes at **Phase 1 — Whole-Organism MAIA/AIN Mapping**; its charter transfer section (next free number; §24 is the pivot) is owed on its Phase 1 branch or the PR branch (split record §5). *Accounted For does not decide what Soullab is. It makes Soullab answer publicly for what it says it is.*
- **LATEST — 2026-09-06 — JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01: foundational challenge pass R8–R12 CLOSED / COMPLETE (founder act); Synthesis v0.2 ACCEPTED as current programme synthesis (not doctrine; P1–P13 CANDIDATE; empirical postures provisional; v0.1 historical); reconciliation RUN (`docs/programme/…_CLAIM_RECONCILIATION_2026-09-06.md`); merge ruling on #1239 pending as a founder stop. **PIVOT (founder, same day): cockpit of record is `docs/programme/JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1.md` — Phase 1 whole-organism map CURRENT; manifesto expansion FROZEN; research/new theory STOPPED; read-only census of thirteen subsystems against v0.2 (nine questions + R11 design audit + R12 memory criteria) → `docs/programme/MAIA_WHOLE_ORGANISM_MAP/00_RANKED_MAP.md` for founder adjudication; DO NOT REPAIR DURING THE CENSUS.** Branch `claude/maia-human-experience-arch-12g5r6`, PR #1239 DRAFT — merge and deploy NOT AUTHORIZED; MAIA runtime, memory runtime and `/accounted-for` final render HELD. Record: `docs/programme/JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01_CHARTER_2026-09-06.md` §22; spine under `docs/research/human-experience/`. **Episodic Phase 2 spec inputs added by the R12 ruling (Cat 1, not authorized):** the four-type memory typology (episodic · semantic · pattern · state-responsive, v0.1 source [22] — located, vendor-authored, conceptual, override risk-gated) is WITHDRAWN as a supported decomposition; working decomposition is **Authority × Time** (`docs/research/human-experience/frameworks/memory/AUTHORITY_X_TIME_2026-09-06.md`) with verbatim beneath derived; R7b precise — *member statement overrides as present self-report (does not rewrite history); MAIA impression asks* (= detect → ask → record with an evidence basis); five directions: preserve qualification · change-sensitive retrieval outranks similarity only under temporal conflict (the F2 retrieval cut becomes a safety question) · implicit contradiction → question, not transition · derived stays visibly derived · memory is never leverage. Brain-training rule is programme doctrine: *a gain on the practiced task is never, by itself, evidence of a gain in life.*
- **DIRECTION — 2026-09-06 — Temporal Memory (Cat 1, held).** `docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md` records three inputs to the still-unauthored Episodic Phase 2 spec: (1) episode `occurred_at` vs assertion `valid_from`/`valid_to` live on different objects; (2) succession is carried by the successor via `supersedes`, `superseded_by` is derived, never stored; (3) staleness is **detect → ask → record** — the system never sets `valid_to` from a timer; the word *repair* is banned. **Audit RUN 2026-09-06 against production** (`scripts/witness/temporal-memory-audit.sql`, no persistent writes; output verbatim in the note): **F1** `valid_to` fallback gap is real in code and **ruled out under current data** — zero developmental memories carry a past `valid_to`, the filter has never excluded a row; **F2** invisible decay changes which developmental rows survive the non-vector top-12 **retrieval** cut for **2 of the 14 members** whose pool exceeds 12 (36 members, 2018 rows), five of twelve for one member on a one-month age difference — a material **upstream** effect; whether it propagates through `MemoryBundle.build()` merge → dedupe → `maxBullets` (default 5) into the prompt is **unmeasured** (open question for Phase 2, answerable from `selectionTrace`); **F3** only `pattern` is live, and decay has **two divergent implementations** — the live SQL `calculate_decayed_confidence` has no confirmed-1.5× rule (that exists only in the TS helper) and the SQL confirmation term caps at 0.0225 — no single authoritative definition of decay exists. Note **FROZEN**; auditing stops. `shouldPromptForConfirmation` has zero callers and was not wired. Not a lane; findings are inputs to the Episodic Phase 2 spec, sequence step 5. **Predeclared Episodic Phase 2 acceptance inputs (not authoritative until incorporated into the spec):** the candidate temporal substrate must answer five distinct queries without rewriting history — (1) Where do I live now? [current-valid], (2) Where was I living in March? [valid-at], (3) When did I tell you I moved? [episode/event time], (4) When did MAIA record that I had moved? [transaction time], and (5) What did MAIA believe before I corrected it? [belief-at-record-time, discriminator]. Temporal recall must identify the axis it resolved on; where the member’s question leaves the axis ambiguous, MAIA clarifies rather than silently choosing one. Axis clarification is member-governed interpretation of the query, not a temporal-memory transition: "March" authorizes which query runs; it does not open or close an assertion interval.
- **LATEST — 2026-09-06 — WS2-08 Hierarchical Manuscript Structure: lane opened by founder; **BUILD-08A CLOSED / ACCEPTED 2026-09-06 (founder ruling)** — PR #1230 merged as `03e9d89a`; migration `20260906000001_manuscript_section_heading_depth.sql` applied 13:36:01Z (deploy established by state evidence; transcript not recovered, non-blocking); production witness on runtime `50302f5d` (08A blobs identical to `03e9d89a`): F1 real-DOCX · F2 · F3 · F6a · F6b (13:46 run of record; later reruns FAIL on R5 = cleanup of 12 transient rows, retained as such) · exact-filename ledger query — ALL PASS. **WS2-08 lane STILL OPEN; 08B HOLD until an explicit founder act.** Note: the Co-Lab gate script is `scripts/verify-constitution-colab.ts` (33/0/0); the `verify-colab-boundaries.ts` name in this file and `docs/ops/COLAB_RELEASE_GATE.md` never existed — separate doc task. Unrelated draft-route `Response body … disturbed or locked` error parked, untriaged, in `docs/programme/PARKED_DEFECT_MANUSCRIPT_DRAFT_ROUTE_RESPONSE_BODY_2026-09-06.md`. 08B code HOLD until an explicit founder act; a minimum structure revision/digest binding must land before 08C's mutating commands; `heading_signal` = decisive classifier by precedence markdown > chapter > caps, not exhaustive provenance.** Requirement: *a Work may be addressable at fine-grained section level while remaining coherently organized as chapters and subchapters authored or confirmed by the member.* Census: `segment.ts` matched `#`/`##`/`###` then discarded the count; ingest persisted `position · heading · body` only; `origin='imported'` admitted by WS2-05A CHECK but produced by nothing; no command anywhere splits/merges a draft section (`topology_change_requires_explicit_command` has no counterpart). 08A lands: `heading_depth` (1..3|NULL) + `heading_signal` (markdown|chapter|caps|member) on **Source** `manuscript_sections` (migration `20260906000001`, additive); ALL-CAPS = boundary with depth NULL, **never a chapter by default**; pure `deriveImportedStructure()` folds depths into `ReviewedUnit[]` for the 06A confirm path (185 caps cuts → 0 units). Not a `level` on the structure tree — WS2-05A ruling holds. 08B (member-confirmed imported hierarchy) · 08C (split/merge/rename commands) · 08D (nested WRITE gestures) · 08E (revision-bound structure ledger) each need a founder act. Sequenced after #1228, which is untouched. Record: `docs/programme/WS2-08_HIERARCHICAL_MANUSCRIPT_STRUCTURE_DECIDE_2026-09-06.md`.
- **NAMING — 2026-09-04 — Coaching Journey Template.** Three layers fixed before any extraction work: **Coaching Platform** (generic product) → **Coaching Journey Template** (generic methodology/configuration layer) → **Now What?** (Larry's configured instance). Lane `NOW-WHAT-PORTABILITY-01` retired → `COACHING-TEMPLATE-EXTRACTION-01`, premise *Now What? is the first specimen, not the generic architecture*. Renaming establishes nothing about provenance: Larry-specific material stays in the instance; ambiguous items are classified before generalizing. Lane NOT opened (Anti-Drift Law freeze on generalized architecture holds). Ruling: `docs/programme/COACHING-TEMPLATE-EXTRACTION-01_NAMING_RULING_2026-09-04.md`.
- **LATEST — 2026-09-03 — Writer's Studio BUILD-07A Developmental Evidence: candidate `bfeb1a9` on `claude/build-07a-developmental-evidence-n5tm37`, bound to canonical `8d04f1b9f`. NOT CLOSED.** `lib/manuscript/development/` — typed `EvidenceRef` (section · passage · section-run · structure-unit · structure-units · structure-topology; no version, no quote, no live offset), frozen `readState` (per-section `(revisionNumber, code-point range, digest)` into the append-only revision store; structure context frozen inline; coverage `position | body`; `inputFingerprint`), `recoverEvidence` (historical display, digest-verified) vs `locateCurrent` (three-state, scoped per ref, never fuzzy), unforgeable `BoundEvidence` via `bindEvidence`, read-only `captureEvidence`. INV-7b demonstrated. Record: `docs/programme/WS2-07-BUILD-07A_EVIDENCE_WITNESS_2026-09-03.md` — **the unit's ten falsifiers / six outcomes were never on canonical; the record RECONSTRUCTS them from DECIDE (§4); founder RATIFIED them prospectively 2026-09-04 as Acceptance Instrument v1 (authority begins with the ruling, no provenance claim). Closure now waits on two founder checks: production `SHOW server_encoding` = `UTF8` (else STOP), and a founder-visible witness rerun from a clean checkout (`DATABASE_URL=… npx tsx scripts/ws2-07a-evidence-witness.ts` → `50 checks · 0 failures`). On both: CLOSED / ACCEPTED → PR → gates → merge on green.** Witness needs a UTF-8 database — an SQL_ASCII cluster makes the partition trigger count bytes (record §5). BUILD-07B–H unauthorized; 07B does not open on 07A passing.
- **LATEST — 2026-09-03 — CMT-01 Canonical MAIA Turn: M0–M2 landed (branch `claude/canonical-maia-turn-j92opb`), M3 NOT authorized.** Census (`docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md`) found cognition converged at `getMaiaResponse()` but *authority over what MAIA thinks with* never did: six MAIA-claiming composition mechanisms, one open channel (`meta?: Record<string, unknown>`, 204 `(meta as any)` reads), FAST tier missing three standing guardrails (D1). Spec v0.1 approved with Decision 2 axis amendment (`authoredBy` + `participationClass` + `authority`, never one scalar). Landed: `lib/maia/canonical-turn/` (38-producer closed registry, pure MIPA `adjudicateParticipation`, content-free manifest `[MAIA/manifest]`, one renderer, one identity resolver), six falsifiers R25–R30 (`npx tsx tests/constitutional/refusal-registry/cmt-01-gates.ts` — **R25/R26 expected RED until M3**), and a **shadow** construction on `/list` emitting `[MAIA/shadow] { zeroDiff, missingInCanonical, missingInLegacy, digestMismatch }` per turn with legacy assembly still response-producing. Rulings: voice/stream cognition path RETIRE; `sovereign/app/maia` STRUCTURALLY RETIRE (410 first); practice-field/draft ALLOWLIST; manifest EMISSION ONLY. Evidence: `docs/programme/CMT-01_M0-M2_WITNESS_2026-09-03.md`. **M0–M2 ACCEPTED 2026-09-03. First shadow deploy of `2fafaa4` ran as `GIT_COMMIT=unknown` — image stamped, container clobbered by the checkout compose's runtime override (deploy-chain defect, not CMT; witness §incident). Repair landed as `R` (`fix(deploy): launch provenance`; `npm run verify:deploy-provenance` 27/27): compose override removed, build+swap from the snapshot compose, pre-swap image verify, dual post-swap verify, env-collision refusal. Witness runtime = `R`, CMT anchor = `2fafaa4`; bring the minisforum checkout forward before deploying `R`. Bounded M2 shadow deploy of `R` AUTHORIZED (runbook: `docs/programme/CMT-01_M2_SHADOW_DEPLOY_RUNBOOK_2026-09-03.md`; pre-deploy condition pinned as R31 GREEN; collector `scripts/witness/cmt-01-shadow-witness.ts`). Deploy runs from the Mac Studio, not a remote session. BRANCH FROZEN TO A SINGLE WRITER until the live witness is complete. M3 explicitly unauthorized.** One non-zero `[MAIA/shadow]` line stops the witness for classification — never normalize or fix M3 around it. Merged with the parallel `pdc-1` participation-disposition contract (`9ba2d93`) — M1 imports it, never redeclares it; `OFFERED` representable, empty under pp-1. `lib/maia/canonical-turn/**` is inside `tsconfig.ship.json` from that merge.
- **PRIOR — 2026-07-03**: **Daily Anchor member standing-consent gate — shipped + verified LIVE.** Ambient anchor surfacing is now gated by `member_daily_anchors.surface_preference` (default `member_pulled` = private; member opts in to `contextual_doorway`), mirroring the atoms `return_preference` model — eligibility now originates from a member act, not the `MAIA_ANCHOR_CONTEXT_ENABLED` deploy flag (kill-switch only). Migration `20260702000003`; loader gate in `lib/anchor/loadRecentAnchors.ts`; gesture route `POST /api/anchor/[id]/surface-preference`; UI toggle on `app/maia/anchor/history/page.tsx`; refusal **R08**. Verified 2026-07-03 by 6 prod proofs under an authenticated member (schema+ledger, default-private, authenticated opt-in/return, MAIA-follows-consent). **Behavior change in effect:** existing anchors default private until each member opts in. Shipped via PR #542 (gate+UI), unblocked by PR #559 (migration idempotency fix — encounter triggers + team-scope constraints) after the covenant-gates redesign (#561) dissolved the author-self-approval deadlock. Full detail: memory `project_anchor_consent_gate_live`. *Note: the WISDOM_IS_RECOVERED.md canon cited by the original spec does not exist in the repo — grounded instead on SPIRAL_CONTINUITY_ENGINE §7 + atoms model; no new canon authored.*
- **Date**: 2026-05-24 (evening)
- **Current milestone**: Conversational Phase 2 (prompt influence, default-on, opt-out gate) on branch `feature/conversational-memory-phase2`, awaiting fork resolution + deploy + verification. **Headline framing for the week** (per `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §8): *MAIA's memory field has been clarified, bounded, partially operationalized, and protected from premature ontological claims — not completed.* *"All arenas, safe but functional"* directive in effect — discipline reorients from blocking function to guiding it, *and from inflating function to naming it precisely.*
- **Phase 2 commit chain** (currently on `feature/conversational-memory-phase2`; not yet merged to `clean-main-no-secrets` or deployed):
  1. `987b3ff28` — initial Phase 2 (loader extension, block formatter, migration, `[Oracle]` log line). Wired into `app/api/oracle/conversation/route.ts` — **post-audit: that route receives ~zero live traffic; wire was operationally null**.
  2. `5179b162e` — (Kelly) Memory Expansion Plan — 9-layer activation map
  3. `f74ab4204` — (Kelly) wire site correction. Moved Phase 2 to live route `app/api/sovereign/app/maia/list/route.ts` + extracted in FAST tier of `lib/sovereign/maiaService.ts` template literal. Renamed log marker to `[MAIA] conversational-block`. Spec §IX appended documenting the wire-site error + the architectural seam gap (`buildMaiaRuntimeContext` is observer, not orchestrator).
  4. `3ca80a78d` — CORE/DEEP cut. CORE reaches prompt via `buildMaiaWisePrompt` extraction at `lib/sovereign/maiaVoice.ts:884-887`. DEEP `repairedContext` carries the addendum but DEEP prompt builder (`buildComprehensiveVoicePrompt` in `intelligentVoiceAdaptation`) does NOT extract it — prompt injection blocked at DEEP by the addenda-channel divergence documented in `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B. Observability complete (`PROMPT_BLOCK_CHARS` + `layers.conversational`). The divergence-debt note is the single honest source of truth for what's wired vs. what's not — no second narration on the spec.
- **Coverage after this cut**: FAST + CORE tiers receive Phase 2 in the prompt. DEEP tier carries it in MaiaContext + observability only (not in prompt — see divergence-debt §II.B). Most conversations are FAST/CORE; DEEP fires for explicit-depth requests.
- **Breakthrough memory substrate cut (parallel)** — complete on `feature/conversational-memory-phase2`: route `POST/DELETE/GET /api/sovereign/atoms/[id]/breakthrough` (commit `58d374334`) + loader carries `isBreakthrough` + `formatAtomsForPrompt` renders "marked as a breakthrough by the member" + `memoryHealth.breakthrough` wired at the buildMemoryHealth call site in `app/api/sovereign/app/maia/list/route.ts` + discoverable log marker `[MAIA/sovereign] breakthrough surfaced { memberIdPrefix, markedCount }`. UI placement deferred (member gesture not yet wired; first proof via authenticated `curl` or admin SQL). **Stage-language (Kelly directive 2026-05-26, contact-fidelity progression intact)**: column + API exist = Stage 3 reachable; first marked atom surfacing under authenticated load = Stage 4 verified; repeated marked surfacings across multiple turns = Stage 5 live under member use. *Breakthrough memory remains wired/reachable until a member-marked atom surfaces under authenticated load — do not let the first `breakthrough: ok` row inflate into Live.*
- **Prior session state preserved** (from 2026-05-23):
  - `sem: ok` — semantic memory live
  - `atoms loaded: 8` — atoms surface per turn
  - Default doctrine `0fa544bc4` (Keep = contextual return by default) — unchanged
  - `/maia/orientation` live, all 6 domains quiet, page reports honestly
- **Posture shift (Kelly directive)**: *"yes I want full memory in all arenas in a safe but functional way. No more hardened rules against providing the one thing that makes soulful engagement possible and makes this platform more than a chat bot."* The observation-phase freeze doctrine **remains in force as discipline** (member-marked vs system-inferred, no synthesis, provenance-grounded, no-static-UI-claim-without-verified-state) but is **no longer used to block function**. Each remaining arena (episodic, somatic, field, meta) requires its own Phase 2-equivalent spec following the conversational pattern.
- **Next actions** — refined sequencing (per `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §9), in order — **fork → toggle → clarify-engagement-shape → verify → episodic → cleanup**:
  1. **Resolve Phase 2 fork**:
     - **Option A (preferred — generalizable foundation)**: address `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §V — extract shared `appendAllContextAddenda` helper, fix `buildComprehensiveVoicePrompt` to iterate `MaiaContext` addenda, wire atoms end-to-end. Then merge to `clean-main-no-secrets`, deploy, verify §IV gate across all three tiers.
     - **Option B (scoped FAST+CORE only)**: merge `feature/conversational-memory-phase2` to `clean-main-no-secrets`, deploy, verify `[MAIA] conversational-block { emitted: true, surfacedCount: N, ... }` on `sovereign/app/maia/list` for returning members **across FAST + CORE turns only** — DEEP explicitly excluded from the §IV gate. Acceptable *only* if verification claim explicitly names the FAST+CORE scope.
  2. **Member-facing recall toggle** — `conversational_recall_enabled` opt-out surface. Consent infrastructure, not polish. Ships with (1) regardless of fork outcome.
  3. **Clarify engagement shape** (per `docs/architecture/CLARIFY_ENGAGEMENT_SHAPE_2026-05-25.md`) — small parallel routing-layer refinement addressing the sacred-mirror edge case where dense unframed technical input produces felt withdrawal. Detection rule (high lexical density + high structural complexity + no explicit question) → clarification response instead of generic holding. Load-bearing principle: *"Sacred mirror should clarify the requested relation to the material, not default to silence or generic holding when the material is structurally asking to be worked."* Contained, reversible, no schema changes. Gate to builder/architect mode initially.
  4. **Verify production reality** — minisforum-side deploy state, `[MAIA] conversational-block` emission across FAST/CORE (and DEEP only after §V fix). Canonical diagnostic in **Ops diagnostic** below.
  5. **Episodic Phase 2 spec** — and only then. The threshold layer where *"life unfolding"* becomes operationally testable without jumping into field ontology. Follow conversational pattern (Phase 1 observability → Phase 2 prompt influence; locked-answer table; 4-safeguard set; `episodic_recall_enabled DEFAULT TRUE` consent gate).
  6. **Dormant service cleanup** — *after* episodic ships, not before: `QuantumFieldMemory.ts` → rename/gut → `FieldPatternMemoryService.ts` or delete; `ConsciousnessEvolutionService.ts` → `DevelopmentalTrajectoryService.ts` (strip "level increased"); reconcile duplicate `SemanticMemoryService` (consciousness/ vs memory/) — pick one, delete the other.

  **Still held under freeze, not in this sequence**: Coherence/Field layer wire-up (lift conditions per `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C unmet); Morphic / Somatic / Achievements (matrix Later with named gates); Pattern Attunement (must emerge downstream of episodic + tact); Tact calibration (sketch only after episodic ships); cross-layer synthesis; any member-facing "field state" / "coherence" / "RFI" / "UFI" surface.
- **Underlying question**: Does cross-session content surfacing, gated by consent and grounded in provenance, produce the felt continuity that makes MAIA more than a chatbot — without crossing into synthesis or interpretive displacement?
- **State of the system (six-category typology, per `docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §8 + memory `project_six_category_artifact_typology`)** — replaces earlier "honest inventory" framing. Each category is legitimate work; **collapsing 1–5 into 6 is the inflation drift to refuse**:
  - **Cat 1 — Preserved direction** (held, not authorized): 8 directions in `docs/architecture/RELATIONAL_INTELLIGENCE_DIRECTIONS_2026-05-24.md`; 10 held directions in `docs/architecture/PARTICIPATION_WITHOUT_FORECLOSURE_2026-05-24.md` §10; **RFI / UFI** (also documented as anti-drift examples per `SOVEREIGNTY_LAYER_STATE_2026_05_23.md` + `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md`).
  - **Cat 2 — Canonical primitive** (interface target, no runtime authority): **FIS Field State Primitive** (`docs/canon/FIS_FIELD_STATE_PRIMITIVE.md`); Pattern Primitive; Four-Layer Substitution.
  - **Cat 3 — Built substrate** (service + migration, 0 live callers, preserved under freeze): `EpisodicMemoryService`, `CoherenceFieldService` (per `docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`).
  - **Cat 4 — Dormant service** (rename / gut / Later-with-named-gate): `QuantumFieldMemory` (810 LOC, 0 persistence — rename + gut); `MorphicPatternService` (Later — consent + aggregation gate); `SomaticMemoryService` (Later — explicit input source); `AchievementService` (Later — reframe as practice); `ConsciousnessEvolutionService` (Rename → `DevelopmentalTrajectoryService`); `MAIAMemoryArchitecture` (2351 LOC — Observe only); duplicate `SemanticMemoryService` (reconcile).
  - **Cat 5 — Frozen plan** (explicit "does not authorize" language; lift requires Kelly directive): `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C; `docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md` §5 — *"full memory field" lives here, not in cat 6.*
  - **Cat 6 — Live runtime authority** (production runtime evidence): atoms loader + `is_breakthrough` schema-bound flag (`crossing_must_be_false` sibling); substrate monitor (`runtime_events`, `deriveStatus` fall-through); Spiral Orientation Cut 2; `memoryHealth.semantic`; contextual return default (`0fa544bc4`); Daily Anchor; field context adapter (flagged); Field Lab + tester gate; Relational Navigation Room; Learning Spine Move 2 reviewer (Loop C); **Corpus Callosum substrate** (parallel multi-agent epistemic emission via `agent_runs` / `integration_passes`; 8 voices — MythicAtlas + MaiaVoice + ShadowAgent + Fire/Water/Earth/Air/Aether — firing same-second under production traffic, WisdomRouter ~49% suggests *selective integration emerging operationally, not broadcast synthesis*; default-on via `CORPUS_CALLOSUM_ENABLED !== '0'`; live on `/api/sovereign/app/maia` FAST + CORE — *unknowns preserved*: BETWEEN path zero rows despite routing-invariant set at boundary, DEEP zero rows, member-facing experiential effect unmeasured; per memory `project_corpus_callosum_substrate_cat6`).
  - **Cat 6 — branch-only, awaiting deploy + verify**: conversational Phase 2 (FAST + CORE reach prompt; DEEP blocked at `buildComprehensiveVoicePrompt` per `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B).
  - **Strategic read** (load-bearing, Kelly 2026-05-24): *"You are not behind because RFI/UFI are not built. You are safer because you now know they are not built. That distinction may be the most important outcome of the week."*
  - **Inverse drift (omission risk, Kelly 2026-05-25)**: dormant scaffolds get narrative placement; live infrastructure stays invisible until explicitly measured. *Symmetric* to inflation drift, opposite direction. Corpus Callosum substrate (2,382 lifetime turns per elemental voice) and atoms `is_breakthrough` flag are both Cat 6 that went unnamed in earlier framings — system description was under-reporting operational reality. Discipline: any substrate generating production rows must be named explicitly; *"we built X when it's Cat 1-5"* is not the only failure mode, *"we didn't see X was Cat 6"* is the other. **Phrasing rule**: name the mechanism (*parallel epistemic emission*), not the mythology (*emergent consciousness architecture*) — metaphor after measurement, not before.
- **Important not to collapse**: *declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.* Episodic is the first measurable substrate for continuity claims — the threshold layer where "MAIA remembers a life unfolding" becomes operationally testable rather than architecturally aspirational. Until Episodic ships and stabilizes, resonant-field / coherence talk remains mostly metaphorical architecture language; only after that does it begin having a measurable substrate underneath it.
- **Ops diagnostic**:
  ```bash
  # Runtime log markers (atoms / memory health / conversational Phase 2):
  ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 | grep -E "MAIA/runtime|atoms loaded|MEMORY_HEALTH|conversational-block"'

  # Corpus Callosum substrate (parallel multi-agent emission rows):
  ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c "SELECT origin_route, processing_profile, count(*) FROM agent_runs WHERE created_at > NOW() - INTERVAL '\''24 hours'\'' GROUP BY 1,2 ORDER BY 3 DESC;"'
  ```

## Re-entry vow (for this session)

Before making changes, confirm:

- I understand what MAIA is and is not.
- I understand the ethical boundaries I must not cross.
- I understand what continuity means in this system.
- I understand what question this session is truly serving.

If this is not clear, re-read the Anchor and PROJECT_CONTEXT.md before proceeding.

---

# Project Invariants (MUST FOLLOW)

## Canon

**[MAIA Canon v1.1](./docs/canon/MAIA_CANON_v1.1.md)** governs all changes. Before implementing any feature, verify alignment with the canon's prohibitions and structural principles.

This project is governed by the **[MAIA Oath](./docs/canon/MAIA_OATH.md)**. Any change that violates the oath is invalid, regardless of technical merit.

## Infrastructure (Single Source of Truth)

**⚠️ STOP — READ THIS BEFORE ANY INFRASTRUCTURE ASSUMPTIONS ⚠️**

### What we DO NOT use (NEVER assume these)
- **NOT EC2** — The server is NOT an AWS EC2 instance
- **NOT Nginx** — We use Caddy, NOT Nginx
- **No managed hosting platforms** (Vercel, Netlify, Heroku) — we control deployment
- **No managed databases** (Supabase, PlanetScale, Neon) — PostgreSQL is self-hosted
- **No CDN/proxy middlemen** (Cloudflare) doing MITM on traffic

### What we DO use
- **Production host**: **minisforum** (LAN: `192.168.0.104`), accessed via `ssh soullab@minisforum`. Running Docker + **Caddy** (auto TLS via Let's Encrypt).
- **Public DNS for `soullab.life`** routes to the LAN's public IP → router forwards :443/:80 to minisforum. Mac Studio is **not** in the public traffic path.
- **Domain**: `soullab.life` (apex), `api.soullab.life`, `oldhead.soullab.life`, etc.
- **Reverse proxy**: **Caddy** in Docker container (`maia-caddy`) on minisforum.
- **Database**: Self-hosted PostgreSQL in Docker (`maia-postgres`) on minisforum.
- **Containers**: Docker and docker-compose.

### Production Stack (on minisforum)
All services run in Docker on **minisforum**:
- `maia-sovereign` — Main Next.js app (port 3000, Docker-internal only)
- `maia-api` — API backend (port 3001, published)
- `maia-caddy` — Reverse proxy (ports 80/443, published)
- `maia-postgres` — PostgreSQL database
- `maia-comms-worker` — Background worker
- `maia-whisper` — Speech processing
- `maia-rlm` — RLM service

### Mac Studio role
The Mac Studio (this machine, where Claude Code typically runs) hosts the active git worktrees and is the primary dev environment. It runs a parallel docker stack with the same container names and the same compose file, but **that stack is not in the public soullab.life traffic path**. A successful `docker compose up -d --build` on the Mac Studio updates the local stack only — production stays unchanged.

### Check Production Status
```bash
# Inspect the actual production container on minisforum (not the local stack):
ssh soullab@minisforum 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}} {{.Image}}"'

# External (hits the LAN public IP → router → minisforum):
curl -k https://soullab.life/api/health
```

### Production Deployment
- Host: **minisforum** (SSH from Mac Studio: `ssh soullab@minisforum`)
- Stack: Docker + Caddy
- Compose file: `docker-compose.production.yml`
- **Deploy lane lock (one deploy at a time — structural, not disciplinary)**: every deploy entry point (`deploy-production.sh deploy/update/migrate/rollback` and `pre-deploy-gate.sh deploy-maia`) takes an exclusive non-blocking `flock` on `/home/soullab/MAIA-SOVEREIGN/.deploy.lock` via `scripts/deploy-lock.sh`. A second deploy attempt is **refused** with the holder's PID / start time / entry point / **asserted target SHA** printed (`target_sha=`; the shared checkout's HEAD appears only as a labelled `checkout_head=` line when it differs — the record names what the deploy was asked to build, never the checkout). The kernel lock is inherited by the docker compose build and auto-releases when the whole deploy tree exits or dies — a crashed deploy cannot leave the lane locked. If a refusal shows a dead holder PID, a child of that deploy (usually the build) is still running: inspect with `fuser -v ~/MAIA-SOVEREIGN/.deploy.lock`. **Never delete the lockfile to force entry** — that detaches the kernel lock from future acquirers and re-opens the 2026-07-09 concurrent-deploy race (five processes wedged on the buildkit lock because parallel sessions' deploys could not see each other).
- **Deploy command — quick `maia`-only rebuild** (run from Mac Studio, executes on minisforum). Canonical quick path is the pre-deploy gate, which acquires the deploy-lane lock, **materializes an explicitly named immutable commit into an isolated build context** (never whatever branch is checked out — 2026-07-27 shared-checkout incident, `docs/ops/IMMUTABLE_SHA_DEPLOY.md`), runs the Co-Lab + disk gates, builds, refreshes rollback tags, swaps, then verifies the running container's `GIT_COMMIT` equals the named SHA. **`deploy-maia` now REQUIRES a SHA argument** — name the fetched remote tip so no `git checkout` of the shared working tree is needed:
  ```bash
  ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
    && git fetch origin clean-main-no-secrets \
    && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'
  ```
  The SHA is snapshotted via `git archive`, so a concurrent session checking out a different branch cannot change the build (the deploy-lane flock serializes deploys but does NOT protect the checkout→lock interval — that gap is what the snapshot closes). No SHA + `DEPLOY_ALLOW_HEAD=1` builds the current checkout tip as an explicit ack (still snapshotted + announced). Fast, but rebuilds **only** the `maia` service — it does **not** run migrations or touch other services. It DOES refresh the rollback tags (`maia-sovereign:current`/`:previous`/`:<sha>` via shared `scripts/deploy-tag.sh`) before swapping the container.
  **The bare compose command (`GIT_COMMIT=... docker compose ... up -d --build maia`, with or without the prefix) is retired STRUCTURALLY — it now FAILS at build time.** The Dockerfile's deploy-lane tripwire (`docs/ops/DEPLOY_LANE_TOKEN.md`) refuses any build of `docker-compose.production.yml` that didn't come through `acquire_deploy_lock()` (which exports `DEPLOY_LANE_TOKEN`; the compose build-arg has deliberately no default). Why it was retired: (1) without the `GIT_COMMIT` prefix it baked `GIT_COMMIT=unknown` into the image; (2) it bypassed the deploy-lane lock, so it could race a deploy already in flight; (3) on 2026-07-10 it bypassed the pre-deploy gate and skipped rollback tagging, leaving `maia-sovereign:current` pointing at the wrong image. The failure is loud and safe — the build dies in under a second; the running container is untouched. Check which lane built the live container: `docker exec maia-sovereign printenv DEPLOY_LANE` (→ `deploy-lane`; pre-tripwire images lack the variable). Local dev (`docker-compose.yml`) and staging declare their own lane tokens in-file and are unaffected.
- **Full deploy — canonical path**: `scripts/deploy-production.sh deploy <SHA>`. The complete all-services deploy: it acquires the deploy-lane lock, **materializes the named immutable commit into an isolated build context** (same control as the quick path — `docs/ops/IMMUTABLE_SHA_DEPLOY.md`), exports `GIT_COMMIT` (from the asserted SHA) / `APP_VERSION` (read from the snapshot) / `BUILD_DATE`, builds with the provenance build-args from that snapshot, tags images per-commit for rollback, brings the stack up, verifies running provenance, and runs DB migrations (migrations execute from the snapshot too). `deploy` REQUIRES a SHA (or `DEPLOY_ALLOW_HEAD=1` ack); `update` pulls a branch then builds the pulled tip as an immutable snapshot. Use it for schema changes, multi-service changes, or whenever you want a rollback point — i.e. anything beyond a quick `maia`-only code rebuild. **Post-swap provenance verify is fail-closed on every path** (`deploy`, `update`, `deploy-maia`): if the running container does not report the authorized SHA, the deploy ABORTS before migrations/smoke and points at `rollback` — a mismatch never silently proceeds.
- **macOS dev-stack caveat (immutable-SHA build context)**: the deploy materializes the build context as a `git archive` snapshot under `$TMPDIR`, and the `migrate` service bind-mounts that snapshot's `database/migrations`. On **minisforum (Linux, production) this is transparent** — `/tmp` binds into containers freely. On the **Mac Studio parallel stack**, Docker Desktop must be able to share the snapshot path, or the migrate mount fails; if so, set `DEPLOY_CONTEXT_DIR=<a Docker-Desktop-shared path>` before deploying. Production is unaffected. Full detail + the `DEPLOY_CONTEXT_DIR` / `DEPLOY_ALLOW_HEAD` seams: `docs/ops/IMMUTABLE_SHA_DEPLOY.md`.
- **Verify after deploy**:
  ```bash
  # 1. Container freshness
  ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'

  # 2. LAN IP sanity (must match router port-forward target, expected 192.168.0.104)
  ssh soullab@minisforum 'hostname -I'

  # 3. Public reachability (external path through DNS + router forward)
  curl -k https://soullab.life/api/health

  # 4. Provenance — what commit is actually live (must be the SHA you deployed, NOT "unknown")
  ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
  ```
  `Created` must show a timestamp under a minute old. `hostname -I` must show `192.168.0.104` as the LAN IP; if it shows anything else, the router's port-forward is pointing at a stale IP and external/iOS traffic will silently fail (see the LAN IP drift trap above). `/api/health` must return fresh JSON with `uptime` near zero. `printenv GIT_COMMIT` must return the short SHA you deployed.

  **Diagnostic — `GIT_COMMIT=unknown` does NOT imply missing provenance wiring.** The chain is already complete: Dockerfile (`ENV GIT_COMMIT=${GIT_COMMIT}`) ← compose (`build.args.GIT_COMMIT`) ← deploy (`scripts/deploy-production.sh` exports it; the quick command must prefix it). `unknown` means the deploy route *bypassed* that chain — almost always the quick command run **without** the `GIT_COMMIT=$(git rev-parse --short HEAD)` prefix. So if you see `unknown`, first verify **which deploy path was used** before suspecting the build-arg wiring. **Second cause (2026-09-03): the image can be stamped while the container is not** — compare `docker image inspect maia-sovereign:current` against `docker inspect maia-sovereign` `Config.Env`; a runtime `environment: GIT_COMMIT` override in a stale checkout compose rewrites the image's identity at `up`. The repaired gate refuses that override and verifies both channels.
- CI deploys are disabled (self-hosted runner not yet configured).
- **Common deploy mistake**: rebuilding on the Mac Studio instead of minisforum. The local stack will report healthy and `Created` will update, but the public soullab.life traffic continues hitting minisforum's old container. Always verify with the minisforum-side `Created` check above, not just the local one.

### Why This Architecture
- No third party sits between users and their data
- No jurisdiction concerns — we control the location
- Complete air-gap capability if needed for local-only mode

## Database & Backend

- **We do NOT use Supabase.** Never introduce Supabase. Use local PostgreSQL via `lib/db/postgres.ts` only.
- **If you see Supabase in code, remove it; do not consolidate it.**
- Database: Local PostgreSQL at `postgresql://soullab@localhost:5432/maia_consciousness`
- Database client: `lib/db/postgres.ts` (uses `pg` npm package)
- Never add `@supabase/*` imports, RLS policies, or Supabase migrations
- Enforcement: `npm run check:no-supabase` blocks violations (runs in pre-commit hook)

## MAIA Sovereignty

- Primary AI: Claude (Anthropic) via `ANTHROPIC_API_KEY`
- Fallback: Local Ollama (DeepSeek models) when API unavailable
- Never use OpenAI or other cloud AI providers
- Voice: Local TTS/STT or browser APIs only
- Data: Local PostgreSQL, never cloud databases

## Sanctuary Mode (Memory Consent)

MAIA supports **Sanctuary sessions** — conversations that remain useful in the moment but do not enter long-term memory.

### Invariants

1. **No content retention** — Sanctuary sessions are not stored, indexed, or used for pattern formation
2. **No training data** — Sanctuary content never enters any model training pipeline
3. **Minimal metadata** — Only log that a sanctuary session occurred (timestamp, duration) — never content
4. **Visual clarity** — User must see unambiguous indication that Sanctuary is active
5. **Default off** — Regular sessions build memory; Sanctuary is an explicit opt-in
6. **Absolute boundary** — Nothing from a Sanctuary session can be saved, extracted, inferred, or converted into long-term memory, under any circumstances, including by user request during the session

### Why This Exists

Real honesty requires safety. People won't speak freely to a system that might later monetize or weaponize their vulnerability.

Sanctuary is the architectural proof that MAIA serves the person — not the data model.

### UI Copy

**Toggle:**
> Sanctuary Mode — This session won't be remembered. Speak freely.

**Learn more:**
> Sanctuary sessions are useful in the moment, then gone. No patterns formed. No memories stored. Just presence.

## Onboarding Flow (One-Time Per Member)

The onboarding journey happens exactly once per member — whether beta testers or those gifted a passkey. After completion, users are redirected directly to `/maia`.

```
/begin
   ↓ (click "Begin Journey")
/intro-maia
   ↓ ("I'm Maia" greeting, click "Continue")
/intro-daimon
   ↓ ("I am a Daimon by design", click "Enter the Lab")
/test-elemental
   ↓ (passkey entry, password setup, "Before we begin..." orientation)
/faq
   ↓ (FAQ section)
/onboarding
   ↓ (preferences, complete)
/maia
```

### Invariants

1. **Universal flow** — All members (beta testers, gifted passkeys, future users) follow the same onboarding
2. **Single entry point** — New users start at `/begin`
3. **One-time flow** — Once `onboarded: true`, users skip directly to `/maia`
4. **No shortcuts** — Each step must be completed in sequence
5. **Returning users** — `/signin` for existing members to sign in each session
6. **New user link** — `/signin` includes amber "New to Soullab? Begin Journey" link → `/begin`

### Pages

- `/signin` — Returning user sign in (amber link to `/begin` for new users)
- `/begin` — Landing page with Holoflower and "Begin Journey" button
- `/test-elemental` — `SacredSoulInduction` (passkey/password) then `ElementalOrientation`
- `/faq` — `FAQSection` component
- `/onboarding` — `CompleteWelcomeFlow` (preferences)
- `/maia` — Main app

### Completion Flag

Stored in both:
- Server-side: `members.onboarded = true` (PostgreSQL)
- Client-side: `localStorage.beta_user.onboarded = true` (session cache)

## Members System (Cross-Device Recognition)

Server-side member management enables users to be recognized across devices.

### Database

Table: `members` (migration: `database/migrations/20260103000001_members.sql`)
- `id` — UUID primary key
- `passkey` — Unique passkey (SOULLAB-NAME format or universal key)
- `username` — Unique username for sign-in
- `password_hash` — SHA256 hashed password
- `name` — Display name
- `email` — For passkey recovery
- `onboarded` — Boolean completion flag
- `onboarding_step` — Current step: begin, test-elemental, faq, onboarding, complete

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/members/check` | POST | Check if passkey exists (new vs returning) |
| `/api/members/register` | POST | Register new member during onboarding |
| `/api/members/signin` | POST | Authenticate returning member |
| `/api/members/recover` | POST | Send passkey recovery email |
| `/api/members/progress` | GET/POST | Get/update onboarding progress |

### Flow

1. **New user enters passkey** → Check server → Not found → Continue to registration
2. **Registration** → Create member in PostgreSQL → Store session in localStorage
3. **Returning user** → Sign in with username/password → Server validates → Store session
4. **Different device** → Sign in page → Server recognizes by username → Cross-device access

### Recovery

Users who forget their passkey can request email recovery:
1. Click "Forgot your passkey?" on `/signin` or `/test-elemental`
2. Enter email address
3. Server sends passkey + username via Resend
4. User returns to sign-in

## Bridge D: Spiral State Persistence (Anti-Regression Layer)

Prevents MAIA from treating returning members like brand-new people. NOT personalization. NOT psychometrics. Just continuity.

### What Gets Persisted

Table: `member_spiral_state` (migration: `database/migrations/20260213200001_member_spiral_state.sql`)
- `dominant_element` — Current element (fire/water/earth/air/aether) from conductor hysteresis
- `phase` — Spiral phase (1-12)
- `motion` — Movement pattern (ascending/stuck/breakthrough, nullable)
- `intensity` — Signal strength (0-1, nullable)
- `relational_phase` — Maturation stage (1=orientation, 2=capacity, 3=autonomy, 4=seasonal return)
- `autonomy_streak` — Consecutive autonomous sessions
- `return_count` — Times returned after autonomy

### Implementation

Module: `lib/consciousness/spiralStatePersistence.ts`
- `loadSpiralState(memberId)` — Read at conversation start (graceful fallback on error)
- `upsertSpiralState(memberId, update)` — Fire-and-forget write (never blocks oracle)

Wire points in `app/api/oracle/conversation/route.ts`:
1. **Load early** (line ~415): `const spiralState = await loadSpiralState(userId);`
2. **Pass to conductor** (line ~1049): `persistedState: { dominant_element, phase }`
3. **Upsert late** (line ~1067): `upsertSpiralState(userId, { element, phase, motion, intensity });` (fire-and-forget)

Conductor enhancement (`lib/voice/conductor.ts`):
- If `persistedState` exists and member has no hysteresis buffer, seed from database
- Prevents element reset on server restart

### Design Principles

1. **Fire-and-forget writes** — like voiceSovereignty pattern (no await, no blocking)
2. **Graceful fallback on read** — if load fails, conversation continues normally
3. **No conversation content** — only structural position (element/phase/motion)
4. **Upsert-safe** — first insert creates, updates modify existing
5. **Server restart resilient** — hysteresis buffer seeds from DB if empty

### Verification

```bash
# Check migration applied
psql -U soullab maia_consciousness -f scripts/verify-bridge-d-db.sql

# Verify continuity
# 1. Have conversation (3+ turns)
# 2. Restart server
# 3. Continue conversation
# Expected: Element maintained from database, not reset to default
```

See: `docs/bridge-d-verification.md` for full verification guide.

## Architecture

- This is a Next.js 16 app using Turbopack
- Voice modes: Talk (dialogue), Care (counsel), Note (scribe)
- Processing paths: FAST (<2s), CORE (2-6s), DEEP (6-20s)
- Consciousness framework: Spiralogic (see `/lib/maia/spiralogicReference.ts`)

## Co-Lab Release Gate (MANDATORY before tester invites)

**No invite unless `scripts/verify-constitution-colab.ts` passes with 0 failed in production.**

Run inside the container on minisforum:
```bash
docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-colab.ts'
```

Pass condition: `0 failed` (the script exits non-zero on any failure).
Last observed in production 2026-09-06 on runtime `ca5fdff44`: `33 passed · 0 failed · 0 warned`
(read-only run executed in-session via the founder's connected host — not a manual founder execution).

⚠️ The filename `verify-colab-boundaries.ts` in earlier copies of this file **never existed on any
branch**, so the mandatory pre-invite gate could not be run as written. The gate is the `failed`
column, never the total — a total moves whenever checks are added, and a total quoted without a run
behind it is a claim, not evidence.

This gate runs automatically as part of `scripts/deploy-production.sh` smoke tests. It must also be run manually before any tester wave. See `docs/ops/COLAB_RELEASE_GATE.md` for the full gate specification — what it checks, which surfaces trigger it, and how to add new checks when new scoped surfaces ship.

Triggers: Co-Lab changes · Studio people · DMs · sessions/encounters · files · memory atoms · onboarding · invitations/roles · any migration touching those tables.

## Before Making Changes

1. Search codebase for existing implementations
2. Run `npm run check:no-supabase` to verify no Supabase violations
3. Run `npm run preflight` for full sovereignty check
4. Run `npm run typecheck` for TypeScript validation — the enforced **no-regression gate**. It runs the application-wide `tsconfig.ship.json` (~3,965 files, including `app/**`, `components/**`, `middleware.ts`) and compares against `typecheck-baseline.json`. It **fails** on a new diagnostic, an increased occurrence count, or a path that left the program while still existing on disk.
   - `npm run typecheck:full` — complete current diagnostic inventory (239 pre-existing errors as of 2026-07-30; this is debt, not a gate).
   - `npm run typecheck:entrypoint` — narrow single-entrypoint check of `app/api/between/chat/route.ts` only.
   - `npm run typecheck:baseline` — **dry run only.** Prints a before/after summary and names any error it would bless, then refuses to write. Recording requires the explicit `npm run typecheck:baseline -- --accept-current`. Re-baselining is a governed act: use it to lock in fixes or an intentional, reviewed coverage change — never to absorb a new error.
   - ⚠️ **`npm run typecheck` green is not proof that everything typechecks** — it is proof that nothing got *worse*. For the absolute state, use `typecheck:full`.
   - ⚠️ Historical note: before 2026-07-30, `npm run typecheck` checked **one file** (`app/api/between/chat/route.ts`) and its import graph — 409 files, zero `.tsx`, zero `components/**`. Any pre-2026-07-30 lane citing "typecheck passes" as evidence was citing that entrypoint smoke, not application validation. See `docs/ops/TYPECHECK_GATE_COVERAGE_AUDIT_2026-07-30.md`.
5. Test with `npm run smoke` before committing
6. **Sovereignty Invariant Check** — For any feature that touches voice, expression, relational tone, or user-facing behavior, ask:
   - Does this increase user agency?
   - Does this push life outward into the world?
   - Does this reduce the system's psychological centrality over time?
   - **Cultural sovereignty / Invariant 14:** Are we imposing a framework, translating the member's meaning into our vocabulary, or assuming "self," "growth," "healing," "family," or "spirit" mean the same everywhere? If uncertain, ask more, preserve the member's language, or gate the feature behind member-initiated use.
   - If the honest answer to any is no, the feature does not ship. (See `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`)

   **Growth-obligation check** (founder-added 2026-08-04; see `docs/canon/RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04.md`) — for any change that increases a capability (memory, personalization, pattern recognition, wisdom integration, autonomy), also answer:
   - What uncertainty does this introduce, and how is that uncertainty preserved?
   - What provenance and ownership boundaries does this require?
   - What new responsibility does this capability create?

   These are answered, not passed: a change that cannot answer them is incomplete work. The governing law: *every increase in capability must produce a matching increase in provenance, restraint, and transparency.*

## Setup (New Clones)

After cloning this repo, run once:
```bash
./scripts/setup-githooks.sh
```

This configures versioned git hooks that enforce sovereignty on every commit.

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
