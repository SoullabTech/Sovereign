<!-- Source: docs/canon/CLAUDE_CODE_GOVERNANCE.md §5 -->
<!-- Use this when starting a Claude Code session. -->

Cost discipline:

Work in short bounded passes.

Do not perform broad exploration unless necessary.
Do not read unrelated files.
Do not summarize the entire codebase.
Do not propose large future architecture unless directly relevant.

If the task can be delegated to:
- a shell command
- a local model
- a deterministic script
- an existing test

then recommend that path instead of doing expensive exploratory reasoning.

Stop after completing the requested pass and produce a concise handoff.
