# Knowledge Triage — Where Does This Learning Go?

When a retrospective surfaces new knowledge, use this decision tree to route it correctly.

---

## Decision Matrix

| Signal | Destination | Example |
|--------|-------------|---------|
| Repeated procedure (3+ steps) | **skill** | "Every time we deploy, do X then Y then Z" |
| Explains why/how something works | **docs** | "The Spiralogic system uses 12 facets because..." |
| Catches regressions | **tests** | "This query must never return null" |
| Safety constraint / must-never-do | **guardrail** | "Never delete user data without confirmation" |

---

## 1. SKILL

**When:** A repeatable procedure emerged that will be used again.

**Signals:**
- You wrote the same steps 2+ times in different sessions
- A "recipe" formed (do A, then B, then C)
- Context: when to use, when not to use
- Clear success criteria

**Action:**
- Create new skill in `skills/<skill-id>/`
- Or append to existing skill's procedure

**Template:**
```markdown
### Procedure
1. Step one
2. Step two
3. Step three

### When to Use
- Trigger condition

### When NOT to Use
- Counter-indication
```

---

## 2. DOCS

**When:** Explanatory content that helps understanding but isn't a procedure.

**Signals:**
- Answers "why?" or "how does this work?"
- Background context needed to understand the system
- Architectural decisions and trade-offs
- Concept definitions

**Action:**
- Add to `Community-Commons/09-Technical/` or relevant docs folder
- Or append to a skill's Notes section if skill-adjacent

**Template:**
```markdown
## <Concept Name>

### What It Is
Brief definition.

### Why It Matters
Context and importance.

### How It Works
Technical explanation.
```

---

## 3. TESTS

**When:** A specific invariant must be verified automatically.

**Signals:**
- "This must never happen again"
- Regression from a bug fix
- Edge case that broke something
- Data integrity constraint

**Action:**
- Add test to appropriate test file
- Or add to skill's Verification section

**Template (for skill verification):**
```markdown
### Verification
- `psql -c "SELECT count(*) FROM users WHERE deleted_at IS NULL"` — must be > 0
- `curl -s http://localhost:3000/health` — returns 200
- `npm run typecheck` — exits 0
```

---

## 4. GUARDRAIL

**When:** A safety constraint that MAIA must always respect.

**Signals:**
- Privacy requirement
- Data deletion safeguard
- Trust boundary enforcement
- Irreversible action protection

**Action:**
- Add to `CLAUDE.md` Project Invariants section
- Or add to relevant skill's contraindications

**Template:**
```markdown
## Guardrails

### Data Safety
- Never delete without explicit user confirmation
- Never expose raw API keys in logs

### Privacy
- Never share user data between sessions without consent
- Always anonymize before logging
```

---

## Quick Decision Flow

```
Is it a procedure that will repeat?
├─ Yes → SKILL
└─ No
   ├─ Does it explain how/why? → DOCS
   ├─ Does it catch a regression? → TESTS
   └─ Is it a must-never-do? → GUARDRAIL
```

---

## Multi-Destination

Some learnings belong in multiple places:

| Learning | Destinations |
|----------|-------------|
| "Always validate user IDs before delete" | GUARDRAIL (safety) + SKILL (procedure) + TEST (verification) |
| "The window-of-tolerance skill works best after elemental-checkin" | SKILL (nextSkillHints) + DOCS (usage pattern) |

When in doubt: put the **actionable** part in the skill, and the **explanatory** part in docs.

---

## Integration with Retrospective

The retrospective skill will:
1. Analyze session for learnings
2. Run each learning through triage
3. Generate patches for the appropriate destinations
4. Output unified JSON for the update script

This ensures knowledge flows to where it will compound most effectively.
