# SOULLAB WRITER'S STUDIO
# Flagship Evidence + Readiness Canon v1

Status: PROGRAMME / EVIDENCE AUTHORITY  
Purpose: define exactly what each kind of proof establishes — and what it does not establish — so green law matrices, implementations, browser renders, human judgments, admissions, and deployments cannot be conflated.

This canon is additive to:
- Flagship Experience Canon
- Release Docket
- Founder Visual Acceptance
- Beta Readiness + Participant Data Ruling
- Capability + Quality Operating Manual
- all Writer's Studio law/falsifier matrices

It does not authorize implementation, merge, deployment, or production mutation.

---

# 1. Core Law

> **Evidence proves only the thing it actually witnessed.**

Therefore:

- a canon is not an implementation;
- a discriminating test is not product behavior;
- an implementation is not a visual acceptance;
- a browser render is not human usability;
- a human pass is not canonical admission;
- canonical admission is not deployment;
- deployment is not post-deploy truth.

No status may inherit authority from a higher-sounding label.

---

# 2. The Evidence Ladder

Writer's Studio uses the following distinct states:

```text
E0  SPECIFIED
E1  DISCRIMINATING LAW
E2  IMPLEMENTED
E3  MACHINE-WITNESSED
E4  RENDERED
E5  HUMAN-WITNESSED
E6  FOUNDER-ACCEPTED
E7  CANONICAL / ADMITTED
E8  RELEASE-CANDIDATE FROZEN
E9  DEPLOYED
E10 POST-DEPLOY WITNESSED
```

A feature may occupy several states simultaneously for different properties.

---

# 3. E0 — SPECIFIED

A behavior is defined in:
- canon;
- product ruling;
- implementation contract;
- acceptance criteria.

Example:
> Guided / Learning / Direct must vary explanation depth while preserving observation truth and authority.

E0 establishes:
- intended law;
- terminology;
- boundaries;
- falsifiers.

E0 does NOT establish:
- code exists;
- UI exists;
- runtime behavior exists;
- user understands it.

Label:

> **SPECIFIED**

Never:
> COMPLETE

---

# 4. E1 — DISCRIMINATING LAW

A test/matrix exists where:
- lawful reference passes;
- known violating candidates fail;
- the test is capable of distinguishing the property.

Example:
- 12/12 facet reference laws pass;
- 12/12 defeat candidates die.

E1 establishes:
- the law is machine-expressible where intended;
- the suite is not trivially green;
- defeat candidates are detected.

E1 does NOT establish:
- the actual product implements the behavior.

Critical label:

> **LAW GREEN · PRODUCT NOT PROVEN**

This is the correct state for a facet matrix while facets are still label-only.

---

# 5. Vacuous Green

A suite is **vacuously green** when the tested violating behavior cannot occur because the capability does not exist.

Examples:

### Concurrency
No async runtime exists.
Concurrency invariants pass because nothing can race.

### First Arrival
No arrival state exists.
Some absence-based laws pass because there is no product surface to violate them.

### Facets
No behavior differs.
Some authority-invariance laws can pass because nothing changes.

A vacuous green is not bad test engineering if:
- it is disclosed;
- the suite footer says capability absent;
- readiness does not inherit from it.

Required label:

> **GREEN LAW · CAPABILITY ABSENT**

---

# 6. E2 — IMPLEMENTED

The behavior exists in source.

Evidence may include:
- exact candidate commit;
- files changed;
- state machine;
- component;
- persistence logic;
- route;
- data object.

E2 establishes:
- implementation exists.

E2 does NOT establish:
- it works;
- it renders;
- it is accessible;
- it feels right;
- it survived integration;
- it is canonical.

Label:

> **IMPLEMENTED · NOT YET WITNESSED**

---

# 7. E3 — MACHINE-WITNESSED

The implemented behavior passes appropriate automated or deterministic witnesses.

Possible evidence:
- unit tests;
- integration tests;
- Playwright;
- accessibility assertions;
- falsifier matrix;
- persistence round-trip;
- state-machine witness;
- mutation test.

E3 establishes only the tested property.

Examples:

> **Facet observation identity invariant — MACHINE PASS**

does not imply:
> Facet experience good.

> **Review return trail — MACHINE PASS**

does not imply:
> Review visually accepted.

---

# 8. E4 — RENDERED

The actual candidate has been rendered in the required browser/state/viewport.

Evidence includes:
- exact candidate;
- exact viewport;
- exact fixture/state;
- screenshot/render.

E4 establishes:
- this product state visibly exists;
- the layout can be inspected.

E4 does NOT establish:
- founder acceptance;
- accessibility;
- human comprehension;
- semantic truth;
- production parity.

Label:

> **RENDERED · HUMAN JUDGMENT PENDING**

---

# 9. E5 — HUMAN-WITNESSED

A property requiring human judgment has actually been observed.

Examples:
- Direct is concise without feeling cold;
- Guided feels supportive without patronizing;
- writer understands Continuity Map;
- writer knows why they landed on a passage;
- visual hierarchy makes Work primary;
- navigation invites curiosity.

E5 requires:
- real candidate;
- actual state;
- defined human question;
- named witness context.

A human judgment about a mockup is evidence about:
> the mockup

not:
> the implementation.

---

# 10. E6 — FOUNDER-ACCEPTED

The founder has explicitly adjudicated the intended product experience.

Examples:
- V10 visual PASS;
- integrated founder walk PASS;
- named product ruling.

E6 establishes:
- founder accepts the witnessed experience for that scope.

E6 does NOT:
- merge code;
- change canonical;
- deploy;
- prove unrelated hidden states.

Label exact scope.

Prefer:

> **V10 FOUNDER PASS — Review composition**

Not:

> **Writer's Studio approved**

unless the entire product was actually adjudicated.

---

# 11. E7 — CANONICAL / ADMITTED

The candidate or governed artifact has passed the programme's admission process and is in canonical custody.

E7 establishes:
- canonical lineage/custody;
- admitted scope.

E7 does NOT establish:
- production is running it.

Never translate:
> merged to canonical

into:
> live

without deployment evidence.

---

# 12. E8 — RELEASE-CANDIDATE FROZEN

An exact integrated candidate is frozen for release adjudication.

Required identity:

```text
canonical predecessor
candidate SHA
file population
dependency delta
schema/migration delta
test packet
human gates
known limitations
rollback plan
```

E8 establishes:
- this exact object is the proposed release.

It does not establish:
- deployment authorization;
- successful deployment.

---

# 13. E9 — DEPLOYED

Exact accepted candidate has been deployed to the named environment.

Evidence must identify:
- environment;
- exact deployed commit/build identity;
- timestamp;
- deployment mechanism.

E9 does NOT establish:
- runtime is healthy;
- every route serves the new build;
- client caches updated;
- production behavior matches expectation.

---

# 14. E10 — POST-DEPLOY WITNESSED

Production behavior is independently checked after deployment.

Examples:
- serving commit identity;
- route health;
- flagship state render;
- persistence sanity;
- critical interaction;
- rollback not needed.

Only E10 supports:

> **live and witnessed**

for the tested scope.

---

# 15. Product Property Ledger

A feature is not one scalar status.

Example:

## Review

| Property | Evidence |
|---|---|
| architecture law | E1 |
| two-pane implementation | E2 |
| route/trail tests | E3 |
| 1440 render | E4 |
| visual feel | E5 pending |
| V10 | E6 pending |
| canonical | separate |
| production | separate |

This is more truthful than:

> Review: 80% complete

Avoid percent-complete unless measuring a literal count.

---

# 16. Matrix Footer Requirement

Every law/falsifier matrix must state:

1. what it proves;
2. what it does not prove;
3. whether the target capability exists;
4. whether green is potentially vacuous;
5. what next evidence class is required.

Example:

> **FCT suite: 12/12 reference, 12/12 defeat candidates.**
>
> Proves: facet laws are discriminating.
>
> Does not prove: facet behavior exists.
>
> Current product: label-only facets.
>
> Next evidence: E2 implementation, E3 invariant witness, E4 triple render, E5 human facet test.

---

# 17. Status Vocabulary

Allowed:

- SPECIFIED
- LAW GREEN
- CAPABILITY ABSENT
- IMPLEMENTED
- MACHINE PASS
- RENDERED
- HUMAN PASS
- FOUNDER PASS
- ADMITTED
- FROZEN RC
- DEPLOYED
- POST-DEPLOY PASS

Avoid ambiguous standalone words:

- done
- complete
- finished
- ready
- green
- shipped
- live

unless qualified.

---

# 18. Readiness Is a Gate Set

"Ready" must name the next act.

Examples:

> **READY FOR V10**

means:
- required implementation exists;
- machine gates for V10 scope pass;
- required renders exist;
- known deviations disclosed.

It does not mean:
- beta-ready;
- release-ready;
- deploy-ready.

Similarly:

> **READY FOR HUMAN BETA**

requires the R9 prerequisites.

---

# 19. V10 Readiness

To call a candidate:

> **READY FOR V10**

require:

- exact candidate;
- Review composition implemented;
- required visual-system normalization for scope complete;
- 1440 render;
- 1920 render;
- reference at matching state/viewport;
- Write sanity render;
- Develop sanity render;
- mobile sanity render;
- known deviations;
- no capability-false navigation;
- no known blocking visual law failure.

Then founder adjudicates PASS / REVISE.

---

# 20. Facet Readiness

To call facets:

> **READY FOR HUMAN FACET TEST**

require:

- Guided behavior exists;
- Learning behavior exists;
- Direct behavior exists;
- same underlying observation triple;
- FCT invariants machine-pass;
- actual rendered triple;
- no label-only implementation.

D-F9 remains human-only:
> Direct feels concise without becoming cold/dismissive.

D-F13 must be included:
> facet switch preserves identity yet visually/conversationally lands the member in a different locus.

---

# 21. Concurrency Readiness

Concurrency suite green while no async exists is E1 only.

To call:

> **CONCURRENCY IMPLEMENTATION WITNESSED**

require actual async surfaces and races against:
- changed locus;
- changed Work version;
- navigation;
- dismissal;
- duplicate request;
- stale Apply;
- retry;
- late response.

---

# 22. First Arrival Readiness

First-arrival law may be green before arrival exists.

To call:

> **FIRST ARRIVAL IMPLEMENTED**

require actual arrival state.

To call:

> **FIRST ARRIVAL HUMAN-WITNESSED**

require a member can:
- recognize Work;
- understand place;
- act without terminology;
- reach first discovery;
- maintain trust.

No Home room is implied.

---

# 23. Visual Readiness

A token diff alone is not visual evidence.

Require actual renders.

A screenshot alone is not V10.

Require founder comparison.

Founder PASS is not accessibility proof.

Require appropriate machine/manual accessibility witness.

Keep evidence classes separate.

---

# 24. Human-Only Properties

Do not fake automation for:

- warmth;
- curiosity;
- "not cold";
- welcoming;
- literary feeling;
- visual delight;
- whether MAIA feels beside rather than above;
- whether language feels patronizing;
- whether a first discovery feels meaningful;
- whether the product feels like Soullab.

Automation may catch proxies.
It cannot issue the human verdict.

These remain explicitly:
> **HUMAN GATE**

---

# 25. Unknown Is a Valid Status

If a property has not been witnessed:

> **UNKNOWN**

is more truthful than:
- PASS by proxy;
- presumed;
- likely good.

Example:

> D-F9 — UNKNOWN · HUMAN GATE

This is healthy programme state.

---

# 26. Defect vs Missing Capability

Keep distinct:

## DEFECT
Implemented behavior violates law.

## MISSING CAPABILITY
Behavior does not exist yet.

## UNWITNESSED
Behavior may exist but required evidence has not been gathered.

## OUT OF SCOPE
Not part of current act.

Do not turn missing capability into a usability defect.
Do not turn unwitnessed into a pass.

---

# 27. Evidence Provenance

Every important proof packet should identify:

```text
programme
act
canonical/base
candidate
suite/render/human protocol
timestamp
environment
scope
author/witness
what it proves
what it does not prove
```

For human evidence:
- participant profile where relevant;
- device;
- task;
- product candidate.

---

# 28. Independent vs Author-Produced Evidence

Distinguish:

## AUTHOR-PRODUCED
Created/reported by the implementation agent.

## INDEPENDENTLY REPRODUCED
A separate witness reproduced it.

## FOUNDER-WITNESSED
Founder directly inspected/adjudicated it.

Do not relabel reported evidence as independently reproduced.

---

# 29. Historical Evidence

Evidence belongs to the candidate it witnessed.

If canonical/candidate moves:
- determine whether evidence remains applicable;
- do not silently carry it forward.

Possible statuses:

- EXACT
- BYTE-IDENTICAL
- SEMANTICALLY COMPATIBLE
- STALE / RE-WITNESS REQUIRED

Follow programme-specific freshness law.

---

# 30. Evidence Must Follow the Property

Examples:

### Typography
Need rendered/scaled evidence.

### Persistence
Need cross-session round trip.

### Async
Need real race.

### Visual warmth
Need human render judgment.

### Provenance
Need data + rendered copy.

### Navigation return
Need state transition witness.

### Deployment
Need serving identity.

Use the right evidence form.

---

# 31. No Proxy Inflation

A proxy can detect risk.
It cannot silently become the target.

Examples:

- sentence length ≠ "not cold";
- card count ≠ "not dashboard-like";
- contrast score ≠ "readable for older writers";
- route existence ≠ "member understands navigation";
- test green ≠ implementation exists;
- screenshot ≠ product truth.

If using proxy:
> name it as proxy.

---

# 32. Programme Status Table Format

Preferred:

| Surface / property | Law | Implementation | Machine | Render | Human | Founder | Canonical | Production |
|---|---|---|---|---|---|---|---|---|

Cells use:
- PASS
- PRESENT
- ABSENT
- PENDING
- UNKNOWN
- N/A

No overall percentage.

---

# 33. Current Flagship Matrix Interpretation

As reported at the current stage:

## Facets
- law: GREEN
- product behavior: ABSENT
- human D-F9: UNKNOWN

## Concurrency
- law: GREEN
- async product: ABSENT
- runtime concurrency: NOT PROVEN

## First Arrival
- law: GREEN
- arrival product: ABSENT

## Flagship composition
- law: GREEN
- live visual candidate: exists in partial/in-progress scope
- V10: PENDING

These are not contradictions.

They are precise states.

---

# 34. Release Readiness

A release candidate may be called:

> **FLAGSHIP RELEASE-CANDIDATE READY**

only when the release docket's required evidence is present, including:

- constitutional/product semantics;
- integrated implementation;
- machine witnesses;
- rendered states;
- accessibility;
- responsive/mobile;
- V1–V15;
- I1–I12;
- founder visual PASS;
- founder integrated walk PASS;
- required beta evidence;
- no unresolved blocking defect;
- exact frozen candidate.

Even then:
> deployment is separately authorized.

---

# 35. Deployment Language

Allowed:

> **Candidate `abc123` admitted to canonical. Production unchanged.**

> **Candidate `abc123` deployed to production; post-deploy witness pending.**

> **Production serving `abc123`; critical flagship witness PASS.**

Avoid:

> **Shipped**
if only merged.

Avoid:

> **Live**
if deployment identity was not verified.

---

# 36. Failure of Evidence

If evidence contradicts itself:

STOP status inflation.

Example:
- machine says correct route;
- browser render shows dead control.

Record:
> **CONFLICTING EVIDENCE · ADJUDICATION REQUIRED**

Do not choose the more convenient proof.

---

# 37. Acceptance Gates

## EV1 — NO STATUS COLLAPSE
Each evidence class remains distinct.

## EV2 — GREEN LAW DISCLOSURE
Law matrices state whether capability exists.

## EV3 — VACUOUS GREEN DISCLOSURE
Absence-caused green is named.

## EV4 — PROPERTY-SPECIFIC PROOF
Evidence type matches property.

## EV5 — HUMAN GATES STAY HUMAN
No proxy silently closes them.

## EV6 — UNKNOWN ALLOWED
Unwitnessed state remains UNKNOWN.

## EV7 — CANDIDATE BINDING
Evidence binds exact candidate/scope.

## EV8 — FRESHNESS
Stale evidence is not silently carried forward.

## EV9 — AUTHORSHIP OF EVIDENCE
Author-produced vs independent witness distinguished.

## EV10 — ADMISSION ≠ DEPLOYMENT
Canonical and production never collapse.

## EV11 — DEPLOYMENT ≠ POST-DEPLOY
Serving behavior independently witnessed.

## EV12 — READINESS NAMES NEXT ACT
"Ready" always has an explicit destination.

---

# 38. Defeat Candidates

### D-EV1
`12/12 green` reported as "facet implementation complete."

### D-EV2
No async exists, but concurrency suite reported as runtime PASS.

### D-EV3
Mockup founder approval reported as candidate V10 PASS.

### D-EV4
Merged commit reported as production live.

### D-EV5
One browser screenshot reported as responsive PASS.

### D-EV6
Word-count proxy closes "Direct not cold."

### D-EV7
Old candidate evidence silently applied after material implementation change.

### D-EV8
CC-reported result described as independently reproduced.

### D-EV9
Missing intent-first entry recorded as failed usability.

### D-EV10
Human beta PASS treated as deployment authorization.

### D-EV11
Production deploy succeeds but serving identity is never checked.

### D-EV12
A single "overall readiness 92%" hides absent critical gates.

---

# 39. Product Principle

> **A trustworthy product deserves a trustworthy account of what has actually been proven.**

---

# 40. Spirit of Soullab

The programme should be able to say:

> This is the law.
>
> This is what exists.
>
> This is what machines witnessed.
>
> This is what humans witnessed.
>
> This is what the founder accepted.
>
> This is what entered canonical.
>
> This is what production is actually serving.
>
> We do not use one of those statements to impersonate another.

**A deeper you. A more human world.**
