# A1-LS1R1 · E1 teardown record (packet §8)

Written AFTER the evidence package was hashed and transported:

- `EVIDENCE_MANIFEST.tsv`: SHA-256 `1a8d1080e91cbf1df464fa9d43fddadd98d9ae0f9743cede3622ed60a6d60a4a`, covering 238 files. This file is therefore not in that manifest.
- Transport commit `a26d21ada44e1db0c1f6be9d2128a88f8e08e47a` on `chore/a1-ls1r1-rewitness-evidence-transport-20260925`.

```
teardown_started=2026-09-25T16:08:32Z
app_or_stub_processes_before=0
server stopped
postgres_processes_after_stop=0
pg_isready_55432=no-response
data_dir_exists_after=no
run_worktrees_exist_after=no
raw_run_dirs_exist_after=no
synthetic_tokens_remaining_in_scratch=0
candidate_branch_on_remote=c723dc8cc9599e68b61f95d6be012ed53988e571
teardown_finished=2026-09-25T16:10:52Z
```

**What each line means:**

- **app_or_stub_processes_before = 0.** Each configuration's orchestrator had already stopped its dev servers (candidate and mutant) and the provider stub on exit.
- **pg_ctl stopped the disposable cluster.** No postgres process remains, and port 55432 does not respond.
- **The data directory `/tmp/ls0-e1-pg` no longer exists.** It held the database, the raw PostgreSQL log (custody identity SHA-256 `c97d8519…ff5d`, recorded by the extraction audit before deletion) and the per-run statement logs. Their deletion is intentional under the evidence-handling rule.
- **The run and practice worktrees were removed**: the candidate run checkout, the mutant checkout, the base checkout, the practice mutant tree and the candidate development tree, together with their `.next` caches. The candidate branch remains on the remote at `c723dc8`.
- **The raw run and practice directories were deleted**, for both LS1R1 and the prior LS1 run. They held synthetic session tokens and raw application logs. No synthetic token remains in the scratch area.

**What remains, deliberately:**

- the frozen LS0 and LS1R1 instruments and the extraction-audit instrument;
- the LS1 and LS1R1 evidence packages and their transport checkouts;
- the verified packet copies.

The container itself remains alive.
