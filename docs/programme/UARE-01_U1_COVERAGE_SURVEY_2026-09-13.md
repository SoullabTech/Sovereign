# UARE-01 — U1 Coverage Survey — Result

**Date:** 2026-09-13 · **Lane:** `UARE-01` · **Authorized by:** founder ruling 2026-09-13 (U1, narrow).
**SHA under study:** `36374edb` (branch `claude/uare-ai-analysis-bm8azo`).
**Grammar:** charter §5.1 ladder. **Canary:** §0.1, at 2/3 on entry — **and at 2/3 on exit** (§6).

⚠️ **Environment disclosure.** `node_modules` was absent in this container; dependencies were installed
with `npm install --ignore-scripts --no-audit --no-fund` (2450 packages) to make execution possible.
That is **not** a clean `npm ci`, and postinstall steps did not run. The run below is therefore
evidence about these three suites under the repo's own `jest.config.js`, on `36374edb`, in an
install that skipped scripts — stated so the next reader can decide whether that is enough.

---

## 1 · Execution

```
npx jest --config jest.config.js \
  __tests__/voice-non-degradation.test.ts \
  __tests__/voice-transcript-commit.test.ts \
  __tests__/r2-voice-continuity-contract.test.ts

Test Suites: 3 passed, 3 total
Tests:       35 passed, 35 total
Time:        3.398 s
```

⛔ **A green run is not `GATED`.** It establishes that the assertions present pass. Whether those
assertions *decide the claimed boundary* is the separate question §2 answers, and it is the one that
governs promotion.

## 2 · Body inspection — the inversion criterion

Founder criterion, applied to every row: **if the claimed gate were removed or inverted, would this
assertion be capable of failing?**

### ⭐ Category finding — these are source-shape gates, not behavioural ones

**None of A1–A5 executes the voice path.** Every one reads source files as text and asserts over
them: A1 through a TypeScript **AST walk**, A2–A5 through regex and substring matching on
comment-stripped source.

**[I]** That is not a defect — a structural gate is the right instrument for *"the mind may not be
substituted"*, and it is why the non-degradation gate can be stated as law at all. But it fixes what
the whole A-block can mean: **these tests detect source drift, not runtime regression.** A refactor
that preserves the literals while changing behaviour passes every one of them. Any future sentence of
the form *"voice is gated"* must carry that qualifier.

### Row by row

| Row | Claim | Inversion result | State |
| --- | --- | --- | --- |
| **A1** | convergence — one canonical cognition call, nothing between log line and cognition | ⭐ **DECISIVE** | **TEST PASSING** |
| **A2** | one commit seam, committed exactly once | **DECISIVE** on *one seam / one append*; **NOT decisive** on *reached by every terminal path* | **TEST PASSING (narrowed)** |
| **A3** | stalled TTS delays, never erases | **NOT decisive** — proves the watchdog exists in source, not that it arms or survives | **TEST PRESENT** |
| **A4** | commit not gated on `showVoiceText` | ⛔ **NOT DECISIVE** — see below | **TEST PRESENT** |
| **A5** | emitted text and persisted transcript are the same guarded value | **NOT decisive** — proves two spellings coexist at two named sites | **TEST PRESENT** |

**A1 — decisive, and decisive by construction.** Its ⛔ cases do not describe the inversion, they
*perform* it: each synthesizes a mutated source (`maiaSpeak("ahead")` inserted immediately before
`await handleTextMessage(...)`, an unknown responder added to the successful path, a restored
streaming exit) and asserts the instrument rejects it. One probe even asserts that the handler-wide
call **set** stays identical while the **ordered tail** diverges — the case a set-comparison alone
would miss. That is the inversion criterion satisfied inside the test, which is the strongest form
available without executing the component. **Promote.**

**A2 — decisive in part.** `expect(directAppends).toHaveLength(1)` over a delimited region genuinely
fails if a second append appears; the seam declaration and idempotence guard fail if removed.
**Two ambiguities recorded:** *(i)* the region is delimited by searching for the literal
`console.error('Text chat API error:'` — an error-message string as a structural anchor, so an
unrelated copy edit to that message silently moves the region's end; *(ii)* the "every terminal path"
assertion checks that six `commitOracleTurn('<reason>')` literals **exist in the file**, which is not
the same as those paths reaching the seam. Promote the narrowed claim only.

**⛔ A4 — the finding of this survey.** The whole assertion is:

```js
expect(code).not.toMatch(/isInVoiceMode\s*&&\s*showVoiceText/);
```

A re-introduced render gate spelled `showVoiceText && isInVoiceMode`, `if (showVoiceText) {`, or via
any derived boolean **passes this assertion while violating the boundary it claims to hold.** The
test bans one spelling, not the behaviour. This is precisely the 2026-09-07 defect — *a render
preference deciding what MAIA could remember saying* — and the gate written to prevent its return can
be green while it returns.

⛔ **NOT REPAIRED.** U1 authorizes recording failures and ambiguities, not fixing them. Repair is a
separate act on the owning voice lane, and it is a source change this lane may not make.

**A3, A5 — decisive against deletion only.** Both prove a mechanism is spelled in the source. Neither
can fail if the mechanism is present but mis-wired: a watchdog never armed on the live path, a
`clearTimeout` firing early, a third emission site using the raw chunk. Deletion-resistance is real
value and is not what their claims assert.

## 3 · Remaining rows — corrected

⚠️ **The original matrix under-reported existing coverage.** It surveyed `__tests__/` at the
repository root and `lib/voice/*.ts`, and did not look in **`lib/voice/__tests__/`** — 18 further
test files, several directly on these rows: `mobile.robustness.test.ts` (incoming call · Bluetooth
handoff · resume after notification · iOS background audio mode), `conversationContinuityBuffer`,
`restartAuthority`, `utteranceTail`, `webSpeechLifecycle`, `StreamingAudioQueue.watchdog`,
`micLiveness`, `rapidEndPolicy`, `realtime.soak`.

**[I]** This is the Anchor's *inverse drift* in miniature — under-reporting operational reality — and
it is the symmetric error to the one §0.1 names. Worth recording as such: the canary watches for
claims that grew too strong; this is a claim that stayed too weak because the search was too narrow.

⛔ **These rows stay `NOT SURVEYED`.** A located test file is not `TEST PRESENT`; under §5.1 that rung
requires the assertion to be *read* and to *decide*. The files are named as candidates so the next
pass starts from them instead of re-deriving them. ⛔ **Resist the pull to count them** — locating a
test and reading its name is exactly the evidence that was already found insufficient once today.

| Row | Candidate located |
| --- | --- |
| A6 text↔voice switching | `lib/voice/MaiaRealtimeWebRTC.ts` |
| A7 reconnect continuity | `lib/voice/__tests__/conversationContinuityBuffer.test.ts` · `restartAuthority.test.ts` |
| A8 no duplication | `lib/voice/webSpeechLifecycle.ts` · `__tests__/webSpeechLifecycle.test.ts` |
| A9 second turn works | — none located |
| B1 echo / feedback | `lib/voice/voice-feedback-prevention.ts` (**CODE PRESENT**, no test located) |
| B2 barge-in | `components/OracleConversation.tsx` · `components/voice/ContinuousConversation.tsx` |
| B3 endpointing | `lib/voice/__tests__/utteranceTail.test.ts` · `rapidEndPolicy.test.ts` |
| B4 network drop | `lib/voice/__tests__/webSpeechLifecycle.test.ts` |
| B5 backgrounding | `lib/voice/__tests__/mobile.robustness.test.ts` (iOS background audio mode) |
| C1–C4 device / interruption | `lib/voice/__tests__/mobile.robustness.test.ts` (call · Bluetooth · resume) |
| D1 stale UI state | `lib/voice/micLiveness.ts` · `__tests__/micLiveness.test.ts` |
| D2 interim transcript tape | repaired 2026-09-07; no test located |

## 4 · What U1 owes next

1. Read the located bodies against the inversion criterion. Expect the A4 pattern to recur — a banned
   spelling standing in for a banned behaviour is a cheap gate to write.
2. Decide whether a source-shape gate can ever discharge a *behavioural* row (B1–B5, C1–C4, D1). ⛔ Not
   a question this lane answers.
3. A4's non-decisiveness is a finding for the owning voice lane, with a named failing case
   (`showVoiceText && isInVoiceMode`). ⛔ This lane hands it over; it does not fix it.

## 5 · Not done, not authorized

⛔ No source repaired · no `[O]` claimed · no product witnessed · no requirement authored · no
Practitioner Studio doctrine · no competitive-derived acceleration · ⛔ **nothing reached `GATED`.**

## 6 · Canary status

**2 / 3 — unchanged.** No standing rose without a crossing in this survey. Every movement was
downward or lateral: one promotion to `TEST PASSING` (A1) carrying an executed run and an in-test
inversion proof; one narrowed promotion (A2); three rows held at `TEST PRESENT` with their
non-decisiveness recorded; twelve rows held at `NOT SURVEYED` despite located candidates.

> *The survey found the gate written to prevent a defect's return can be green while it returns. That
> is what the ladder was built to surface, and finding it is the instrument working, not failing.*

---

# U1 — SECOND PASS · `lib/voice/__tests__/`

**Authorized:** founder ruling 2026-09-13 (U1 continuation). **SHA:** `7f52f587` — docs-only delta from
`36374edb`; **no source changed between them.** **Canary: 2/3, unchanged.**

## 7 · Execution

```
npx jest --config jest.config.js \
  lib/voice/__tests__/{restartAuthority,utteranceTail,micLiveness,
                       conversationContinuityBuffer,webSpeechLifecycle,rapidEndPolicy}.test.ts

Test Suites: 6 passed, 6 total
Tests:       125 passed, 125 total
```

## 8 · ⭐ The instrument-class finding

**These are a different class of instrument from the A-block, and a stronger one.** Every file
inspected imports the real module and executes it — `../restartAuthority`, `../utteranceTail`,
`../micLiveness`, `../conversationContinuityBuffer`, `../webSpeechLifecycle`, `../rapidEndPolicy`,
and `mobile.robustness` imports `../micSession`, `../wakeWord`, `../guardrails`. They assert on
returned decision values (`d.allowed`, `d.reason`, `s.tailAtRisk`, `s.interimOutstanding`, `v.dead`,
`v.cause`) rather than on source text.

So the repository holds **both** guard kinds, and the distinction is now load-bearing:

```text
LEXICAL / SOURCE GUARD     reads the file as text; fails on source drift
BEHAVIORAL GUARD           executes the unit; fails on wrong behaviour
```

⛔ **Neither is superior in general** — a source guard is the right tool for *"the mind may not be
substituted"*, which is a structural law. But a row's claim decides which kind can discharge it, and
**a lexical guard can never discharge a behavioral row.** That is exactly A4's defect (§2, handoff).

## 9 · 🔴 The second finding — a test whose body asserts nothing it is named for

`lib/voice/__tests__/mobile.robustness.test.ts`, *"should pause on incoming call"*. It constructs a
real `MicSession`, starts it, asserts it is listening, simulates the interruption
(`visibilitychange` → `visibilityState: 'hidden'`), and then its final assertion is:

```js
// In real implementation, would pause/resume
expect(session).toBeDefined();
```

**It cannot fail if pause is absent, broken, or inverted.** The comment says so in the file. This is
the founder's named anti-pattern in its purest form — and it is the *"read the test name"* trap
materialized in the repository: the name claims a boundary the body never approaches.

*"should handle Bluetooth handoff"* is weaker than it appears for a different reason: after
dispatching `devicechange` it asserts `session.isListening()` is `true`, which is **also what a
complete no-op produces** — the session was already listening. The assertion can fail only if the
event *stops* listening, the opposite of the claim.

⚠️ **Scoped precisely, not generalized:** only 1 of 31 `expect(...)` calls in that file is a
`toBeDefined`/`toBeTruthy` tautology. **The file is not condemned; two named tests are.** ⛔ Not
repaired — U1 records.

## 10 · Rows — what was and was not earned

⭐ **Grain mismatch, recorded and not resolved.** Each behavioral suite decides a **narrower**
property than the matrix row claims. Under *"never widen a test's claim from its name"*, the rows
therefore **do not reach `TEST PRESENT`** — what is established is recorded beside them instead.

| Row | What the suite actually decides (passing, `7f52f587`) | Row state |
| --- | --- | --- |
| A7 reconnect continuity | `conversationContinuityBuffer` decides buffer retention and ordering; `restartAuthority` decides whether a restart is `allowed` and why | **NOT SURVEYED** — narrower than *"a reconnect resumes the same conversation"* |
| A8 no duplication | `webSpeechLifecycle` passes; ⛔ its dedup assertions were **not** read | **NOT SURVEYED** |
| B3 endpointing | `utteranceTail` decides `tailAtRisk` / `interimOutstanding`; `rapidEndPolicy` passes | **NOT SURVEYED** — tail-risk detection ≠ *"trailing words survive"* |
| B5 backgrounding | `mobile.robustness` iOS background-audio-mode test not read | **NOT SURVEYED** |
| C1–C4 device / interruption | 🔴 located, executed, **non-deciding** (§9) | ⛔ **NOT `TEST PRESENT`** — assertion does not decide |
| D1 stale UI state | `micLiveness` decides `dead` / `cause` / `silentForMs` | **NOT SURVEYED** — liveness detection is the substrate, not the UI-state claim |

⛔ **The grain mismatch is not resolved by restating the rows.** Editing a row to fit the evidence
found would be fitting the claim to the instrument — the canary's mechanism running backwards. The
rows stand as written; the mismatch is a finding for the founder.

## 11 · Canary — 2/3, unchanged

Nothing was promoted. Two rows moved **down** from an implied to an explicit non-deciding state; six
stayed at `NOT SURVEYED` despite located, executing, passing tests. **125 green tests produced zero
promotions**, which is the correct result when the suites decide properties other than the ones
claimed.

> *The first pass found a gate that can be green while the defect returns. The second found a test
> that cannot fail at all. Both were passing.*
