# CLAUDE_REPO_CLEANUP.md

## Objective

Perform full repository hygiene cleanup for Spiralogic Oracle System to prepare for team collaboration and improve maintainability.

---

### Step 1 – Remove macOS Ghost Files

1. Search repo for `.DS_Store` and `._*` files.
2. Delete all matches.
3. Add the following to `.gitignore` (if not already present):

```
.DS_Store
._*
```

Commit as:

```
chore(cleanup): remove macOS ghost files and update .gitignore
```

---

### Step 2 – Consolidate Markdown Documentation

1. Create a `/docs` folder at repo root if it doesn't exist.
2. Move **all** `.md` files (excluding LICENSE.md if present in root) into `/docs`.
3. Update any relative links in `.md` files to reflect new paths.

Commit as:

```
chore(docs): consolidate markdown files into /docs
```

---

### Step 3 – Identify and Remove Unused JS Files

1. Run `npx depcheck --json` to identify unused JS/TS files.
2. Review the list; delete confirmed unused `.js` and `.ts` files.
3. Ensure no active imports are broken.

Commit as:

```
chore(cleanup): remove unused JavaScript/TypeScript files
```

---

### Step 4 – Standardize Folder Structure

Ensure the repo follows this structure:

```
/agents
/personal_oracle
/elemental
/main_oracle
/api
/docs
/frontend
/monitoring
/scripts
/services
/tests
```

Move files accordingly; update import paths where necessary.

Commit as:

```
refactor(structure): standardize folder organization
```

---

### Step 5 – Lint & Format Sweep

1. Run ESLint autofix:

   ```bash
   npx eslint . --fix
   ```

2. Run Prettier format:
   ```bash
   npx prettier --write .
   ```

Commit as:

```
style: lint and format codebase
```

---

### Step 6 – Final Commit & Push

After all cleanup steps:

1. Run `npm run build` to confirm no breakages.
2. Run tests with `npm test` to verify stability.
3. Push changes to main branch.

Commit as:

```
chore(repo): complete repository cleanup and organization
```

---

### Execution Rules for Claude Code

- Work **iteratively** — complete and commit each step before moving to the next.
- Do not delete files unless confirmed unused or obsolete.
- Preserve all active functionality.
- Update imports after moving files.
- Maintain existing metaphysical/archetypal logic intact.

---

**End State:**
A clean, organized, and team-ready Spiralogic Oracle System repository:

- No macOS ghost files.
- All docs in `/docs`.
- No unused JS clutter.
- Standardized folder structure.
- Code fully linted and formatted.
