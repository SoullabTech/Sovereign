# KERNEL-00 — CORPUS-PARTITION CENSUS (read-only) — 2026-09-15

**Authority:** founder ruling on C-D23 (2026-09-15; discriminator plan §10): explicit per-population naming in the source gate has reached its limit (C-D19 · C-D21 · C-D23); *future corpus membership must be structural*; this census must show how every tracked journal population obtains its subject/provenance and define a deterministic partition that reproduces the current gate truth without per-population naming. **Scope: inspect tests, ledger headers and corpus layout only. Nothing modified: classifier behaviour, historical evidence and reader output untouched. Implementation of any partition is NOT authorized by this census.**

## 1. What the gate does today (`__tests__/voice-kernel-00-source-gates.test.ts`, corpus-regression test)

`all` = every tracked `driver-ledger/**/kernel00-*.jsonl` (548 files). Four populations are named by directory: `VPIO-01-20260914T200542Z` (30; asserted 30 × failure-then-degradation under vpio-01, 30 × SUBJECT-MISMATCH under vpio-02), `VPIO-02-20260914T223500Z` (30; 29 gen-1 listen + 1 recovery under vpio-02, 30 × SUBJECT-MISMATCH under vpio-01), `K00-0506-20260915T004738Z` (10; 10 × gen-1 listen / 10 × SUBJECT-MISMATCH), `K00-0506-VPOFF-20260915T012817Z` (10; same). `engine` = `all` minus those four (468 files); asserted > 400 and, under vpio-02, only SUBJECT-MISMATCH or DRIVER/INFRASTRUCTURE FAILURE. Every new VPIO-02 population therefore lands in `engine` and turns the gate red until a fifth name is added — the defect the ruling names.

## 2. How each tracked population obtains its subject and provenance (read from the files)

| directory | journals | ledger header `subject=` | journal content family (trace signature) | current bucket |
|---|---|---|---|---|
| `CALIBRATION-20260912T183534Z` | 3 | p5b0 | engine · 13-step P5-B0 · `engineRunning` | engine |
| `STAGE-A-20260912T183944Z` | 30 (1 not-a-sample) | p5b0 | engine · 13-step | engine |
| `STAGE-B-20260912T190130Z` | 8 (1 not-a-sample) | p5b0 | engine · 13-step | engine |
| `STAGE-B-20260912T191955Z` (flood, PRE-AUTH) | 101 | p5b0 | engine: 82 × 13-step · 6 × 14-step Phase-A · 13 × no start trace (the whole-container flood ledgered foreign journals) | engine |
| `STAGE-B-20260913T141415Z` | 25 | p5b0 | engine · 13-step | engine |
| `STAGE-B-20260913T145034Z` | 28 | p5b0 | engine · 13-step | engine |
| `P5B0-POSTCLEAN-CONTROL-20260913T164252Z` | 29 | p5b0 | engine · 13-step | engine |
| `PHASE-A-REPRO-01-20260914T011819Z` | 30 | phase-a | engine · 14-step Phase-A (`input_format_before_vp`) | engine |
| `LOG-CAL-20260914T124328Z` | 1 | phase-a | engine · 14-step Phase-A | engine |
| `SEAM-01-CONTROL-20260914T135238Z` | 29 | phase-a | engine · 14-step Phase-A | engine |
| `SEAM-01-LOGGED-20260914T141516Z` | 30 | phase-a | engine · 14-step Phase-A | engine |
| `VPIO-01-20260914T200542Z` | 30 | vpio-01 | vpio-01 · `input_format_read` without probe (refused at step 4) | named |
| `VPIO-02-20260914T223500Z` | 30 | vpio-02 | vpio-02 · `format_probe_initialize_begin` … 14 steps · `ioRunning` | named |
| `K00-0506-20260915T004738Z` | 10 | vpio-02 | vpio-02 · 14-step probe · `ioRunning` | named |
| `K00-0506-VPOFF-20260915T012817Z` | 10 | vpio-02 | vpio-02 · 14-step probe · `ioRunning` (bypass 1) | named |
| `container-archive/pre-purge-20260913T154847Z` | 154 | — (no ledger; SHA-256 manifest only) | engine (13/14-step, `engineRunning`) | engine |

Two independent provenance carriers exist for every journal: **(H) the directory's `ledger.md` header** (`stratum=… · subject=<p5b0|phase-a|vpio-01|vpio-02> · bundle=…`, written by the batch from its `--subject` argument — the *declared* population subject), and **(C) the journal's own start trace** (`graph_start_trace` steps + the running key on `graph_started`: `format_probe_initialize_begin` ⇒ VPIO-02; `input_format_read` without the probe ⇒ VPIO-01; otherwise engine, with `input_format_before_vp` distinguishing Phase-A from P5-B0 — the *physical* subject). The archive has (C) only. Across all 548 files **H and C never disagree at the VPIO-02 / VPIO-01 / engine level**; the only sub-level nuance is the flood directory, whose p5b0 header covers foreign 14-step and trace-less engine journals — engine-era either way, and its produced rows (classified under p5b0 at the time) are the record.

## 3. Two deterministic partitions, both tested here against the current buckets

- **P-H (declared subject):** journal → its directory → `ledger.md` header `subject=`; no ledger ⇒ `none`. VPIO-02 set = header `vpio-02`; VPIO-01 set = header `vpio-01`; engine = everything else. **Result: vpio-02 50 · vpio-01 30 · engine 468 — set-equal to the current four-name buckets** (the three vpio-02 directories fall out automatically).
- **P-C (physical subject):** journal → its own trace signature as above. **Result: vpio-02 50 · vpio-01 30 · engine 468 — set-equal to the current buckets.**

Both reproduce the gate truth without naming a directory. They are not redundant: H is what the batch *claimed*, C is what the organism *was*; the S1 population, for instance, is vpio-02 under both while its bypass state is a per-journal fact neither carrier encodes (it is in `vp_properties_set`, read separately).

## 4. Recommended structural rule (for ruling; not implemented)

1. **Membership = H ∧ C agreement.** A journal belongs to the VPIO-02 (or VPIO-01) corpus iff its directory header declares that subject *and* its trace signature is that subject; a disagreement is a named gate failure (the file, the header, the signature), never a silent bucket. Engine-era = header ∉ {vpio-01, vpio-02} ∧ signature = engine. The archive (no header) is engine by signature and stays engine.
2. **Per-population truth from the produced ledger, not from hand-written counts.** For every directory with a ledger header, the frozen classifier run under the header's subject must reproduce the produced `ledger.md` class column row for row (the reproduction this session already performs by hand on every receipt). That single structural assertion replaces C-D19/C-D21/C-D23's per-population count lists for every future population, including S2's. The historical count assertions (14/29 · 15/28 · 16/29 · 13/30 · 29+1 · 10 · 10) remain as they are — they pin history, not membership.
3. **Cross-subject assertion stays structural:** every VPIO-02 journal reads SUBJECT-MISMATCH under vpio-01 and vice versa; every engine-era journal reads SUBJECT-MISMATCH or infrastructure under both VPIO subjects.
4. **Not-a-sample and flood journals** keep their present treatment (present in `all`, never counted as samples; the flood directory's rows are historical evidence under the PRE-AUTH classification).

What changes if implemented: only the corpus-regression test's partition (four `includes(dir)` filters → header/signature derivation + the produced-ledger reproduction loop); `k00-ledger.py`, `k00-output-ledger.py`, the batch, every journal and every ledger untouched. What does not change: any class, threshold, reader rule or historical verdict. **Returned for ruling; no gate edit made in this census.**
