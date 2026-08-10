# AIN Work Packet Contract

> Founder-authorized 2026-08-09 as part of the Builder OS delegation control plane (`docs/ops/AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md`). This is the bounded unit of work Claude hands to a delegated execution lane (local Qwen via `maia-code`, or Kimi via `kimi-cc`). It carries **conclusions**, not the archaeology that produced them — Claude may spend 100k tokens understanding a problem; the packet should carry the 2-5k of settled result a delegate needs to execute it.

## Storage

Packets are ephemeral working state, not repo content — stored outside the repo, mirroring the existing `~/.claude/kimi-lane/episodes.jsonl` convention:

```
~/.claude/ain-delegation/packets/<work_unit_id>.json
~/.claude/ain-delegation/results/<work_unit_id>.json
~/.claude/ain-delegation/locks/<work_unit_id>.lock
~/.claude/ain-delegation/episodes.jsonl        # observability ledger, one line per delegated run
```

Never commit a packet or result file to the repo. If a delegation is worth preserving as a record, write a normal handoff packet (`docs/ops/AIN_HANDOFF_RECORD_CONTRACT.md`) or a docs/ops note that references the `work_unit_id`.

## Schema

```json
{
  "work_unit_id": "kebab-case-unique-id",
  "title": "One-line human title",
  "objective": "What the delegate must accomplish. Conclusion-level, not exploratory.",
  "execution_lane": "local | kimi",
  "canonical_sha": "short sha the work starts from",
  "branch": "branch name the delegate will work on",
  "worktree": "absolute path — filled in by `ain-delegate.sh claim`, not by the packet author",
  "governing_authority": "which canon/doc/founder-ruling constrains this unit, if any (or 'none — mechanical task')",
  "established_facts": ["settled conclusions the delegate must NOT re-derive or re-litigate"],
  "allowed_files": ["glob or explicit paths the delegate may touch"],
  "prohibited_files_actions": ["explicit files/actions off-limits, e.g. migrations, auth, .env*, production scripts"],
  "acceptance_criteria": ["concrete, checkable conditions for done"],
  "verification_commands": ["shell commands run inside the worktree after work; e.g. npm run typecheck, npm test -- <path>"],
  "escalation_conditions": ["conditions under which the delegate must stop and escalate rather than guess"],
  "max_attempts": 2,
  "expected_output": "what a successful result looks like, in one or two sentences"
}
```

## Authority firewall (always appended to every packet's prompt, not author-editable)

A delegate may execute settled decisions. It may **not** silently establish: constitutional architecture, member authority, consent semantics, confidentiality semantics, provenance semantics, epistemic authority, destructive migration policy, security boundaries, founder rulings, ontology, or deprecation of important capability.

If delegated work encounters one of these, it must stop and print a line starting with `ESCALATE_TO_CLAUDE:` followed by the exact ambiguity — never guess. This reuses `kimi-cc`'s existing escalation-marker convention (`escalation_reason` parsed from the transcript tail) so both lanes escalate the same way.

## Example

```json
{
  "work_unit_id": "typecheck-baseline-drift-scripts-lib",
  "title": "Fix mechanical typecheck regressions in lib/scheduling",
  "objective": "Bring lib/scheduling/*.ts to zero new typecheck diagnostics vs typecheck-baseline.json without changing runtime behavior.",
  "execution_lane": "local",
  "canonical_sha": "57005b6b1",
  "branch": "chore/typecheck-scheduling-drift",
  "worktree": null,
  "governing_authority": "none — mechanical task",
  "established_facts": [
    "npm run typecheck is a no-regression gate against typecheck-baseline.json, not a full-clean requirement",
    "do not re-baseline; only fix the new diagnostics introduced since baseline"
  ],
  "allowed_files": ["lib/scheduling/**/*.ts"],
  "prohibited_files_actions": ["typecheck-baseline.json", "any migration", "package.json"],
  "acceptance_criteria": ["npm run typecheck passes", "no behavior change beyond types — confirm by reading diff"],
  "verification_commands": ["npm run typecheck"],
  "escalation_conditions": ["a type error requires changing a public function signature used outside lib/scheduling"],
  "max_attempts": 2,
  "expected_output": "A diff limited to lib/scheduling/**/*.ts, typecheck green, no signature changes leaking outward."
}
```
