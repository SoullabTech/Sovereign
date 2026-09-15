# KERNEL-00 · VPIO-02-SID · ENTRY WITNESS — DESIGN (read-only design act, 2026-09-15)

**Authority:** founder ruling 2026-09-15 (implementation record `KERNEL-00_VPIO-02_SOURCE-ID-02_IMPLEMENTATION_2026-09-15.md` §10.14; discriminator plan §18.45): *`SID ENTRY-WITNESS-DESIGN` OPEN — records/design only, analogous to SOURCE-ID-01; may define identity inputs · preconditions · read-only observations · acceptance/refusal criteria · timing/order · evidence carriers · failure semantics · container-ID capture after install · the exact boundary between ENTRY and source population; may not install, launch, sample, populate a source, modify a device, or spend an ENTRY witness.* Requirement being designed for: design record §9 item 4 / discriminator plan §18.34 — *a separate entry witness is required before any source population — the population must not answer "did the new in-process observer perturb entry?" and "what source survives during duplex rendering?" at once*; §18.35's closed sequence **SID MAC-COMPILE → FIRST-INSTALL → SID ENTRY WITNESS (mandatory, separately authorized) → S-b N=10 → source reading → only then redesigned S3 / KERNEL-00**.

**This document authorizes nothing.** Every act named here (§3) is a separate founder act with its own pin. Numbers in §6 are proposals until ruled (§11).

---

## 1. The question, stated so that the install cannot answer it for itself

**Q-ENTRY.** *Does the in-process source observer added by SOURCE-ID-02 (fixed-bin Goertzel on every consumed input callback in `AudioGraph.pullInput`, one closed frame per 4 callbacks, ≈25 `SourceObservation` actor hops/s into `VoiceKernel.handleSource`, one `input_source_sample` journal record/s) perturb the physical entry of the conversational audio organism?*

The organism under the observer is otherwise the accepted VPIO-02 organism (`ac12dedf4` invariant files byte-identical; gate-pinned). The one prior fact about VPIO-02 entry is **F-W1** (`KERNEL-00_VPIO-02_F-W1_WITNESS_2026-09-14.md`, adjudicated PASS): N=30 automated cold launches, VP ON, Mode L, hold 15 s → **29/30 gen-1 listen**, 1 failure-then-recovery (digital-zero input → `input_dead` at 2 001 ms → gen-2 listening), 0 infrastructure, gen-1 listening latency 319–360 ms (median 338), K00-04 entry ceiling 1 500 ms.

**Null (H0):** SID entry is indistinguishable from VPIO-02 F-W1 on the K00-04 axis. **Alternative (H1):** the observer degrades entry (fewer gen-1 takes, or takes that breach the ceiling, or a systematic latency shift). The witness is designed to be able to say H1 **and** to be able to say "cannot tell" — it is not designed to say "pass".

**What Q-ENTRY is not.** Not a source-attribution question (no stimulus, no source reader). Not K00-05 (cancel) or K00-06 (duplex) on SID — those are population acts. Not a KERNEL-00 acceptance step — the SID subject is a *custody* subject (P5-F1), and KERNEL-00 remains NOT ACCEPTED whatever this witness reads.

**Why it must be measured with the observer demonstrably live.** A "no perturbation" reading over samples in which the estimator never ran (e.g. a coefficient path that silently disabled it) would be vacuous. The witness therefore carries an **observer-liveness** read (§5.3) as a validity condition, not as an outcome.

---

## 2. Identity inputs (every one pinned before the first device verb)

| input | value | source of truth |
|---|---|---|
| organism (source) | `f0c6ae13b88db29cbd1537bec585d98376c8bc4f` (accepted SOURCE-ID-02 + 02A code state) | §10.1 |
| organism (compiled) | `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8` — differs from the above by one test-file hunk only; kernel bytes identical | §10.8, REPAIR-01 |
| instrument (driver · batch · entry classifier · reinstall) | the bytes at `faf918b5c` for driver/batch/reinstall (SOURCE-ID-02 rows) and **`k00-ledger.py` = `b198e2e37` bytes** (frozen, gate-pinned) — the batch maps `--subject vpio-02-sid` → `CLASSIFIER_SUBJECT=vpio-02` and prints `classifierSubject=` in the ledger header | gate `__tests__/voice-kernel-00-source-gates.test.ts` |
| reinstall pins | UUID `4A6AD464-0A19-320F-980E-7446F6AA1440` · dylib SHA `a15b399d9a9a3c1071d12ba3c4fb24a56b3f6e51c708f8d3c5dd9cb811bdfc44` (act 1, ACCEPTED at `3f3cb15b0`) · executable SHA `db036694dcaa415bb50bb6319af249d643e6db76847177541db836f2f1ec5d17` · manifest `699ac758b12bd8062145655ad12fab6ed5ac2c96e1b4003cc210a5b39f72c7a4` · 7 files (act 2, written at `3035c0235`, review pending) | carrier-B `ca735fe15`, cherry-picked here, every seal reproduced |
| bundle · display | `life.soullab.voicekernel.vpio02sid` · `VoiceKernel VPIO-02-SID` | §18.34 |
| signing | team `ZVK2X646Z2` · Apple Development (N9DTF6434L) | compile identity.txt |
| device | `K00_DEVICE` default `A0736AC8-793B-516F-AC72-C076DB6CEE38` (the registered arm) | reinstall/batch |
| product on disk | the **exact** `VoiceKernelHarness.app` produced by MAC-COMPILE-02 at `/private/tmp/sid-mac-compile-02-faf918b5c…-derived/Build/Products/Debug-iphoneos/` — if that product no longer exists, STOP (founder rule 2026-09-13: *do not rebuild and call the result the historical subject*) | §10.12 |
| container | **UNKNOWN until FIRST-INSTALL-SID** — `VPIO02SID_CONTAINER="WITNESS-REQUIRED"` in the instrument, permanently (§8) | `3f3cb15b0` |
| coexisting subject | `.vpio02` installed, container `E3B88028-A10F-46B1-AB27-CF0A1F83FB78` — **never uninstalled, never overwritten, never launched by this witness** | frozen custody |

---

## 2a. The three moments (founder framing, ruled 2026-09-15) — what each may establish and what it may not

```
PRE-INSTALL            exact compiled artifact identity (§2 pins, all five + UUID) · SID ABSENT on device ·
                       container identity DOES NOT EXIST — nothing may name one
INSTALL TRANSACTION    separately authorized · ONE install verb · no launch · no sample · no source population ·
                       produces (does not "look up") the container id
POST-INSTALL ENTRY     observe the installed bundle · capture the container id · BIND installed artifact ↔
                       compiled identity ↔ container · prove ENTRY acceptance/refusal on the K00-04 axis
ONLY AFTER ENTRY PASS  source population may become SEPARATELY eligible (it is not opened by the PASS)
```

The witness is therefore not "the app installed". It is: **this exact compiled SID identity entered this particular device environment, acquired this particular container, and its physical entry behaves as VPIO-02's did — with no permission yet granted to the source system to populate anything.**

**The binding chain (§2a-bind).** Four links, each read-only, each from a different act, none of which may be substituted for another:

| link | what is bound | where it is witnessed |
|---|---|---|
| 1 · compiled identity | bundle · display · dylib UUID `4A6AD464-…` · dylib SHA `a15b399d…` · exec SHA `db036694…` · manifest `699ac758…` / 7 | MAC-COMPILE-02 `identity.txt` (carrier-B, in custody) = the five reinstall pins |
| 2 · artifact at install time | the product on disk equals link 1 at the moment of the install verb | `k00-reinstall.sh` custody gate (`dwarfdump`/`shasum`/manifest `shasum -c`/file-set diff/CFBundleIdentifier) teed into `reinstall-<stamp>.txt` — a mismatch refuses before the verb |
| 3 · container | the install verb's own result line `installationURL … /Bundle/Application/<CONTAINER>/VoiceKernelHarness.app/` (+ `databaseUUID`, `databaseSequenceNumber`) | the same `reinstall-<stamp>.txt` — the container is *produced* here and nowhere else |
| 4 · installed bundle ↔ container, live | `device info apps` lists bundle `…vpio02sid` exactly once, at that container path; no harness process running | ENTRY preflight `apps.json` / `processes.json` (§4), read immediately before the batch |

Only when links 1→2→3→4 are each witnessed does an ENTRY population sample say anything about *this* subject. A gen-1 take on a bundle whose link 2 was not teed, or whose link 3 was copied from anywhere but the install result, is a take on an unbound subject and is not admissible ENTRY evidence.

---

## 3. Timing and order — the chain, each link its own founder act

```
[A] REINSTALL-PIN completion   code-only · exec SHA + manifest SHA + count (Q1) · gate · diff review
        ↓  (without [A] the instrument refuses the SID subject: pins-unrecorded — by design)
[B] FIRST-INSTALL-SID          one custody-gated install · k00-reinstall.sh · K00_SUBJECT=vpio-02-sid ·
                               K00_EXPECT_UUID / _DYLIB_SHA / _MANIFEST supplied AND equal to the pins ·
                               K00_EXEC_AUTHORITY supplied at invocation (never from the repo) ·
                               just-in-time ABSENT read is the only admission · PRESENT / UNREADABLE → STOP
        ↓  produces the container id (§8)
[C] CONTAINER CAPTURE          records-only: the installationURL container id is written into the
                               FIRST-INSTALL-SID record and into [D]'s pinned preflight block as a literal
        ↓
[D] ENTRY PREFLIGHT            read-only, immediately before [E], its own pinned block (§4)
        ↓  (all four reads green → proceed at once; anything else → STOP, [E]'s authority spent)
[E] ENTRY BATCH                one k00-driver-batch.sh run · N (Q2) · --vp on --mode L --hold 15 ·
                               --subject vpio-02-sid · NO --act output · NO --stimulus
        ↓
[F] CARRIER                    feature/* branch · seals written OUTSIDE the ledger dir (§7)
        ↓
[G] VERIFICATION (here)        cherry-pick -x · seals · classifier reproduction N/N · liveness read · §6 reading
        ↓
[H] FOUNDER ADJUDICATION       the only step that can say what the reading means
```

[B] and [E] are the only device-touching acts; each is one governed authority; a refusal or STOP **consumes** it (F-W1 precedent). No pilot, no calibration sample: sample 1 of [E] is the first physiological observation of the SID subject. [D] is separate from [E] because the batch's own per-sample precondition runs `testTerminateOnly`, which would normalize state the preflight must read unnormalized.

---

## 4. Preconditions — the pinned preflight block (shape; container literal filled at [C])

Reads, in order, all read-only, all teed into `driver-ledger/VPIO-02-SID-ENTRY-preflight-<stamp>/`:

1. `git rev-parse HEAD` = the pinned lane SHA; `git diff --quiet -- scripts/witness/k00-driver-batch.sh scripts/witness/k00-ledger.py scripts/witness/k00-reinstall.sh ios/VoiceKernelDriver` (instrument identical to its gate-pinned bytes).
2. `xcrun devicectl device info apps --device $DEV --json-output apps.json` → `grep -c <SID-CONTAINER>` **= 1** AND `grep -c E3B88028-A10F-46B1-AB27-CF0A1F83FB78` **= 1** (both subjects installed, exactly once each; the SID container is the literal captured at [C]).
3. `xcrun devicectl device info processes --json-output processes.json` → `grep -ci VoiceKernelHarness` **= 0** (no harness of either subject running).
4. The product the install came from still exists at its MAC-COMPILE-02 path and `dwarfdump --uuid` = `4A6AD464-…` (the installed binary is provably the compiled binary; no rebuild in between).

Predeclared: **all four green → [E] starts at once (same terminal, same minute); any other reading → STOP, nothing launched, return for ruling.** No Mac speaker volume precondition: [E] plays nothing (§9).

---

## 5. Read-only observations

### 5.1 What the frozen instrument already produces (unchanged from F-W1)
Per sample: `sample-N-xcodebuild.log`, the one new `kernel00-*.jsonl` journal pulled from the SID container (`--domain-identifier life.soullab.voicekernel.vpio02sid`), `daemons/` before/after, `sample-timing.tsv` row, and the `k00-ledger.py` row `| Stratum | # | Mode | Session | Records | SHA-256 | Class | Evidence |` with class ∈ {`gen-1 listen`, `failure then recovery`, `failure then degradation`, `other observed shape`, `DRIVER/INFRASTRUCTURE FAILURE`, `SUBJECT-MISMATCH`} and evidence `cold · isRunningImmediate · graphStartedRunning · firstCallbackMs · generations · holdS · listeningHeldAtExport · listeningLostLater`. The classifier is the F-W1 classifier byte-for-byte (`classifierSubject=vpio-02`): the SID trace signature is the same fourteen `graph_start_trace` seams, so `SUBJECT-MISMATCH` on any row is itself a finding (§6.4).

### 5.2 Entry latency
`firstCallbackMs` and Enter→`listening` per gen-1 take, as F-W1 read them; every take compared to the K00-04 ceiling 1 500 ms.

### 5.3 Observer liveness (new read, evidence-only, performed HERE at [G] — no new instrument on the device)
For each journal: `L = count(records where component == "SourceEvidence" ∧ kind == "input_source_sample" ∧ evidence.frames ≥ 1)` and `R = count(… ∧ evidence.frameReset == true)`. Expected `L ≈ holdS − 1 … holdS + 1` (one sample/s while the generation runs). A journal is **OBSERVER-LIVE** iff `L ≥ 10` and the first such record precedes the sample's export; otherwise **OBSERVER-DORMANT**. `R` is reported descriptively (a callback-size change at entry would be a physiological fact worth seeing, not a verdict). The read is a pinned ≤15-line Python over the journals, committed with the witness record, run on the cherry-picked evidence; it reads **no bin energies and no `m2` values** — those fields exist in the records but are out of scope for ENTRY (§9).

### 5.4 Unchanged health record
`input_health_sample` must still be present at its F-W1 cadence beside the new record (SOURCE-ID-02 promised *beside an unchanged `input_health_sample`*); its absence or a changed cadence is a finding, not noise.

---

## 6. Reading law (predeclared; numbers are proposals until ruled — §11)

### 6.1 Validity
- N declared is always finished (driver rows are never classes; the batch never tops up).
- `DRIVER/INFRASTRUCTURE FAILURE` rows ≤ 2 → the population is **valid**; > 2 → **CHARACTERIZE ONLY** (no class below is earned; F-W1 rule).
- **Observer-liveness veto:** if any *valid* row is OBSERVER-DORMANT, the witness is **INDETERMINATE-ENTRY (observer-dormant)** regardless of takes — the question was not posed to the organism-with-observer.
- Any `SUBJECT-MISMATCH` row → **STOP-CLASS** (§6.4).

### 6.2 Per-sample
As the frozen classifier says. A gen-1 take whose Enter→`listening` exceeds 1 500 ms is counted as a take by the classifier but flagged **CEILING-BREACH** here; ≥ 1 breach in a valid population → the population cannot read UNPERTURBED.

### 6.3 Population classes (valid populations only)
Let `t` = gen-1 takes, `v` = valid rows, `F` = one-sided Fisher exact test of (t, v−t) against F-W1 (29, 1), alternative "SID worse".

| class | condition |
|---|---|
| **ENTRY-UNPERTURBED** | `t/v ≥ 24/30` (the F-W1 frozen-table floor, reused as ratified) ∧ `F` not significant at .05 ∧ 0 CEILING-BREACH ∧ all rows OBSERVER-LIVE |
| **ENTRY-PERTURBED** | `F` significant at .05 (deterioration against F-W1) ∨ ≥ 2 CEILING-BREACH |
| **INDETERMINATE-ENTRY** | anything else that is valid (e.g. `t/v` between, or exactly 1 breach), with the reason named: `(takes)` · `(ceiling)` · `(observer-dormant)` |
| **CHARACTERIZE ONLY** | invalid population (§6.1) |

Latency shift is **descriptive only**: median gen-1 latency reported against F-W1's 338 ms; a shift > 100 ms is written as `LATENCY-SHIFT` in the reading and is an input to adjudication, never a class on its own (n is too small to make a latency-only claim without a ruling).

### 6.4 STOP-CLASS
`SUBJECT-MISMATCH` on any row means the SID gen-1 trace is not the fourteen VPIO-02 seams — the observer changed the *start sequence*, which is exactly the P5-F1 concern. That is not a population outcome; it is a STOP for the whole witness and a return for ruling with the row's step list quoted.

### 6.5 What no class licenses
UNPERTURBED opens nothing by itself; it is the precondition S-b was designed to require. PERTURBED does not authorize a repair (a repair is its own ruling, as REPAIR-01 was). No class moves any row of `VOICE_CLAIM_STATE_2026-09-15.md`.

---

## 7. Evidence carriers and verification here

- Ledger: `docs/programme/VOICE-2026/driver-ledger/VPIO-02-SID-ENTRY-<stamp>/` (as the batch writes it) + `…-preflight-<stamp>/` (apps.json · processes.json · head/diff/dwarfdump reads).
- Seals: `SHA256SUMS.entry` written **outside** the ledger directory first, then moved in — so the seal never lists itself at zero length (carrier-02 attempt 1 defect, §10.14). Journals additionally hashed one line each (F-W1 shape).
- Transport: `feature/vpio02sid-entry-evidence-<stamp>` from the Mac (file-transport carrier script, §10.6 shape); here: cherry-pick `-x`, reproduce every seal, re-run `k00-ledger.py` with `subject=vpio-02` over the pulled journals and require N/N byte-identical rows, run the §5.3 liveness read, then write the §6 reading as a record section — reading, not adjudication.

---

## 8. Container-ID capture after install

The container id is **produced by the install**, not read separately: `k00-reinstall.sh` tees the single `xcrun devicectl device install app` result into `reinstall-<stamp>.txt`, whose `installationURL … /Bundle/Application/<CONTAINER>/VoiceKernelHarness.app/` line (with `databaseUUID` / `databaseSequenceNumber`) is the capture. [C] copies that literal into two places only: the FIRST-INSTALL-SID record section, and the [D] preflight block. It is **never** written into an instrument: `VPIO02SID_CONTAINER` stays `WITNESS-REQUIRED` for the life of the subject (the constant is declared once and consumed nowhere; the gate pins that). Precedent: `E3B88028-…` appears in records, preflight blocks and evidence, and in nothing under `scripts/`, `ios/`, `__tests__/`. Re-reads thereafter go through `device info apps --json-output` and a count, never through the instrument.

---

## 9. The exact boundary between ENTRY and source population

| | ENTRY witness [E] | source population (S-b) |
|---|---|---|
| batch flags | `--vp on --mode L --hold 15 --subject vpio-02-sid` | `--act output --vp on --mode L --subject vpio-02-sid --stimulus sid-nearend-gated` |
| stimulus | none — nothing is played; Mac volume irrelevant | gated 997 Hz fixture, Mac Studio Speakers at exactly 69 |
| readers invoked | `k00-ledger.py` only (the batch invokes the output and source readers only under `--act output` / `--stimulus`) | + `k00-output-ledger.py` + `k00-source-ledger.py` |
| `input_source_sample` records | present in every journal; **counted for liveness only (§5.3)** — bin energies and `m2` never read | read by the source reader under the §10 reading law |
| question | did the observer perturb entry | whose energy survives at the consumed seam |
| authority | its own; opens only after [B] | its own; opens only after [H] rules on ENTRY |
| K00 obligation touched | K00-04 (entry axis) | K00-06 characterization (source-identifying) |

Two prohibitions follow. **(i)** ENTRY journals are never fed to `k00-source-ledger.py`, not even "to see": with no stimulus every window would read UNMEASURED-SRC / `stimulus_not_visible`, and reading them would be a source population by the back door. **(ii)** The population never re-reads ENTRY rows as its own entry evidence: S-b samples have their own gen-1 rows, but *those* rows answer the population's validity (stimulus visible in healthy baseline windows), not Q-ENTRY.

---

## 10. Failure semantics (complete list)

| event | consequence |
|---|---|
| [A] not complete when [B] is attempted | `pins-unrecorded` refusal before any device verb; [B]'s authority **not** spent (the instrument refused, the device was not addressed) — but recorded |
| [B] PRESENT / UNREADABLE / custody mismatch | `.REFUSED.txt`, exit 3/4, authority **spent**, nothing installed, return for ruling |
| [B] install result line missing / container unparsable | STOP; no [C]; the device state is then read once (apps.json) and returned — an install with no capturable container is a finding |
| [D] any of the four reads not green | STOP, [E]'s authority spent, nothing launched |
| [E] batch dies mid-run | evidence as produced is carried; population CHARACTERIZE ONLY; **no top-up, no rerun** on the same authority |
| [E] `SUBJECT-MISMATCH` row | STOP-CLASS (§6.4) |
| [G] a seal fails to reproduce | the row(s) affected are struck from validity; if a journal hash fails, that sample is `DRIVER/INFRASTRUCTURE FAILURE` for reading purposes and the carrier is returned to the Mac for a second seal from the original files |
| [G] observer-dormant row | INDETERMINATE-ENTRY (observer-dormant) — never silently dropped |
| any second [B] or [E] | a new authority, a new stamp, never "the same act continued" |

---

## 11. Open questions for the founder (design questions; each needs a ruling, none is answered here)

- **Q1 — reinstall-pin completion.** ⭐ **RULED (founder, 2026-09-15): YES — act 2 opened code-only and written at `3035c0235`** (exec SHA · manifest SHA · count; review pending). Consequence as the founder stated it: `pins-unrecorded` no longer fires for the SID subject, but *installable under a future authorized transaction is not installation opened* — artifact matching, manifest verification, just-in-time absence and explicit execution authority all still stand.
- **Q2 — N.** Mirror F-W1 at **N = 30** (≈23 min wall) so the Fisher comparison is like-for-like, or a smaller N (e.g. 10) accepting that only gross perturbation is detectable? *Recommendation: 30; the comparison population is 30 and the question is subtle.*
- **Q3 — comparison law.** Accept §6.3 as written (floor 24/30 reused; one-sided Fisher vs (29,1) at .05; ceiling breaches ≥2 → PERTURBED; latency descriptive)? Or require a stricter equality band (e.g. `t ≥ 27`)? *Recommendation: as written; the floor is already ratified and the Fisher test is the F-W1 instrument.*
- **Q4 — observer-liveness minimum.** `L ≥ 10` of an expected ≈15 per journal as the OBSERVER-LIVE bar? *Recommendation: yes; below that the observer was not running for most of the hold.*
- **Q5 — preflight read 4.** Require the compiled product to still exist at its `/private/tmp` path at [D] (it is the install source at [B]; by [D] it has served its purpose)? *Recommendation: require it at [B] (inherent) and record-only at [D]; a missing product at [D] is not a STOP.* (If accepted, §4 item 4 becomes a read, not a gate.)
- **Q6 — `.vpio02` coexistence.** Confirm that both subjects installed side by side is the intended state for the whole SID programme (never uninstall `.vpio02`), so that preflight read 2 asserts both containers = 1.

---

## 12. Standing

`SID ENTRY-WITNESS-DESIGN` RETURNED · authorizes nothing · [A]–[H] each NOT OPEN · `SID MAC-COMPILE-02` PASS · spent (carrier-B in custody) · `SID REINSTALL-PIN-SID` act 1 ACCEPTED at `3f3cb15b0` · act 2 written at `3035c0235`, review pending · siblings HOLD · `.vpio02` frozen · S-b N=10 CLOSED · S-a NOT OPEN · S3 CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · KERNEL-00 NOT ACCEPTED · install 0 · launch 0 · sample 0 · device act 0 · C-D26 HOLD.
