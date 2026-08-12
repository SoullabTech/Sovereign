# CMC-001 · Phase 1 · Unit 2
## Artifact 4: Corrections · Capability Candidates · Unresolved · Stop State

Referent `52a3b924b7cf52013c1c8b0d635359c2cad672fc`.

---

## D. Corrections

### D-1 — Correction to Unit 1 (admitted evidence, superseded not erased)

Unit 1 Artifact 2 §4 recorded:

> `'CORE' → corePathResponse (:1377)  separate assembly site`
> `'DEEP' → deepPathResponse (:1788)  separate assembly site`

**Corrected.** `corePathResponse` has an assembly site, but it is not located at `:1377`
and is not of the same kind as FAST's: it is `buildMaiaWisePrompt` in a *different file*
(`maiaVoice.ts:531`, blob `8ea2f62a…`), reached from `maiaService.ts:1592`, with the
continuity contributors injected by `appendAllContextAddenda` at `maiaVoice.ts:913` under
the `ADDENDA_SPECS` registry (`maiaVoice.ts:406-431`).

`deepPathResponse` has **no assembly site on its primary path at all.** Primary generation
is `consciousnessWrapper.processConsciousnessEvolution(input, consciousnessContext)`
(`:2052`) where `consciousnessContext` (`:2034-2043`) contains no prompt and no addendum.
Describing DEEP as having a "separate assembly site" overstates the topology: the correct
statement is that DEEP has **two conditional seams** (consultation `:2097-2115`, repair
`:2169-2230`) and no unconditional one.

This is a §IV `SURFACE_SUBSTITUTION` correction of the mild form — Unit 1 inferred
"separate assembly site" from the *switch-case structure* (a weaker surface) rather than
from the path bodies (the authoritative surface). Unit 1's stop code
`STOPPED_UNENUMERATED_ASSEMBLY_SITE` was **correct and well-taken**: the sites were indeed
unenumerated, and enumerating them changed the picture materially.

Everything else in Unit 1 that Unit 2 re-derived independently **reproduces**: blob SHAs
for `route.ts` and `maiaService.ts`; the router call at `:2800`/`:2808`; the switch at
`:2943`; the FAST assembly at `:1297` and its contributor order; the
`relationalContext` vs `relationshipContext` two-contributor resolution
(re-confirmed here — `formatRelationshipMemoryForPrompt` at `maiaService:1091` and
`maiaVoice:892`; `getMemberActiveRelationalContext` route-side).

### D-2 — Comment-vs-code divergence (recorded per §III, not averaged)

`maiaVoice.ts:908-911` states:

> "both FAST+CORE (this function) and DEEP repair path (`buildMaiaComprehensivePrompt`)
> call the same helper."

**Code contradicts this for FAST.** `buildMaiaWisePrompt` does not occur anywhere in
`fastPathResponse` (whole-range scan of 646–1376, zero occurrences); FAST assembles its own
template literal at `:1297` and never calls `appendAllContextAddenda`. The comment's claim
of a "single point of truth for which addenda reach the prompt" is true of CORE and
DEEP-repair only.

Code is the surface of record (§III). The comment is not load-bearing for any Unit 2 claim
— no claim was derived from it — so this is recorded as a divergence, **not** a §XXIII.5
stop and not a §IV retraction.

The divergence is materially consequential: it is exactly the gap through which
`memoryInfluenceAddendum` and `forwardReadinessAddendum` became FAST-only, since adding a
contributor to `ADDENDA_SPECS` does not add it to FAST, and adding it to FAST's template
does not add it to `ADDENDA_SPECS`.

### D-3 — `processingProfile` label divergence on RCN

`maiaService.ts:2860` persists `processingProfile: 'RCN'` while `:2870` returns
`processingProfile: 'DEEP'` to the client. Any future analysis correlating client-reported
profile with stored profile must not treat them as the same field. Recorded.

---

## E. Capability candidates (§XVII — record only, no redesign, no nomination of a fix)

* **E-1 · `ADDENDA_SPECS` as a declarative contributor registry** (`maiaVoice.ts:406-431`).
  A single ordered list of named context fields with per-field log markers, iterated by one
  helper. It is the closest existing structure to a `ContextContribution` registry and is
  already the ordering authority for two of the four assembly paths.
* **E-2 · `appendAllContextAddenda`'s trailing-invariant discipline**
  (`maiaVoice.ts:499-524`). Unconditional standing blocks appended *after* all variable
  context, so guardrails always govern the material above them. A structural pattern for
  separating per-turn context from standing discipline.
* **E-3 · The context-inventory emitter** (`maiaService.ts:2889-2940`). Emits, once per
  turn before model invocation, a descriptive record of which contributors were available
  — explicitly scoped to "what was available", never "what was used", with `null` (not
  `[]`) for layers that do not exist. A disciplined observability primitive.
* **E-4 · Route-level suppression with path-level truthiness.** Consent, sanctuary, and
  opt-out gates are enforced once at the route; paths perform only a truthiness read. The
  policy decision is not duplicated across three consumers.
* **E-5 · `formatRelationshipMemoryForPrompt` as a shared serializer.** The one continuity
  serializer already reused verbatim by two independent assembly paths — evidence that
  cross-path serializer sharing is achievable in this codebase.

No repair is proposed for any of the above (§XIX).

---

## F. Unresolved

* **F-1 · `RUNTIME_BRANCH_UNRESOLVED`.** Which profile a real production turn takes is not
  statically decidable — it depends on member message text, `turnCount`, and a
  DB-resident `CognitiveProfile`. The decision procedure is fully enumerated
  (Artifact 1 §B); the outcome is not. Requires §XXVII authority.
* **F-2 · `MAIA_SAFE_MODE` production value** (`maiaVoice.ts:532`). If `'true'`, CORE drops
  all 24 addenda. Environment state, not source state → unresolvable under STATIC ONLY.
* **F-3 · `MAIA_USE_CLAUDE_CONSULTATION` production value** (`maiaService.ts:2083`).
  Determines whether DEEP's only non-repair continuity seam is live. Same class as F-2.
* **F-4 · `adaptResponsePromptWithPolicy` transform fidelity** (`maiaService.ts:1684`).
  CORE's fully assembled prompt is rewritten by this function before dispatch. Whether it
  preserves, reorders, or truncates the addenda was not traced — outside Unit 2's bounded
  question. Any claim that C1–C5 reach the CORE model *intact* is unwarranted until traced.
* **F-5 · `buildMaiaComprehensivePrompt` field coverage** (`maiaVoice.ts:953`, reaching
  `appendAllContextAddenda` at `:1045`). Confirmed to call the helper; its own MaiaContext
  field handling was not traced.
* **F-6 · DEEP's `consciousnessWrapper` internals**
  (`lib/consciousness/consciousness-layer-wrapper.ts`). Whether it performs any retrieval
  of its own, independent of `consciousnessContext`, was not traced. The claim recorded is
  narrow and defensible: *the route's contributors are not passed to it.* Whether DEEP has
  continuity from some other substrate is open.
* **F-7 · Dead router parameters.** `conversationHistory` (`processingProfiles.ts:41`) and
  `lastDepth` (`:52`, `:58`) are accepted and never read. `maiaService:2803` passes
  `conversationHistory` in. Whether this is vestigial or unfinished is not determinable
  from source.
* **F-8 · `formatRcnForMaia` output composition.** The RCN early-return path was
  enumerated but its formatter was not traced.

---

## G. Stop state

**`UNIT_COMPLETE`**

The bounded question — runtime profile calculation → branch selection → each assembly site
→ contributor inclusion/exclusion → final dispatch — is answered across FAST, CORE, and
DEEP with every claim bound to path, line, and blob SHA at
`52a3b924b7cf52013c1c8b0d635359c2cad672fc`.

Boundaries returned rather than crossed:
* `RUNTIME_BRANCH_UNRESOLVED` recorded rather than guessed (F-1); no plausibility weighting
  offered for which profile production traffic takes.
* No runtime witnessing performed; `DEPLOYED_REFERENT_UNBOUND` stands.
* `between/chat` **not followed.** It is named in a comment at `maiaService.ts:1197-1198`
  as a producer of `memoryInfluenceAddendum`. Unit 2 recorded the reference and stopped:
  the origin of that addendum outside `/list` was not traced. Per §IX-A this is noted, but
  it did **not** become a `STOPPED_AUTHORITY_BOUNDARY` because characterizing `/list` did
  not require following it — the route builds its own `memoryInfluenceAddendum` at
  `route.ts:908-968`, which is sufficient for the topology question.
* No repair designed or proposed (§XIX). No file in `/Users/soullab/MAIA-SOVEREIGN`
  modified — all source read via `git show`.
* Census not broadened to the general 33 contributors. The only contributors examined
  beyond Unit 1's set are C8 (`contextPrompt`), required because it is a *second* FAST
  continuity channel whose absence in CORE/DEEP is part of the topology, and the
  `ADDENDA_SPECS` inventory, required to prove C6/C7 exclusion.

### Recommended next bounded unit (not authorized here, offered as scope only)

Trace `adaptResponsePromptWithPolicy` (F-4) — it is the single largest unverified
transform standing between CORE's assembled prompt and CORE's model call, and no claim
about what CORE actually delivers is complete without it.
