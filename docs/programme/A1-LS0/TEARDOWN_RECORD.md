# A1-LS0 · E1 teardown record (packet §12)

Written AFTER the evidence package was hashed:

- `EVIDENCE_MANIFEST.tsv`: SHA-256 `9b47bfc67a6c1d8a0d43633cb7a056a049171862af15b13c244b58a92f7ad114`, covering 106 files.
- This file is therefore not in that manifest.

```
teardown_started=2026-09-25T00:03:52Z
app_or_stub_processes_before=0
pg_ctl: server stopped
postgres_processes_after_stop=0
pg_isready_55432=no-response
data_dir_exists_after=no
run_worktree_exists_after=no
raw_run_dirs_exist_after=no
teardown_finished=2026-09-25T00:03:52Z
```

**What each line means:**

- **app_or_stub_processes_before = 0.** Each configuration's orchestrator had already stopped its dev server and provider stub on exit.
- **pg_ctl stopped the disposable cluster.** No postgres process for `/tmp/ls0-e1-pg` remains, and port 55432 does not respond.
- **The data directory `/tmp/ls0-e1-pg` no longer exists.** It held the database, the server log and the per-run statement logs.
- **The detached canonical run worktree was removed**, together with its `.next` build cache and its `node_modules` link.
- **The raw run directories were deleted.** They held synthetic session tokens and raw application logs.

**What remains, deliberately:**

- the frozen instruments;
- this evidence package;
- the verified packet copy.

The container itself remains alive, as §12 allows.
