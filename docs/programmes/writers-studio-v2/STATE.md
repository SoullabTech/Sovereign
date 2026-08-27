# WRITERS-STUDIO-V2 — STATE

> Short by design. This is what JARVIS reconstructs from — not the conversation.
> Update it in the same commit as the work that changes it.

```text
PROGRAMME       WRITERS-STUDIO-V2 · ACTIVE
LANE            claude/writers-studio-organization-wxpb7q
CANONICAL       644d4f2c5

PRODUCTION      1feec9b1d  deployed + VERIFIED TWO WAYS 2026-08-27
                printenv GIT_COMMIT == 1feec9b1d, and the refusal-panel string
                is present in the built artifacts:
                  /app/.next/static/chunks/app/writers-studio/canvas/page-fbd9167f5560c402.js
                  /app/.next/server/app/writers-studio/canvas/page.js
                the CODE is in the image, not merely the label (D-007)

CURRENT         WS2-00 — product contract
                BLOCKED on the reference images reaching the repository
                (DESIGN-CONTRACT.md §0 / DECISIONS.md D-006)

READY           WS2-01 — work/manuscript/content identity
                fix IS in production and verified present; BEHAVIOUR NOT YET
                OBSERVED, and acceptance requires the chain, not the screen
                (ACCEPTANCE.md § WS2-01 · D-008 · D-009):
                  90f447cd8  refuse to substitute a manuscript not asked for
                  1feec9b1d  read the asked-for id reliably; self-diagnose on failure
                remaining: full chain audit — owner → work → manuscript →
                section → content, every read path, no silent fallback anywhere

BLOCKED         WS2-04 — editor storage decision (rich text format + migration)

ACCEPTED        none

UNRESOLVED      root cause of transcript substitution.
                The two commits above are a strong inference from evidence
                (two distinct ?m= ids, one identical wrong result, fallback
                sentence rendering both times), NOT a proof. The fix is deployed;
                the screen has not yet been read. Three outcomes are open:
                correct manuscript / explicit "not on your shelf" refusal naming
                the asked-for id / still the wrong text.

NEXT ACTION     1. founder: commit the 8 reference screens to reference/  → closes WS2-00
                2. founder: capture the resolution chain for TWO distinct
                   writings, then run the nonexistent-id probe
                   (ACCEPTANCE.md § WS2-01 — screen alone is not acceptance)
                3. on that evidence, audit every remaining read path and make
                   the D-008 invariant a regression test

CARRIED FORWARD WS-01 formal acceptance still outstanding (founder's act)
                STRUCTURE-02 held; redefinition carries into WS2-07 (D-005)
                SHELL-01 withdrawn; absorbed by WS2-02 + WS2-03

QUARANTINED     CADDY-CUSTODY-01 · Resend/auth:email-code · dependency audit debt

LAST UPDATED    2026-08-27
```
