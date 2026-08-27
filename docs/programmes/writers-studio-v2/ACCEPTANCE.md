# WRITERS-STUDIO-V2 — Acceptance

How a unit is proved finished. Applies to every unit; the per-unit packet adds
its own specifics.

---

## The three legitimate outcomes

Carried forward from the R2 walk doctrine. Every unit and the whole programme
end in exactly one of:

1. **Accept**
2. **Accept with bounded corrections** — the corrections are named and scoped
3. **Do not accept**

"Nearly" and "in principle" are not outcomes.

## A unit is not finished because code exists

A vertical room, not a backend feature. The unit's packet names the user path,
and the path is walked end to end. Examples:

**WS2-06 MATERIALS** — enter Materials Studio → import → inspect → understand
provenance → establish relationship to work → see connections → talk with MAIA →
return to the manuscript.

**WS2-04 WRITE** — open the correct manuscript → open the correct chapter →
write → format → autosave → navigate → pull material → ask MAIA → inspect the
insight → version → return later and find the same state.

## Evidence required per unit

```text
FUNCTIONAL     the user path walked, with what was observed at each step
REGRESSION     the PRESERVE list from CAPABILITY-MAP still works
VISUAL         screenshot at the reference viewport, compared against the frozen
               reference on composition · hierarchy · density · typography ·
               alignment · states · fidelity · interaction
DATA           no substitution, no silent fallback, failures explicit
PROVENANCE     the exact SHA the evidence was taken from
```

Visual evidence compares against an **image**, never against a description. Until
`DESIGN-CONTRACT.md` §0 closes, no unit from WS2-02 onward can produce valid
visual evidence.

## Roles in a unit pass

```text
ARCHITECT     existing substrate + minimal design
EXPERIENCE    interaction/visual acceptance derived from the frozen references
BUILDER       implements in an isolated worktree
TESTER        functional + regression proof
REVIEWER      code / data / security review
EXPERIENCE    visual comparison + user-path walk
JARVIS (CC)   reconciles evidence
FOUNDER       appears only at a genuine decision or authority gate
DEPLOYMENT    deploys the exact accepted lineage
JARVIS (CC)   verifies live provenance + live behavior
```

The founder is not a step in the loop. He appears when there is a real design
choice, a real authority boundary, or a finished surface worth experiencing.

## Deploy verification — both ways, every time

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
ssh soullab@minisforum 'docker exec maia-sovereign ls /app/.next/server/app/api/sovereign/studio/'
```

The env var proves what the deploy was told to build. The built routes prove
what is actually in the image. A deploy is verified when both agree with the
commit under test. See `DECISIONS.md` §D-007.

## Programme acceptance — WS2-13

The programme is not complete when thirteen units each pass. It is complete when
the founder walks the **whole product** on the deployed lineage and accepts it,
with real writing, as a writer — not as a systematic test.

Quarantined from every outcome: CADDY-CUSTODY-01, Resend / `auth:email-code`,
dependency audit debt. They need fixing. None of them determines whether the
creative architecture works.
