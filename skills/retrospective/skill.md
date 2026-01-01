# Retrospective Skill — Continual Learning Flywheel

## Description

End-of-session retrospective that converts today's work into durable improvements:
- Captures what worked, what failed, and edge cases discovered
- Updates existing skills or creates new skill stubs
- Optionally generates PR-ready patch lists

**This is how MAIA/AIN learns without weight updates.**

---

## Quick Start

At the end of a session, invoke:

```
/retrospective
```

Or ask Claude:

> "Run a retrospective on this session. Output patch list for the skill registry."

Provide:
- Key diffs / files touched
- Commands you ran (curl, psql, tests)
- What surprised you or failed

---

## Outputs

1. **Session Summary** (6-12 bullets)
2. **Success Patterns** — repeatable moves
3. **Failure Patterns** — what to avoid
4. **Edge Cases** — boundary conditions
5. **Patch List** — JSON for `update-skill.ts`
6. **PR Payload** — optional git operations

---

## Applying Patches

### Manual Review (Recommended)

```bash
# Review the patch JSON output, then:
cat <<'JSON' | npx tsx skills/retrospective/update-skill.ts --dry-run
{
  "patches": [
    { "file": "skills/some-skill/skill.md", "append": "\n### Notes\n- New insight here\n" }
  ]
}
JSON

# If it looks good, run without --dry-run
```

### Automatic (Pipeline)

```bash
# Pipe Claude's output directly
claude "Run retrospective on this session" | \
  grep -A1000 '```json' | grep -B1000 '```' | \
  npx tsx skills/retrospective/update-skill.ts
```

---

## Files in This Skill

| File | Purpose |
|------|---------|
| `meta.json` | Skill metadata (triggers, tags, tier) |
| `skill.json` | Full definition (procedure, eligibility, outputs) |
| `skill.md` | This file (human-readable overview) |
| `triage.md` | Decision tree: skill vs docs vs tests vs guardrail |
| `prompts/system.md` | System prompt template |
| `prompts/user.md` | User prompt template |
| `update-skill.ts` | Patch applier script |

---

## The Flywheel

```
Session Work
    ↓
Retrospective Skill
    ↓
Extract: successes, failures, edge cases
    ↓
Triage: skill / docs / tests / guardrail
    ↓
Patch JSON
    ↓
update-skill.ts
    ↓
Updated Skills Registry
    ↓
Future sessions start smarter
    ↓
[repeat]
```

Each session compounds into future sessions.

---

## Integration Points

### With AIN Deliberations

When AIN produces a breakthrough (⭐⭐⭐), the retrospective can:
- Extract the synthesis as a success pattern
- Create a new skill if the deliberation revealed a repeatable procedure
- Update `ain_sessions.jsonl` with structured learning tags

### With Developmental Memory

High-confidence memories (effectiveness ≥ 8) from Beads tasks can:
- Become success patterns in relevant skills
- Inform skill verification steps

### With Pattern Mining

Skills updated via retrospective get more usage → pattern miner detects co-occurrence → emergent agents form.

---

## Known Limitations

- **Manual trigger required** — retrospective doesn't auto-run (yet)
- **No git operations** — PR payload is informational only
- **Skills directory only** — patches restricted to `skills/` for safety

---

## Verification

```bash
# Check skill structure
ls -la skills/retrospective/

# Dry-run a test patch
echo '{"patches":[{"file":"skills/retrospective/skill.md","append":"\n\n<!-- test -->"}]}' | \
  npx tsx skills/retrospective/update-skill.ts --dry-run

# Verify triage doc exists
cat skills/retrospective/triage.md | head -20
```

---

## Notes

- The real flywheel comes from actually running retrospectives, not just having the skill
- Start with 1 retro per session; adjust frequency based on learning velocity
- Keep patches minimal; it's better to compound small improvements than large rewrites
- Success patterns compound faster than failure patterns (positive feedback loop)
