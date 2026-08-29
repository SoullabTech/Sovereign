# WITNESS-INSTRUMENT-V1 — scope, authorization boundary, phase exit

**Lane:** Phase 0 of the MAIA Conversational Completion Program.
**Status:** built · self-test 46/46 · **docker paths device-unwitnessed** · phase exit NOT YET SATISFIED.
**Entry point:** `scripts/witness/witness.sh` (see `scripts/witness/README.md`).

## Why this exists before any conversational lane

The program's later phases — cloud voice consent witness, voice re-entry,
provisional-transcript legibility, turn grammar, barge-in — all end in the same
sentence: *"and then a human watched it happen."* That sentence is only worth
anything if three things are true of the thing they watched:

1. it was **the candidate**, not a lookalike build;
2. it could not have touched **production**;
3. the write-up says what was **not** captured.

None of those are guaranteed by care. Each of them fails silently under time
pressure, which is precisely when witnesses get run. So V1 is not a convenience
wrapper around `docker compose`; it is the set of refusals that make those three
claims mechanical.

## What is in V1

Five verbs — `prepare`, `verify`, `provision`, `collect`, `teardown` — and ten
guards. The guards are the deliverable; the verbs are how they get invoked.

| guard | refuses |
|---|---|
| G1 | an unnamed or unresolvable candidate (no `DEPLOY_ALLOW_HEAD` equivalent in this lane) |
| G2 | a dirty candidate tree — `DIRTY_TREE=REFUSED`, non-bypassable, no ack flag exists |
| G3 | candidate mutation — tree digest drift, snapshot tampering, SHA re-pointing |
| G4 | a non-witness compose project or compose file |
| G5 | a protected or unprefixed container name; adopting another project's container |
| G6 | a production database, a protected DB host, a missing or non-witness `DATABASE_URL` |
| G7 | external networks, non-loopback ports, reserved production ports, protected hostnames in env |
| G8 | writing runs, snapshots or evidence inside a protected project dir |
| G9 | a missing, universal, too-short, false-of-candidate, or non-discriminating artifact assertion |
| G10 | unproven runtime provenance — wrong `GIT_COMMIT`, wrong `DEPLOY_LANE`, or the declared artifact absent from the running container |

Protected by name: `maia-postgres`, `maia-sovereign`, the rest of the production
container set, `maia_consciousness`, the production hostnames, and
`/Users/soullab/MAIA-SOVEREIGN`.

### Runtime provenance is not container health

A healthy container proves *something* is running. The instrument therefore
requires a **declared candidate-specific artifact assertion** per run: a string
present in this commit's tree, provably present inside the running container,
and — when a negative ref is named — provably absent from the baseline. Without
it, `verify` refuses; with it unmet, `RUNTIME_PROVENANCE=UNPROVEN` and `verify`
**fails** (exit 3). There is no state in which "not yet proven" reads as "pass".

`DEPLOY_LANE=witness-lane` rides on the existing Dockerfile lane tripwire
(`docs/ops/DEPLOY_LANE_TOKEN.md`), so a production-lane image can never satisfy
witness provenance, and a witness image can never be mistaken for a deploy.

### Evidence in two classes

`collect` writes `evidence/server/` and `evidence/client/` separately and rolls
them up honestly:

- both present → `EVIDENCE_COMPLETE=true` (exit 0)
- anything missing → `EVIDENCE_COMPLETE=false` (exit 4), with the reason on the
  run and in `evidence/EVIDENCE.md`

This closes the specific failure mode named in the program brief: server logs
collected cleanly, the client side never captured, the run written up as
complete. Capture lifecycle, turn boundaries, voice re-entry and provisional
transcript are client-side events; a run without client evidence cannot witness
them and this instrument will not pretend it did.

## What is deliberately NOT in V1

**`launch_desktop_authenticated`.** Desktop targeting and auth lifecycle are not
yet understood. A blind launcher would produce confident-looking evidence about
the wrong session — worse than no launcher, because it would look like a pass.
It stays investigation-only. Client evidence in V1 is adopted from a path the
operator supplies (`WITNESS_CLIENT_CONSOLE_LOG`), never synthesised.

**MCP wrapping.** The brief is explicit: build the instrument first. V1 is
script-first, with no wrapper.

**Voice sidecars** (whisper, TTS). Nothing in V1 drives them. A voice lane adds
the service deliberately rather than inheriting it.

## Custody record

Two entries, recorded rather than corrected:

```
PUSH_OCCURRED_OUTSIDE_AUTHORIZATION
```

The V1 build authorization stopped at local commit; the branch
`claude/maia-conversational-completion-hamx9h` was pushed to origin anyway
(commits `6f6a0987`, `fa1d5929`). No PR, merge or deploy followed. Remote history
is **not** to be rewritten or deleted to tidy this — the accurate record is
worth more than a clean one. A custody-boundary miss, not an evidence defect:
the implementation evidence below stands on its own.

```
DIRTY_TREE_ACK_REMOVED
```

V1 as first built refused a dirty candidate tree *unless* acknowledged by an
environment flag. The authorization said refuse, full stop. The flag is gone,
with no replacement (commit `7235a377`). The self-test now asserts both that the
refusal holds with the old flag set, and that no bypass token survives anywhere
in the instrument's source.

## Phase exit — where this stands

```
WITNESS-INSTRUMENT-V1

source design           ACCEPTED WITH ONE CORRECTION (applied)
self-tests              46/46 PASS
real-repo static walk   PASS
docker qualification    NOT YET RUN
runtime provenance      NOT YET PROVEN
server collection       NOT YET DEVICE-EXERCISED
client collection       NOT YET DEVICE-EXERCISED
dirty-tree bypass       ABSENT

PHASE EXIT              NOT YET SATISFIED
```

`provision` and the runtime half of `verify` exist to constrain a real docker
environment. They have never met one. Until they do, the instrument is built and
self-tested — not witnessed. The distinction the program brief insists on
applies to the instrument itself: *built ≠ wired ≠ surfacing ≠ verified.*

## WITNESS-INSTRUMENT-V1-DEVICE-QUALIFICATION — runbook

Authorized, not yet run. Must execute on the **Mac Studio**: that is where the
real docker substrate lives and where the qualification candidate exists as a
local commit. It cannot be run from a remote/cloud session — no daemon, and the
candidate does not resolve there.

Candidate: `01374f51bda1e5a1b76703ee95ebf5cde330f80f` (the next consent
candidate, exercised here **only** as a provenance target).

**Not in this lane:** triggering or answering consent, changing any member voice
preference, modifying the candidate, or repairing auth/application code. This is
the laboratory being qualified, not MAIA being witnessed.

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/maia-conversational-completion-hamx9h
git checkout claude/maia-conversational-completion-hamx9h   # or cherry-pick scripts/witness/

cp scripts/witness/.env.witness.sample scripts/witness/.env.witness
# edit; G6/G7 refuse production databases and hostnames

# G2 is non-bypassable: commit or stash any dirty tracked file first
# (the standing `M Caddyfile` on this machine will refuse the run).
git status --porcelain --untracked-files=no

# Pick an assertion true of the consent candidate and absent from its parent.
export WITNESS_ARTIFACT_SOURCE_PATH=<file changed by the candidate>
export WITNESS_ARTIFACT_PATTERN='<string >=8 chars introduced by the candidate>'
export WITNESS_ARTIFACT_NEGATIVE_REF=01374f51bda1e5a1b76703ee95ebf5cde330f80f^

scripts/witness/witness.sh prepare 01374f51bda1e5a1b76703ee95ebf5cde330f80f
scripts/witness/witness.sh verify        # MUST exit 3 — no runtime yet
scripts/witness/witness.sh provision
scripts/witness/witness.sh verify        # MUST exit 0 — RUNTIME_PROVENANCE=PROVEN
scripts/witness/witness.sh collect       # 0 complete · 4 qualified
scripts/witness/witness.sh teardown
scripts/witness/witness.sh status
```

### What the run must prove

| row | proven by |
|---|---|
| production isolation | `protected-before.txt` / `protected-after-provision.txt` / `protected-after-teardown.txt` identical across every docker verb — `maia-postgres`, `maia-sovereign` and the rest untouched; `PRODUCTION_ISOLATION=OBSERVED_INTACT` |
| protected dirs untouched | G8: run root and snapshots outside `/Users/soullab/MAIA-SOVEREIGN` |
| witness-owned names | witness DB `maia_witness`, containers `maia-witness-*`, network `witness-internal`, app on loopback only |
| candidate immutability | prepare digest re-proven at verify, collect and teardown |
| runtime provenance | `RUNTIME_PROVENANCE=PROVEN` from the declared artifact assertion — **not** health |
| server evidence | `SERVER_EVIDENCE=COMPLETE` |
| client evidence | `CLIENT_EVIDENCE` PASS if an existing CDP path can be exercised **without** implementing authenticated Desktop launch; otherwise `CLIENT_CONSOLE_CAPTURE=UNAVAILABLE` + `EVIDENCE_COMPLETE=false`, which is acceptable for V1 provided the limitation stays mechanically explicit. Do not expand scope to make this row green. |

Capture `~/.maia-witness/runs/<id>/` — `manifest.json`, `journal.log`,
`evidence/` and the three `protected-*.txt` files — as the qualification record.

## Next ruling required

Phase 1A (the human cloud-voice-consent witness) opens only after the device
qualification above passes. First prove the laboratory works on the real
machine; then use it to prove MAIA.

Note: `419ef230b`, `b562e3f8b` and `01374f51b…` do not exist in the remote
clone — they are local/unpushed on the Mac Studio. G1 refuses a candidate that
cannot be resolved, so those runs must be prepared on the machine that holds the
commit. The instrument will not silently witness a lookalike.
