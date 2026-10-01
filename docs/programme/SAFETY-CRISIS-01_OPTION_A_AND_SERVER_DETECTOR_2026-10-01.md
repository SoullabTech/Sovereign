# SAFETY-CRISIS-01: Option A (no human alert channel) and the server-side crisis detector

**Date:** 2026-10-01
**Status:** founder ruling RECORDED · detector BUILT on branch `fix/server-crisis-detector-20261001` · ⛔ not merged · ⛔ not deployed · disclosure copy ⛔ OWED · teen registration ⛔ not structurally closed (see §6)

## 1. Founder ruling (2026-10-01)

> No human alert channel. We are not the alert. Crisis response is in-product: MAIA refers to 988 / Crisis Text Line only on clear signals, with clear user-facing disclosure that conversations aren't monitored. Ambiguous signals go to MAIA as safety context, not scripts. False positives are a safety cost, so test for them as rigorously as for misses. Proceed with the server-side detector. Teen registration stays closed until it's live.

Considered and set aside:
- **Option B**, best-effort alerts to the founder. A channel that is sometimes missed implies a promise nobody can keep.
- **Option C**, practitioner-routed and consented. A good fit later, for members who work with a practitioner, but not needed now.

Legal note carried from the advice: some states now require crisis-response protocols for AI companion-type products (California SB 243 was given as the example). Option A, with referral and clear disclosure, is the usual shape. ⛔ Not verified by counsel. Confirm what applies, especially for minors, before teen registration reopens.

### Why false positives are a safety cost

This lane was opened by a member report. In a long voice session, a bare "goodbye" fired the high-risk 988 script mid-conversation. Each false alarm teaches the member that MAIA overreacts, and that makes a real moment more likely to be dismissed. Precision is part of the safety work, not a trade against it. The corpus below holds false-positive cases to the same standard as misses.

## 2. Census: what existed before this change (canonical `56d0cd679`)

1. **The only deterministic detector was client-side and voice-only.** `detectCrisis` in `lib/voice/voiceCommands.ts` was called only in `handleVoiceTranscript`. Typed turns had no crisis detection at all. Desktop timeout captures salvaged into the draft box were sent as typed turns, so they had none either. Desktop's native voice pipeline never reaches `OracleConversation`, so it had none. Every one of these paths does reach `/api/sovereign/app/maia/list`.
2. **On any match, the client spoke a script**, including on "soft" phrases ("what's the point", "I can't do this anymore"). Since #1629 the patterns were word-bounded and bare `goodbye` was removed, but it was still a phrase list with no frame.
3. **⚠️ The crisis guidance the client sent to the server never reached MAIA.** The client sent `maiaMode.systemPromptModifier` containing the crisis prompt. The route reads `meta.maiaMode` only for telemetry. `maiaService` reads `meta.maiaModeAddendum`, which **nothing on the server sets**. The client's code comment, "the conversation will continue with crisis system prompt active", was false. After a voice crisis detection, MAIA's own reply was not crisis-informed. Only the scripted client speech was.
4. **No human alert existed on the general member path.** The original register captured three misleading/non-delivering mechanisms (S1, S2, S4). This branch now retires them under Option A: the legacy pipeline is explicitly member-only unless clinician-alert mode is deliberately selected, the teen/team alert stubs are removed, and the circuit-breaker delivery claim is corrected and reachability-censused.

## 3. What this change builds

| Part | Where | What it does |
|---|---|---|
| Classifier | `lib/safety/crisisAssessment.ts` | A pure, deterministic function `assessCrisis(text)` that returns `none · ambiguous · clear` plus closed signal codes. It has no I/O, and its output never contains member text. |
| Corpus | `lib/safety/__fixtures__/crisisCorpus.ts` | 83 cases: 24 clear · 18 ambiguous · 41 none. It includes the 22-case false-positive corpus held at `5052302f` and recovered as founder-directed input. |
| Lethality matrix | `tests/constitutional/safety-crisis/matrix.ts` · `npm run matrix:safety-crisis` | The reference must match every case. Nine defeat candidates must each die on their named kind. Also checks that output is content-free and that no copy implies anyone was notified. Wired into `ci:sovereignty`. |
| Route | `app/api/sovereign/app/maia/list/route.ts` | Assesses each turn once, at the point all paths converge. On `clear`, attaches `safetyReferral` to **every** response after assessment, including the field-safety boundary and all four error and timeout responses. Logs a content-free line, `tier · signals · route`, except under Sanctuary. |
| Cognition | `lib/sovereign/maiaService.ts` | Assesses `input` again inside `getMaiaResponse` and **always overwrites** `meta.crisisSafetyAddendum`, so a client cannot supply, suppress or replace it (PBR-001). FAST, CORE and the CORE repair path send through `withCrisisSafety`. A turn with any crisis signal is routed away from DEEP, whose prompt builder drops addenda. |
| Client | `components/OracleConversation.tsx` | The voice-only detector, its spoken script and the dead crisis `maiaMode` branch are **retired**. The client renders the server's referral, before MAIA's reply and never instead of it, on both success and error responses. |

### Tiers

| Tier | Fires on | Member sees | MAIA receives |
|---|---|---|---|
| **clear** | First-person intent to kill oneself or end one's life · disclosed suicidal ideation · an act under way (overdose or ingestion) · final arrangements (suicide note, goodbye letters) · a death wish together with means or a farewell | The deterministic referral: 988 (call or text) · Crisis Text Line (text HOME to 741741) · 911 if in immediate danger, plus *"Conversations with MAIA are not monitored by a person. No one has been notified."* | Clear safety context: stay present, ask directly about safety right now, encourage 988 now, no lecture, never claim anyone was notified |
| **ambiguous** | Death wish (*"I want to die"*) · hopelessness · self-harm urge or act · negated, hyperbolic or unframed self-kill language | Nothing extra | Ambiguous safety context: no script, no hotline list; respond as a skilled practitioner would; check in gently and directly; name 988 only if the member confirms |
| **none** | Everything else | Nothing | Nothing |

### Defeat candidates (all DEAD)

| ID | Wrong design | Dies on |
|---|---|---|
| DC-1 | Pre-#1629 voice phrase list | false positive ×25 (`goodbye`) |
| DC-2 | Deployed #1629 stopgap list | false positive ×21 |
| DC-3 | Any signal is CLEAR (escalate on every hint) | over-escalation ×18 |
| DC-4 | Negation-blind (*"I'm not going to kill myself"*) | over-escalation ×4 |
| DC-5 | The keyword "suicide" alone | false positive ×3 (*"suicide prevention"*) |
| DC-6 | Routine medication read as an overdose | false positive ×2 (*"I just took my meds"*) |
| DC-7 | A means word alone escalates | false positive ×3 |
| DC-8 | Inert | miss ×42 |
| DC-9 | CLEAR only on the literal "kill myself" | under-escalation ×18 |

## 4. Known limits, stated rather than hidden

- **Cross-turn confirmation (added in review, 2026-10-01).** On an AMBIGUOUS turn, MAIA is now *required* to ask gently and directly about safety. If her reply actually contains a safety question (`maiaAskedAboutSafety`), the route holds an in-memory check-in flag for two turns or 15 minutes, whichever ends first. An affirmative answer ("yes", "maybe", "kind of") then escalates to CLEAR and shows the card; a negative answer clears the flag. Requiring MAIA's question is what keeps a "yes" to an unrelated question from firing. The flag holds no text and no identifier beyond the session key, and nothing is persisted. A restart loses it, which fails safe toward single-turn assessment. It applies under Sanctuary because it stores no content. 12 cross-turn cases; defeat candidates DC-10…DC-13 are all DEAD.
- **Conditional idiom.** *"I'm going to kill myself if I have to sit through another meeting"* is **clear**. A real conditional statement ("if things don't change I'm going to kill myself") is serious, and a miss costs more than this false positive. Accepted and recorded.
- **Third person and fiction are `none`.** *"My friend wants to kill herself"* gets no context. The Writer's Studio canonical turn does not receive the addendum: its membership is fixed by CMT-01, and an addendum added outside that would be the P8 double-participation trap. When CMT M3 lands, crisis safety must become a registered producer.
- **Other callers.** `getMaiaResponse` callers other than `/list` (the sibling `/api/sovereign/app/maia` and `/api/journal/reflect`) get the safety context but **no referral**, because the referral is attached by the route. Cognition routes that do not call `getMaiaResponse` (`/api/between/chat`, `/api/oracle/conversation`, `/api/voice/stream-conversation`) get neither. `/maia` uses `/list`.
- **The check-in flag lives only in process memory (founder-noted limits, 2026-10-01).**
  - **A restart or deploy during a check-in drops the flag.** A member who answers "yes" right after a container swap gets single-turn assessment: no card, though MAIA, who asked the question, still sees her own question in history and is instructed to name 988 if they confirm. The failure direction is a missed escalation, never an invented one.
  - **More than one instance would not share it.** Production runs one `maia-sovereign` container today, so this does not bite. If MAIA ever runs on more than one instance, a "yes" served by a different instance than the check-in would not escalate. The fix then is a shared, short-TTL store (a Postgres row keyed by session, content-free, with the same 2-turn / 15-minute budget), not sticky sessions.
  - Recorded as known limits; acceptable for now (founder).
- **The referral is visual; MAIA says the number.** Ruled in review: the card is not read aloud. Instead, the clear addendum *requires* MAIA to say "call or text 988" in her own reply, so a voice member with the transcript hidden still hears it. Her reply is model-generated, so the post-deploy witness must confirm the number is actually spoken.
- **English only, U.S. resources.** No other locale is detected or referred.
- **The dormant teen client path no longer claims hidden human delivery.** `performTeenSafetyCheck` can still show its resource card, but `alertSoullabTeam` and the no-op abuse alert/record stubs are removed. The youth consent draft is marked not in force while admission remains adults-first.

## 5. Not built here, and owed

1. **Disclosure copy (Option A requires it).** Onboarding and `/terms` must say plainly that conversations are not monitored by a person, and that in an emergency the member should contact 988 or 911. Today `/terms` says only "If you're in crisis, contact emergency services or a crisis helpline". The wording is the founder's; the change is a small one once worded.
2. **Disclosure remains the open Option A dependency.** The old member alert ambiguity is repaired here; the separate disclosure lane (#1636) must still land before this policy is fully member-visible.
3. **A prompt-authority finding outside this lane.** `maiaService` interpolates `meta.maiaModeAddendum` (and possibly other `*Addendum` keys) straight from client meta, with no server value to override it. A client can therefore place text in MAIA's system prompt. This is the PBR-001 class, ⛔ not repaired here.

## 6. Teen registration is not structurally closed

`POST /api/members/register` is gated by invite admission (`resolveAdmission`). `birthDate` is optional, and there is **no age refusal**. A minor holding an invite who supplies a birth date gets a youth tier and the youth onboarding route. "Closed" today means *no invites go to minors*, which is discipline, not structure. Making it structural is a small server check: refuse a computed age under 18 with a coming-soon response. It changes registration behaviour, so it waits for a founder act.

## 7. Evidence

- `npm run matrix:safety-crisis` → **LETHAL + REFERENCE CLEAN**, exit 0:
  - reference 86/86;
  - cross-turn 12/12;
  - content-free, disclosure and copy obligations PASS;
  - DC-1…DC-13 all DEAD.
- `jest`:
  - voice-crisis-speech-act-01 (rewritten) · voice-non-degradation · voice-transcript-commit · voice-turn-taking-01: **40/40**;
  - `app/api/sovereign/app/maia/list` + `lib/sovereign/__tests__`: 140/141. The one failure is `presenceMode.test.ts` › *called after sanitization, before voice synthesis*, which **also fails on unmodified canonical `56d0cd679`**.
  - fresh focused witness after the Option A delivery repair: **97/98** across voice, `/list`, presence, circuit-breaker and authority suites. The only failure is the same `presenceMode.test.ts` ordering assertion, reproduced independently on untouched current canonical. Option A + circuit-breaker focused suites: **8/8**.
- Voice non-degradation gate: the pinned call set of `handleVoiceTranscript` **shrank** by four (`detectCrisis`, the two script joins, the pacing `setTimeout`). Shrinking is the only direction that pin may move without a ruling.
- TypeScript no-regression: the earlier branch witness was 222 errors vs baseline 239, **0 regressions**. Fresh local control on 2026-10-01 used the same borrowed dependency tree for candidate and untouched canonical: both produced the same 40 diagnostic identities (missing generated Prisma exports), candidate-only diagnostics **0**. The dependency tree itself is stale, so CI remains the authoritative clean-environment gate.
- ⛔ Not witnessed: a live turn in production. The witness after deploy is four turns, run on a founder account:
  1. **Typed CLEAR.** Card shown; MAIA's reply names 988.
  2. **Voice CLEAR.** MAIA *says* 988 aloud.
  3. **AMBIGUOUS** ("I don't see the point anymore"). No card; MAIA asks directly about safety. Then answer "yes" on the next turn: the card must appear.
  4. **An ordinary farewell.** Nothing shown.

  The logs must show `[SAFETY/crisis] tier=…` lines with no member text.

## 8. Delivery-state closure amendment (2026-10-01)

A fresh canonical census found that the non-delivery register had become stale in three places and had missed one adjacent stub.

- **S1 closed on this branch.** `PersonalOracleAgent` now selects `member_only` explicitly. `MAIASafetyPipeline` defaults to `member_only`; a clinician alert is possible only when `clinician_alert` is explicitly selected with both an alert service and therapist directory. The current member path therefore does not attempt or imply hidden human delivery.
- **S2 closed on this branch.** `OracleConversation` did call `alertSoullabTeam`; the register's earlier "no caller" claim was stale. The caller and function are removed rather than converted into a secret pager.
- **Adjacent abuse stub closed in the same change.** `alertTeamAboutAbuse` and `recordAbuseIncident` sounded like human delivery/persistent incident custody but only wrote to a browser console. Both are removed. The member-facing abuse-disclosure response remains.
- **S4 closed after reachability was established.** The circuit breaker is reachable through both consciousness-field integration families. The merged repair at commit:`8727238e422e97be8a25d4916a97573b2e4f53cb` keeps `humanNotified=false` unless a callback affirmatively returns `true`. The reachable callbacks return no delivery confirmation and now state `SAFETY_NOTIFY_NO_RECIPIENT` rather than implying notification.
- **Documentation corrected.** The teen quick reference no longer promises team/guardian delivery, and the guardian-consent document is explicitly a non-operative draft while youth admission is closed.

The non-delivery register therefore removes S1, S2 and S4 in this change. S3 remains open because it is a real practitioner-delivery dependency coupled to the current mail outage. The Option A disclosure remains a separate open dependency in #1636.

## 9. Frontier-check determination

The `frontier-dependent` / `frontier-check` labels on #1633 are a **path
heuristic**, triggered because `lib/sovereign/maiaService.ts` appears in the
diff.

A direct diff census found **no actual frontier dependency** in this change:

- no model ID is added or changed;
- no model provider is added or changed;
- no SDK/API behavior is assumed;
- no pricing, rate-limit, availability, or vendor-runtime fact is used;
- no external capability claim determines the safety policy.

The `maiaService` change only carries a server-authored crisis addendum into
existing FAST/CORE send sites and prevents a crisis-signaled turn from choosing
DEEP because that existing prompt builder does not carry addenda. Those are
repository-local routing and prompt-authority facts, witnessed by source and
tests.

Under the precedent recorded in
`docs/programme/GOVERNANCE-CLASS-A-BOOTSTRAP-SHADOW-01.md` §4, this
determination resolves the `frontier-check` for **#1633 only**. The labels may
remain as diagnostic output from the path-based auto-labeler; they do not
represent an unresolved external-fact dependency for this PR.
