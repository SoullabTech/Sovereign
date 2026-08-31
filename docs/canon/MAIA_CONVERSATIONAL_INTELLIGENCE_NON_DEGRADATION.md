# MAIA DEEP-INTELLIGENCE GATE
## (Conversational Intelligence — Non-Degradation Rule)

**Status:** standing ruling and **hard acceptance gate**, founder, 2026-08-31.
**Not a preference.** Desktop voice is acceptable *only* if spoken conversation
enters MAIA's full canonical intelligence pathway. **There is no reduced voice
version of MAIA.**
**Applies to:** all voice, Desktop, transport and latency work, from this point forward.
**Occasion:** four days of Desktop voice repair, during which the pressure to make
voice "work" was continuous and the temptation to make it work *cheaply* was never
once named as a risk.

---

## The rule

The purpose of repairing Desktop voice is to restore **access to** the full MAIA
conversational intelligence developed through the R&D.

⛔ It is not acceptable to make voice work by routing spoken turns through a
thinner, cheaper, generic, stateless, or otherwise reduced conversation path.

> **Voice may have a different capture path. It may not have a different mind.**
>
> **We are repairing MAIA's ears and mouth. We are not replacing her mind.**

Not "a good approximation". Not "the same model". Not "sounds like MAIA". The
spoken turn must reach the same canonical cognition architecture that gives MAIA
her depth.

## The core invariant

After STT produces the authoritative member text, **spoken and typed turns must
converge on the same canonical MAIA cognition boundary.** From that point they
must have identical access to the governed intelligence architecture, including
where applicable:

- member identity and continuity
- conversation / thread context
- relational memory and Anamnesis
- developmental and relational state
- Spiralogic / elemental intelligence
- attention and contextual routing
- model / capability orchestration
- provenance and epistemic standing
- consent and Sanctuary boundaries
- reflection versus authority distinctions
- uncertainty and interpretive restraint
- cross-domain synthesis
- the established MAIA relational voice

⭐ **The model is a worker inside this architecture, not MAIA herself.** What was
designed through the R&D was never "speech in → generic chatbot → speech out". The
intelligence lives in the governed layer above the model. A change that swaps or
degrades that layer degrades MAIA even if every transport test is green.

## Explicit prohibitions

Do not solve latency, reliability, or Desktop integration by silently:

- bypassing memory
- reducing relational / context payloads
- skipping AIN orchestration
- using a generic prompt instead of the canonical MAIA context
- routing voice to a weaker conversational model merely because it is faster
- removing developmental / elemental context
- truncating meaningful conversation history without governed policy
- bypassing provenance / consent
- creating a Desktop-specific "simple MAIA"
- **treating TTS/STT success as proof that conversational intelligence is intact**
- reproducing MAIA's tone without MAIA's underlying intelligence

That last one is the load-bearing prohibition. Transport tests are the ones that
are easy to make green, and a green transport says nothing whatever about whether
the mind behind it is the one that was designed.

## What this rule does NOT cover

⛔ **Hearing accuracy is not intelligence.** Whisper is MAIA's ear, not her mind.
Escalating a transcription model — `base → small`, say — is movement *toward* the
designed system, not away from it. A sophisticated relational intelligence fed
*"I'm having a really good time"* when the member actually said *"I'm having a
really hard time"* will produce a disastrously inappropriate answer no matter how
good its reasoning is. Fixing the ear is a precondition of the intelligence being
able to act at all.

The distinction to hold: **the ear may be improved freely; the mind may not be
substituted.**

---

## The convergence point, named

The invariant requires the convergence point to be named in code rather than
assumed. As of `b17cbf8ff` it is:

```
components/OracleConversation.tsx:7268
    await handleTextMessage(cleanedText);          ← inside handleVoiceTranscript
```

The full path, for both modalities:

```
SPOKEN                                    TYPED
  ContinuousConversation                    composer submit
  → sovereign capture → Whisper
  → onTranscript(transcript)
  → handleVoiceTranscript                   → handleTextMessage
      · empty-transcript guard
      · duplicate/echo suppression
      · crisis detection
      · mode / journal commands
      └────────────► handleTextMessage ◄────────────┘
                          │
                          ├─ apiFetch(apiEndpoint)   OracleConversation.tsx:5362
                          └─ apiEndpoint on /maia = '/api/sovereign/app/maia/list'
                                                    (app/maia/page.tsx:843, :1540)
```

⭐ **Voice currently satisfies the invariant.** It does not carry its own request,
its own prompt, its own endpoint, or its own model selection. Everything above
`handleTextMessage` is *capture and admission* — guards that decide whether a
member turn exists at all. Everything below is one shared cognition path.

⚠️ **The default is not the live value, and that is a standing hazard.**
`apiEndpoint` defaults to `/api/between/chat` (`OracleConversation.tsx:626`) and is
overridden to `/api/sovereign/app/maia/list` by `/maia`. A surface that mounts
`OracleConversation` without passing the prop silently gets a different
conversational route. That is exactly the shape this rule exists to catch, and it
is reachable today by omission rather than by intent. A stale comment at
`:7266` still reads `Browser STT → /api/between/chat → Browser TTS`, which
describes neither the transport nor the endpoint now in use on `/maia`.

## The verdict

```
GREEN   spoken and typed converge before cognition begins, and voice inherits
        the same governed intelligence from that point
RED     spoken and typed diverge downstream of input acquisition into
        meaningfully different intelligence paths
```

⛔ **RED means Desktop voice does not ship.** A thinner or generic MAIA reached
through voice is not an optimization problem to be tuned later. It is a failed
architecture, and it fails acceptance outright.

**Current verdict: GREEN**, on the evidence traced above — with the omission
hazard at `apiEndpoint` standing as the live way it could turn RED without anyone
deciding to make it so.

## Proof required, at voice acceptance

Not "MAIA heard me and answered". Trace **one spoken turn after final
transcription** and establish from code and runtime evidence — never from whether
the answer merely sounds plausible — that:

1. it enters the same downstream pipeline as an equivalent typed turn;
2. the convergence point above is the one actually taken;
3. voice does not select a reduced model, context, or memory path;
4. the endpoint reached is the canonical one, not the default.

## Human witness, after transport works

A technically successful spoken exchange is **insufficient**. Transport working is
a precondition, not the acceptance. The witness must demonstrate that the MAIA
reached through voice possesses the same depth, continuity, relational
intelligence and discernment as the MAIA reached through text:

- remembers and carries continuity appropriately
- responds relationally rather than generically
- **preserves the member's actual language and meaning**
- does not flatter or manufacture certainty
- can draw on deeper developmental / elemental intelligence when the encounter
  warrants it
- can remain simple and present when deeper interpretation is not warranted
- integrates context rather than behaving as a fresh chatbot every turn
- remains **one MAIA** across text and voice

⛔ Do not redesign that intelligence inside a voice repair. Preserve it, and prove
voice reaches it.

## Sequence

```
hear the member accurately
  → prove the spoken turn enters full canonical MAIA
    → witness the quality of the relational intelligence itself
```

"Voice works" is not completion until the third step is witnessed.
