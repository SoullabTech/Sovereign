---
description: "Create verification pass for an Oracle feature"
argument-hint: "feature-name"
allowed-tools: "Read,Grep,Glob,Write,Edit,Bash"
---

# Oracle Test Pass

You are creating a verification pass for: **$1**

## Before writing tests

1. Read the implementation files to understand what was actually built
2. Read existing test conventions:
   - `__tests__/` directory for test patterns
   - Check if Jest or another runner is configured
3. Understand what's testable without a running server vs what needs runtime verification

## Test categories

### 1. Typecheck
```bash
npm run typecheck
```
Must pass with zero errors. If it doesn't, fix type issues before writing other tests.

### 2. Unit tests
Create or update `__tests__/$1.test.ts`:

**Positive cases:**
- Feature produces correct output for valid input
- Feature returns expected shape (matches shared types)
- Feature integrates with existing data structures

**Negative cases:**
- Feature handles missing input gracefully
- Feature handles null/undefined context
- Feature doesn't fire on unrelated input (false-positive protection)

**Edge cases:**
- Boundary values (0, 1, max)
- Empty strings, empty arrays
- First-time user (no prior state)
- Returning user (with prior state)

### 3. Integration checks (if applicable)
- Does the feature compose correctly with the conductor?
- Does the feature work with existing framework lenses?
- Does memory load/write work end-to-end?

### 4. Sovereignty checks
- [ ] Does this feature increase user agency?
- [ ] Does this feature push life outward into the world?
- [ ] Does this feature reduce the system's psychological centrality over time?
- [ ] Does this feature respect Sanctuary Mode boundaries?

### 5. Runtime/manual verification
Steps to verify in a running system:

```bash
# 1. Rebuild container
docker compose -f docker-compose.production.yml up -d --build maia

# 2. Check logs for errors
docker logs maia-sovereign --tail 50

# 3. Verify database state (if new table/columns)
docker exec maia-postgres psql -U soullab maia_consciousness -c "SELECT * FROM [table] LIMIT 5;"

# 4. Test via internal curl (NOT from host — port 3000 is Docker-internal)
docker exec maia-sovereign sh -c "curl -s localhost:3000/api/health"

# 5. Test via Caddy (from host)
curl -s http://localhost/api/health
```

### 6. Regression zones
List specific behaviors that might break:
- Existing routing that could be affected
- Memory patterns that might conflict
- Prompt assembly that could be disrupted
- Performance impact (new LLM calls, new DB queries)

## Output format

Return:
1. Test file(s) created or updated
2. Manual verification steps
3. Known gaps (what can't be automatically tested)
4. Regression watch list for production

## Constraints

- Do not test internal implementation details — test behavior and output shape
- Do not mock the database unless absolutely necessary (prefer testing against real DB)
- Keep tests fast — avoid unnecessary LLM calls in unit tests
- Include both "feature works" and "feature doesn't break existing behavior" tests
