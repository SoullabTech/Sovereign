# WRITERS-STUDIO-V2 — STATE

> Short by design. This is what JARVIS reconstructs from — not the conversation.
> Update it in the same commit as the work that changes it.

```text
PROGRAMME       WRITERS-STUDIO-V2 · ACTIVE
LANE            claude/writers-studio-organization-wxpb7q
CANONICAL       644d4f2c5

PRODUCTION      59ed6dac6  verified two ways 2026-08-27
                (printenv GIT_COMMIT + built studio routes present)
IN FLIGHT       1feec9b1d  deploy started, completion UNVERIFIED — see UNRESOLVED

CURRENT         WS2-00 — product contract
                BLOCKED on the reference images reaching the repository
                (DESIGN-CONTRACT.md §0 / DECISIONS.md D-006)

READY           WS2-01 — work/manuscript/content identity
                partial work already on the lane, unproven in production:
                  90f447cd8  refuse to substitute a manuscript not asked for
                  1feec9b1d  read the asked-for id reliably; self-diagnose on failure
                remaining: full chain audit — owner → work → manuscript →
                section → content, every read path, no silent fallback anywhere

BLOCKED         WS2-04 — editor storage decision (rich text format + migration)

ACCEPTED        none

UNRESOLVED      root cause of transcript substitution.
                The two commits above are a strong inference from evidence
                (two distinct ?m= ids, one identical wrong result, fallback
                sentence rendering both times), NOT a proof. Production has not
                confirmed or refuted them.

NEXT ACTION     1. founder: commit the 8 reference screens to reference/  → closes WS2-00
                2. verify 1feec9b1d in production; report which of three states
                   the canvas shows: correct manuscript / "not on your shelf —
                   asked for: <id>" / still the wrong text
                3. on that answer, finish WS2-01 and prove it

CARRIED FORWARD WS-01 formal acceptance still outstanding (founder's act)
                STRUCTURE-02 held; redefinition carries into WS2-07 (D-005)
                SHELL-01 withdrawn; absorbed by WS2-02 + WS2-03

QUARANTINED     CADDY-CUSTODY-01 · Resend/auth:email-code · dependency audit debt

LAST UPDATED    2026-08-27
```
