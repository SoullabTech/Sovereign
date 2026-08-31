# House — 00 Standing Record · PROVENANCE ANNEX

**Companion to** `HOUSE_00_STANDING_RECORD.md`. Read alongside it.

Every claim in the Standing Record is an **output of the Pass 1 reconciliation**, not an
externally established fact, **unless listed in §1 below.** This annex exists because the
review's own discipline (Observed / Inferred / Hypothesis) was applied to the findings
but not, initially, to the reporting of them.

Raised by Kelly, 2026-07-29:

> "They remain repository-specific observations… I would treat them as reported findings
> from this Pass 1 extraction, not as universally established facts."

Correct, and adopted.

---

## 1. OBSERVED — verified by direct command, output in the session transcript

| Claim | Method | Result |
|---|---|---|
| Repository identity | `gh repo view --json nameWithOwner` | `SoullabTech/Sovereign` — **not** `SoullabTech/MAIA-SOVEREIGN` |
| Trunk branch protection | `gh api repos/:owner/:repo/branches/clean-main-no-secrets/protection` | required: `["build","check-diagrams"]` · strict: true · enforce_admins: **false** · required_reviews: null |
| The prior "no protection" finding | probed both repo paths explicitly | wrong-repo 404 — **falsified premise**, not a stale fact |
| ADR-013 | `git ls-files` + `ls docs/adr/` | **absent** — dir holds only 001, 004, 010, 012, README, template |
| ADR-005 | same | **absent** |
| Four House docs tracked-status | `git log --all --oneline -- <path>` per file | `THE_HOUSE.md`, both 07-22 coherence audits → **0 commits on any ref**; 07-27 nav audit → 1 (PR #801 branch only) |
| Working-tree currency | `git rev-list --count HEAD..origin/clean-main-no-secrets` | **427 commits behind trunk** |

These seven are externally verified. Anyone can re-run the commands.

## 2. REPORTED — Pass 1 extraction output, NOT independently verified

Treat as reconciliation output pending confirmation:

- The category counts (27 / 14 / 41 / 46 / 20 / 33 / 21) and the 202-row merge
- The **B3 split — 34 consequential / 7 ordinary**. The *test* is stated and sound; the
  *assignment* of individual items to each side is a judgment call made by one agent.
- 62 standing rulings; their grouping by binding force; 37 flagged for re-verification
- 28 frozen/held items and their lift-gates
- The five-term vocabulary register and its sense-counts
- Three incompatible accounts of Journal · the House Presence deployment conflict
- The nine contradictory surface accounts (Astrology, Wisdom return, `MaiaReturn`)

## 3. RETRACTED

**"Eight cited-but-nonexistent documents."** Not verified; partly wrong.

A spot-check of names appearing in that section found `ADR-010`,
`CHANGES_SECTION_EPISTEMIC_DISCIPLINE.md`, `SESSION_ROOM_LIVING_ENCOUNTER.md`, and
`CLAUDE.md` **present and tracked**.

*Method caveat*: the check used a `grep -A3` context window and may have captured
neighbouring names rather than only the missing list — so this does not cleanly refute
the extraction's list. It does establish that the count **as relayed** was unverified.

**Replacement claim, verified: two documents are absent — ADR-005 and ADR-013.**

`THE_HOUSE.md` exists. At the time of this review it was **untracked**, which was a
*durability* finding, not an *existence* finding. The two must not be merged into one
number — that conflation is what produced the inflated count.

**Updated 2026-07-29:** it is now preserved on `clean-main-no-secrets` via merge `d531974e2`
(PR #814) and **relocated** to `docs/governance/candidates/THE_HOUSE_CANDIDATE.md`.
Its standing is unchanged — **candidate**. ⛔ Path is not status: neither the relocation
nor the merge promotes it. The durability finding is discharged; nothing else about it is.

## 4. Standing rule for the remaining nine reviews

> An agent-produced count is **Reported** until a command re-establishes it.
> The reviewer's summary does not upgrade a finding's evidence class.

A finding that gains confidence by passing through a summary is the same defect the
navigation lane was opened to repair — a claim acquiring authority from its retelling
rather than from evidence. It is easier to commit in prose than in code, and this annex
is the guard against it.

---

*Pass 1 artifact. No recommendations. Nothing here authorizes a build.*
