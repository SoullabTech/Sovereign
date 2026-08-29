# WITNESS-INSTRUMENT-V1 — scope, authorization boundary, phase exit

**Lane:** Phase 0 of the MAIA Conversational Completion Program.
**Status:** built · self-test 44/44 · docker paths device-unwitnessed.
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
| G2 | a dirty candidate tree, unless the exclusion is explicitly acked and recorded |
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

## Phase exit — where this stands

| criterion | state | basis |
|---|---|---|
| `prepare` PASS | **PASS** | self-test A/B/D; real-repo walk |
| `verify` PASS | **structurally proven, runtime-unwitnessed** | static gates PASS on the real repo; provenance path exercised only through its UNPROVEN branch (no daemon in the build environment) |
| `provision` PASS | **UNWITNESSED** | requires a docker daemon |
| `collect` PASS or qualified | **qualified path PASS** | self-test F; server class unwitnessed |
| `teardown` PASS | **UNWITNESSED** | requires a docker daemon |
| production isolation | **PROVEN in source, unwitnessed at runtime** | self-test C (11 refusals) |
| candidate immutability | **PROVEN** | self-test B — snapshot survives a concurrent checkout; mutation and SHA re-pointing both refuse |
| runtime provenance | **PROVEN in the negative** | self-test E — unproven fails closed |

**This is not a device pass.** `provision`, server-class `collect` and
`teardown` have never executed against a docker daemon. They are source-accepted
and self-test-accepted only. First execution on a host with a daemon is the
device witness for those three paths, and until it happens they must be cited
that way.

The distinction the program brief insists on applies to this instrument itself:
*built ≠ wired ≠ surfacing ≠ verified.* V1 is built and self-tested. It is not
yet witnessed.

## Next ruling required

Per the brief, the lane stops here and reports. The next lane is not opened
merely because the roadmap lists it. Two candidates, in the brief's order:

1. **First device run of the instrument** — provision/collect/teardown against a
   real daemon on a host that also runs production, which is the only place the
   isolation guards are worth anything.
2. **Phase 1A — cloud voice consent witness** at the fixed candidate
   `01374f51bda1e5a1b76703ee95ebf5cde330f80f`, which the brief requires to stay
   immutable through its witness. G3 is what now enforces that mechanically.

Note for (2): that SHA does not exist in this checkout, nor do `419ef230b` or
`b562e3f8b`. They are local/unpushed on the Mac Studio. G1 refuses a candidate
that cannot be resolved, so those runs must be prepared on the machine that
holds the commit — the instrument will not silently witness a lookalike.
