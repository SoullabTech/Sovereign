# CAPABILITY AUDIT — FLAGSHIP STAGES R3…R12

Instrument: `CC_CAPABILITY_AND_QUALITY_OPERATING_MANUAL_v1.md` §3.
Canonical: `clean-main-no-secrets`. Candidate head: see `git log -1`.
Run: read-only inspection of `package.json`, scripts and source. ⛔ Nothing installed.

> ⛔ This audit grants nothing. It names what exists, what does not, and what
> is human-only, so that a missing capability is **stopped on** rather than
> silently approximated — which is §2's whole point.

---

## 0. The manual's own inventory, VERIFIED not assumed

The manual asserts four gaps. I checked all four rather than repeating them.

| Claim | Verified | Evidence |
|---|---|---|
| no `axe-core` / `@axe-core/playwright` | ⛔ **CONFIRMED ABSENT** | no dependency matches `/axe/` |
| no Lighthouse / Lighthouse CI | ⛔ **CONFIRMED ABSENT** | no dependency matches `/lighthouse/` |
| no `toHaveScreenshot` assertions | ⛔ **CONFIRMED UNUSED** | zero source matches repo-wide |
| no Percy / Chromatic | ⛔ **CONFIRMED ABSENT** | no dependency matches |

⭐ **One correction the manual's framing invites and the facts refuse.**
`toHaveScreenshot` is **not a missing dependency**. It ships inside
`@playwright/test@1.56.1`, which the repo already has. So it is a *bounded
test-policy decision*, ⛔ not a tooling act — and that distinction matters,
because proposing an install for something already installed would be
asking for authority nobody needs to grant.

⭐ Present and usable today, so §1's *use an existing capability first* binds:
`@playwright/test@1.56.1` · `@next/bundle-analyzer@15.0.3` (`npm run analyze`)
· `storybook@8.3.5` · `jest@29` · `vitest@4` · the flagship render witness
(real Chromium, 11 states × 4 viewports) · the flagship lethality matrix.

---

## 1. R3 — Intent-first entry

REQUIRED: a front-door state, plain-language intents, intent→lens routing that
does not ask the member to select machinery, explicit commission before any new
reading, a grammar for MAIA's first response.

AVAILABLE: `machine.ts` (add phases) · `capability.ts` (routing must resolve
through it, so an intent cannot promise what is `gated`/`absent`) ·
`language.ts` (the intent labels are member copy and must pass the verdict
scan) · `developObservation.ts` (the first response is a governed observation
or it is not a response) · render witness (new states are new renders).

MISSING: nothing.

HUMAN-ONLY: whether *Something feels off* is the sentence a real writer would
pick. ⛔ V12's felt half. I can render the wording; I cannot rule it right.

⚠️ STOP CONDITION ALREADY VISIBLE: intent→lens routing must map seven intents
onto **seven ratified lenses** — and `themes` is ⛔ not a lens. An intent that
routes to "Themes" would invent an eighth. That is a law conflict to surface,
not an implementation detail to resolve.

---

## 2. R4 — First-ten-minutes loop

REQUIRED: the full chain `recognize → act → discovery → passage → travel →
conversation → possibility → read in context → apply/keep → undo → return`, end
to end, with no dead end and no loss of place.

AVAILABLE: every link exists as a machine event and is already matrix-lethal
(F4–F11, 8/8 candidates dead). ⭐ What is NOT yet proved is the **chain**: the
matrix proves each law in isolation; the loop is a sequence.

MISSING: an automated **journey** walk. `@playwright/test` is present and
`test:e2e` exists, so this needs no dependency — only writing it.

HUMAN-ONLY: whether the discovery is *meaningful to them*. ⛔ Not renderable.

---

## 3. R5 — Member observation + stale-reading trust

REQUIRED: three note kinds, exact locus, member provenance, durable identity,
find-it-again; stale disclosure + kept previous reading + member-held re-read.

AVAILABLE: `OwnObservation` (V14 16/16) · `StaleReading` both states
(V15 16/16, and the trust line is now asserted **by its text**, not its
existence).

⚠️ MISSING, AND IT IS THE REAL ONE: **durability.** Everything above is
component state. §21 requires owner · Work · read identity · locus ·
provenance · timestamps · undo semantics · whether MAIA may reference it.
A member note that survives only until reload is ⛔ *UI-only state
masquerading as durable authorship*, in the manual's exact words.

⛔ **STOP.** Persisting a member observation is a **schema act** and is
gated twice over: by B0's own stop list, and by `OBSERVATION-ADDRESS-01`,
which is ⛔ NOT OPENED and whose gate reads *facet implementation may not
create member actions against `observation_id` until that lane closes*.
⭐ So R5 can be built to the edge of persistence and no further.

---

## 4. R6 — Mobile flagship loop

AVAILABLE: 390px is already one of four witness viewports, and every law runs
there. Mobile-specific laws already pass (map scrolls, secondary tools
collapse, no hover dependency, 44px targets).

MISSING: **real touch interaction**. The witness renders and measures; it does
not tap, drag or dismiss a sheet. Playwright does all three and is present.

---

## 5. R7 — Accessibility + responsive acceptance

REQUIRED (§7): WCAG 2.2 AA behaviour — keyboard reach, tab order, focus ring,
accessible names, heading/landmark structure, contrast in all states, 200%
zoom, focus trap/restore in sheets, reduced motion, no colour-only meaning.

AVAILABLE: names (`EVERY-CONTROL-IS-NAMED` 44/44) · no hover-only content
(44/44) · targets (44/44) · text scaling (`TEXT-SIZE-responds-and-does-not-break`
44/44, after the whole scale moved to rem).

⛔ **MISSING, AND NOT APPROXIMABLE:** automated **contrast**, **tab order**,
**focus trap/restore**, **landmark/heading structure**, **reduced motion**,
**colour-only meaning**. I can hand-check these one state at a time. I cannot
hold them across 11 states × 4 viewports by hand without the check silently
rotting — ⭐ which is precisely the failure mode of a discipline that is
prose instead of an instrument.

⭐⭐ **THIS IS THE ONE STAGE WITH A GENUINE TOOLING GAP**, and §2 says stop.
The bounded proposal is written separately (below) and is ⛔ not acted on.

⚠️ And one thing axe would **not** catch, so it must not be read as closing
R7: the two new colour registers. Blue now carries *selection* and *state*.
If any selection is conveyed by colour **alone**, that is a colour-only
meaning failure that an automated contrast scan passes cleanly.

---

## 6. R8 · R9 — Founder walk · Human beta

AVAILABLE: I can prepare, render, measure, record, and name likely friction.

⛔ **HUMAN-ONLY. NOT PROXYABLE BY ANY RESULT I PRODUCE.** §23. The founder's
own split says it, the canon says it, and no gate above changes it.

---

## 7. R10 · R11 · R12

R10 remediation: available, scoped by whatever R8/R9 return.
R11 integrated candidate: available.
⛔ R12 deployment: **OUT OF SCOPE OF B0 ENTIRELY** — a separate founder act.

---

# BOUNDED TOOLING PROPOSAL (§2) — ⛔ NOT ACTED ON

Presented for a founder decision. Nothing is installed.

**Package:** `@axe-core/playwright` (devDependency), pinned to a `^4.x` exact
range at proposal time. Pulls `axe-core` transitively; both are Deque-maintained,
MPL-2.0, dev-only, ⛔ never shipped to a member and ⛔ making no network call.

**Why existing tooling is insufficient:** the witness asserts laws I thought to
write. Contrast, tab order and focus restoration are properties of a *rendered
tree*, and hand-reimplementing WCAG contrast maths inside my own harness would
be writing a worse axe with no maintainer.

**Change surface — deliberately one file:** inject the scan into the existing
render witness, which already launches Chromium and already walks 44 renders.
⭐ No new CI job, no new workflow, no second browser launch, one new script.

**Removal if rejected:** delete the dependency and the injection block; the
witness is unchanged. No migration, no lock-in.

**Acceptance proof:** every one of the 44 renders reports zero serious/critical
violations, ⭐ with the exclusions — if any — named individually with reasons,
⛔ never a blanket suppression.

**⛔ What it still would not do:** axe cannot tell whether the Studio feels like
Soullab, and a clean axe run is ⛔ not R7 PASS. It closes the mechanical half.

---

# NOT PROPOSED, AND WHY

**Lighthouse / Lighthouse CI.** §10 says establish a baseline before inventing
budgets. `npm run analyze` already gives bundle deltas, and the flagship route
is not yet integrated, so a performance number today would measure a fixture
harness, ⛔ not the product. Revisit at R11 with something real to measure.

**Percy / Chromatic.** A hosted visual-diff service sends renders of a member's
Studio to a third party. ⛔ Against the sovereignty posture, and ⛔ unnecessary:
`toHaveScreenshot` is already installed and keeps every pixel local.

**`toHaveScreenshot` adoption.** Available today, needs no install. ⛔ Not
proposed *yet*, for one reason: the composition is still under V10 revision,
and baselining pixels mid-revision would bless a frame the founder has not
accepted. ⭐ Propose it *after* V10 PASS, when there is a frame worth freezing
— and ⛔ never as a replacement for V10.
