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

## Real snapshot taken — 2026-10-02 (Mac Studio, founder-reported)

The Desktop-closed condition became clean (final census clean) and the snapshot was taken from the real delegation home. Facts as reported; this session did not read the home, the manifest, the index or the sheet.

- Source corpus: 30 primary v2 units present; deterministic selection (ascending `sha256(unit_id)`) chose 25.
- Source-set SHA before and after the snapshot: `8483637c1059bc19904bf451e55954c35825c6ce37cde350c8fb2c7c1201aa73` — source bytes unchanged across the snapshot.
- Manifest SHA-256: `12758958be8c3eec4a3054491ddfb92efe8b89aa92c3393a88649b7513d8a009`; 25 units; `packet_underivable` = 0; task shapes: `CODE_GROUNDED` 15, `ARCHITECTURE_REASONING` 10.
- Custody: `local-index.json` mode 0600; no F sheet; no label entered; no seal; no provider call.
- Kelly's P-only sheet exists on the Mac Studio (100 blank P entries = 25 units × 4 J1 questions; packet projection only; the five `PILOT_CANDIDATE` anchors; `ambiguous` + local note fields; P-only `UNDETERMINABLE`). Structurally verified: 0 objective fields, 0 unit-id fields, 0 v2 slug strings, 0 absolute paths. (An earlier string hit on the word "objective" was the instruction text "Do not open the unit, its objective…", not content.)
- The temporary code worktree was removed. Files stay on the Mac Studio under `/Users/soullab/jev-label-pilot-01-real-20261002/`; `local-index.json` is never committed.

Observation for the pilot (not a finding yet): the 25 selected units carry only two of the six task shapes, so per-stratum agreement cannot be assessed for four shapes in this pilot.

STOP. Next act: Kelly's packet-only P labelling (Label A, human). F/full routed-state access stays closed until those P labels are sealed. Label B unfilled; no provider; INT-04 closed; nothing frozen.

## F rerun custody and instrument finding — 2026-10-02

P custody attribution: **Kelly completed the P pass**; this is not attributed to any other participant. P working state reached 100/100 entries at 12:53:46 ET; P sealed at 12:55:10 ET. The F sheet was cut afterward at 12:55:39 ET, so P-before-F is preserved by chronology and by the F sheet's P-seal digest binding.

The first F working artifact was not recoverable. The original F surface had no per-save server log and no disk read-back before advancing. This is an **instrument finding**, not a label finding: successful interaction was not sufficient evidence that the working artifact remained durably recoverable.

F rerun custody condition: if Kelly elects to re-enter F, record that the rerun follows loss of the first working file; Kelly has seen the full routed states before and may recall earlier answers. If original F values are later recovered, retain them as test-retest evidence and do not overwrite the rerun.

### F rerun instrument pin

Exact SHA-256 hashes of the F collection surface used for the rerun:

- `human-f-ui-server.ts` — `dab5b01705085cd0c7272acf72ab82bd81ade759653a8bebaf55e3258859d0cd`
- `human-f-ui-model.ts` — `0369f7bbf76256fbe9ba02866b00437f2566403afa208f2e4cd403027d9bc4ca`
- `human-f-ui-client.js` — `366a49b1855a067803d67e0dfc9352b7ce2bd5d9842cfce630d2378c66ffa613`
- `human-f-ui.html` — `ce22ef104a280d1cd1113e929b49560da8499db715714019d2b70e8c0007b71b`
- `human-f-ui.css` — `c721675641c1cefdf75ddeabc0f78765b62ef507b59d712a3cbda8af2aff321c`
- `human-f-ui-verify.ts` — `f4d5134900948138e5f5a30727c8d91e93bc93aa405c4e2026f0b0e15cb99c07`

The rerun surface advances only after atomic write, disk re-read, and exact sheet verification. The UI reports `N of 25 saved to disk`; each successful POST emits a content-free save event with timestamp and completion count.

## F durability R1 — 2026-10-07 (candidate; NOT yet run on the Mac Studio)

**Occasion.** A second F pass ("25 of 25 saved to disk", reported ~09:17 ET on 2026-10-07) left no recoverable working artifact. Per the Mac-side recovery session (reported, not witnessed here): the 3762 server was gone, the only surviving server log had zero save events, the pilot directory mtime was unchanged since 2026-10-02, and no candidate file carrying the F custody hash was found. The exact judgments are **not recoverable**; nothing was reconstructed, copied from P, or sealed. The fallback is a further Label A pass on the hardened surface below.

**Why the previous hardening was not enough (read from code at `279bfb232`).** `human-f-ui-server.ts` held the sheet in a server variable and `/api/state` never re-read the disk, so "N of 25 saved to disk" was a verified-at-save-time count that could outlive the file; a restart after loss would load the blank source. The launch command was not recorded anywhere, so the instance that served the pass could not be identified afterwards. **These are instrument findings, not label findings.**

**Finding — the pinned commit is not self-sufficient.** `human-f-ui-server.ts`, `human-f-ui-model.ts` and `human-f-ui-verify.ts` import `./human-ui-model` and the server reads `human-ui.css`; **neither file is in version control at `279bfb232`** (nor is the P surface). A clean checkout of the pinned commit fails typecheck (TS2307) and cannot start. The surfaces that collected the P labels and the F labels therefore depend on files that exist only in the Mac Studio working tree. Until those files are committed, the P and F collection surfaces are **not fully pinned**; the hashes recorded for the F files above are true but incomplete. The R1 server now records the SHA-256 of every file it is built from (`MISSING` when absent) in its startup event.

**What R1 changes (behaviour of the collection surface only).**

- *Nothing is trusted from memory.* The server keeps no sheet. Every `/api/state` (and a 30-second UI poll via `/api/custody`) re-reads the disk and verifies it.
- *Three durable copies, two directories.* Per save: write-once **generation** file (the ledger) → canonical working file → rolling-latest copy → byte-equal verification → event. The backup directory is **required** and refused if it equals the working file's directory or lies inside the delegation home.
- *Repair from survivors.* Loss or replacement of any single copy is repaired from the others; a diverged working file is preserved under `diverged/` before being replaced. If the ledger records a save that **no** copy holds, the server **refuses** (`DURABILITY_UNRECOVERABLE`) and refuses to start — it never serves a blank sheet over lost progress and never rolls back to an older state.
- *Content-free, hash-chained event log* (`events.jsonl`, 0600): timestamp, pilot id, completed/total cases, working path, working and rolling SHA-256, generation file. **No judgment values, notes or answers.** Startup records actual `SOURCE=`/`WORKING=`/rolling/ledger paths and the code identity (git head, dirty-path count, per-file SHA-256).
- *Visible custody.* The screen shows `DISK VERIFIED · N of 25 read back from disk · working-file hash · rolling copy matches · generations · ledger event · checked <time>`; any verification failure turns it red with "stop labelling".
- *Pinned procedures.* `run-f-ui.sh` (launcher; echoes its own command into a durable server log) and `finish-after-f.sh` + `human-f-finish.ts` (gate) are now in version control. The gate refuses unless: domain F; labeller A; manifest and P-seal match the stated frozen values; every judgment non-null; exactly the manifest's cases; working = rolling = latest generation; the final event hash = working file hash. Only then does it write the **read-only (0400) write-once pre-seal backup**, re-read it and compare SHA-256, and seal F against sealed P and report.

**Evidence (hermetic; synthetic home; run in a container with TypeScript 5.6.3 / tsx 4.23.15; the Mac Studio run is the evidence of record).** Durability + finish suite: 55 checks, 0 failed — including crash injected after each of the four save steps, deletion/replacement of each copy, restart, torn event-log tail, wrong manifest, wrong P seal, 99/100-style partial F, pre-seal hash conflict. **Lethality witness: 14/14 mutations killed on their named check** (reference green); the first run of the witness found two suite defects — one mutant died by an anonymous crash and one survived behind a redundant second guard — both repaired in the suite, not the module. HTTP-level smoke (real server over HTTP): 11 checks, 0 failed — **but it ran against a test-only stand-in for the missing `human-ui-model.ts`/`human-ui.css`** and is not runnable from a clean checkout of this branch.

**What could alter pilot comparability (stated, not resolved).**

1. A repeat F pass after the first was lost: recall of earlier answers is possible (record as in the F rerun custody condition above). If the original values ever surface they are retained as test-retest evidence, not overwritten.
2. The collection surface differs between the lost run and the rerun (custody panel, save latency). Questions, anchors, case order, answer values and sealing semantics are **unchanged**; `human-f-ui-model.ts` is not modified.
3. The P labels were collected on a surface whose model/CSS files are not in version control (see Finding). Nothing indicates the P values are affected; the surface is simply not reproducible from the repository.
4. A rerun F takes place days after P; any drift in Label A's judgment between P and F is part of what the pilot measures and is not separable from the delay.

**Not done / not claimed.** Not run on the Mac Studio; not merged; no label touched; no sheet sealed; `human-ui-model.ts` and `human-ui.css` not committed or reconstructed (a stand-in was used only in scratch for tests); no claim that the first-run loss is explained — the mechanism is **unknown**; R1 makes any recurrence recoverable or loudly refused, not understood.
