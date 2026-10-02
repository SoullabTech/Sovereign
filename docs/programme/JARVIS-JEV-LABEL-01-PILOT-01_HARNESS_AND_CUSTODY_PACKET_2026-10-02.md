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
Commit `manifest.json`, sealed labels and the report; **never** `local-index.json`.

## Verification here

`tsc -p tsconfig.jarvis-jev-label-01.json` exit 0 · `verify:jarvis-jev-label-01-pilot` ALL PASS (26 checks, synthetic home) · `matrix:jarvis-jev-label-01` LETHAL + DISCRIMINATING (18/18, 17 falsifiers, 0 defects) unchanged. TypeScript/tsx from a scratchpad (no project `node_modules` here); the founder's run is the evidence of record. `check:record-shas` not runnable in this shallow clone.

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

Standing: **R1 awaiting Mac Studio re-witness; not admitted for real-data execution until it is green there.** ⛔ Nothing real read. ⛔ Not frozen. ⛔ No provider. INT-04 closed.
