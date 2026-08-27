# WRITERS-STUDIO-V2 — STATE

> Short by design. This is what JARVIS reconstructs from — not the conversation.
> Update it in the same commit as the work that changes it.

```text
PROGRAMME       WRITERS-STUDIO-V2 · ACTIVE
LANE            claude/writers-studio-organization-wxpb7q
CANONICAL       644d4f2c5

PRODUCTION      1feec9b1d  deployed 2026-08-27 · printenv GIT_COMMIT confirms
                artifact check pending (grep the built bundle for the refusal
                panel string — see DECISIONS.md D-007; the env var alone is not
                proof the code is in the image)
                predecessor 59ed6dac6 was verified two ways

CURRENT         WS2-00 — product contract
                BLOCKED on the reference images reaching the repository
                (DESIGN-CONTRACT.md §0 / DECISIONS.md D-006)

READY           WS2-01 — work/manuscript/content identity
                partial work now IN production, behaviour not yet observed:
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
                2. founder: open a manuscript that is NOT the most recent and
                   report the exact words on screen — that answer decides where
                   WS2-01 goes next
                3. on that answer, audit the whole chain (owner → work →
                   manuscript → section → content, every read path) and prove it

CARRIED FORWARD WS-01 formal acceptance still outstanding (founder's act)
                STRUCTURE-02 held; redefinition carries into WS2-07 (D-005)
                SHELL-01 withdrawn; absorbed by WS2-02 + WS2-03

QUARANTINED     CADDY-CUSTODY-01 · Resend/auth:email-code · dependency audit debt

LAST UPDATED    2026-08-27
```
