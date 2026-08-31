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

### ⛔ CORRECTION, 2026-08-31 — the first GREEN verdict was WITHDRAWN

The verdict above was **falsified**. `MAIA-ORGANISM-CENSUS-01` found an earlier
reachable return in `handleVoiceTranscript` — `sendStreamingMessage(...)` →
`/api/voice/stream-conversation` → `return`, taken **before** the convergence
point this document certified. `streamingVoiceMode` was hard-initialised `true`,
so that was the DEFAULT spoken path. The route runs its own Claude service,
memory bundle, relational stack, prompt machinery and TTS — zero references to
`getMaiaResponse`, `maiaService`, `buildMaiaWisePrompt` or
`finalizeMemberFacingText`. Not a thinner call into canonical cognition: a
**second mind**.

⛔ **How the enforcement missed it, three times.** v1 asserted four *named*
routes were absent; `/api/voice/stream-conversation` was not among them, so it
passed while the divergence ran. v2 replaced that with a catalogue of
response-producing call *patterns* and called it positive enforcement — it was
not: anything not matching a listed pattern stayed invisible, and its
"unnamed endpoint" probe used a URL inside the catalogue's own regex family, so
it proved the pattern generalized within what it already knew while being
presented as proof against the unknown. v3 enumerated every `return` via the
TypeScript AST, which closed the added-exit hole for good — but it still
*classified* each exit with a leftover regex, so a responder nobody had named,
placed **before an existing ratified return**, changed no exit, matched no
pattern, and left the gate green.

⭐ **All three were denylists, and a denylist fails open on the unknown.** Each
asked *"does this look like something we thought of?"* and answered no. The
enforcement therefore now pins **two closed sets, both derived from the code by
the compiler**:

1. **The exit set** — every `return` belonging to `handleVoiceTranscript`. Exits
   are a closed set the compiler can enumerate exhaustively; responder names are
   not. An added exit fails because a new exit appeared, whatever preceded it.
2. **The admission-phase allowlist** — for each ratified exit, the *exact* set of
   calls its guard branch makes. Not "no responder-shaped call": *exactly these
   calls and no others*. An unknown call fails **because it is unknown**, without
   the gate ever learning its name.

The property proven is that **every explicit return is a non-response admission
guard that still does only what it was certified to do**, the single
response-producing path being the fall-through to `handleTextMessage`.

⛔ **The cost is accepted deliberately.** Changing what an admission guard does
turns the gate red, including for innocent edits. That is the mechanism, not a
side effect: the admission phase is a sovereignty boundary, and it must not be
possible to widen it quietly. Re-pinning a row is an authority decision argued
for in the diff, exactly like adding a preload channel.

⛔ **Repaired in `VOICE-CANONICAL-CONVERGENCE-02`** by removing the branch
structurally, not by defaulting a flag off — a flag would have made the defect
dormant rather than impossible.

### The invariant, restated NARROWLY

> **Every response-producing voice turn requiring MAIA cognition crosses the
> canonical cognition spine exactly once before any response transport begins.**

⛔ This deliberately does **not** claim universal MAIA egress convergence.
Class C of the exit map — eleven `maiaSpeak()` sites uttering locally-authored or
data-API text with no model in the path — prevents that claim from being
established, and `OracleConversation.tsx:6712` (a crisis script spoken outside
any guard, which deliberately does not return) remains a separately recorded
safety/egress finding. Neither is repaired, and neither may be laundered into
"fixed" by the narrower invariant holding.

### R13, precisely

```
R13 implementation on canonical spine     DEMONSTRATED ✅
R13 coverage of streaming voice           NOT ESTABLISHED
"single egress funnel" as a global claim  SUSPECT / overbroad
```

The Refusal Registry audits the spine `OracleConversation →
/api/sovereign/app/maia/list → getMaiaResponse()` and names *"route an egress
around the funnel"* as the violating action. The repair does not copy the guard
into the streaming route — that would yield a better-guarded second mind. The
guard applies because spoken output now uses the canonical egress.

### ⚠️ The cost, recorded rather than discovered

Canonical voice **sacrifices token-streaming latency** for single-cognition
convergence. MAIA still speaks — the canonical path returns audio via
`includeAudio: true` — but first sound now waits for the canonical response to
complete instead of beginning mid-generation.

Streaming could not simply be demoted to transport: its value is emitting tokens
*as the model generates them*, so once cognition must finish first there is
nothing left to stream. The route also emits `silence` and `move_outcome`, both
cognition decisions a transport layer cannot author. The implementation is
preserved untouched for a separately authorized transport-extraction unit.

**Current verdict on the narrow invariant: GREEN**, positively enforced — with
the omission hazard at `apiEndpoint` standing as the live way it could turn RED
without anyone deciding to make it so.

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
