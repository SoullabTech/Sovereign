# JARVIS-VOICE-PROSODY-ALLOY-01 — Freeze Record

**Date**: 2026-08-28
**Record type**: Evidentiary freeze record. Not a spec, not a plan, not an authorization.
**Scope**: Describes a frozen specimen branch. Authorizes nothing.

---

## 1. Custody

```
unit        JARVIS-VOICE-PROSODY-ALLOY-01
lane        ALLOY-PROSODY (MAIA Conversation 1.0)
branch      claude/maia-prosody-alloy-06r3r6
candidate   fe5cb13105fff29a122455021fca2bb4606e706d
parent      847485d413357a837909c956bc8eff71a1f21d40  (clean-main-no-secrets tip)
shape       one commit directly on canonical; working tree clean at freeze
```

Files in `fe5cb131` (+807 / −8):

| file | status |
|---|---|
| `lib/tts/openaiSpeechAdapter.ts` | new |
| `lib/tts/__tests__/openaiSpeechAdapter.test.ts` | new |
| `lib/tts/openaiTts.ts` | modified |
| `app/api/voice/stream-conversation/route.ts` | modified |
| `scripts/bench-openai-tts-prosody.ts` | new |

### 1.1 Superseded custody record — `e63b8b9`

An earlier lane report cited the candidate as **`e63b8b9`**. That SHA is
**invalid** — `git cat-file -t e63b8b9` returns `fatal: Not a valid object name`.
It was never a commit in this repository.

It was not a transcription error. It was asserted in a report without having
been read from `git`, and is therefore a **fabricated custody record**. It is
superseded in full by the verified SHA above, which was confirmed against both
the local ref and `git ls-remote origin` (local and remote heads identical).

Any programme ledger, review note, or downstream record citing `e63b8b9` should
be corrected to `fe5cb131`.

---

## 2. State

```
state       PROTOTYPE PROVEN LOCALLY
PR          NONE
merge       NOT READY
deploy      FORBIDDEN
runtime     UNTESTED
class       Class A + Frontier-Dependent  (ruling NOT YET MADE — see §4)
```

"Proven locally" means exactly: unit tests pass on this machine. It does **not**
mean heard, measured, deployed, or sovereignty-cleared.

**Verified locally at `fe5cb131`:**

- 309/309 tests pass across `lib/tts` + `lib/voice`, including the full
  `voiceSovereignty` suite (22 of those tests are new to this candidate).
- `npm run check:no-supabase` — clean.
- `npm run typecheck` — **FAILS**, at `app/wisdom-keepers/sacred-texts/page.tsx:207`
  (`TS2322`). Verified pre-existing: the gate fails identically with this
  candidate's changes stashed, at an identical error count (231). This is a
  base-branch condition on `847485d`, unrelated to this lane or to any of the
  three MAIA Conversation 1.0 lanes.

**Not verified:**

- Latency (request → first audio; total TTS) — **NOT MEASURED**.
- Runtime A/B/C listening acceptance — **NOT PERFORMED**.

Neither was measurable in the build environment: no `OPENAI_API_KEY`, OpenAI
egress blocked, and cloud voice forbidden under the current canon. No latency
figure was estimated, and none should be inferred from this record. The harness
`scripts/bench-openai-tts-prosody.ts` refuses to run unless cloud voice is
deliberately re-permitted, and correctly refused.

---

## 3. Sanctuary-in-adapter — P0 finding

`fe5cb131` routes Sanctuary state **into** the OpenAI prosody adapter:

```ts
resolveOpenAISpeechDelivery({
  ...
  sanctuary: options.sanctuary,
})
```

which the adapter translates into a provider instruction clause:

> "This is a private, held moment. Stay quiet and contained."

This is architecturally backwards. It teaches the adapter how to make a
Sanctuary cloud request *sound*, when such a request must instead be
**impossible before the adapter exists in the call chain**.

```
WRONG (as built in fe5cb131)        RIGHT (target)

Sanctuary                            Sanctuary
   ↓                                    ↓
OpenAI                               cloud gate
   ↓                                    ↓
"please sound contained"             REFUSED
```

### 3.1 The test suite pins the violation

`lib/tts/__tests__/openaiSpeechAdapter.test.ts` contains:

```
"sanctuary adds a containment clause rather than a flourish"
```

This asserts the violating behaviour **as correct**, converting a sovereignty
violation into a regression guard that protects it. A future contributor
removing the Sanctuary clause would be met with a failing test instructing them
not to. This is the more serious half of the finding.

### 3.2 Resolution constraint (binding on any resumption)

- The repair is **removal**, not a stronger or more tasteful Sanctuary
  instruction. `sanctuary` leaves `SpeechInstructionInput` entirely, so the
  adapter has no expressible opinion about a Sanctuary turn.
- The pinning test is **deleted**, not rewritten.
- Sequenced as step 5, after `SANCTUARY-CLOUD-WALL-01`.

### 3.3 Census fact for the wall's design

`resolveVoicePreference(stored)` in `lib/tts/cloudVoicePolicy.ts` takes only the
stored provider-preference string. **Sanctuary is not one of its inputs.** It is
in scope at the call site in `app/api/voice/stream-conversation/route.ts` but is
never passed to the gate.

Consequence: the current gate cannot refuse on Sanctuary *even in principle*.
The refusal must be **added** to the gate; it cannot be recovered from existing
behaviour by configuration or by reading the policy more strictly.

---

## 4. Class A + Frontier-Dependent — egress ruling NOT MADE

### 4.1 What is and is not established

**Established**: `buildSpeechInstructions` takes no spoken-text parameter and
composes only from a closed enum-keyed vocabulary. It cannot carry the
transcript, and no injection path runs from member speech into provider
instructions.

**Not established, and previously conflated with the above**: that the
instructions carry nothing sensitive. These are different claims. The earlier
lane report proved the first and allowed it to stand in for the second.

### 4.2 The actual disclosure

Instruction clauses encode MAIA's *derived relational interpretation of the
member*, for example:

```
You are settling and grounding someone.
You are holding a limit kindly.
You are reflecting back what you heard.
```

`MEET_BOUNDARY` alone discloses that MAIA judged a limit was being tested. The
closed vocabulary bounds the *shape* of the disclosure; it does not make it not
a disclosure.

Today the cloud TTS provider receives the text being spoken. This candidate
would **additionally** transmit MAIA's inferred posture, energy, and relational
state — a genuine expansion of provider egress, not a re-encoding of what
already leaves.

### 4.3 The unmade ruling

> Does a member's choice of cloud TTS authorize sending only the text required
> for synthesis, or also MAIA's derived relational/prosodic interpretation of
> the encounter?

**This ruling has not been made.** `fe5cb131` presumes the second answer without
authority to do so. Sanctuary makes the stake concrete: the prototype would
explicitly disclose to OpenAI that an encounter is a "private, held moment."

Classification for any future review: **at least Class A + Frontier-Dependent.**

---

## 5. Unknown-model false-observability defect

`resolveOpenAISpeechDelivery` is not fail-closed on an unrecognized model:

```ts
if (modelSupportsInstructions(model)) { /* instructions */ }
return { channel: 'speed', model, speed: baseSpeed };   // ← catch-all
```

`lib/tts/openaiTts.ts` independently re-checks `modelSupportsSpeed()` and drops
the speed for an unrecognized model. The two disagree:

```
prosody adapter log:  control = speed
actual wire:          control = none
```

The adapter emits **self-reported false evidence**, in the module whose stated
purpose is truthful observability at the provider boundary. An unknown, future,
or mistyped model name reaches production carrying no delivery control at all,
while the logs claim one applied.

Resolution constraint: a third `unsupported` arm, or a fail-closed error.
**Not** a widened `SPEED_CAPABLE_MODELS`. Sequenced as step 6.

---

## 6. Cross-lane collision — corrected

**Withdrawn**: the earlier lane report claimed `CONFLICTS WITH VOICE-CAPTURE`
(#1126). That claim was inferred from file adjacency without reading #1126, and
is not real for the authoritative capture candidate — #1126 works in
`ContinuousConversation.tsx` and its capture-forensics files, which this unit
does not touch.

**Actual collision** — shared file `app/api/voice/stream-conversation/route.ts`:

```
MEMORY F10 ─────────────┐
                        ├──→ app/api/voice/stream-conversation/route.ts
SANCTUARY-CLOUD-WALL-01 ┤
                        │
ALLOY-PROSODY ──────────┘
```

**MEMORY F10 holds the shared-file lease.** ALLOY-PROSODY yields.

Confirmed no collision with MEMORY-SURFACING outside that shared file.

---

## 7. Prohibitions in force

Until the lease sequence in §8 completes, on `claude/maia-prosody-alloy-06r3r6`:

- **No PR.**
- **No merge.**
- **No deploy.** (Independently also barred by the Sanctuary/cloud hold.)
- **No further edits to `app/api/voice/stream-conversation/route.ts`.**
- **No further commits on the branch.** `fe5cb131` remains **byte-frozen** as the
  specimen this record describes. Do not amend it, rebase it in place, or
  force-push it. Resumption work begins from a *new* candidate built on the
  post-lease canonical (§8 step 4).

Merge, production ordering, and deploy authority belong to the MAIA
Conversation 1.0 programme coordinator, not to this lane.

---

## 8. Resumption sequence

```
1. MEMORY F10 Sanctuary retrieval wall
2. SANCTUARY-CLOUD-WALL-01 egress wall
3. release shared stream-conversation lease
4. rebase/rebuild PROSODY on resulting canonical
5. remove Sanctuary from OpenAI adapter entirely (§3)
6. make unknown model resolution fail closed / truthful (§5)
7. explicit Class-A ruling on derived-state egress (§4)
8. run controlled A/B/C + latency harness
9. only then decide whether it deserves a PR
```

Steps 5–7 are **preconditions**, not cleanup. Step 7 in particular may return an
answer that invalidates the approach rather than permitting it; nothing in this
record presumes the unit is destined to merge.

---

## 9. What the specimen established

Two findings survive the corrections above and are the reason `fe5cb131` is
preserved rather than discarded.

**9.1 — MAIA's prosodic intelligence substantially exceeds what the provider
receives.** MAIA computes `energy`, `warmth`, `pace`, `clarity`, `emphasis`,
`pauseMs`, `intentTag`, a session prosody baseline, and a relational
`MoveIntent`. At the OpenAI boundary this collapsed to text, voice, format, and
a speed value confined to 0.92–1.10. Specifically: `energy` was read by no
adapter function at all; four of six `intentTag` values had no effect;
`generateSSML` was computed on every sentence and then discarded on both the
OpenAI and Kokoro paths; and `MoveIntent` never reached prosody at all — it was
computed on all three response paths and only ever logged into the `complete`
event.

**9.2 — The provider's two control channels are mutually exclusive.** Verified
against the pinned `openai@4.104.0` `SpeechCreateParams`
(`developers.openai.com` and jsDelivr are egress-blocked in the build
environment, so the pinned artifact is the authority):

```
SpeechModel = 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-tts'

instructions?: string
  "Control the voice of your generated audio with additional instructions.
   Does not work with `tts-1` or `tts-1-hd`."

speed?: number
  "The speed of the generated audio. Select a value from `0.25` to `4.0`.
   `1.0` is the default. Does not work with `gpt-4o-mini-tts`."
```

No model honours both. Any future design must carry pace in language rather
than in `speed`, and must not send a control the chosen model silently
discards. Current OpenAI documentation lists `gpt-4o-mini-tts` maximum input at
2,000 tokens — unverified against MAIA's per-sentence streaming, though
unlikely to bind.

The candidate preserved the existing `tts-1` path mechanically: its tests assert
`tts-1` returns the speed channel at the supplied value, and the provider module
emits only fields its model-capability map supports. Default behaviour is
unchanged unless `OPENAI_TTS_MODEL=gpt-4o-mini-tts` is set.

---

## 10. Standing

This record is evidentiary. It authorizes no change, lifts no hold, and makes no
ruling — in particular it does not make the §4 ruling, which remains open.

The unit reached the point where prosody stops being an audio-quality question
and becomes a sovereignty question. That is why it is frozen rather than
finished, and why §3, §4, and §5 are binding on anyone who resumes it.
