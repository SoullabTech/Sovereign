# Kristen — Identity Continuity Reconstruction (preserve-first)

**Read-only inventory. No migration performed. Consolidation NOT authorized.**
Posture per founder correction 2026-08-16: *preserve first, reconstruct continuity second,
consolidate only if the evidence supports it — and never by deleting records.*

Two member identities differing only by email capitalization:

| | Identity **A** | Identity **B** |
|---|---|---|
| id | `aed4e372-874d-44c3-816e-dcf3cd9c09b8` | `bce7a472-7924-4f6d-893c-580e7f0e620a` |
| email | `Inhomesanctuary@gmail.com` (capital I) | `inhomesanctuary@gmail.com` |
| username | `kristen` | `kristenn` |
| onboarded | **true** | **false** |
| created | 2026-01-23 | 2026-02-08 |

## The correction this forces

I earlier said "her real account is orphaned," implying the onboarded account (A) was the real one.
**That is backwards.** The evidence:

**Identity B — where Kristen actually lives** (non-onboarded, lowercase):
652 conversation turns · 3,242 memory uses · 72 developmental memories · 50 breakthrough moments ·
47 relationship entries · 55 state vectors · 123 field-orchestrator rows · 1,067 agent runs ·
spiral state · astrology report · practitioner record · a circle she created · 16 auth sessions
(last 2026-08-05).

**Identity A — a near-empty onboarded shell** (capital I):
1 auth session (last ~2026-03-25) · richer *tool configuration* (34 enabled tools vs B's 21;
6 category prefs vs 2) · owns a studio team · 1 team DM membership.

She onboarded once as A, was not recognized when she returned, re-registered as B, and has lived in
B ever since — while B was never marked onboarded. Her continuity is overwhelmingly in B; A holds
her onboarding flag and some Studio/tooling structure.

## Neither identity is a clean superset

Unique history exists on **both** sides, which is precisely why a naive merge would lose something:

- **A-only:** studio team ownership, a team DM membership, a fuller enabled-tools/category config.
- **B-only:** essentially all conversational, memmory, relational, developmental and astrological
  continuity.

## Classification (per founder's requested schema)

| Dimension | Finding |
|---|---|
| OVERLAP | Both own a `studio_teams` row and 2 `studio_team_members` rows — need inspection to see if same team or two. Both have session tables populated. |
| UNIQUE — A | onboarded flag, tool config breadth, team DM, studio ownership |
| UNIQUE — B | all memory/continuity/relational/astrology/practitioner history |
| PROVENANCE | A = older, onboarded, then abandoned (1 session since March). B = self-registered 2026-02-08 after non-recognition, actively used through 2026-08-05. |
| CANONICAL (recommend, not ruled) | **B** should be the identity MAIA resolves — it carries the lived relationship. A's unique structures (studio team, tool config, onboarded flag) should be **re-attributed to B with preserved provenance**, not discarded. |

## What is NOT authorized

No merge, no delete, no re-attribution yet. This document establishes *which records belong to the
same human and how they are distributed*. The canonical-identity decision and any consolidation
mechanism are a **founder ruling** (surfaced as R6) and a subsequent designed, provenance-preserving
migration — never a hand-merge.

## Revised finding posture (replaces "DUPLICATE IDENTITY → CLEAN UP")

```
KRISTEN IDENTITY CONTINUITY
  two member identities observed (A onboarded/near-empty, B non-onboarded/memory-rich)
  memory/history distribution  RECONSTRUCTED (this document)
  canonical identity           RECOMMENDED: B  (founder ruling R6 required)
  consolidation                NOT AUTHORIZED
  preservation                 REQUIRED
  continuity reconstruction    DONE — precedes any merge
```

Same shape applies to the six other non-lowercase-email rows and any future OAuth-case split —
this is the pilot case for the P2 uniqueness-and-continuity work, not a one-off cleanup.
