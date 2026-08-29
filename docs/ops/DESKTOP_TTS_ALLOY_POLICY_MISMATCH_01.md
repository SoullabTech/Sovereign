# DESKTOP-TTS-ALLOY-POLICY-MISMATCH-01 — the trace

```
lane      DESKTOP-TTS-ALLOY-POLICY-MISMATCH-01
supersedes DESKTOP-SOVEREIGN-TTS-01 (Kokoro witness — stopped, not continued)
question  why does an explicit MAIA Alloy voice selection arrive at the
          policy boundary as ttsProviderPref=auto?
```

**Answer: it does not arrive as `auto`. It is overwritten with the literal
string `'auto'` at the call site, one line before the boundary.**

---

## The trace, end to end

```
member settings         mergeVoiceIntent(systemVoice, memberVoice)
                        → memberTtsProvider                      :664
call site               ttsProvider: memberTtsProvider           :983, :1455
route entry             const memberProvider = options.ttsProvider || 'auto'   :175
resolve log             ttsProviderPref: memberProvider          :192   ← truthful
cloud branch            resolveVoicePreference(memberProvider)   :250   ← truthful
kokoro path             ttsProviderPref: 'auto'                  :312   ⛔ LITERAL
ttsRouter               primary = 'openai'                       :185
                        throw TTSFallbackToOpenAI(…, 'auto')     :352
constructor             resolveVoicePreference('auto') → local
                        ≠ 'cloud' → CloudVoiceForbidden          :404
observed                ttsRouter:openai_primary:pref=auto
                        [TTS] Kokoro failed: …                   :317
                        [StreamConversation] TTS returned no audio
```

The member's real preference is computed at `:175`, reported honestly in the
`[tts.resolve]` log at `:192`, and used correctly by the cloud branch at `:250`.
Then the Kokoro path at `:312` passes a hard-coded `'auto'` instead of
`memberProvider`, and that literal is what the policy is enforced against.

> ⭐ **The log and the enforcement disagree.** `[tts.resolve]` prints the
> member's stored preference; the constructor refuses a different value. An
> auditor grepping the logs would see the member's real choice and never learn
> that the boundary was handed something else. A member who stored `cloud` is
> refused with `pref=auto` — a refusal that names a preference they did not set.

Note what is **not** lost: the voice identity survives intact. `:179-187`
resolves `maia_core` → `openaiVoice='alloy'` and `kokoroVoice='af_kore'`
correctly. Alloy is computed and then never delivered, because the branch that
would speak it (`!openaiDisabled`, `:267`) is gated on
`voicePref.effective === 'cloud'`, which `auto` can never satisfy.

---

## Two defects, separable from any policy ruling

**D1 — the enforcement boundary is given a literal, not the member's preference.**
`stream-conversation/route.ts:312`. `ttsProviderPref: 'auto'` discards
`memberProvider`. The sibling branch at `:215` hard-codes `'local'`, which is
correct there — it *is* the member's explicit choice, established by the `if`
above it. `:312` has no such establishing condition; it asserts a preference
nobody expressed. This is a consent-representation defect and is wrong under any
ruling on cloud voice.

**D2 — the archetype intercept is dead on this route.**
`ttsRouter.ts:188-206` resolves a `voiceArchetype` to its provider and, for
`maia_core`, routes to OpenAI Alloy (`voiceArchetypes.ts:67` —
`provider: maiaProvider`, `voice: 'alloy'`, with `MAIA_VOICE_OVERRIDE=kokoro`
as the documented optional override). Neither call site (`:983`, `:1455`)
passes `voiceArchetype`, and the Kokoro path at `:301-313` does not forward it.
So the one code path that expresses *"MAIA's voice identity is Alloy"* to the
router is never reached from the surface that needs it.

⚠️ **Fixing both does not by itself produce audio.** With D1 repaired, an `auto`
member is still refused — correctly, per VOICE-SOVEREIGNTY-02. With D2 repaired,
`maia_core` reaches the intercept and throws
`TTSFallbackToOpenAI(false, 'archetype_openai:maia_core:alloy', 'alloy', pref)`,
whose constructor still refuses unless the preference resolves to `cloud`. The
refusal simply becomes *truthful* rather than spurious. What remains after that
is a genuine policy question, not a bug.

---

## The policy question, stated exactly

`resolveVoicePreference` (`cloudVoicePolicy.ts`) reaches `cloud` only when the
member's **stored provider preference** is the literal `'cloud'` *and*
`MAIA_ALLOW_CLOUD_VOICE=1`. MAIA's **voice identity** (`maia_core` → Alloy) is a
different field on a different axis, and the policy does not read it.

So the founder's conditional — *"if the explicit choice of maia_core/Alloy is
itself sufficient member consent, encode that deliberately and narrowly"* — is a
question about whether **choosing a voice whose provider is OpenAI constitutes
consent to cloud egress**, distinct from choosing a *provider*.

The canon does not currently answer it, and this lane must not answer it by
implementation. `cloudVoicePolicy.ts` is explicit that `auto` — the absence of a
choice — must never be read as consent; whether *choosing Alloy* is a presence of
choice is precisely the undecided part. Recorded here, put to the founder, not
resolved by inference.

## ⛔ NOT WITNESSED

```
no repair has been made — this document is the trace only
D1 and D2 are read from source; neither has been fixed or tested
the acceptance path has NOT been witnessed:
  spoken turn → Whisper → MAIA → OpenAI TTS Alloy → audible Desktop playback
```

Evidence class: **SOURCE**. Probes 1–5 of the superseded Kokoro lane passed on
device (Kokoro synthesised 17,685 bytes of mp3 from inside MAIA); that stack is
stopped and is not evidence for this lane.
