# WITNESS-INSTRUMENT-V1

The laboratory. Phase 0 of the MAIA Conversational Completion Program.

Before any conversational lane can be witnessed — cloud voice consent, voice
re-entry, provisional-transcript legibility, turn grammar — there has to be a
place to witness it that cannot lie. That is all this is: a stack built from an
explicitly named commit, provably isolated from production, whose evidence is
attributable to that commit and honest about what it did not capture.

It deploys nothing. It approves nothing. It proves three things and refuses when
it cannot.

---

## The three claims

| claim | how it is proven |
|---|---|
| **Production isolation** | Every container, network, port, volume and database the witness stack can name is witness-owned. Protected names are refused by guard, and protected container state is recorded before and after every docker verb — so "untouched" is an observation, not a promise. |
| **Candidate immutability** | The build context is a `git archive` snapshot of a named commit. Its digest is recorded at `prepare` and re-proven on every later verb. A rewritten history, a moved ref, a mutated snapshot, or a run re-pointed at another SHA all refuse. |
| **Runtime provenance** | The running container must report the candidate's `GIT_COMMIT`, must carry `DEPLOY_LANE=witness-lane`, and must physically contain a declared candidate-specific artifact. Anything less is `RUNTIME_PROVENANCE=UNPROVEN`, and unproven **fails**. |

Container health proves something is running. It does not prove *the candidate*
is running. That gap is where a witness quietly becomes a story about the wrong
commit, so the instrument closes it by construction: no artifact assertion, no
verification.

---

## Verbs

```bash
scripts/witness/witness.sh prepare <SHA>   # name + snapshot the candidate
scripts/witness/witness.sh verify          # refusal set, then runtime provenance
scripts/witness/witness.sh provision       # build + start the isolated stack
scripts/witness/witness.sh collect         # evidence, in two named classes
scripts/witness/witness.sh teardown        # destroy the stack, keep the evidence

scripts/witness/witness.sh status
scripts/witness/witness.sh selftest
```

Normal order:

```
prepare → verify → provision → verify → collect → teardown
            ↑                     ↑
      exit 3, expected        full PASS
```

**`verify` before `provision` is supposed to fail with exit 3.** There is no
runtime yet, so provenance is unproven, and the instrument has no state in which
"not yet proven" reads as "pass".

---

## First run

```bash
cp scripts/witness/.env.witness.sample scripts/witness/.env.witness
# edit it — guards G6/G7 refuse production databases and hostnames

WITNESS_ARTIFACT_SOURCE_PATH=lib/voice/capture.ts \
WITNESS_ARTIFACT_PATTERN='DESKTOP_STT_UTTERANCE_CEILING_MS' \
WITNESS_ARTIFACT_NEGATIVE_REF=<pre-candidate SHA> \
  scripts/witness/witness.sh prepare 419ef230b

scripts/witness/witness.sh verify        # exit 3 — expected, no runtime yet
scripts/witness/witness.sh provision
scripts/witness/witness.sh verify        # exit 0 — the candidate is running
scripts/witness/witness.sh collect
scripts/witness/witness.sh teardown
```

### The artifact assertion

The one thing the operator must supply per run: a string that exists in *this*
commit and can be looked for inside the running container.

- `WITNESS_ARTIFACT_SOURCE_PATH` — the file in the candidate's tree
- `WITNESS_ARTIFACT_PATTERN` — the string (≥ 8 chars, not universal)
- `WITNESS_ARTIFACT_NEGATIVE_REF` — optional; a ref where the string must be
  **absent**. Supplying it upgrades the run from "the assertion is true of the
  candidate" to "the assertion distinguishes the candidate from that baseline",
  and is recorded either way as `ARTIFACT_ASSERTION_DISCRIMINATING`.

The instrument refuses an assertion that is missing, universal, too short, false
of the candidate, or (when a negative ref is given) also true of the baseline.

---

## Evidence, in two classes

```
evidence/server/   container, image, database, provenance
evidence/client/   browser / Electron console
```

Voice, capture lifecycle, turn boundaries and re-entry are **client-side**
events. Server logs cannot witness them. So `collect` never rolls the two
classes into one verdict:

- both present → `EVIDENCE_COMPLETE=true`, exit 0
- anything missing → `EVIDENCE_COMPLETE=false`, exit **4**, and the run may only
  be cited with that qualification attached

V1 has no authenticated Desktop launcher — `launch_desktop_authenticated` is
deliberately **not** implemented. Desktop targeting and auth lifecycle are not
yet understood, and launching blind would produce confident-looking evidence
about the wrong session. Until that lane runs, client evidence is supplied by
hand:

```bash
WITNESS_CLIENT_CONSOLE_LOG=/path/to/console.log \
  scripts/witness/witness.sh collect
```

---

## Exit codes

| code | meaning |
|---|---|
| 0 | pass |
| 1 | refused by a mechanical guard |
| 2 | usage |
| 3 | `RUNTIME_PROVENANCE=UNPROVEN` |
| 4 | evidence qualified / incomplete |
| 5 | environment or tooling missing |

---

## Layout

```
scripts/witness/
  witness.sh                     driver — the only entry point
  lib/witness-common.sh          run dirs, manifest, logging
  lib/witness-guards.sh          the refusal set (G1–G10)
  lib/witness-evidence.sh        the two evidence classes
  docker-compose.witness.yml     the isolated stack
  .env.witness.sample            copy to .env.witness (gitignored)
  verify-witness-instrument.sh   self-test — 44 assertions, no docker needed
```

Runs live outside the repo, under `WITNESS_RUN_ROOT` (default
`~/.maia-witness`): `runs/<id>/manifest.env`, `manifest.json`, `journal.log`,
`evidence/`. Guard G8 refuses to place them inside any protected project dir.

---

## Known V1 limits

Named, not worked around:

- **No Desktop launcher.** Investigation-only, as above.
- **No whisper / TTS sidecars** in the witness stack. Nothing in V1 drives them.
  A voice lane must add the service deliberately, not inherit it by accident.
- **Migrations may fail** on a candidate whose migration set is not idempotent.
  Recorded as `MIGRATIONS=FAILED`; provision continues so the failure is visible
  rather than fatal, and provenance is still decided on its own terms.
- **Self-test proves the refusals, not the runtime.** The docker-touching paths
  (`provision`, server-class `collect`, `teardown`) are source-accepted and
  device-unwitnessed until first run on a host with a daemon.

## Related

- `scripts/deploy-context.sh` — the immutable-SHA pattern this borrows
- `docs/ops/IMMUTABLE_SHA_DEPLOY.md` — the 2026-07-27 shared-checkout incident
- `docs/ops/DEPLOY_LANE_TOKEN.md` — the lane tripwire `DEPLOY_LANE=witness-lane` rides on
- `docs/ops/WITNESS_INSTRUMENT_V1.md` — scope, authorization boundary, phase exit
