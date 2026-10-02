# JARVIS-FOUNDER-OPERATING-ENVIRONMENT-01 — P0 · Founder Adjudication (verbatim record)

**Received:** 2026-09-23 · **Candidate adjudicated:** `eb77216b4237ad0685208d949507848fc6535c0e` on `claude/sharp-cannon-cyrdeb` · **Canonical:** `840194ba859bd5a497fc939c94329ee972ca3f80`.
**Disposition:** **P0 PASS · READINESS MAP ACCEPTED · DEPENDENCY GRAPH ACCEPTED · DAILY-WORK COVERAGE ACCEPTED · SEQUENCE ACCEPTED WITH FOUNDER RULINGS.**

The founder's act is the law; this file is its record. Nothing below is paraphrased where it rules; JARVIS commentary is confined to §Z.

---

## I · Disposition (founder)

> P0 correctly establishes that the principal problem is no longer missing intelligence. The principal problem is: existing intelligence is fragmented, partially unwired, incompletely observed, and presented through engineering machinery rather than one humane Founder operating environment. The target remains: JARVIS as the sovereign Founder operating environment for Soullab · AIN · MAIA · JARVIS and their development, research, infrastructure and operations.

## II · Full-functionality definition accepted

The `BUILT ≠ WIRED ≠ LIVE ≠ USABLE ≠ WITNESSED` ladder is accepted. A capability counts toward fully functional only when it has become BUILT → WIRED → LIVE → USABLE → WITNESSED with truthful provenance at every stage. The 17 P0 requirements (R-01…R-17) are the current readiness framework.

## III · F2 carry-forward rulings

- **FD-1 Architecture — ACCEPT.** Five-surface Founder Workspace becomes the presentation architecture *inside* the existing `jarvis-desktop` application. No second application. `governed organs → pure/read-only adapters → founder-workspace-viewmodel.v1 → Today · Work · Graph · Monitor · System`. The renderer presents truth; it does not become a second authority engine.
- **FD-2 IPC — ONE NEW READ CHANNEL PERMITTED WHEN B5 OPENS.** Reserved name `jarvis:workspace-viewmodel`. Returns only a validated `founder-workspace-viewmodel.v1`; semantics `presentation_only: true` · `authority_effect: none`; no mutation verbs; existing governed mutation paths stay separate. **B1/B2 do not spend this authorization.**
- **FD-3 Programme-state projector law — RULED.** Population = complete governed population under `docs/programme/**` plus the canonical Founder priority thread in `CLAUDE.md`. Record precedence: (1) an explicit Founder adjudication/ratification record governing that exact programme or act; (2) otherwise the newest canonical programme record that explicitly names the programme/lane and carries `Standing`, `Status` or `State`; (3) `CLAUDE.md` may orient or identify a newer unresolved act but does not silently override a specific governed record; (4) conflict or ambiguity → `UNVERIFIED / CONFLICT`, never guessed precedence. Documents not deterministically associable with a programme remain UNCLASSIFIED. `population.complete` may be `true` only when every examined subject is emitted, explicitly excluded by rule, or explicitly classified; unreadable/unresolved subjects prevent `complete:true`. **Projection location: rebuildable operational state under `$AIN_HOME`, not `docs/programme`.** The repository remains the authority source; the projection is derived and disposable.
- **FD-4 Ops instrument output mode — YES, ADDITIVE.** A later bounded B3 act may add machine-readable output to `workstation-storage-census.sh` and `worktree-census.sh`: human behaviour preserved by default · structured mode explicitly requested · output only · no cleanup · no deletion · no sudo · no new probe · no production access · same observations as the existing read-only census.
- **FD-5 Sequencing — YES.** B1–B4 may proceed before the F1 visual walk. **B5 remains blocked on the experiential Founder walk. No renderer replacement before that human ruling.**
- **FD-6 CSP — YES.** B5 must add a CSP to the main Desktop page. No external font, script, style or other convenience dependency.

## IV · New P0 docket rulings

- **OE-1 Voice — OPEN A CHILD PROGRAMME: `JARVIS-VOICE-DOORWAY-01`.** Purpose: a sovereign spoken doorway into the *same* JARVIS mind and work state used by typed interaction. Architecture `microphone → local STT → transcript → SAME O1 intent seam used by typed text → JARVIS plan/answer/work state → text response → local TTS when speech requested`. **One mind, two capture modes. No parallel "voice commands" authority system.** First mode: push-to-talk (also clickable microphone; keyboard hold-to-talk). STT: existing local Whisper substrate — `whisper-server` at `127.0.0.1:8080` per `scripts/start-whisper.sh`; ⛔ no production MAIA Whisper for Founder JARVIS. TTS: local Kokoro, default `http://localhost:8880` per `lib/tts/providers/kokoro.ts`; **LOCAL ONLY · FAIL CLOSED** — ⛔ no `ttsRouter` cloud fallback for Founder speech; Kokoro unavailable → graceful unavailable state, text retained; ⛔ never silently to OpenAI or any cloud provider. Wake phrase "Jarvis…" desired eventually, ⛔ **not authorized for implementation**: `lib/voice/wakeWord.ts` is not an acceptable semantic detector (energy/pattern event treated as simulated detection, never establishing the word). Wake activation requires a later act with genuine wake-word recognition · explicit always-listening setting · visible mic/listening state · local processing · false-activation, background-noise and interruption tests · no audio retention beyond declared policy. **Authorized now: `JARVIS-VOICE-DOORWAY-01 / V0 — EXISTING SOVEREIGN VOICE SUBSTRATE CENSUS + JARVIS OPERATOR VOICE CONTRACT`** (documentary/read-only; may map reusable STT/TTS/mic/turn-taking substrate and specify the contract; ⛔ may not modify Desktop or activate microphones).
- **OE-2 Governed No — REQUIRED.** Open later under `JARVIS-WORK-UNIT-01`. The Workspace may not fabricate the gesture before the Work Unit lifecycle constitutes its meaning.
- **OE-3 Work vs RB-6 — PLAN-ONLY FIRST.** Live Work first supports `ordinary-language intent → plan → authority requirements → HOLD` without executing anything new. Effect-bearing execution enters only after RB-6 is lawfully closed.
- **OE-4 GitHub Monitor — YES, READ ONLY.** A later B3 instrument may report PR state · CI/check state · branch/canonical information · relevant read-only repository state. No GitHub write verb.
- **OE-5 Desktop reliability ownership — CREATE A DISTINCT ACT: `JOP-05 — DAILY-USE RELIABILITY`** (crash · renderer loss · restart · relaunch · window restoration · workspace recovery · first-run · rebinding · app/substrate identity · offline/degraded). Reliability deserves its own falsifiers.
- **OE-6 Results — REVEAL FIRST.** Initial artifact action = Reveal in Finder; ⛔ not arbitrary `openPath`, ⛔ never `openExternal`. Opening files considered later after object and MIME boundaries are governed.
- **OE-7 Continuity freshness — YES, AFTER THE READ-WRITES DEFECT IS CLOSED.** `CONTINUITY-BRIDGE-01` must first reconcile the read path that creates tables / enables WAL; then a local scheduled import with its own observable freshness timestamp.
- **OE-8 Non-code work — ROUTE, DO NOT ABSORB.** JARVIS is doorway and coordinator; it does not take the sovereignty of Writer's Studio, MAIA, email, Drive, other specialist houses or connected services. The specialist environment retains its own law. The research/web lane remains held until its provider-governance prerequisite is actually established.

## V · Blocker model accepted

> We do not have one giant remaining build. We have a dependency graph of small bounded acts.

Child defects stay with their owners: C1 `REPO_ROOT` · local-native write-bearing label · O4 standing drift · RB-6 · Merge Authority · branch-policy authority. The Operating Environment tracks their effect; it does not opportunistically repair them.

## VI · Immediate build authorization

**`JARVIS-FOUNDER-WORKSPACE-01 / B1+B2 — FOUNDER VIEW-MODEL FOUNDATION + READ-ORGAN COMPOSITION`** against canonical `840194ba…`, using the F2 contract at `9b1c1acf…` and the P0 readiness record `eb77216b…`.

- **B1**: `founder-workspace-viewmodel.v1` + validator + adapter harness + VM-1…VM-7 falsifier suite + seven defeat candidates. **Pure. May not touch Desktop.**
- **B2** (after B1's validator is green): `listWorkUnitsV2(home)` · `readEventsTail(n)` · read-only governor report wrapper · results/history enumeration required by the accepted contract · pure adapters from recorded organ outputs into the view-model.
- **B2 read law**: a read must not create directories or mutate state merely to discover that nothing exists; ⛔ do not reuse a path whose `initStore()` performs `mkdirSync` as a pure read — separate read-only resolution from initialization, or provide a non-mutating read wrapper. Missing storage means *not present / empty / unobserved*, not "create it so I can read it".
- **B2 failure law**: corrupt or unreadable objects are surfaced explicitly, never silently dropped.

## VII · Hard stop after B2

B1+B2 do **not** authorize: B3 registry · B4 projector · B5 renderer · new IPC · Desktop mutation · voice implementation · wake word · O1 live wiring · Work execution · Graph join · production · GitHub write · connectors. After B1+B2: **STOP FOR EVIDENCE + NEXT-ACT ADJUDICATION.**

## VIII · Parallel act authorized

`JARVIS-VOICE-DOORWAY-01 / V0` may run independently and must answer ten questions: (1) reusable microphone capture · (2) reusable turn-taking/liveness · (3) MAIA-specific and must not be imported · (4) exact local Whisper contract · (5) exact local Kokoro contract · (6) how spoken input becomes the identical O1 object as typed input · (7) how speech output is optional and interruptible · (8) STT/TTS unavailable behaviour · (9) visible privacy/retention state · (10) evidence required before "Jarvis" wake activation ships. **No microphone activation in V0.**

## IX · Product priority (founder)

FOUNDATION (B1 view-model · B2 read organs) → ORIENTATION (programme projector · Today live) → WORK (plan-only Work · history · results · resume) → UNDERSTANDING (Graph · Monitor) → NATURAL INTERACTION (voice) → RELIABILITY (installed daily-use witness) → EXECUTION (effect-bearing work as governance permits). Voice design proceeds in parallel so it is not an afterthought.

## X · Acceptance standard (founder)

> The final system is not fully functional until Kelly can routinely say or type things like: "Jarvis, what needs me?" · "Continue the MAIA voice work." · "What changed overnight?" · "Show me what is blocking Writer's Studio." · "How is the Mac Studio doing?" · "Where did we leave the RGR research?" · "Prepare the next act." — and JARVIS can answer from governed state, take the lawful next steps, preserve continuity, and expose its evidence without requiring Kelly to reconstruct the machinery. That is the product.

## STANDING (founder)

`JARVIS-FOUNDER-OPERATING-ENVIRONMENT-01 / P0 — PASS · READINESS MODEL ACCEPTED · FD-1…FD-6 RULED · OE-1…OE-8 RULED · VOICE CHILD LANE OPENED AT V0 ONLY · B1+B2 VIEW-MODEL + READ-ORGAN FOUNDATION AUTHORIZED · ALL EXISTING SOULLAB/AIN/MAIA CAPABILITY TO BE COMPOSED WHERE LAWFUL RATHER THAN DUPLICATED · F1 HUMAN WALK STILL OWED BEFORE B5 · NO DESKTOP MUTATION YET`

---

## §Z · JARVIS notes on receipt (not law)

- Three substrate facts the ruling cites were re-verified in source before acting: `lib/voice/wakeWord.ts` computes energy and a pattern heuristic (`:33–46`) and never establishes the word; `lib/tts/providers/kokoro.ts:15` `KOKORO_DEFAULT_URL = 'http://localhost:8880'`; `scripts/start-whisper.sh:10,79` `WHISPER_PORT=8080`, `whisper-server` binary.
- Acts opened by this adjudication and their records: `JARVIS-VOICE-DOORWAY-01_CHARTER_2026-09-23.md` (V0 authorized) · B1+B2 evidence record under `JARVIS-FOUNDER-WORKSPACE-01_B1B2_*`.
- Not opened (named for later founder acts): `JOP-05`, the WORK-UNIT-01 governed-No act, B3, B4, B5, the CONTINUITY-BRIDGE-01 read-writes reconciliation.
