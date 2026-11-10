# CLAUDE.md relocation plan — DRAFT, authorizes nothing (2026-11-09)

## Problem (measured)
Root `CLAUDE.md` = 255,474 bytes (~65k tokens). The local delegation lane (`~/bin/maia-code`, `CLAUDE_CODE_MAX_CONTEXT_TOKENS=65536`) loads it into every worker, so the worker fails with "Prompt is too long" before starting (observed 2026-11-09 on a trial unit, 11 s, result `reject`). Cause is inferred from size and the error text; not yet confirmed by running with a trimmed file.
Section sizes: "Current priority thread" 218,169 B (52 `LATEST` entries + older notes) · Infrastructure 11.7 KB · Architecture snapshot 4.2 KB · everything else under 3.3 KB each. So the problem is one section, 85% of the file.

## Proposal: relocation only, byte-exact (precedent: memory index split 2026-08-05 — "nothing summarized, rewritten or improved")
1. Move the body of `## Current priority thread` (lines 45-149) unchanged to `docs/programme/CLAUDE_MD_PRIORITY_THREAD_ARCHIVE_2026-11-09.md`.
2. Leave in CLAUDE.md: the section heading, one paragraph "history lives at <path>; newest entries first; read before consequential work", and the 3 newest `LATEST` entries verbatim.
3. Leave every other section (vows, canon, infrastructure, invariants, traps) untouched.
4. Target: CLAUDE.md under ~45 KB (~11k tokens), safely inside a 65k window.

## Verification (before anything is merged)
- Archive + new CLAUDE.md, concatenated in the right order, are byte-identical to the old file (sha256 compare). 0 lines lost, 0 duplicated.
- All links/paths cited in the moved text still resolve from their new location, or are listed as unchanged-text-moved.
- Re-run the trial unit (`ain-delegate.sh new/claim/local`) against the trimmed file: expect the worker to start. This is the only test that confirms the cause.
- `npm run preflight` is not needed (docs only), but the repo commit hooks apply; the commit-message hook refuses the Claude co-author line (per the PR #2205 report).

## Going forward
Status entries go to a dated record in `docs/programme/`; CLAUDE.md gets at most a one-line pointer per lane. Candidate guard: a check that fails when CLAUDE.md exceeds 60 KB.

## Authority / stop conditions
- Editing CLAUDE.md is a project-governance change: needs the founder's explicit yes, then a normal PR.
- Stop if the byte-exact check fails or the trial worker still fails (cause then not size).
- Not authorized: merge, deploy, summarizing or rewriting any entry, deleting any entry, touching other sections.
