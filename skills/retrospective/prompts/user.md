# Session Retrospective Request

## Session Context

{{sessionContext}}

{{#if filesTouched}}
## Files Touched

{{filesTouched}}
{{/if}}

{{#if commandsUsed}}
## Commands Used

{{commandsUsed}}
{{/if}}

{{#if errorsEncountered}}
## Errors Encountered

{{errorsEncountered}}
{{/if}}

{{#if stackTraces}}
## Stack Traces / Logs

{{stackTraces}}
{{/if}}

---

## Your Task

Analyze this session and produce:

1. **Session Summary** (6-12 bullets)
   - What was the objective?
   - What changed?
   - What was verified?
   - What remains unknown or risky?

2. **Success Patterns** (if any)
   - Pattern name
   - Trigger (when it applies)
   - Move (what to do)
   - Proof (how to verify)
   - Files (relevant paths)

3. **Failure Patterns** (if any)
   - Failure name
   - Symptom (what you saw)
   - Root cause (why)
   - Avoid (what not to do)
   - Fix (what to do instead)

4. **Edge Cases** (3-10 bullets)
   - Boundary conditions discovered
   - Invariants that must remain true

5. **Patch List** (1-3 targets max)
   - Decide: update existing skill OR create new skill stub
   - Produce exact JSON for the update-skill.ts script

6. **PR Payload** (optional, if requested)
   - Branch name
   - Commit message
   - PR description (3-6 bullets)

---

**Output the patch JSON at the end so it can be piped to the update script.**
