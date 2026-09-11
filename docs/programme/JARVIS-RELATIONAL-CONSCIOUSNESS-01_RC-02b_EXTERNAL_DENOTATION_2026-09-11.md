# RC-02b · EXTERNAL DENOTATION REGISTER — opened under RC-FR-04

**Founder act 2026-09-11:** `RC-02b BLOCKED → RESUMABLE · SOURCE-GATED`. Access adjudicated **per source**.
**RC-FR-04 binding.** No search-summary denotation claims. Inaccessible sources stay candidate/blocked.

---

## ⛔ ACC-01 — ACCESS ASYMMETRY: this session cannot reach source-level material. The founder's environment can.
The founder verified open full text for several nodes already in the lane. **This session cannot retrieve any of
them.** Tested 2026-09-11, both available routes:

```text
WebFetch    pmc.ncbi.nlm.nih.gov        EGRESS_BLOCKED
            www.frontiersin.org          EGRESS_BLOCKED
            www.sciencedirect.com        EGRESS_BLOCKED
            europepmc.org                EGRESS_BLOCKED
            arxiv.org                    EGRESS_BLOCKED   (PASS 2)
            cspeech.ucd.ie               EGRESS_BLOCKED   (PASS 2)

curl        pmc.ncbi.nlm.nih.gov         HTTP 000 (no connection)
            www.frontiersin.org          HTTP 000 (no connection)

agent proxy "enabled": true · "selective": false · "recentRelayFailures": []
            → the block is NOT the HTTPS proxy; scholarly full-text hosts are
              unreachable from this session by any available route.
WebSearch   WORKS — which is precisely the layer RC-FR-04 forbids for denotation.
```

⭐ **The ruling is not refused; it cannot be executed here.** `RESUMABLE · SOURCE-GATED` is correct as a lane
state. **The gate is open and this session is not on the right side of it.**
⛔ **Consequence, stated so it cannot be quietly eroded: every entry below stands at `CANDIDATE · ACCESS BLOCKED`.
None may be promoted by this session.** The one tool that works is the one the rule excludes.

---

## Register — all entries `CANDIDATE · ACCESS BLOCKED` unless marked otherwise

Each entry names **what must be inspected**, so that an inspecting pass is immediately executable and does not
have to re-derive the question.

### N-01 · Redcay & Schilbach 2019, *Using second-person neuroscience to elucidate the mechanisms of social interaction* (Nat. Rev. Neurosci.; open full text at PMC6997943)
**Status:** `CANDIDATE · ACCESS BLOCKED` (this session).
**Inspect:** how the authors define/delimit **"social interaction"**, **"second-person"**, **"social cognition"** ·
any hedge, scope condition or explicit refusal · whether any passage places consciousness or a phenomenal subject
**between** participants.
**Founder's source-level observation, relayed:** *"the paper's target is neural/cognitive mechanism during
interaction. That by itself does not move the locus of consciousness between agents."*

### N-02 · Liu & Pelowski 2014, *Clarifying the interaction types in two-person neuroscience research* (Front. Hum. Neurosci.; `10.3389/fnhum.2014.00276`)
**Status:** `CANDIDATE · ACCESS BLOCKED`. ⚠️ **Carries the C-00 corrected clause** — must be inspected in context.
**Inspect:** definitions of **"interaction"**, **"inter-brain"**, **"synchronization"** · the stated object of
study · what two-person methods are said **not** to establish.
**Founder's source-level observation, relayed:** *"the object of study is the relationship between measured brain
activity during interaction — not an assertion of a shared phenomenal subject."*

### N-03 · De Jaegher, Di Paolo & Gallagher 2010, *Can social interaction constitute social cognition?* (Trends Cogn. Sci.; `S1364661310001464`)
**Status:** ⭐ `EVIDENCED · FOUNDER-INSPECTED` — **not lane-inspected.** Recorded as the founder's reading,
relayed verbatim in substance, ⛔ **not** as this session's inspection:
> the paper **explicitly defines social cognition and social interaction**, and **distinguishes constitutive from
> merely contextual or enabling interaction**.
⭐ **That three-way distinction — contextual · enabling · constitutive — is the single most load-bearing
denotation in the whole near-neighbour ladder**, because B-01's ladder turns entirely on which of the three a
given author is claiming. **It must be read in the original before any ladder rung is treated as settled.**
**Still to inspect:** whether any passage extends constitution to **consciousness or phenomenal experience**, or
explicitly declines to.

### N-04 · Gallagher — consciousness paper (identity to be fixed at inspection)
**Status:** `EVIDENCED · FOUNDER-INSPECTED` for one point only:
> Gallagher **characterizes consciousness in terms of intentionality, phenomenality, and non-reflective
> self-awareness**, in explicitly phenomenal and first-person terms.
⭐⭐ **This is the register earning its keep, exactly as predicted.** The same author appears at two rungs of the
ladder using **two different target concepts** — *social cognition* (N-03) and *consciousness* (N-04) — and
**resisting atomistic individualism about the first does not transfer to the second.**
⛔ **Founder's operative warning, recorded as governing this register:** *"Those are not automatically points on
one scale just because all of them resist atomistic individualism."*
**Inspect:** exact bibliographic identity · whether Gallagher anywhere licenses transfer between the two.

### N-05…N-09 · `CANDIDATE · ACCESS BLOCKED`, inspection targets named
| | Source | Term whose permitted denotation must be inspected |
|---|---|---|
| N-05 | Tsuchiya & Saigo 2021, *Neurosci. Conscious.* `niab034` | **"relational"** — confirm sense **A** (experience ↔ experience), and whether the authors ever license sense **B** |
| N-06 | Hermans, dialogical self (`10.1177/1354067X0173001`) | **"self"**, **"I-position"** — and whether *constitutive of the self* is ever extended to consciousness |
| N-07 | Seth 2025, *Behav. Brain Sci.* | **"consciousness"**, **"computational functionalism"**, **"in some relevant sense alive"** |
| N-08 | Butlin, Long et al. 2023/2025 | **"indicator property"**, **"consciousness"** — and the stated status of computational functionalism as *working assumption* vs conclusion |
| N-09 | Relational psychoanalysis, *relational unconscious* (`PMID 14750466`) | **"unconscious"**, **"relational"** — and the explicit stopping point short of dyadic consciousness |

---

## Standing
```text
RC-01     OPEN · not closeable
RC-02     OPEN
RC-02a    COMPLETE
RC-02b    RESUMABLE · SOURCE-GATED  (founder)
          ⛔ NOT EXECUTABLE IN THIS SESSION — ACC-01
          all entries CANDIDATE · ACCESS BLOCKED
          except N-03, N-04: EVIDENCED · FOUNDER-INSPECTED, relayed
RC-03–05  NOT STARTED
F-01      UNADJUDICATED
F-03      UNADJUDICATED
```
⛔ No adjudication · no ladder rung treated as settled · no canon edit · no implementation · no outward claim.
