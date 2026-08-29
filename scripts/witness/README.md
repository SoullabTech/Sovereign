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
| **Candidate immutability** | The source tree must be clean — `DIRTY_TREE=REFUSED`, no override. The build context is a `git archive` snapshot of a named commit. Its digest is recorded at `prepare` and re-proven on every later verb. A rewritten history, a moved ref, a mutated snapshot, or a run re-pointed at another SHA all refuse. |
| **Observer provenance** | The instrument that prepared a run must be the instrument that executes every later verb — same commit, same tree state. A dirty instrument is refused at `prepare`; a mismatch refuses before any evidentiary or runtime action. The candidate cannot change during a run, and neither can the witness. |
| **Substrate integrity** | If the candidate's migrations do not apply to the empty witness database, `provision` stops **before** the app is started. A healthy container over an incomplete schema is a false green, and health is the most persuasive signal the instrument emits. |
| **Runtime attribution** | Runtime objects are scoped to the RUN, not the candidate: project, container names and volumes all carry a per-run token, and every container is labelled `ai.soullab.witness.run_id`. A run cannot adopt another run's containers even for the same candidate. |
| **Runtime provenance** | The running container must report the candidate's `GIT_COMMIT`, must carry `DEPLOY_LANE=witness-lane`, and must physically contain a declared candidate-specific artifact. Its **image digest** is bound on first proof and must not move afterwards — a tag is a name, and a tag can be rebuilt underneath a run by another lane. Anything less is `RUNTIME_PROVENANCE=UNPROVEN`, and unproven **fails**. |

Container health proves something is running. It does not prove *the candidate*
is running. That gap is where a witness quietly becomes a story about the wrong
commit, so the instrument closes it by construction: no artifact assertion, no
verification.

---

## Naming the observer

`prepare` records `INSTRUMENT_SHA` and `INSTRUMENT_TREE_STATE`, every verb prints
both the executing and the prepared identity, and `status` flags a mismatch
outright. A commit alone is not enough — two checkouts at the same SHA with
different working trees are different observers — so a dirty instrument is
refused with no ack flag, exactly as a dirty candidate is.

`teardown` is the one exception: it proceeds under mismatch and records
`TORN_DOWN_BY_FOREIGN_INSTRUMENT`. Refusing it would strand containers, and
cleanup produces no evidence that a mismatch could contaminate.

## Naming the run

`prepare` mints a run id and prints the line to pin it. **Every later verb
requires that run to be named** — by argument, or by `WITNESS_RUN` in your shell:

```bash
export WITNESS_RUN=20260829T205439Z-01374f51b
scripts/witness/witness.sh verify
```

A bare verb refuses (exit 2) rather than resolving "the most recently prepared
run". That pointer is shared, mutable state: another lane can prepare a run
between two of your commands, and a verb that guessed would then act on someone
else's run — observed on 2026-08-29, when `provision` and `collect` silently
changed subject mid-sequence. An argument that disagrees with `WITNESS_RUN` is
refused as ambiguous, not ranked.

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

### Clean tree, no override

`prepare` refuses a source tree with uncommitted tracked changes and there is
no acknowledgement flag. `git archive` already keeps that work out of the
snapshot; the danger is operator belief, and a flag would only record the
belief rather than correct it. Commit or stash, then prepare.

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

**Discriminating is not enough — it must also be stable under the build.** The
assertion is validated against the candidate's *source* and proven inside the
*built* container. Anything the bundler rewrites between those two points is a
correct-looking assertion that fails on a correct build.

| prefer | avoid | why |
|---|---|---|
| identifiers, object keys, symbol names | numeric literals | the minifier emits `maxMs:120000` as `maxMs:12e4` — a true assertion about the right commit refused the right image (2026-08-29) |
| distinctive string literals | comments | stripped from the bundle |
| a name introduced by this commit | anything also in the negative ref | not discriminating |

A pattern containing a run of three or more digits gets a warning, not a
refusal — a numeric literal in a file the bundler never touches is legitimate,
and the guard cannot tell which file that is.

---

## Evidence, in two classes

```
evidence/server/   container, image, database, provenance
evidence/client/   browser / Electron console
```

Voice, capture lifecycle, turn boundaries and re-entry are **client-side**
events. Server logs cannot witness them. So `collect` never rolls the two
classes into one verdict:

- both present, runtime proven → `EVIDENCE_COMPLETE=true`, exit 0
- a class missing, runtime proven → `EVIDENCE_COMPLETE=false`, exit **4**, and the
  run may only be cited with that qualification attached
- **runtime not proven** → nothing is attributable. Artifacts are still captured,
  under `evidence/diagnostic/` with a `NOT_ATTRIBUTABLE.txt` header, and the run
  exits **3**. A failed run is exactly when logs matter; they may inform the next
  repair, never a claim about the candidate.

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
| 3 | `RUNTIME_PROVENANCE=UNPROVEN`, or evidence not attributable |
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
  verify-witness-instrument.sh   self-test — 51 assertions, no docker needed
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
- **Migrations must apply.** A candidate whose migration set cannot replay against
  an empty database aborts `provision` (exit 5) with `MIGRATIONS=FAILED`, the app
  unstarted, and the migration output preserved under
  `evidence/diagnostic/MIGRATIONS_FAILED.txt`. The harness does not repair the
  migration set — that defect belongs to the platform — but it will not build a
  runtime on top of it.
- **Self-test proves the refusals, not the runtime.** The docker-touching paths
  (`provision`, server-class `collect`, `teardown`) are source-accepted and
  device-unwitnessed until first run on a host with a daemon.

## Related

- `scripts/deploy-context.sh` — the immutable-SHA pattern this borrows
- `docs/ops/IMMUTABLE_SHA_DEPLOY.md` — the 2026-07-27 shared-checkout incident
- `docs/ops/DEPLOY_LANE_TOKEN.md` — the lane tripwire `DEPLOY_LANE=witness-lane` rides on
- `docs/ops/WITNESS_INSTRUMENT_V1.md` — scope, authorization boundary, phase exit
