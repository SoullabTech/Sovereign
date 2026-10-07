# RGR-05B-R1 — Reference generator and bounded feasibility result

Date: 2026-10-07
Standing: EVIDENCE READY — DESIGN FEASIBILITY FAILED UNDER THE FROZEN SAMPLER BUDGET
Accepted design: `f6f9c7cb02bfa47a36cc4b143b66a99f1d441ebf`
Founder acceptance record: `b999f9cf47abbddfd58bfa911115d7b6a0c9a633`
Implementation evaluated: `f134e19d5b41f08d3cd80fca48c04d64447551d1`

## Result

The authorized bounded reference-generator implementation and first feasibility run are complete. The run returned **DESIGN_INFEASIBLE_UNDER_FROZEN_BUDGET** for Task B's ordinary population. No neural model was trained, no benchmark skill was measured, and no member data or MAIA behavior was touched. Nothing was merged or deployed.

At the 35th selected Task B topology root in the frozen encounter order (a TRAIN root), 100,000 attribute/carrier/pulse draws yielded 99,994 negatives and only **six positives**. R1 requires ten distinct positives and ten distinct negatives from every selected root before that cap. The generator retained ten negatives and six positives, recorded the failure and stopped. It did not replace the difficult root, increase the cap, change the 3/10 return threshold, or alter the class quota.

The same 100,000 draws were replayed from the same root-bound deterministic streams. They reproduced exactly 99,994 negatives and six positives. All six positive quantities, 101 regularly spaced draws, and the largest negative were cross-checked with two other exact solvers: **108 three-way comparisons agreed**. This replay is verification of the original draws, not an extension of the search budget.

This is a failure under the documented implementation binding and frozen budget, not a proof that the process is mathematically impossible or that every alternative seed must fail. The seed/key serialization choices are preserved in the prospective implementation manifest. They were not chosen after seeing outcomes.

## What was implemented

The research-only Python standard-library module includes an exact Fraction-based synchronous queue simulator, a separately organized DAG-first Fraction solver, and an equivalent integer-common-denominator solver. The accelerated path computes exact rational quantities; it never makes floating-point threshold decisions.

The generator implements the frozen graph conditions, exact query-marked topology canonicalization, hash split assignment, deterministic finite-choice streams, raw attribute/carrier/pulse sampling, ordinary label quotas, equivalence-aware deduplication, and operational/frozen-cap distinctions. Counterfactual and invariant transformations are implemented and exercised by diagnostic probes. Full C/N population materialization and its entire quota protocol are not claimed complete.

The successor uses only its explicitly scoped scripts, tests, result record and manifest. The accepted R1 specification, machine contract, RGR-02 and accepted RGR-05A source remain unchanged. The original design-only envelope was not rewritten to fabricate a mechanical lifecycle transition.

## Checks completed

**27 unit-test cases passed** on Python 3.9.6 on the Mac Studio. They cover exact threshold equality, simultaneous dispatch, delays, absorbing terminals, retained stock, one-time turnaround, outbound continuation beyond tick 10, inclusive horizons, pending buffers at the horizon, invalid inputs, carrier and node renaming, tuple equivalence, deterministic sampling, serialization and cross-solver agreement.

On **192 generated diagnostic worlds**, all three exact computations agreed. The queue reference checked mass conservation at **2,880 time points** across those worlds. There were **576 successful target-invariance checks**: 96 per task for each of carrier relabeling, node relabeling and effective-coefficient substitution. These are finite implementation checks, not a proof over every possible world, independent human review, or statistical calibration.

## Network-root feasibility

| Required partition | Delivery A | Return B |
|---|---:|---:|
| TRAIN | 1,000 | 1,000 |
| VALIDATION | 250 | 250 |
| TEST | 500 | 500 |
| REPLICATION | 500 | 500 |
| Total selected roots | **2,250** | **2,250** |

Task A found its required roots after 10,566 raw graph draws. Task B required 56,956 raw graph draws, counting the two layers separately. The root quotas and split grouping were satisfied; that did not imply label-quota feasibility for each root.

## Ordinary population outcomes

| Measure | Delivery A | Return B |
|---|---:|---:|
| Completed roots | 622 / 2,250 | 34 / 2,250 |
| Raw attribute draws | 400,000 | 197,205 |
| Retained labeled instances, including partial last root | 12,452 | 696 |
| Disposition | INCOMPLETE_OPERATIONAL_CAP | DESIGN_INFEASIBLE_UNDER_FROZEN_BUDGET |

Task A stopped at the prospectively declared 400,000 total-draw operational bound. Its unfinished root had used only 3,709 of its frozen 100,000 allowed draws; that is **not** a design-failure result. Task B's failing root actually exhausted the full frozen per-root cap, before either operational bound was reached.

Retained prefixes are research evidence, not authorized training datasets. Full ordinary, C/N and invariance population quotas are not certified.

## Rhythm finding

The diagnostic probe used 12,000 P4/P5 comparisons per task, cycling through selected roots. It is separate from the preregistered class-balanced counterfactual populations.

| P4 / P5 labels | Delivery A | Return B |
|---|---:|---:|
| 0 / 0 | 9,684 | 10,950 |
| 1 / 1 | 2,229 | 1,035 |
| 0 / 1 | 87 | 15 |
| 1 / 0 | 0 | 0 |

The absent direction is **not impossible**. Two hand-constructed valid worlds, each checked by all three exact methods, provide existence certificates:

| Task | P4 quantity | P5 quantity | Frozen threshold | Labels |
|---|---:|---:|---:|---|
| Delivery A | 7/10 | 2/5 | 3/5 | 1 / 0 |
| Return B | 9/20 | 3/20 | 3/10 | 1 / 0 |

Those worlds were **not inserted into the sampled populations**. They distinguish existence from practical discoverability by the frozen sampler. The full balanced CF-2 quotas remain unverified; the one-sided diagnostic sample is a warning to investigate, not a substituted outcome rule or a measured population rarity estimate.

## Preservation and custody

Specification SHA-256: `16df2b04c769e94adff6147c81177c9698a5d6a1878b29920181aeb36fde1567`.

Exact accepted machine-contract SHA-256: `1f3d376d5b360817bfd441b160fcfbb894aeb9104ea09619da1540ff72e14d92`.

Evidence directory: `/Users/soullab/.maia-evidence/rgr-05b-reference-feasibility-run-20261007-v1`.

The result manifest contains source hashes, environment, recorded prospective bounds, phase results, stopping root, raw evidence hashes and replay data. The evidence directory retains selected roots, ordinary prefixes, control probes, exact witness worlds, reference results and the failure replay.

Reproduce unit tests from the worktree root:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/research/rgr_flow -v
```

Reproduce the bounded run only into a **new** evidence directory:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 scripts/research/rgr_flow/feasibility.py   --repo "$PWD" --output /absolute/path/to/a/new/evidence-directory   --graph-budget 200000 --control-draws 12000   --ordinary-seconds 120 --ordinary-draws 400000
```

The wall-clock operational limit can stop a slower machine earlier; that changes completeness, never the frozen failure threshold. All actual stop reasons are recorded. The reference generator has no training or production command.

## Consequence

R1 is accepted as the design that was tested, but it is **not ready for training**. Preserve this failure rather than silently repairing the sampling rule after observing it. Any proposal to change class quotas, root replacement, rejection caps, or the sampling distribution requires a separately named design revision. No such revision has been applied here.

The result concerns the practicality of this synthetic benchmark's sampling design. It does not test or refute the accepted architectural role of FLOW_D, the Elemental operators, Weather, consciousness, or human experience. Feasibility is a different proposition from computational value.
