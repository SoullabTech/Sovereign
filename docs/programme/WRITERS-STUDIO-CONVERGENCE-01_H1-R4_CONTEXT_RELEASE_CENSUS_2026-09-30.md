# WRITERS-STUDIO-CONVERGENCE-01 · H1-R4 — Context Release Census

## Gate question

After House explicitly carries Work A into Writer's Studio, does the Studio
release that temporary Work relationship when the member deliberately moves
to another manuscript/Work inside the Studio?

## Governing law

> **Context survives only while the relationship validates.**

H1-R1/F7 already removes the work= parameter at the landing. H1-R4 tests the
stronger behavioral claim: the entered-through Work must not remain as hidden
durable state when the member moves to another Work.

## Existing navigation

The canonical P4R1 Write controller owns mode navigation. Selecting **Home**
moves to the same Writer's Studio organism with mode=home; the URL may retain
m=<manuscript> until the member chooses another writing identity.

Studio Home renders the member's declared Works and opens a selected manuscript
through the existing open() seam. No new switching mechanism is authorized.

## Acceptance

1. House → Work A → Manuscript A produces mode=write&m=A.
2. The member chooses **Home** inside Writer's Studio.
3. The member explicitly opens Work B from Studio Home.
4. The resulting URL contains m=B and no work= or alternate Work key.
5. The visible Work identity is Work B.
6. Browser storage contains no Work A identity introduced by the circulation
   lane.
7. No database row is written merely by this movement.

## Rejected candidate

A persistent activeWork, lastWork, returnWork, session token, or hidden Work id
is rejected. Those would convert navigation context into memory.

## Behavioral witness

A real Chromium walk used the canonical creation paths for two Works and two
section-addressable manuscripts.

Observed:
- House → Work A landed at mode=write&m=A with no work= parameter.
- The member selected **Home** inside Writer's Studio.
- Studio Home showed Work B as the current Work and Work A under **Also
  written**.
- The member selected **Return to this work** for Work B.
- The resulting URL was mode=write&m=B&s=<section> with no work= or alternate
  Work key.
- The visible Work identity was **H1 R4 Work B**.
- Browser localStorage and sessionStorage contained neither Work A nor Work B
  ids.
- No circulation-specific persistence mechanism was introduced.

This is the decisive release proof: the Work selected at the House threshold
does not survive as hidden Work identity after the member deliberately enters
another Work.

**H1-R4 disposition:** IMPLEMENTATION NOT REQUIRED · BEHAVIORAL EVIDENCE
COMPLETE.

**Stop boundary:** no new persistence, no new crossing vocabulary, no MAIA
input, no Work memory.
