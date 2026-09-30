# SOUL-SERVICE-03H — Capacity Orchestration Witness

**Date:** 30 September 2026
**Status:** LOCAL DESIGN / INTERACTION WITNESS
**Base:** 03G at `0bcc905dba56692023922169044eebc476655f96`
**Production:** untouched
**Persistence:** none
**Scoring:** none

---

## Question

> **Can several capacities remain available and coordinated without making MAIA the permanent executive function of the member?**

Synthetic inquiry:

> Two reader reports about the same revised passage disagree. One says the transition now works; the other still loses the thread. The author has not decided whether another revision is needed.

---

## Browser witness

Observed:

- no-support state exists initially: **true**
- direct member choice works without MAIA: **true**
- MAIA appears only after explicit invitation: **true**
- MAIA offer set is bounded to four options including **None right now**: **true**
- offer set is explicitly non-ranked: **true**
- reject-all clears MAIA offer standing: **true**
- rejection returns orchestration to **NO_SUPPORT**: **true**
- MAIA-assisted selection still results in **MEMBER_SELECTED**: **true**
- sequential second-capacity use is **MEMBER_SEQUENCED**: **true**
- no checklist / Step 2 framing appears: **true**
- page errors: **none**

> **SOUL_SERVICE_03H_CAPACITY_ORCHESTRATION_WITNESS = PASS**

---

## Direct choice

The member can choose:

> **Compare versions directly**

without inviting MAIA.

This witnesses that MAIA is not required to mediate access to the member's own capacities.

---

## Invited MAIA menu

After explicit invitation, MAIA presents a bounded set:

- Compare versions
- Look for counterevidence
- Leave unresolved
- None right now

The set is:

> **non-ranked**

and states:

> **None is the correct one.**

No hidden fit score is displayed or used in this prototype.

---

## Rejection

The member may choose:

> **None right now**

Observed result:

> **MAIA's offered set has no standing after rejection.**

The interaction returns to:

> **NO_SUPPORT**

No rejected capacity remains active.

---

## Sequencing

The member first chooses:

> **Compare versions**

The inquiry then reveals a contradiction.

Only then does the member choose:

> **Look for counterevidence**

Observed orchestration state:

> **MEMBER_SEQUENCED**

The UI explicitly says:

> **There is no next step.**

This prevents orchestration from becoming a mandatory cognitive checklist.

---

## Governing result

> **Good orchestration helps the person choose their support. Great orchestration increasingly lets them know when they need none.**

---

## Exact stop

03H remains local / design-only.

It does not authorize:

- model-ranked capacity selection;
- production personalization;
- member cognitive profiles;
- adaptive scoring;
- automatic orchestration;
- deployment.

**STOP before merge or production.**
