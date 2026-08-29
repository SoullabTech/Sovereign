# VOICE-SOVEREIGNTY-03 — consent is a member act, not an inference

**Founder ruling, 2026-08-29.** Closes the policy question opened by
`DESKTOP-TTS-ALLOY-POLICY-MISMATCH-01` (`docs/ops/DESKTOP_TTS_ALLOY_POLICY_MISMATCH_01.md`).

---

## The ruling

> Choosing MAIA's voice identity is not the same act as consenting to cloud
> egress.

`maia_core → OpenAI Alloy` says **which voice the member wants**. It does not say
*"I consent to sending the text of my conversations to OpenAI for synthesis."*
Two axes, and the ruling is that they must not be collapsed:

```
VOICE IDENTITY      maia_core → Alloy        which voice
EGRESS CONSENT      local / cloud            whether text may leave
```

### Consent is never inferred

Not from `maia_core`, not from `Alloy`, not from `auto`, not from an existing
default voice, and not from the presence of an OpenAI key.

> **A voice pick MAY INITIATE the consent request. It MAY NOT SUBSTITUTE for it.**

### Both gates are required

```
member consent          stored tts_provider = 'cloud'    a member act
deployment permission   MAIA_ALLOW_CLOUD_VOICE=1         an operator act
```

Neither implies the other. An operator cannot consent on a member's behalf by
setting a flag; a member cannot open egress on a deployment that forbids it.

This mirrors the Daily Anchor `surface_preference` model, where eligibility
originates from a member act and the deploy flag is only ever a kill-switch.

### The gesture

```
"Maia uses OpenAI Alloy for this voice. Allow cloud voice synthesis?"

Allow     → store tts_provider = 'cloud'
Not now   → preserve voice identity
          → use local voice if available, otherwise text
```

### Why not the alternatives

**Archetype-plus-flag** (an explicit OpenAI-backed archetype counts as consent,
still gated on the env flag) was tempting and refused: it quietly makes *"I chose
a sound"* mean *"I authorized a data boundary."* The two are not the same
sentence and a system should not read one as the other.

**Archetype alone** (voice identity self-authorizing, no flag) directly
contradicts the standing canon, under which an unset variable is already
sovereign and re-permitting cloud is a visible, deliberate act.

---

## Where it lives in code

| concern | location |
|---|---|
| the ruling itself | `lib/tts/cloudVoicePolicy.ts` — `classifyCloudVoiceGate()` |
| the member act | `POST /api/voice/cloud-consent` |
| the narrow write | `setMemberTtsProvider()` in `lib/voice/voiceControlsService.ts` |
| surfacing a closed gate | `tts_error` SSE event carries `gate` |

`classifyCloudVoiceGate` returns which gate is closed and whether a member act
can open it:

```
permitted              both gates open
consent_required       deployment permits, member has not chosen
                       ← the ONLY state in which a surface may raise the gesture
deployment_forbids     member chose cloud, deployment refuses — not a member question
member_prefers_local   nothing closed, nothing asked
```

Three details carry the ruling rather than merely implementing it:

- **`local` is a choice and is never re-litigated.** Only the absence of a choice
  can be asked about. Asking is not inferring, because the answer still has to
  come from the member.
- **`auto` under a deployment that forbids cloud asks nothing.** Consent could
  not be honoured even if given, so the prompt would be theatre. MAIA speaks
  locally or not at all, and says so.
- **"Not now" stores `local`, not null.** Null is `auto` — the absence of an
  answer — and would make the surface ask again next turn. A member who declined
  has answered; re-asking turns a refusal into attrition. They can change it in
  voice settings, where a decision is revisited deliberately rather than by
  repetition.

### Why consent needed its own route

`POST /api/settings/voice` is a full-replace upsert: every column it does not
receive is written `NULL`. A consent post routed through it would clear
`voice_id_override` and `voice_archetype` — so answering *"yes, you may use the
cloud"* would **erase which voice the member had chosen**.

> ⭐ The ruling's whole content is that identity and egress are separate axes. A
> write that collapses them would contradict it in the one place it matters
> most. `setMemberTtsProvider` updates one column and cannot touch identity.

### Why the archetype is NOT threaded into the router

The trace observed correctly that the router's archetype intercept
(`ttsRouter.ts:188-206`) is unreachable from this route. **Forwarding
`voiceArchetype` into `ttsRouter.synthesize()` is not the repair, and was backed
out before it shipped.**

The intercept runs *before* local dispatch and diverts `maia_core` to OpenAI:

```
no consent      → CloudVoiceForbidden → silence, where the member would
                  otherwise have heard Kokoro
consent, no key → the sentinel throws, the catch does not recognise it,
                  and the turn is silent anyway
```

In production (`MAIA_TTS_PROVIDER=kokoro`, `MAIA_VOICE_OVERRIDE` unset) that
would have taken MAIA's voice away from every member using the default
archetype — inverting the ruling, whose "Not now" branch **preserves** the local
voice.

> ⭐ And it was never needed. MAIA's identity already reaches both providers
> through the `voice` channel: `resolveToOpenAI('maia_core') = 'alloy'` and
> `resolveToKokoro('maia_core') = 'af_kore'`. The archetype channel would have
> added no identity, only a diversion. **Identity resolution and provider
> selection are the two axes; making an identity instruct a provider collapses
> them.**

The archetype is therefore used only as identity and context — to decide whether
the requested voice is cloud-backed, to name it in the gesture, and for
telemetry. It never selects a provider.

### Why a default is not a pick

`resolveArchetypeVoice(null)` returns `{ provider: 'openai', voice: 'alloy' }`.
Deriving cloud-backedness from it directly would raise the consent gesture for
every member who has **never chosen a voice at all** — manufacturing a
cloud-backed identity out of a default.

So `identityIsCloudBacked` requires an actual row in `MAIA_VOICE_ARCHETYPES`
matched from the member's stored `voice_archetype`. The ruling forbids inferring
consent from "an existing default voice"; a default cannot even *initiate* the
request.

### Why a closed gate is no longer silence

`synthesizeWithFallback` returned `null` for every kind of failure, and the
client had no handler for `tts_error` at all. So a member whose consent gate was
closed heard nothing — indistinguishable from a broken service, and impossible
to act on.

Two changes:

- `tts_error` now carries `gate`. `"TTS unavailable"` is true of a closed consent
  gate and of a crashed synthesiser alike; naming which is what makes a response
  possible. Without it a surface can only apologise.
- A dedicated `cloud_voice_consent_required` SSE event is emitted **before any
  synthesis and independent of it**, carrying `voiceArchetype`, `voiceLabel`,
  `provider`, `voice`, `storedPreference` — and **no transcript or conversation
  content**. The gesture is about a data boundary, so it must not itself cross
  one.

⭐ Emitting it does **not** withhold audio. Local synthesis proceeds with the
already-resolved `af_kore` mapping. The ask is additive, never a toll. It is
classified once per request rather than per sentence, and "Not now" storing
`local` makes the state unreachable on later turns — so a decline is durable
rather than re-litigated.

---

## The four cases the ruling turns on

| case | required behaviour | status |
|---|---|---|
| `maia_core` + `auto` + cloud permitted | MUST NOT reach OpenAI until the member acts | source-verified: `classifyCloudVoiceGate` returns `consent_required`; `TTSFallbackToOpenAI` refuses `auto` independently |
| `maia_core` + `auto` + local Kokoro available | MUST speak locally as `af_kore`, not go silent | source-verified: archetype is not forwarded, so local dispatch is unchanged |
| `maia_core` + member declines | MUST preserve `maia_core` identity, use `af_kore` | source-verified: consent write touches only `tts_provider`; `local` routes to Kokoro |
| `maia_core` + `cloud` + `MAIA_ALLOW_CLOUD_VOICE=1` | → OpenAI Alloy | source-verified: `cloud_allowed`; route's `!openaiDisabled` branch resolves `alloy` |

⚠️ **"Source-verified" means read, not run.** None of these four has been
executed. They are the acceptance set for whoever takes this to a device.

---

## Verification

```
PASS  npm run typecheck        no TypeScript regressions
                               231 errors vs baseline 239
PASS  npm run check:no-supabase   no Supabase detected
```

Both are the repository's own gates. (An earlier reading that the gate was
inoperable was wrong: `npx tsc` resolved a global TypeScript 6.0.2, which refuses
`tsconfig.json`'s deprecated options; the repo pins 5.9.3 and the gate runs
normally through `npm run typecheck`.)

## ⛔ NOT WITNESSED

```
the consent GESTURE has no client surface.
  cloud_voice_consent_required is emitted; nothing consumes it yet.
  a member can currently only consent via an authenticated
  POST /api/voice/cloud-consent {"allow": true}

no code in this change has been EXECUTED.
  typecheck is not behaviour. no test was written or run against the
  four cases above.

the acceptance path has NOT been witnessed:
  spoken turn → Whisper → MAIA → OpenAI TTS Alloy → audible Desktop playback
```

Evidence class: **SOURCE**. `UNWITNESSED is not a pass.`
