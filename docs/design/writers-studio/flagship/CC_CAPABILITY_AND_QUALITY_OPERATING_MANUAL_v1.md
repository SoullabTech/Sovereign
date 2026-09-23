# CC — SOULLAB FLAGSHIP CAPABILITY + QUALITY OPERATING MANUAL v1

Status: OPERATING INSTRUCTIONS / NOT IMPLEMENTATION AUTHORITY  
Applies to: Soullab Writer's Studio flagship work and adjacent flagship product surfaces  
Purpose: ensure the implementation agent uses the full engineering, design, accessibility, testing, performance, trust, and human-validation discipline required to build Soullab's flagship product.

This manual does not grant merge, deployment, package-install, migration, route-retirement, or production authority.

---

# 0. Prime Directive

> **Do not optimize for "feature complete." Optimize for a coherent, trustworthy, accessible, beautiful human product whose architecture makes its promises structurally difficult to violate.**

A green test suite is necessary and insufficient.

The flagship must satisfy, simultaneously:

1. constitutional / authority law;
2. product semantics;
3. evidence / provenance / coverage law;
4. interaction integrity;
5. visual composition;
6. accessibility;
7. responsive/mobile behavior;
8. performance;
9. security/privacy;
10. capability honesty;
11. human usability;
12. founder visual acceptance.

---

# 1. Existing Repo Capabilities — USE THEM

The current repo already provides a strong base.

## Automated engineering
- TypeScript and existing typecheck lanes
- Jest
- Vitest
- Playwright E2E
- Storybook
- existing Writer's Studio constitutional/convergence gates
- custom flagship matrix / visual witness
- existing capability/provenance/refusal substrate

## UI substrate
- React
- Next.js
- Radix UI primitives
- Headless UI
- existing Studio theme / shell / component architecture

## Existing rendering evidence
The flagship lane has demonstrated:
- real Chromium rendering;
- multi-state / multi-viewport screenshot generation;
- rendered DOM assertions;
- visual-law checks;
- exact-position / layout invariants.

### Rule

Use an existing capability before proposing a new dependency.

---

# 2. Important Capability Gaps — DO NOT PRETEND THEY ARE PRESENT

Current repo inspection did **not** find an established implementation of:

- `axe-core` / `@axe-core/playwright` automated accessibility scanning;
- Lighthouse / Lighthouse CI performance auditing;
- Playwright screenshot assertions such as `toHaveScreenshot`;
- a dedicated visual-regression service such as Percy / Chromatic for Writer's Studio.

These are **gaps**, not automatic install instructions.

If any is needed:

> **STOP and present a bounded tooling proposal before adding packages or CI infrastructure.**

The proposal must state:
- exact package/tool;
- exact version/range;
- why existing tools are insufficient;
- files/scripts/workflows to change;
- expected maintenance burden;
- privacy/network implications;
- how it will be removed if rejected;
- exact acceptance proof.

No ambient dependency expansion.

---

# 3. Capability Audit at the Start of Every Stage

Before implementation, produce:

```text
STAGE
exact canonical
exact branch/head

REQUIRED CAPABILITIES
[capability]

AVAILABLE
[repo tool / runtime / existing component]

MISSING
[gap]

HUMAN-ONLY
[founder / usability / aesthetic judgment]

STOP CONDITIONS
[anything requiring new authority]
```

Do not begin a stage whose required capability is missing and silently approximate it.

---

# 4. Product Authority Stack

Use this authority order:

```text
constitutional law
        ↓
programme / founder rulings
        ↓
Flagship Experience Canon
        ↓
Intent-First + First Ten Minutes canon
        ↓
approved visual references
        ↓
existing components
```

Existing code does **not** outrank an approved flagship design because it is already implemented.

Visual references do **not** override constitutional law.

When reference and law conflict:
1. preserve law;
2. name the conflict;
3. revise the reference/implementation explicitly.

---

# 5. Build from Governed Data, Not Pretty Screens

Static references govern:
- atmosphere;
- hierarchy;
- density;
- typography;
- interaction feel;
- spatial composition;
- cross-mode family resemblance.

They are **not** implementation truth.

Use governed components/data for:
- evidence;
- addresses;
- provenance;
- coverage;
- freshness;
- observation identity;
- return paths;
- mutation authority;
- capability availability.

Prefer:
> impossible-to-construct invalid state

over:
> render first, lint later.

---

# 6. Required Disciplines

Every flagship stage must explicitly consider all of these.

## A. Product / UX
Ask:
- What human need is this solving?
- Does the member know where they are?
- Is the next meaningful action obvious?
- Does it preserve the Work as the subject?
- Does every analytical object lead somewhere?

## B. Interaction design
Verify:
- entry;
- state transitions;
- dismissal;
- return;
- persistence;
- undo/recovery;
- focus;
- keyboard;
- touch;
- mobile;
- loading;
- unavailable states;
- stale states.

## C. Information architecture
Verify:
- Write / Develop / Review semantics;
- plain-language primary labels;
- no duplicate competing rooms;
- no capability-false destination;
- no hidden technical machinery as front door.

## D. Content design / product language
Run member-facing copy through:
- verdict-language refusal;
- jargon review;
- uncertainty language;
- provenance language;
- coverage/freshness language;
- non-professional-writer comprehension.

## E. Accessibility
Verify:
- semantic HTML;
- keyboard navigation;
- visible focus;
- labels / names / roles;
- contrast;
- text scaling;
- zoom;
- reduced motion;
- touch target size;
- screen-reader order;
- no hover-only critical content;
- mobile scrolling for dense data.

## F. Responsive/mobile
Mobile is the same product, not compressed desktop.

Verify:
- manuscript primacy;
- contextual sheets/cards;
- no crushed grids;
- map horizontal scrolling;
- semantic nav parity;
- preserved exact locus;
- Back trail.

## G. Frontend engineering
Verify:
- clear component boundaries;
- state identity;
- deterministic state transitions;
- no duplicated business law in screens;
- reusable governed observations;
- no one-off copy bypass;
- no hidden fallback.

## H. Testing
Use:
- unit tests for pure law;
- type constraints for impossible states;
- component tests for state composition;
- Playwright for real interaction;
- rendered DOM falsifiers;
- exact defeat candidates;
- multi-viewport witnesses.

## I. Performance
Check:
- bundle impact;
- rendering cost;
- image weight;
- layout shift;
- long lists;
- map/grid virtualization if needed;
- unnecessary model/network calls;
- unnecessary re-renders.

Use existing bundle-analyzer tooling first.

If Lighthouse/CI is desired and absent:
- propose it separately.

## J. Security/privacy
Verify:
- no secrets;
- no PHI/log regression;
- member data minimization;
- no hidden external provider call;
- no unauthorized export/disclosure;
- no unsafe HTML;
- upload/file boundaries;
- route/access control;
- dependency risk.

## K. Trust / epistemics
Verify:
- fact vs interpretation;
- observation provenance;
- coverage;
- freshness;
- non-conclusion;
- member vs MAIA authorship;
- declared vs template vs inferred structure;
- no silent recommission.

## L. Human validation
Never proxy:
- "Does this feel like Soullab?"
- "Do I know what to do?"
- "Am I being graded?"
- "Do I trust MAIA?"
- "Do I want to keep exploring?"

---

# 7. Accessibility Standard

Target **WCAG 2.2 AA behavior** for the flagship unless repository/product law sets a stricter requirement.

At minimum manually/automatically verify:

- all interactive controls keyboard reachable;
- logical tab order;
- obvious focus ring;
- accessible name for every control;
- headings reflect visual hierarchy;
- landmarks are meaningful;
- form errors programmatically associated;
- dialogs/sheets trap and restore focus correctly;
- no color-only meaning;
- contrast remains adequate in all states;
- text works at 200% zoom / meaningful browser text enlargement where applicable;
- layout does not require two-dimensional scrolling except genuine data objects such as maps/tables;
- touch controls are comfortably operable;
- motion has reduced-motion behavior;
- status changes are announced where appropriate.

### If automated accessibility tooling is absent

Use current browser/DOM inspection + manual keyboard checks now.

If sustained automation is desired:
propose `@axe-core/playwright` as a separate bounded tooling act.

---

# 8. Visual Regression Strategy

Current custom visual witness is valuable but semantic.

Add no new dependency silently.

Use current Playwright first to create deterministic screenshots for:

- 1920
- 1440
- laptop
- mobile
- text-scale states

For every flagship reference:

```text
reference id
candidate screenshot
exact commit
viewport
state
known deviations
```

If pixel/screenshot regression assertions are needed:
- first evaluate Playwright's existing screenshot capability;
- propose adoption of `toHaveScreenshot` only as a bounded test change if not already accepted by programme law.

Do not let pixel matching replace human V10.

---

# 9. Storybook Role

Use Storybook for **component-state completeness**, not product acceptance.

Create/maintain stories for governed reusable pieces such as:

- Observation card
- Provenance badge
- Coverage disclosure
- Stale-reading notice
- Continuity Map
- Add Your Own Observation
- Alternatives
- Read in Context
- Applied receipt
- Empty/not-read/nothing-noticed states
- contextual MAIA card/sheet

Required stories should include:
- ordinary;
- long text;
- high text scale where feasible;
- no evidence / refusal example in tests;
- narrow container;
- keyboard focus state;
- stale state;
- member/MAIA/text provenance variants.

A Storybook story cannot PASS the integrated Studio.

---

# 10. Performance Discipline

Flagship quality includes responsiveness.

At each integrated checkpoint record:

- route/client bundle delta;
- important dynamic imports;
- image assets and dimensions;
- model/network calls introduced;
- blocking calls;
- unnecessary whole-Work payloads;
- render count / obvious re-render loops;
- slow list/map behavior.

### Budgets

Do not invent global numeric budgets without founder/programme authority.

Instead:
1. establish current baseline;
2. report candidate delta;
3. stop on material unexplained regression;
4. propose numeric budgets as a separate product-performance ruling.

Use the repo's existing Next bundle analyzer before adding new tooling.

---

# 11. Security + Dependency Discipline

The flagship lane is not permission to solve all repository security debt.

However, no flagship act may make it worse silently.

For every new dependency proposal include:
- package reputation/maintenance;
- transitive dependency count where practical;
- runtime vs dev-only;
- browser/server exposure;
- network behavior;
- license;
- vulnerability scan result;
- why an existing dependency cannot do the job.

Do not mix broad Dependabot remediation into a Writer's Studio composition act.

Open a separate security lane.

---

# 12. Human-Centered AI Law

MAIA must not:
- diagnose the writer;
- infer competence;
- assign expertise;
- grade quality;
- infer author intent as fact;
- infer reader effect as fact;
- silently broaden scope;
- silently re-read;
- silently mutate;
- rank alternatives;
- hide coverage;
- hide stale evidence.

MAIA may:
- observe;
- point to evidence;
- disclose uncertainty;
- teach when invited;
- hold a first-person stance;
- propose possibilities;
- follow member intent;
- ask permission for expanded reading.

---

# 13. Intent-First Entry

The human front door is:

> **What are you trying to understand?**

Examples:
- Something feels off
- Help me see the shape
- I'm losing the thread
- This doesn't sound like me
- Show me what keeps appearing
- I want to go deeper here
- I don't know — help me look

Do not require the member to choose editorial machinery.

Routing remains inspectable and authority-bound.

---

# 14. First Ten Minutes

The first meaningful discovery is onboarding.

A successful first ten minutes:

```text
recognize Work
→ meaningful act
→ evidence-grounded discovery
→ exact passage
→ same observation travels
→ MAIA conversation
→ safe possibility
→ Read in context
→ Apply / Keep original
→ Undo
→ return
```

No tutorial carousel should be necessary before value appears.

---

# 15. Review Composition Law

Current founder ruling:

## WRITE
Exactly one permanent content region:
- manuscript.

## REVIEW
Two-part Work composition is lawful:
- Review intelligence;
- manuscript context.

These are two views of the same Work.

MAIA remains contextual.

Forbidden:
```text
review intelligence | manuscript | permanent MAIA utility rail
```

as three competing permanent content regions.

Review must:
- keep the Work visible;
- highlight selected finding locus;
- allow Go to passage;
- preserve Back to Review;
- preserve same observation identity.

---

# 16. Develop Composition Law

Develop is not an analytics dashboard.

Primary intelligence:
- Continuity Map / addressable patterns.

Shared governed object:
- evidence;
- returnTo;
- provenance;
- coverage;
- doesNotEstablish.

Views:
- Structure
- Themes
- Voice
- Continuity

are different presentations of governed evidence, not independent hand-coded truth systems.

---

# 17. Visualization Truth

> **A visualization must be as verifiable as its form implies.**

Measured-looking charts:
- countable;
- checkable;
- declared;
- coverage-based.

Interpretation:
- attributed;
- revisable;
- evidence-linked;
- visually distinct from measurement.

Never chart inferred inner state as though it were telemetry.

---

# 18. Required Empty States

Every flagship surface must explicitly design:

- loading;
- unavailable capability;
- not read;
- read / nothing admissible found;
- insufficient coverage;
- Work changed since read;
- only-one-occurrence;
- no declared structure;
- permission refused/cancelled;
- failed request;
- offline/network failure where relevant.

No generic empty box.

---

# 19. Required Error States

For every network/model action define:

```text
pending
success
recoverable failure
non-recoverable failure
cancel
retry
stale response
late response after locus changed
```

A late MAIA response must not attach itself to a new passage merely because the UI moved.

Observation/locus identity wins.

---

# 20. Concurrency + State Integrity

Test:
- user scrolls while MAIA responds;
- user changes chapter during request;
- user dismisses MAIA;
- user opens another finding;
- user applies then rapidly undoes;
- stale reading refresh completes after member navigates away;
- mobile sheet dismissed mid-request.

The system must preserve:
- exact locus;
- observation identity;
- correct Work/version;
- no cross-passage response leakage.

---

# 21. Data + Persistence

Every persistent object must define:
- owner;
- Work;
- version/read identity;
- exact locus/address;
- provenance;
- created timestamp;
- modified timestamp where relevant;
- deletion/undo semantics;
- whether MAIA may reference it.

Especially:
- member observations;
- applied revisions;
- history;
- declared maps;
- selected templates;
- MAIA readings.

No UI-only state masquerading as durable authorship.

---

# 22. Required Quality Matrix Per Stage

At every checkpoint report:

| Area | Status | Evidence |
|---|---|---|
| Constitutional | PASS/OPEN | |
| Product semantics | PASS/OPEN | |
| Evidence/provenance | PASS/OPEN | |
| Interaction | PASS/OPEN | |
| Accessibility | PASS/OPEN | |
| Responsive/mobile | PASS/OPEN | |
| Copy/language | PASS/OPEN | |
| Capability honesty | PASS/OPEN | |
| Performance delta | PASS/OPEN | |
| Security/privacy | PASS/OPEN | |
| Visual reference | PASS/OPEN | |
| Human-only founder gate | OWED/PASS | |

Do not compress all of these into `tests green`.

---

# 23. Human-Only Gates

These remain outside CC's authority.

## V10
Founder visual side-by-side.

## V12 felt half
Non-professional-writer comprehension.

## Founder walk
The integrated experience.

## Human usability
Representative writers across age/experience.

CC may:
- prepare;
- render;
- measure;
- record;
- identify likely friction.

CC may not mark these PASS on the founder's behalf.

---

# 24. Research Discipline

When product/design research is needed:

1. identify the exact unresolved question;
2. prefer primary standards/documentation;
3. distinguish research from product law;
4. record source and date;
5. bring material choices to founder if they alter experience authority.

Research may inform a proposal.
It does not silently amend the product.

---

# 25. Visual Reference Discipline

Do not blindly reproduce generated images.

Before implementing any reference:
- identify lawful parts;
- identify capability-false controls;
- identify evaluation leaks;
- identify fake/stock semantic imagery;
- identify inferred structure;
- identify unsupported destinations;
- identify contradiction with current canon.

Then implement:
> governed architecture rendered in the approved visual language.

---

# 26. Stop Conditions

STOP before acting when any of these occurs:

- canonical precondition changed beyond authorized freshness rule;
- requested package/tool is absent and installation is needed;
- visual reference requires unsupported feature;
- database migration required;
- new external provider/network destination required;
- route retirement required;
- production read/write required but not authorized;
- export/disclosure authority changes;
- member data model must change materially;
- visual ruling conflicts with ratified constitutional law;
- human-only judgment is required.

Present the smallest next authorization.

---

# 27. Checkpoint Deliverable

Every significant stage returns:

```text
exact canonical
candidate commit
files changed
product state built
visual refs satisfied
constitutional gates
typecheck/tests
browser renders
accessibility checks
mobile checks
performance delta
security/privacy delta
known deviations
human gates still owed
next bounded act
```

No "done" without evidence.

---

# 28. Definition of Flagship Quality

The flagship is not merely correct.

It should be:

- constitutionally lawful;
- architecturally coherent;
- emotionally inviting;
- visually distinctive;
- technically quiet;
- fast enough to disappear;
- understandable without expertise;
- accessible across age and ability;
- responsive across devices;
- safe to experiment in;
- honest about what MAIA knows;
- explicit about what MAIA does not know;
- easy to return from;
- difficult to misuse;
- easy to trust;
- compelling because the member keeps discovering their own Work.

---

# 29. Spirit of Soullab

Every implementation decision should support this sequence:

> My Work is alive.
>
> I can see more of it than I could before.
>
> I know where I am.
>
> I can follow what interests me.
>
> I can always return to my words.
>
> I can try things without losing myself.
>
> MAIA is with me, not ahead of me.
>
> I want to see where this goes.

**A deeper you. A more human world.**
