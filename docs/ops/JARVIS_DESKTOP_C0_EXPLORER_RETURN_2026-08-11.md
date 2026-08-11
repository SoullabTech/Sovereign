# JARVIS DESKTOP ALPHA — C0 CAPABILITY EXPLORER · RETURN

```text
CLAIM:   Desktop C0 capabilities are discoverable and structured; canonical
         execution/authority semantics unchanged.
BRANCH:  feature/jarvis-desktop-c0-explorer
BASE:    chore/jarvis-desktop-alpha-source @ ef3d57c4e
         (NOT an ancestor of clean-main-no-secrets — the Desktop source has
          never been merged to trunk)
COMMIT:  1b692f672  (3 commits: ec2671e3b custody · 727c6d3af feature · 1b692f672 walk fix)

FILES CHANGED:
  jarvis-desktop/src/capability-form.js   (new — DOM-free shared logic)
  jarvis-desktop/src/main.js              (+ jarvis:capabilities, read-only)
  jarvis-desktop/src/preload.js           (+1 channel)
  jarvis-desktop/src/renderer.js          (Work → C0 rebuilt)
  jarvis-desktop/src/index.html           (script tag + form styles)
  scripts/builder/__tests__/desktop-c0-explorer-proof.mjs  (new)
  package.json                            (proof registered in jarvis:proof)

REGISTRY SOURCE:  scripts/builder/deterministic.mjs — imported at runtime by
                  main.js from the resolved REPO_ROOT, the same module the
                  executor imports. No second catalog; the UI prints the
                  absolute path it read.
CAPABILITY COUNT: 15

C0 PICKER:        filter box + registry-backed <select>; free-text capability
                  name box removed entirely.
STRUCTURED ARGS:  generated from each capability's declared schema
                  (string/number/enum, required markers, min/max/maxLength).
                  Blank optional field ⇒ argument OMITTED, so a capability's
                  own default is never silently overridden.
ADVANCED JSON:    retained, and validated against the schema before submit.
LOCAL VALIDATION: unregistered identifier · malformed JSON · non-object JSON ·
                  missing required · unexpected argument · type/range/enum.
                  Invalid C0 input is never sent to the router.

ROUTER CHANGED: NO
AUTHORITY CHANGED: NO
CAPABILITY IMPLEMENTATIONS CHANGED: NO
C1 BEHAVIOR CHANGED: NO

TESTS:      desktop-c0-explorer-proof.mjs — 44 passed, 0 failed (acceptance A–H)
            regression: router-alpha 12/12 · deterministic-registry 11/11 ·
                        run-check 15/15 · work-unit 37/37
TYPECHECK:  npm run typecheck — ✅ no regressions (231 errors vs baseline 239).
            ⚠️ Honest scope: every file changed here is .js/.mjs, and
            tsconfig.ship.json has no allowJs — NONE of them enter that
            program. The gate proves no regression elsewhere; it is not
            evidence about this diff.
FOUNDER WALK: performed on the governed worktree build.
            Defect found and fixed during the walk: the capability filter
            re-rendered its own input, so only the first typed character
            survived. Fixed + regression-guarded (commit 1b692f672).

inventory.routes C0 execution:
  requested:          inventory.routes  {"dir":"app/api"}
  selected:           C0 (cost class: deterministic)
  status:             completed
  execution verified: PASS
  result correctness: RESULT VERIFIED

UNRELATED WORK: NO
  Declared, not hidden: commit ec2671e3b adopts the live console source
  byte-exact. The running JARVIS.app is built from an UNTRACKED directory
  (.claude/worktrees/jarvis-desktop/jarvis-desktop/) whose main.js/renderer.js
  are AHEAD of the preserved branch — it carries the 2026-08-11 verification
  honesty split. Building on the stale snapshot would have silently reverted
  it. No behavior was authored in that commit.

FINAL CLASSIFICATION:
PASS — C0 CAPABILITIES ARE DISCOVERABLE AND STRUCTURED;
CANONICAL EXECUTION/AUTHORITY SEMANTICS UNCHANGED
```

## Two things that need the founder

1. **The Desktop console's real source is untracked and lives in a scratch
   worktree.** It is one `rm -rf` from gone. `ec2671e3b` captures the current
   bytes on a branch, but the running app still loads from the untracked path.
   A custody decision is owed on where the canonical Desktop source lives.
2. **The registry declares no descriptions and no categories.** The picker
   therefore shows neither, and says so per capability rather than inventing
   copy. Adding them is a registry change, not a Desktop change — deliberately
   out of scope here.
