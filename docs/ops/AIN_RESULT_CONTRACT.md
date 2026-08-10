# AIN Result Contract

> Companion to `docs/ops/AIN_WORK_PACKET_CONTRACT.md`. Every delegated lane (`local`, `kimi`) returns this same shape so Claude can inspect a delegated unit without reading the delegate's full transcript. The full transcript/log is preserved on disk and pointed to, never auto-injected into Claude's context.

## Storage

`~/.claude/ain-delegation/results/<work_unit_id>.json`, plus a raw log at `~/.claude/ain-delegation/logs/<work_unit_id>.log`.

## Schema

```json
{
  "work_unit_id": "must match the packet",
  "lane": "local | kimi",
  "model": "e.g. maia-coder:latest | kimi-k2.7-code | kimi-k3",
  "starting_sha": "sha the worktree started from",
  "ending_sha": "sha after commit, or null if nothing was committed",
  "files_changed": ["paths from git diff --stat"],
  "summary": "one paragraph, written by the delegate, of what it did",
  "tests_run": ["the verification_commands actually executed"],
  "test_results": "pass | fail | not_run",
  "typecheck_result": "pass | fail | not_run",
  "build_result": "pass | fail | not_run",
  "evidence": "command output excerpts or pointers, kept short",
  "uncertainties": ["anything the delegate was not confident about"],
  "scope_deviations": ["any deviation from allowed_files/acceptance_criteria, even if justified"],
  "escalation_required": false,
  "unresolved_questions": ["only present if escalation_required is true"],
  "recommended_next_action": "what Claude should do with this result: accept | reject | escalate | review-diff",
  "log_path": "~/.claude/ain-delegation/logs/<work_unit_id>.log",
  "duration_s": 0,
  "attempts": 1
}
```

## Claude's review contract

On receiving a result, Claude does exactly one of:

1. **accept** — acceptance_criteria met, tests/typecheck/build pass, no scope deviation → merge/integrate.
2. **reject** — result present but wrong or incomplete → either re-delegate (if `attempts < max_attempts`) or pull the work back to Claude directly.
3. **escalate** — `escalation_required: true` or an authority-firewall boundary was hit → surface `unresolved_questions` to the founder/user, do not resolve unilaterally.

Claude reviews the **compact result**, not the delegate's full working context. If something in the compact result doesn't add up, `log_path` is there for forensic drill-down — but that is the exception path, not the default read.
