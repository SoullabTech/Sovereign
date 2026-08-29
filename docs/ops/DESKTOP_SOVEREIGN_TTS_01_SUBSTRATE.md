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
to the production project (`maia-sovereign_maia-internal`). Under a witness
project name that would either fail to resolve or — worse — attach witness Kokoro
to the production network. It also sets no MAIA environment, so it cannot move
the router off `openai_primary`, which is the whole defect.

The new overlay joins `maia-internal` by **key**, so it resolves inside whatever
project the witness runs under and has no path to production by construction.

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
docker compose -p <witness-project> \
  -f docker-compose.production.yml \
  -f <witness override> \
  -f <local ollama override> \
  -f docker-compose.witness-kokoro.yml \
  up -d kokoro-tts maia

scripts/witness/kokoro-substrate-probe.sh -p <witness-project>
```

The probe resolves containers through `docker compose -p`, refuses to run if it
resolves a production `container_name` (`maia-sovereign`, `maia-kokoro-tts`), and
reads environment with `printenv` **inside** the container rather than
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

Verified in this session, by construction and by `docker compose config`:

```
PASS  overlay merges onto a MAIA+Postgres+Whisper base and PRESERVES it
      → maia depends_on: kokoro-tts, postgres, whisper
      → WHISPER_LOCAL_URL intact
PASS  the local Ollama override is preserved through the merge
      → OLLAMA_BASE_URL + MAIA_TEXT_PROVIDER=local survive
PASS  the three sovereign voice variables land on `maia`
PASS  MAIA_ALLOW_CLOUD_VOICE is absent in the merged config
PASS  the witness network resolves as <project>_maia-internal
      → no path to the production network
PASS  applied to docker-compose.production.yml the overlay changes nothing
      but the kokoro-tts dependency — it cannot drift production
```

One merge defect was found and repaired during that verification: compose
concatenates list-valued keys across overlays and then rejects duplicates, so an
overlay copy of `security_opt: [no-new-privileges:true]` made the file
unmergeable against any base that already declares it. The overlay no longer
re-declares list keys a base may own.

## ⛔ NOT WITNESSED — named, not implied

```
1–6  the six substrate probes have NOT been executed
     this session has no docker daemon and no route to minisforum;
     the probe script has been syntax-checked, never run

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
