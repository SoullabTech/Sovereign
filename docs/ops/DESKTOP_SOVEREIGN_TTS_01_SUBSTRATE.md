# DESKTOP-SOVEREIGN-TTS-01 — Kokoro substrate

```
base      11bd40e3f6078b6f6591701afc9c48f2f70eae15
lane      DESKTOP-SOVEREIGN-TTS-01
mission   make actual platform /maia speak audibly in MAIA Desktop
          using sovereign local Kokoro TTS
```

The Desktop sovereign **STT** programme is closed at the base commit and is not
reopened here. Member audio reaches Faster-Whisper, becomes a canonical member
turn, local Ollama produces MAIA's response, persistence is truthful, and
capture lifecycle S4–S9 is green. The remaining defect is **audible response
output only**.

---

## The witness error is substrate, not synthesis

The Desktop witness produced:

```
[TTS] Kokoro failed: cloud voice is not available under the current
      sovereignty policy (ttsRouter:openai_primary:pref=auto)
[StreamConversation] TTS returned no audio
```

Read backwards from the throw site, that message names an environment, not a
broken Kokoro.

`openai_primary` is thrown at exactly one place — `lib/tts/ttsRouter.ts:352` —
and it is reached only when the resolved provider is `openai`. Provider
resolution is `ttsRouter.ts:185`:

```ts
const primary: TTSProvider =
  provider !== 'auto' ? provider
  : localEnabled ? 'kokoro'
  : 'openai';
```

So `openai` requires **either** `MAIA_TTS_PROVIDER=openai`, **or** an unset /
`auto` provider together with `MAIA_LOCAL_VOICE_ENABLED !== "1"`
(`ttsRouter.ts:143`, a strict `=== '1'` test — `"true"` does not qualify).

Had the container seen `MAIA_TTS_PROVIDER=kokoro`, `primary` would be `kokoro`,
dispatch would enter the Kokoro branch at `ttsRouter.ts:227`, and line 352 would
be unreachable.

> ⭐ **Therefore Kokoro was never called.** The log line `[TTS] Kokoro failed`
> names a provider that was never reached — it is the route's catch-all wording,
> not evidence about Kokoro. `pref=auto` in the reason string is the *member's*
> stored preference (`ttsProviderPref`), not `MAIA_TTS_PROVIDER`; it is not the
> cause and should not be read as one.

### Confirmed at runtime, not only from source

Read on the live witness container `maia-witness-1377e8b4` (2026-08-29):

```
MAIA_LOCAL_VOICE_ENABLED=
MAIA_TTS_PROVIDER=
KOKORO_TTS_URL=
MAIA_ALLOW_CLOUD_VOICE=
```

All four empty. Provider unset → `auto`; `localEnabled` false → `primary` is
`openai` → `ttsRouter.ts:352` → `CloudVoiceForbidden`. That is the witness error,
reproduced from the environment alone.

> ⭐ This upgrades the diagnosis from a reading of the source to a **measured
> property of the running stack**. Kokoro is not misbehaving in the witness; it
> is not present in it. `MAIA_ALLOW_CLOUD_VOICE` empty also confirms probe 6's
> premise independently: the sovereign default is intact and was never the thing
> standing in the way.

`docker-compose.production.yml` already declares the sovereign substrate
correctly — `MAIA_LOCAL_VOICE_ENABLED: "1"`, `MAIA_TTS_PROVIDER: "kokoro"`,
`KOKORO_TTS_URL: "http://kokoro-tts:8880"` on `maia` (lines 168–170) and a
`kokoro-tts` service (line 624). **Production is not the defect.** The witness
stack is what lacks them. That is why the first task of this lane is witness
substrate and not code repair: repairing the TTS path now would be repairing a
path the witness never took.

---

## Why a new overlay, and why it is committed

`.gitignore:145` ignores `docker-compose.*.yml` wholesale, with explicit
negations for only production, staging, local-voice and the sample template.

That rule is why this session could not read the MAIA + Postgres + Whisper
witness or the local Ollama override the founder named: **they exist on the
machine and not in the repository.** The substrate a previous session stood up
is invisible to the next one. `docker-compose.witness-kokoro.yml` therefore
carries its own negation (`.gitignore:378`) so this lane does not repeat that
cost on the lane after it.

`docker-compose.local-voice.yml` was considered and left **exactly as it is**.
It also stands up `kokoro-tts`, but it joins an *external* network pinned by name
to the production project (`maia-sovereign_maia-internal`) — which is the project
actually running it today. Under a witness project name that would either fail to
resolve or, worse, attach witness Kokoro to the production network. It also sets
no MAIA environment, so it cannot move the router off `openai_primary`, which is
the whole defect.

The new overlay joins the witness network by **key**, so compose scopes it to
`<project>_maia-network` and there is no path to production by construction
rather than by anyone writing the right name.

---

## Correction — the overlay was verified against the wrong base topology

The first push of this lane (`f42cc8019`) joined `maia-internal`. That is
`docker-compose.production.yml`'s network key. The **actual** witness chain roots
at `docker-compose.yml`, which declares only `maia-network`
(`docker-compose.yml:199-200`):

```
docker-compose.yml              maia-network      ← the witness chain
docker-compose.production.yml   maia-internal     ← what was verified
```

Appended to the real chain, MAIA and Kokoro would have landed on **different
networks**, `http://kokoro-tts:8880` would not have resolved, and probe 4 would
have failed as `kokoro_unreachable` — which reads exactly like a Kokoro defect
and is not one.

> ⭐ The error is worth naming precisely, because it is the same shape as the
> defect this lane exists to correct. Both the original Desktop failure and this
> one produce a confident, well-formed message about the wrong subject: `[TTS]
> Kokoro failed` named a provider never reached; a `maia-internal` overlay would
> have named a network nothing was on. **A witness verified against the wrong
> base produces confident evidence about a stack nobody is running.**

The cause was in the verification, not the writing: the first pass checked the
overlay against `docker-compose.production.yml` and against a *synthetic* base
constructed to resemble the witness. Both merged cleanly. Neither was the stack.
Caught by Kelly on review of `f42cc8019`, before the device witness was taken.

Two things changed:

- `kokoro-tts` and the `networks:` block now use `maia-network`. The header
  carries an explicit ⛔ against appending this overlay to
  `docker-compose.production.yml`, which declares all three variables and its own
  `kokoro-tts` already and needs nothing from it.
- The probe resolves containers by **compose label**
  (`com.docker.compose.project` / `.service`) instead of `docker compose ps`.
  That form needs the project's full `-f` chain, and the witness chain lives
  partly in `/tmp`. Labels let the running stack answer for itself — no `-f`, no
  `COMPOSE_FILE`, and it reports what *is* running rather than what a set of
  files says should be.

---

## Artifacts

| file | what it is |
|---|---|
| `docker-compose.witness-kokoro.yml` | witness-only Kokoro overlay: the `kokoro-tts` service, three env vars on `maia`, one `service_healthy` dependency. Nothing else. |
| `scripts/witness/kokoro-substrate-probe.sh` | the six substrate probes, run before any application code is touched. |

The overlay adds `kokoro-tts` and exactly three variables. It does not touch
STT, authentication, conversation persistence, memory, provider convergence,
provider provenance, lifecycle, or production configuration.

`MAIA_ALLOW_CLOUD_VOICE` is **absent**, not set to `"0"`.
`lib/tts/cloudVoicePolicy.ts` treats absence and `"0"` identically, and the canon
is that *"an unset variable, a fresh environment, a new deployment — all
sovereign."* Writing `"0"` would assert the sovereign default needs a keeper.

---

## Run

Append the overlay **last**, after the witness file and the Ollama override,
both preserved untouched:

```bash
docker compose -p witness-<id> \
  -f docker-compose.yml \
  -f /tmp/witness-<id>.override.yml \
  -f /tmp/witness-local-ai.override.yml \
  -f /tmp/witness-sovereign-voice.override.yml \
  -f docker-compose.witness-kokoro.yml \
  up -d kokoro-tts maia

scripts/witness/kokoro-substrate-probe.sh -p witness-<id>
```

LAST is load-bearing: compose merges in file order, so an earlier position lets a
later override win on the three variables this lane depends on.

The probe resolves containers by compose label, refuses to run against the
`maia-sovereign` project or a production `container_name`, and reads environment with `printenv` **inside** the container rather than
`docker inspect` — the Desktop failure was a gap between declared config and the
process view, so the process view is what gets read. Probes 4 and 5 run **from
inside the MAIA container** over the real service name, because a probe from the
host proves the host can reach Kokoro, which is not the claim.

```
1  kokoro container running + healthcheck healthy
2  MAIA printenv MAIA_LOCAL_VOICE_ENABLED == "1"
3  MAIA printenv MAIA_TTS_PROVIDER == "kokoro"
4  KOKORO_TTS_URL DNS-resolves from inside MAIA
5  POST /v1/audio/speech from MAIA returns > 1 KiB with an mp3 header
6  MAIA_ALLOW_CLOUD_VOICE absent AND OPENAI_API_KEY absent
```

Probe 5 asserts bytes and format, not HTTP 200: a 200 carrying an empty or JSON
body is not audio, and *"the endpoint answered"* is not the claim. Probe 6
protects the meaning of every other probe — if a cloud path was available, an
audible PASS cannot be attributed to sovereign synthesis.

---

## What is verified, and what is not

Verified by `docker compose config` against **real chain files** — the root
`docker-compose.yml`, the verbatim `witness-sovereign-voice.override.yml`, and
the overlay, under the real project name `witness-1377e8b4`:

```
PASS  services present   postgres, whisper, kokoro-tts, maia
PASS  maia + kokoro-tts + whisper SHARE one network  → maia-network
PASS  witness-scoped                       → witness-1377e8b4_maia-network
PASS  no external network declared         → no path to production
PASS  maia depends_on: kokoro-tts, postgres, whisper
PASS  STT env survives   WHISPER_LOCAL_URL=http://whisper:8000
                         ALLOW_AUDIO_TRANSCRIPTION=true
PASS  MAIA_LOCAL_VOICE_ENABLED = 1
PASS  MAIA_TTS_PROVIDER        = kokoro
PASS  KOKORO_TTS_URL           = http://kokoro-tts:8880
PASS  MAIA_ALLOW_CLOUD_VOICE   = <ABSENT>
```

A merge defect was found and repaired along the way: compose concatenates
list-valued keys across overlays and then rejects duplicates, so an overlay copy
of `security_opt: [no-new-privileges:true]` made the file unmergeable against any
base that already declares it. The overlay no longer re-declares list keys a base
may own.

### ⚠️ NOT verified here — two /tmp overrides

Two chain files were not available to this session:

```
/tmp/witness-1377e8b4.override.yml
/tmp/witness-local-ai.override.yml
```

So **the Ollama env surviving the merge** is asserted by no evidence here; the
local-ai override is where it lives and it was not read. Whisper is now covered
(above). The full chain can only be verified on the machine that holds all five:

```bash
docker compose -p witness-1377e8b4 \
  -f docker-compose.yml \
  -f /tmp/witness-1377e8b4.override.yml \
  -f /tmp/witness-local-ai.override.yml \
  -f /tmp/witness-sovereign-voice.override.yml \
  -f docker-compose.witness-kokoro.yml \
  config
```

### The `witness-sovereign-voice` override is a Whisper override

A file named `witness-sovereign-voice.override.yml` sits in the chain, which
raised the obvious worry: a voice override already exists and did not take, so
appending a second one would shadow rather than repair it. Read in full, it
resolves the other way — the file sets `ALLOW_AUDIO_TRANSCRIPTION` and
`WHISPER_LOCAL_URL` and declares the `whisper` service. **It contains no TTS
configuration at all.**

> ⭐ "Sovereign voice" in that filename means *speech in*, not *speech out*. It
> is an STT override wearing a name broad enough to be read as both, in a lane
> whose whole defect is speech out. Nothing is being shadowed; the TTS substrate
> was never written by anyone. Worth renaming, but not in this lane.

So there is no reconciliation to do, and no ambiguity about attribution if the
substrate goes green after this change.

## ⛔ NOT WITNESSED — named, not implied

```
1–6  the six substrate probes have NOT been executed
     this session has no docker daemon and no route to the Mac Studio;
     the probe script has been syntax-checked, never run

     the FULL five-file chain has NOT been config-verified
     two of its files live in /tmp and were not available to this session

     the DEVICE witness has NOT been taken:
     member speaks → Faster-Whisper → local Ollama → Kokoro → audible MAIA
```

`UNWITNESSED is not a pass.` Nothing here is evidence that MAIA speaks. The
overlay is an apparatus for producing that evidence, not the evidence.

**Evidence class: SUBSTRATE/SOURCE. It remains SUBSTRATE/SOURCE until Kelly
audibly hears MAIA speak.**

---

## The boundary rule for the next step

Six green probes say the sovereign path is present and Kokoro produces audio
bytes when MAIA asks. They say nothing about whether Kelly hears anything.

> If Kokoro generates valid audio and Desktop remains silent, **stop**. The next
> boundary is **playback**, not synthesis. It is a different subsystem with a
> different acceptance criterion and it belongs to a different unit — the same
> discipline that closed the STT lane rather than extending it into speech
> output.

One job, one boundary, one audible acceptance.
