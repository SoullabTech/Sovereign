# JARVIS-JEV-LABEL-01-PILOT-01 — historical pilot harness and custody packet

**PILOT_ONLY — THRESHOLDS PROVISIONAL — NO ADMISSIBILITY CLAIM**

Status: **R1 revision after founder review of `539197ad` (which was NOT admitted for real-data execution)**; harness verified on a synthetic home. ⛔ No real unit read, ⛔ no label exists, ⛔ nothing frozen, ⛔ no provider, ⛔ INT-04 closed, J1/host untouched.
Instrument admitted for this pilot: `96e929a8` (founder re-review; decisions 6 and 7 ratified for the pilot only).

## What the pilot is for

It tests the **human measurement apparatus**, not Jev: Q_DEPTH anchors, Kelly's band reliability, what P and F mean in practice, the UNDETERMINABLE rate, the task-shape distribution, hindsight unusability, Label B instructions, and whether the statistics and report structures survive real work. It **cannot** yield a Jev admissibility result (Label B unfilled, no provider judgments). Label B later labels the same frozen units.

## Custody rules (enforced in `pilot/pilot.ts`, checked in `pilot/verify.ts`)

| Rule | Mechanism |
|---|---|
| Read-only on the delegation home | only `readdir`/`readFile`; check asserts the home is byte-identical after a snapshot |
| Never write inside the home | `assertOutsideHome` refuses an output path inside it |
| Hash before labelling | `snapshot` records `source_sha256` per unit; `seal` re-hashes every source and refuses `SOURCE_DRIFT`; manifest body is itself hashed (`MANIFEST_TAMPERED`) |
| Selection is not a human choice | ascending `sha256(unit_id)`, first 25, rule recorded in the manifest |
| Content-free manifest | opaque `pilot_id` + `sha256(unit_id)[:32]`; ids are slugs of authored objectives, so they live only in `local-index.json` (mode 0600, never commit) |
| Every label is `HINDSIGHT_RISK` | sheet entries pre-marked; `seal` refuses an unmarked entry |
| Authority is never a target | `seal` refuses any non-J1 target |
| Sealed before anything else | each label gets a salted SHA-256 commitment and a sequence number; incomplete sheets cannot be sealed |
| No verdict | report prints `verdict: NOT PRODUCED`, `licenses: NOTHING`, the banner, and says the agreement rule is not frozen |
| Provisional numbers | `PILOT_CONFIG` (non-normative, **not** `fixtures.CFG`); agreement per stratum is reported, never gated |

## Packet projection — a pilot finding in itself

A v2 unit carries `task_shape`; it does **not** carry the other J1 fields. They are projected, each tagged with its derivation:
`contains_sensitive` ← `evidence_class == E4` · `requires_external_info` ← `network_external ∨ external_disclosure ≠ none` · `production` ← `production_read/write ∨ deploy` (all **AUTHORITY_PROXY**) · `file_count` ← `len(allowed_paths)` (**DECLARED_SCOPE_PROXY**, a bound, not a measured change) · `migration`, `auth` ← path patterns (**PATH_PATTERN**). A unit that cannot be projected is recorded `packet_underivable`, never imputed. ⚠️ `requires_external_info` as an authority proxy is the weakest mapping; whether these proxies are what Jev should see is for the pilot to answer, and the P-label is exactly where a labeller says so (`UNDETERMINABLE`).

## Run (Mac Studio, Desktop closed)

```
npm run pilot:jarvis-jev-label-01 -- snapshot --home ~/.claude/ain-delegation --out <dir outside the home>
npm run pilot:jarvis-jev-label-01 -- sheet --manifest <dir>/manifest.json --labeller A --out sheetA.json   # B later, independently
# label sheetA.json (value per entry; F integer band 1..5 for Q_DEPTH, boolean otherwise; P may be "UNDETERMINABLE")
npm run pilot:jarvis-jev-label-01 -- seal --home ~/.claude/ain-delegation --manifest <dir>/manifest.json --index <dir>/local-index.json --sheet sheetA.json --out sealedA.json
npm run pilot:jarvis-jev-label-01 -- report --manifest <dir>/manifest.json --sealed sealedA.json [--sealed sealedB.json]
```
Commit `manifest.json`, the sealed files (labels + ambiguity COUNTS only) and the report; **never** `local-index.json` and **never** the `--annotations-out` files (see R1.1).

## Verification here

Evidence is stated once, in the R1 and R1.1 sections below, from the runs themselves (the count is printed by `verify.ts`, never quoted from memory). `check:record-shas` is not runnable in a shallow clone; the founder's Mac Studio run is the evidence of record.

## Not decided / owed

Q_DEPTH anchors, real floors and ceilings, agreement treatment (all from the pilot, then a founder freeze) · who is Label B · INT-03 ruling · human-delivery falsifier. Hindsight: A knows outcomes; the pilot measures how unusable that makes the labels, it does not remove it.

## R1 revision (2026-10-02) — what the Mac Studio witness of `539197ad` found, and the repair

Witness at `539197ad`: record-shas 79/79, TS 5.9.3 exit 0, metric matrix 17/17 · 18/18 dead · 7/7 · 0 defects, **pilot verify 22 PASS / 1 FAIL** (`output inside home refused`), tree clean; nothing in `~/.claude/ain-delegation` read. The real snapshot was deliberately not taken.

| Finding | Repair |
|---|---|
| Boundary compared a `realpath` home with a merely `resolve`d output, so on macOS (`/var` → `/private/var`) an inside path read as outside; the custody boundary was unproven on the machine the pilot runs on | `physicalPath()` canonicalises BOTH sides identically (deepest existing ancestor via `realpathSync.native`, non-existent tail appended); proven by symlink fixtures: lexical, symlinked home, symlinked output, not-yet-existing subdirectories, the home itself, a prefix-sharing sibling (outside). **Mutation witness:** reverting the output side to `resolve()` fails 3 of those checks. |
| Only `snapshot` checked the boundary; `seal`/`sheet`/`report` could write anywhere, so "never write inside the home" was overstated | one write path, `writeOutside()`; every command now takes `--home` and goes through it |
| P and F were interleaved on one sheet, so the labeller could see the full routed state before answering what the packet alone supports, contaminating the P/F gap | separate passes: **P sheet** shows the packet projection only (no ids, no objective); **F sheet cannot be cut** until that labeller's P is sealed (`P_NOT_SEALED`), is bound to the P seal digest, F sealing needs the P seal, F sequence numbers must follow every P sequence number, and `report` re-checks all of it |
| `Q_DEPTH` had no anchors and `SheetEntry` had no way to record ambiguity | `PILOT_CANDIDATE — NOT FROZEN` five-band anchors on every sheet; `ambiguous` + `note` per entry, kept outside the commitment, counted per question in the report (anchor ambiguity is the pilot's main `Q_DEPTH` output) |
| Evidence count: this record said 26 checks; `539197ad` has 23 | the count is now printed by the run (`N checks · M failed`); this revision reports **44 checks, 0 failed** from the run, not from memory |
| `mode: 0o600` is honoured only when a file is created | `writeOutside(..., 0o600)` follows with `chmodSync`; tested on a pre-existing 0644 file |

Anchors (candidate measurement convention, **not J1 semantics**): 1 mechanical · 2 routine · 3 integrative · 4 deep (cross-system, architectural, constitutional, substantial ambiguity) · 5 frontier (novel, interacting unknowns, adversarial, open-ended).

Packet-projection mappings remain a pilot hypothesis, **not canonized**; `requires_external_info` is a proxy, not an equivalence.

### Human procedure (replaces the Run section above)
`snapshot` → `sheet --domain P` → Kelly labels P **from the packet only** → `seal` P → only then `sheet --domain F --sealed-p …` → Kelly labels F from routing-time full state → `seal` F (`--sealed-p`) → `report`. Every command takes `--home`.

Standing: **R1 Mac-witnessed green at `a9cf45d2` (79/79 record SHAs, TS 5.9.3 exit 0, 44 checks 0 failed, matrix 17/17 · 18/18 · 7/7, tree clean) and admitted; R1.1 below awaits its own re-witness. Real snapshot NOT taken: JARVIS Desktop processes are active.** ⛔ Nothing real read. ⛔ Not frozen. ⛔ No provider. INT-04 closed.

## R1.1 (2026-10-02) — founder review of the `a9cf45d2` witness

- **Snapshot precondition (not a code defect).** The Mac had `/Applications/JARVIS.app` and an O5-R3 development Desktop running, so "Desktop closed" was untrue. Neither was killed and the home was not read. The snapshot waits until those processes are no longer active; closing the O5-R3 witness is separate governed work and is not smuggled into this pilot.
- **`UNDETERMINABLE` ratified as P-only.** F inability is recorded as `ambiguous: true` + a note while still giving the nearest human judgment, so packet insufficiency and human ambiguity stay distinct.
- **Stale evidence removed** (the old "26 checks" sentence); one account of the evidence remains.
- **Notes are local-only.** `ambiguous` counts per question enter the sealed artifact (`ambiguity_counts`), but free-text `note` text can carry objective text, paths or routed-state fragments, so it never enters a committable artifact: `seal` writes it to a separate `--annotations-out` file (mode 0600, refused inside the home) and `report` consumes counts only. Checks: the sealed JSON contains no note text and no `annotations` member; the note survives only in the local file; the report carries none. Canonical evidence can state `Q_DEPTH ambiguity = n/25` without publishing what was written about any unit.

After R1.1: `verify:jarvis-jev-label-01-pilot` **48 checks · 0 failed** (this container), typecheck exit 0.

Next act, once Desktop is not running: real snapshot → content-free manifest + 0600 local index → cut Kelly's P-only sheet → stop for packet-only labelling.

## R1.1 Mac Studio independent witness — 2026-10-02

Independent Mac Studio re-witness at exact head `0860a882c19f3a2ade59968a52a3e8c2ac51c88e`:

- `check:record-shas`: 79/79, exit `0`
- narrow strict typecheck: exit `0` using TypeScript `5.9.3`
- PILOT-01 verifier: 48 checks · 0 failed
- metric reference: 17/17 falsifiers
- defeat matrix: 18/18 candidates dead on their named falsifier
- structural guards: 7/7
- matrix: 0 defects, exit `0`
- witness worktree: clean

This admits PILOT-01R1.1 for real-data execution when its separate snapshot precondition is satisfied. It does not freeze the instrument, authorize a provider, open INT-04, or create any label.

### Snapshot precondition census — 2026-10-02 11:21 ET

The Desktop-closed precondition remained unsatisfied:

- `/Applications/JARVIS.app` live, PID `770`.
- O5-R3 development Desktop, PIDs `74332/74333`, user-data dir `jarvis-desktop-dev-o5r3-final-witness`.
- A second O5-R3 development Desktop, PIDs `90266/90267`, user-data dir `jarvis-desktop-dev-o5r3-final-711668e81`.
- Delegation-home runtime PID file names `39474`, not live.

(This supersedes the earlier single-family description: there are two distinct O5-R3 Desktop process families.)

**Ruling (founder):** the stronger *Desktop-closed* rule is KEPT; it is not weakened to "no observed writes". No process is stopped for the sake of PILOT-01 — the O5-R3 Desktops belong to separate governed work. The pilot waits for a naturally clean boundary.

Therefore the real snapshot remains HELD solely on the Desktop-closed precondition. No real work unit was read by PILOT-01, no manifest or local index was created from the real delegation home, and no label exists.

Next act after a clean process census: real snapshot → content-free manifest + local-only 0600 index → Kelly P-only sheet → stop for packet-only human labelling.
