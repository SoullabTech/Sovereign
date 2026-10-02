# JARVIS-FOUNDER-WORKSPACE-01 — B3 Census JSON Compatibility

**Date:** 2026-10-02
**Parent recovery:** `a3a07538b`
**Branch:** `fix/kellys-world-b3-census-json-20261002`
**Standing:** COMPATIBILITY SEAM VERIFIED · FULL-HOST PERFORMANCE NOT CLAIMED

## Scope

This successor closes one missing seam identified by the Kelly's World current-canonical recovery:
`scripts/ops/worktree-census.sh` did not emit the optional `CENSUS_JSON` sidecar declared by the
B3 Monitor instrument registry.

The change is output-only. It does not alter worktree discovery, classification, fetch posture,
cleanup policy, production reach, or default human-readable output.

## Contract

When `CENSUS_JSON` is unset, behavior remains unchanged.

When `CENSUS_JSON=<path>` is set, the script writes one JSON object:

- `read_only: true`;
- `rows: []`;
- every row carries the same thirteen columns as the TSV projection;
- serializer failure exits nonzero rather than returning an empty successful observation.

The output path remains a declared B3 output path. Scratch cleanup remains limited to scratch files.

## Verification

- `/bin/bash -n scripts/ops/worktree-census.sh`: PASS.
- B3 static admission: admitted · `static-scan` · zero findings.
- Disposable repository, disposable HOME, default mode: human output unchanged; no JSON sidecar.

- Disposable repository with a quoted path: JSON parses; one row; all thirteen TSV keys present.
- Registry-driven `observe()`: `current` / `current`, JSON sidecar consumed successfully.
- Focused successor tests: 4/4 PASS.
- `git diff --check`: PASS.

## Remaining boundary

The Mac Studio's full historical worktree population is still expensive to census and previously
exceeded the B3 witness budget. This successor does not alter that traversal and makes no full-host
performance claim.

Therefore the missing compatibility seam is closed, while any optimization of full-host census
duration remains a separate operational-performance decision rather than being hidden inside this fix.
