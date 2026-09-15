# P1-05 · ARTIFACT 3 — UNRESOLVED OBLIGATIONS

```text
STEP      P1-05 · CONTRADICTION / GAP PASS
ARTIFACT  3 of 3 — every question P1 CANNOT LAWFULLY ANSWER from its own evidence
TYPE      RECORD ONLY — ⛔ these are OWED READS AND OWED RULINGS, ⛔ not failures
```

> ⭐ An obligation here is a question the census **posed and declined**, because answering it would
> have required evidence the lane was not permitted to gather, or a ruling the lane is not
> permitted to make.

**Format.** Each entry states the question so that someone else could answer it, the boundary that
forbids P1 from answering it, and what evidence would settle it — **named only**.

```text
WHY-CODES
E-1         the clone is shallow; history-dependent claims are UNKNOWN by fetch depth
EVIDENCE    the evidence boundary — no runtime, no database, no production access in the census
            container; LIVE requires a traced path AND a dated in-repo runtime witness
RECORDS     records-only — P1-03/04/05 may not re-read source code to settle a question a domain
            record left open; doing so would be re-running P1-02, not normalizing it
LANE        a lane boundary — the question belongs to another lane's custody
RULING      a founder ruling is owed; no located governing source exists to be read
SCOPE       declared UNKNOWN BY SCOPE — the authorized inputs of the pass could not identify the
            object the question names
```

⛔ **No priority. ⛔ No severity. ⛔ No recommendation. ⛔ No sequencing.** The order below follows
the order of the source records, and carries no other meaning. ⛔ No method is prescribed for any
owed read: naming the evidence that would settle a question is not instructing anyone how to get it.

⚠️ **Standing note, binding on every entry marked with `†`.** These touch the practitioner /
member visibility territory. **`P1-GOV-ACCESS-01`** (practitioner / member visibility governance
absent) and **`AUTH-EXPOSURE-01`** exist as separate standing. ⛔ No finding of AUTH-EXPOSURE-01 is
cited here; ⛔ nothing here awaits it; ⛔ nothing here assigns it work.

---

# I · FOUNDER ITEMS STILL OPEN

```text
OBL-01
Q    Should the frozen strategic register — the document P1-06 must compare the organism against —
     be brought into canonical custody before P1-06 runs? It exists only on
     claude/nice-volta-fogiyw @ ee3e4c47 and is absent from canonical and from the census subject.
WHY  RULING — and the C-2 ruling forbids the obvious shortcut: "⛔ Do not merge or transplant the
     strategic register to make the census convenient."
SET  a founder ruling on D-P1-01. (The comparison authority itself is already settled: the
     verbatim text pinned in P1-00 §3a.)

OBL-02
Q    How does branch law become authoritative across execution environments, given that the census
     branch is a claude/* branch the committed allowlist does not admit and the enforcing hook is
     not installed in this container?
WHY  RULING — and the finding's own rule forbids answering Q2 by editing the allowlist, which
     would silently answer Q1 instead.
SET  a founder ruling on D-P1-03, kept separate from the question of whether claude/* is admissible.

OBL-03
Q    Should a one-line pointer banner be added to MAIA_WHOLE_ORGANISM_MAP/00_RANKED_MAP.md
     recording its FROZEN INCOMPLETE / EVIDENCE INPUT ONLY standing, so a reader arriving there
     first is not misled by "Status: CENSUS IN PROGRESS"?
WHY  RULING + LANE — it is a cross-lane edit, which this lane's own authorization forbids.
SET  a founder ruling on D-P1-05.
```

---

# II · DOMAIN A · CANONICAL COGNITION (P1-02 A §6)

```text
OBL-04
Q    Is a turn answered by DEEP-primary stage 1 — no system prompt, no standing texts, no addenda
     — the same MAIA as a CORE turn? The organism answers "yes" by naming both MAIA.
WHY  RULING — the record marks it REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.
SET  a founder ruling on what makes a turn MAIA's.

OBL-05
Q    What is the actual live tier distribution across FAST / CORE / DEEP?
WHY  EVIDENCE — everything in A-02…A-05 is WIRED-BUT-UNOBSERVED; the guardrail divergence matters
     in proportion to FAST's share, which is unmeasured in-repo.
SET  a dated runtime or production witness of served tier counts.

OBL-06
Q    Does buildMaiaRuntimeContext's declared contract — "every route calling getMaiaResponse must
     pass through this wrapper" — have any authority, given that between/chat does not and the
     registry only warns?
WHY  RULING — the registry is advisory by its own comments; its CI promotion is deferred in-file.
SET  a located governing source, or a ruling that the declared contract binds.

OBL-07 †
Q    Which of the 25 peripheral MAIA-claiming routes are member-reachable, and under what consent?
WHY  EVIDENCE + LANE — the record hands it to domain I / P1-GOV-ACCESS-01; INF-5 forbids treating
     the class as uniform.
SET  a per-route reachability and consent trace, route by route.

OBL-08
Q    What governs re-invocation of /api/voice/stream-conversation — a complete second cognition
     path, deliberately preserved and currently uninvoked?
WHY  RULING — today the only instrument is one client-side unit test.
SET  a located governing source for its re-invocation, or a ruling that none is required.

OBL-09
Q    Where is the canonical cognition boundary: the getMaiaResponse convergence, the generateText
     gateway, or the canonical-turn renderer? All three are claimed as chokepoints in-source.
WHY  RULING — P1-01 established that only an authorized-but-unreached TARGET exists; instrument
     constraint 3 holds the boundary at UNKNOWN and forbids the census adopting the target as law.
SET  a founder ruling naming the boundary.

OBL-10
Q    Is unreachable-but-ungoverned an acceptable resting state? refusal-19:25 states that the
     oracle lane's content writers remain ungoverned behind a 410.
WHY  RULING — marked REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.
SET  a founder ruling.
```

---

# III · DOMAIN B · MEMORY (P1-02 B §10.4)

```text
OBL-11
Q    Which of the six code enumerations of memory arenas is the intended vocabulary, and by what
     authority?
WHY  RULING — "⛔ Not answerable by a census worker."
SET  a founder ruling, or a located governing source naming one enumeration.

OBL-12
Q    Does /api/oracle/conversation serve member traffic at the subject?
WHY  EVIDENCE — no runtime witness. The answer decides whether eight consciousness memory services
     are WIRED-BUT-UNOBSERVED participants or a dead limb, and whether frozen surfaces are touched.
SET  a dated runtime or production witness of traffic on that route.

OBL-13
Q    Is the FAST-only scope of memoryInfluenceAddendum and MemoryBundle the intended architecture
     or an unremoved artifact? It means the developmental and bundle arenas do not reach the
     majority of turns.
WHY  RULING — the code names it a deferred founder decision.
SET  a founder ruling.

OBL-14
Q    Does scrubMemoryAmnesia's result replace member-facing text on the sovereign route, or is
     _memoryScrub observability only?
WHY  RECORDS — not established by the trace, and P1-03+ may not re-read source to settle it.
SET  a trace of that value's consumption at the route.

OBL-15
Q    What is the governing model for member deletion and export of formed memory? Export covers
     five tables and omits every prompt-surfacing memory arena but developmental.
WHY  RULING — P1-01 found deletion/erasure explicitly excluded from the one document that would
     govern it.
SET  a founder ruling or a located governing source.

OBL-16
Q    Should runtime_events record twelve memory_layers statuses for a Sanctuary turn? The row is
     de-identified; the question is whether de-identified per-turn memory telemetry is
     "minimal metadata" under the Sanctuary invariant.
WHY  RULING.
SET  a founder ruling against the Sanctuary minimal-metadata invariant.

OBL-17
Q    Is a health surface fit for the degradation predicate it feeds, when memoryHealth reports
     'empty' identically for "the store was read and was empty" and "the store was never asked",
     and four layers are permanently in the second condition?
WHY  RULING.
SET  a founder ruling.

OBL-18
Q    Is lattice.resonanceRecall meant to participate? It costs a retrieval on qualifying turns and
     the result is discarded.
WHY  RULING.
SET  a founder ruling or a located governing source.
```

---

# IV · DOMAIN C · DEVELOPMENTAL / RELATIONAL (P1-02 C §11)

```text
OBL-19
Q    Is a class-level rule with one call site a rule or a site? R16 declares a rule binding any
     response-shaping subsystem; it is invoked once, and two unguarded loaders of the same table
     exist. What makes an admission boundary constitutional rather than incidental?
WHY  RULING.
SET  a founder ruling on what constitutes an admission boundary.

OBL-20
Q    Is declared-but-unfed a safe state or a latent one? Three shaping modules declare
     relationalPhase as an input and no producer feeds them; a single future call site would route
     inferred developmental state into greeting selection with no boundary crossed and no diff in
     the guard.
WHY  RULING.
SET  a founder ruling.

OBL-21
Q    May a system-computed score select and order what reaches MAIA's prompt? affinity_score DESC
     LIMIT 10 over the member's own material, with inspectability implemented and selection weight
     ungoverned.
WHY  RULING — an X-19 input; the located canon governs the object's inspectability, ⛔ not the
     selection effect.
SET  a founder ruling, or a governing source covering selection weight specifically.

OBL-22 †
Q    What is the status of a developmental judgement a member cannot see? member_patterns.emerging
     is held by a practitioner, about the member, invisible to them, under a code comment.
WHY  RULING + LANE — P1-GOV-ACCESS-01 territory; the withholding rule exists only as a comment.
SET  a ruled access model, or a founder ruling on this row.

OBL-23
Q    Which decay definition is authoritative, and what does "member confirmation" mean, given that
     one live implementation multiplies the half-life and the other only moves a reference date?
WHY  RULING — no authoritative definition of decay was located.
SET  a founder ruling naming the authoritative definition.

OBL-24
Q    Does mixed provenance in one row need a provenance column? relationship_entries carries member
     words and MAIA inference side by side, distinguished only by column name — and the
     MAIA-inferred one is the one promoted to the prompt.
WHY  RULING.
SET  a founder ruling.

OBL-25
Q    Why was the unified relational architecture authored and not wired? lib/relationship/scope.ts
     is the already-authored answer to "should these be one system?" and nothing calls it.
WHY  E-1 + RULING — "why" is a history question the shallow clone cannot answer, and the
     disposition is a ruling.
SET  history beyond the shallow depth, or a founder ruling on the intended architecture.

OBL-26 †
Q    Does P1-GOV-ACCESS-01 extend to the member's own inferred state? A member may read
     relationalPhase about themselves and has no path to dispute it.
WHY  RULING + LANE.
SET  a founder ruling on the scope of P1-GOV-ACCESS-01.

OBL-27
Q    What governs erasure of member_spiral_state, member_relational_signals, member_theme_signals
     and trust_observations — none of which has any member-facing surface at all?
WHY  RULING — no governing source located for erasure of formed inferred developmental memory.
SET  a located governing source, or a founder ruling.
```

---

# V · DOMAIN D · FIELD (P1-02 D §10)

```text
OBL-28
Q    What does the organism intend a model to do with "[Field Intelligence]\n{...}" — an unlabelled
     3000-char JSON blob appended to MAIA's system prompt with no instruction about its weight?
WHY  RULING.
SET  a founder ruling, or a located governing source for the seam.

OBL-29
Q    Is FieldContext (D-OBJ-1) and fieldContextAdapter (D-OBJ-9) one capability with two
     implementations, or two capabilities that share a name? Both are called "field context", run
     on different routes, and are gated differently (none versus MAIA_FIELD_CONTEXT_ENABLED).
WHY  RULING — the record states it outright: "⛔ A worker may not choose."
SET  a founder ruling naming the referents, or a governing source that names one of them.

OBL-30
Q    Do silenceProbability and fragmentationRate shape anything, or are they decorative? Their
     names assert authority over MAIA's speech; no consumer other than the prompt JSON was traced.
WHY  RECORDS — no further consumer traced, and P1-03+ may not re-read source.
SET  a consumer trace for those two quantities.

OBL-31
Q    Is fail-open the intended posture for a safety guard? D-OBJ-6's authority to replace MAIA's
     turn depends entirely on a cognitiveProfile that may be null, in which case it does not run.
WHY  RULING.
SET  a founder ruling.

OBL-32
Q    Which is the finding about the opacity-hidden, pointer-events-auto coherence readout mounted
     on the member surface — that it is there, or that nothing in the corpus rules on whether it
     may be?
WHY  RULING — and see OBL-34 on the scope of the one located prohibition.
SET  a founder ruling.

OBL-33
Q    Does the "no chrome, no pill" prohibition reach lab-gated surfaces? D-OBJ-35 renders fabricated
     constants as a measured index with no fallback indicator, behind a lab gate.
WHY  RULING.
SET  a founder ruling on the prohibition's reach.

OBL-34
Q    Does the one located field prohibition — "No member-facing surface — no chrome, no pill, no
     /maia/field, no admin panel" — reach D-OBJ-1, D-OBJ-7, D-OBJ-35 or D-OBJ-37? It is scoped in
     its source to the Coherence/Field wire-up layer.
WHY  RULING — "a scope question this worker may not answer."
SET  a founder ruling on the prohibition's scope.

OBL-35
Q    What is the organism's disposition toward computation it does not consume? ~7,500 lines across
     D-OBJ-12…28 compute field/coherence/resonance quantities that reach nothing; five objects are
     ORPHANED, including two classes sharing the name ResonanceFieldOrchestrator.
WHY  RULING — marked REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.
SET  a founder ruling.

OBL-36
Q    At what point does vocabulary collision become a structural finding rather than a naming one?
     "field" names seven unrelated semantic families and two directories differing only in casing.
WHY  RULING.
SET  a founder ruling.
```

---

# VI · DOMAIN E · SPIRALOGIC / ELEMENTAL (P1-02 E §12)

```text
OBL-37
Q    Does EXISTS ≠ PARTICIPATES hold at this domain's scale? Of ~200 KB of Spiralogic/elemental
     code, what reaches MAIA's canonical prompt is dominantElement inside a summary sentence and
     the same value inside a JSON blob, both from keyword regexes over one message.
WHY  RULING — a question about the census vocabulary's adequacy, not about a traceable fact.
SET  a founder ruling.

OBL-38
Q    Is the unbounded [Field Intelligence] serialization a Domain D question, a Domain E question,
     or a cross-domain one? fieldOrchestrator JSON.stringifies the entire context object, so
     whatever is later added to FieldContext reaches the prompt automatically with no allowlist.
WHY  RULING.
SET  a founder ruling on ownership of the seam.

OBL-39
Q    Which object is "phase"? Three vocabularies, one persisted column, no ratified definition of
     what integer 1..12 denotes.
WHY  RULING — the vocabulary rule applied to the domain's own central word: "MAIA assigns a phase"
     cannot be evaluated until the referent is named.
SET  a ratified definition, or a founder ruling naming the referent.

OBL-40
Q    Should the census framework distinguish dormant from dormant-behind-a-single-optional-
     parameter? The per-phase modality selector needs only enabledApplied to become live.
WHY  RULING.
SET  a founder ruling on the schema.

OBL-41
Q    Is stale persisted developmental state still shaping a prompt an X-19 matter, a memory-domain
     matter, or its own class? member_spiral_state has readers, one prompt-rendering reader, and no
     writer; rows written before the oracle lane's retirement are read today as if current.
WHY  RULING.
SET  a founder ruling.

OBL-42
Q    Is R16's admission class under-drawn, or is disclosure correctly outside a shaping law?
     dominant_element and phase are not in the class, and the member-facing disclosure route
     bypasses it entirely.
WHY  RULING — "⛔ Not answerable at census authority."
SET  a founder ruling.

OBL-43
Q    Does the RECORD carry a stronger claim than the computation? Six regex counters producing
     template strings are written to agent_runs as "voices", with rows named FireAgent/WaterAgent
     and a wisdom column, while the code labels itself fast_pattern_match and (uncalibrated).
WHY  RULING — a representation question, "⛔ not adjudicated here".
SET  a founder ruling under the claim-discipline instruments.

OBL-44
Q    What happens when two live elemental detectors disagree on the same turn? Both reach the same
     prompt.
WHY  RECORDS + EVIDENCE — no runtime witness of a disagreeing turn, and P1-03+ may not re-trace.
SET  a runtime witness, or a governing source for the conflict.

OBL-45
Q    Per-phase therapeutic-modality selection (IPP / CBT / JUNGIAN / SHAMANIC / SOMATIC / IFS in a
     phase grid) has no consent gate, disclosure, refusal surface, member authority or ratified
     source — and the code exists. What governs it?
WHY  RULING — P1-01 named this the highest-consequence unlocated gap; per constraint 6 finding the
     code changes nothing about its governance.
SET  a located governing source, or a founder ruling.

OBL-46
Q    What governs a member-derived elemental classification entering the prompt on every CORE and
     DEEP turn with no consent gate, no member visibility, no opt-out and no correction path?
WHY  RULING — GOVERNANCE GATE: NONE FOUND (UG-E2).
SET  a located governing source, or a founder ruling.

OBL-47 †
Q    What governs disclosure of relationalPhase / autonomyStreak to the member's client, where a
     shaping refusal exists for the same fields but no governance for the disclosure act?
WHY  RULING (UG-E4).
SET  a located governing source, or a founder ruling.

OBL-48
Q    What governs a 30-day elemental aggregate influencing MAIA's awareness-level posture, on a
     column no migration declares?
WHY  RULING (UG-E5).
SET  a located governing source, or a founder ruling.
```

---

# VII · DOMAIN F · SYMBOLIC (P1-02 F §11, §9)

```text
OBL-49
Q    What layer owns the claim-type check Invariant 13 requires, and why is the one deployed
     instrument an inline const in a single route file? Five concluding-capable symbolic systems
     carry GOVERNANCE GATE: NONE FOUND, and one is member-facing, authenticated, and persists the
     conclusion.
WHY  RULING.
SET  a founder ruling, or a located governing source for the claim-type check.

OBL-50
Q    Which I Ching corpus is canonical — lib/iching/ or lib/divination/iching/? Two independent
     corpora (1,925 ln / 2,687 ln), different data files, different casting modules, no shared
     import, no artifact declaring which is canonical.
WHY  RULING.
SET  a founder ruling, or a located governing source.

OBL-51
Q    Does lib/maia/context/buildMaiaContext.ts → lib/stellium constitute a second symbolic entry
     into MAIA's context, independent of the traced one?
WHY  RECORDS — flagged, not traced; a domain A/B boundary question the pass may not re-open by
     re-reading source.
SET  a trace of that path.

OBL-52 †
Q    Is unauthenticated access to tarot and runes intended, or undeclared drift?
WHY  RULING.
SET  a founder ruling.

OBL-53
Q    Is the corpus discipline protocol aspirational, or does an implementation of safe_for_retrieval
     live outside this repository?
WHY  EVIDENCE — "outside this repository" is not answerable from the census subject.
SET  evidence from outside this repository, or a founder ruling that none exists.

OBL-54
Q    Why does the only structurally-refusing symbolic system also carry the only tests, the only
     producer registry and the only dated production witness?
WHY  RULING — "the correlation is recorded; the inference is P1-04's", and P1-04 declined to draw
     it (no quoted basis for the relation).
SET  a founder ruling, or evidence establishing the relation.

OBL-55
Q    Was lib/symbolic/ superseded, never wired, or is its consumer elsewhere? 3,411 lines of
     governance-named code reachable only from a debug route.
WHY  E-1 — "superseded" is a history claim the shallow clone cannot support.
SET  history beyond the shallow depth, or a founder ruling.

OBL-56
Q    Is archetypeEvolutionEngine ORPHANED or pre-wiring? Zero importers.
WHY  E-1 + RULING — the same shape as OBL-55.
SET  history beyond the shallow depth, or a founder ruling.

OBL-57
Q    What is the relationship between the witnessed false negative at PRESENTED/USED and the
     symbolic layer's governance? A system that cannot conclude also did not recall.
WHY  RULING — marked REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.
SET  a founder ruling.

OBL-58
Q    Does any other P1-01 slice-05 "zero files" claim need the same re-read that falsified the
     tarot claim?
WHY  RECORDS — P1-03/04/05 may not re-read source; the re-read would itself be P1-02 work.
SET  a bounded re-read of the remaining slice-05 "zero files" claims at a named subject.

OBL-59
Q    What implements Invariant 13's Tier-2 hard refusal for consequential forecasts "regardless of
     source"? No implementing code was found anywhere in domain F, while a tarot spread defines a
     Future position as "Likely outcome based on current trajectory."
WHY  RULING.
SET  a located implementing artifact, or a founder ruling.

OBL-60
Q    What governs the member's consent to astrological context in the prompt, and to sacred-text
     encounter? Birth data is supplied by the member; no artifact governs its USE in a turn, and
     the sacred-encounter service contains no consent or opt-in term.
WHY  RULING.
SET  a located governing source, or a founder ruling.

OBL-61 †
Q    What ruled model governs practitioner visibility of member chart derivations
     (practitioner/sessionPrep ← stellium/chartAnalysis ← astrology)?
WHY  RULING + LANE — P1-GOV-ACCESS-01 territory; existing visibility is ⛔ not treated as
     legitimate merely because it exists.
SET  a ruled access model.

OBL-62
Q    What is the provenance of model-authored conclusions persisted to studio_changes, where no
     author-class column was found and a sibling system separates three authorships?
WHY  RULING.
SET  a located governing source, or a founder ruling.

OBL-63
Q    Who may edit SYMBOLIC_LENS_BOUNDARY, and what requires new symbolic paths to apply it? It is
     an inline const in a route file; Invariant 13 calls it "deployed" but binds neither its
     location nor its application.
WHY  RULING.
SET  a founder ruling.

OBL-64
Q    What governs excluding a live-turn prompt contributor from type checking (@ts-nocheck on
     maiaAstrologyContextService)?
WHY  RULING — no governing record found.
SET  a located governing source, or a founder ruling.
```

---

# VIII · DOMAIN G · MODEL / PROVIDER / ORCHESTRATION (P1-02 G §7)

```text
OBL-65
Q    Which failure behaviour is MAIA's? Two implemented, simultaneously-reachable answers exist,
     plus a third behaviour neither doctrine described.
WHY  EVIDENCE + RULING — "not answerable from code"; which disposition governs production is
     UNKNOWN from repository evidence alone.
SET  a dated production witness of the deployed selection, AND a founder ruling on which is MAIA's.

OBL-66
Q    Is a fabricated first-person utterance a MAIA turn? DEGRADED_TEXT is typed, returned and
     consumed identically to a generated answer, and asserts an act the seam does not perform.
WHY  RULING — "a governance question with no located artifact."
SET  a founder ruling.

OBL-67
Q    May a provider transition be invisible to the member? driftAlarm tells the operator and
     explicitly not the member — and at three of four degraded exits, tells no one.
WHY  RULING.
SET  a founder ruling.

OBL-68
Q    What governs a model, and what governs 23 of them — including whether an unavailable or
     retired model id has a defined behaviour? (None found.)
WHY  RULING — one 2024-12-30 ADR, referenced by no provider document, no version pin, no
     unavailability rule.
SET  a located governing source, or a founder ruling.

OBL-69
Q    Is `meta` an authority channel? It currently selects provider, orchestration and model tier
     with no validation and no provenance.
WHY  RULING.
SET  a founder ruling.

OBL-70
Q    What is the standing of a cloud provider present in the main gateway, in no tier and no guard?
WHY  RULING.
SET  a founder ruling, or a located governing source admitting or refusing it.

OBL-71
Q    Does the commit-time guard family have runtime standing? All provider guards are build-time,
     and INF-2 forbids reading CI-GATED as runtime governed.
WHY  RULING.
SET  a founder ruling on whether provider admission requires a runtime expression.

OBL-72 †
Q    What reads minimumBloomLevel — a declared model gate keyed to a developmental attribute of a
     person, in a dormant file — and was it ever evaluated?
WHY  RECORDS + EVIDENCE — one of slice 06's 17 named UNKNOWN sub-questions; an access-shaped
     artifact under P1-GOV-ACCESS-01 that no evaluator reads.
SET  a trace of any evaluator, and a dated runtime witness if one exists.

OBL-73
Q    By what mechanism does a migration become deployable, if not by becoming part of a snapshot a
     deploy carries?
WHY  LANE + RULING — this corroborates the routed-out 2026-09-07 deployment-custody finding; ⛔ the
     census neither repairs nor reopens it, and ⛔ nothing is proposed.
SET  a founder ruling; the finding's own lane, if one is ever opened.

OBL-74
Q    Are provider guards authoritative in every execution environment? The allowlist records seven
     surfaces that shipped because the guard never fired — the same family as the branch-policy
     finding (OBL-02).
WHY  RULING.
SET  a founder ruling, and evidence of guard execution per environment.
```

---

# IX · DOMAIN H · SENSORY / VOICE (P1-02 H §11, §9)

```text
OBL-75
Q    Which is MAIA's voice vow — cloudVoicePolicy's "the default is the canon, cloud is forbidden
     unless explicitly permitted", or the route's "MAIA vow: default voice is always maia_core
     (OpenAI Alloy)"? Both call themselves the vow, and the production compose sets the env var one
     of them needs and omits the other's.
WHY  RULING — carried in MAP 4 as SYN-4: "Both sides call themselves the vow · UNKNOWN."
SET  a founder ruling naming the vow.

OBL-76
Q    Should an egress gate that exists be reachable on the path the member actually takes?
     assertProviderQualified, assertCloudVoiceAllowed and checkCloudConsent all exist, are tested,
     and are all skipped by the archetype branch.
WHY  RULING — "⛔ P1-02 does not answer this."
SET  a founder ruling.

OBL-77
Q    Is the ear governed at all? There is no STT analogue of the TTS refusal — no allowlist, no
     consent, no audit, no refusal class.
WHY  RULING — is that an absence to be ruled on, or a deliberate reading of "browser APIs only"?
SET  a founder ruling.

OBL-78
Q    Where does modality independence live? A founder ruling cited twice in code comments, enforced
     by one source-shape test, and located in NO document under docs/canon/** or docs/programme/**.
WHY  RULING — P1-01's "MODALITY INDEPENDENCE is UNLOCATED in governance" is confirmed at the
     subject; the Deep-Intelligence Gate reads GREEN on a system where cognition completes and the
     member receives nothing.
SET  a located governing document, or a founder ruling.

OBL-79
Q    What is the Class C ruling? It is explicitly "Proposed … for founder ruling", deferred through
     at least two units, and still unruled at the subject — with eleven first-person utterance
     sites, one a crisis script spoken outside every guard.
WHY  RULING.
SET  the founder ruling itself.

OBL-80
Q    What governs silent content-based refusal of a member's spoken words — 21 hard-coded phrases
     and a 50-character heuristic deciding whether an utterance becomes a turn, with no governance
     and no surface to the member?
WHY  RULING — GOVERNANCE: NONE FOUND (U8, U9).
SET  a located governing source, or a founder ruling.

OBL-81
Q    Should the canon's convergence section be re-pinned by OPERATION only? Three of its coordinates
     have drifted while every operation held; the canon's own D1 discipline answers this and the
     canon text has not been updated to follow it.
WHY  RULING — updating canon is outside census authority.
SET  a founder ruling.

OBL-82
Q    Is lastSendWasVoiceRef initialising true correct? Before the member has spoken once, the
     default posture is "voice was the last modality."
WHY  RULING.
SET  a founder ruling.

OBL-83
Q    How much of the 119-entry lib/voice/ surface participates and how much is dormant?
     (aethericOrchestrator, moshi/, personaplex/, MaiaRealtimeClient*, ElementalVoiceOrchestrator,
     UnifiedVoiceOrchestrator, MayaHybridVoiceSystem, …) — reachability was not traced.
WHY  RECORDS — one of slice 06's 17 named UNKNOWN sub-questions; ⛔ INF-5 forbids treating the
     untraced remainder as covered by the traced handful.
SET  a per-entry reachability trace.

OBL-84
Q    Where are DESKTOP-SOVEREIGN-STT-01 · S1/S4/S11 and D01 §XII — rulings cited by name in code and
     located in no document?
WHY  RULING — ⛔ not located at the subject.
SET  a located governing document, or a founder ruling.

OBL-85
Q    What is the standing of a ruling that exists only as a doctrine block inside the module it
     governs? "A module that states its own authorising ruling is the only record of that ruling."
WHY  RULING.
SET  a founder ruling.
```

---

# X · DOMAIN I · MEMBER / PRACTITIONER (P1-02 I §7) — ALL † BY SUBJECT

```text
OBL-86 †
Q    /studio/fields/<memberId> applies a ROLE check where the surface's own language implies a
     RELATIONSHIP. What ruled model does that answer to?
WHY  RULING + LANE — "this census records only that P1-01 located nothing for it to be a defect
     AGAINST." P1-GOV-ACCESS-01 standing; marked REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.
SET  a ruled access model.

OBL-87 †
Q    Two complete access models exist in code and neither is wired — discarded design, unratified
     candidate, or the intended model of a surface built past it?
WHY  E-1 + RULING — "the tree cannot say."
SET  history beyond the shallow depth, or a founder ruling.

OBL-88 †
Q    Was bringForward() — the only member gesture in the coach-field model — intended to reach
     members? It has no surface.
WHY  E-1 + RULING — recorded UNKNOWN.
SET  history beyond the shallow depth, or a founder ruling.

OBL-89 †
Q    What supplies handler-level authorization on the three route families (supervision, caseload,
     practitioners/create) whose matrix rules do not supply it either?
WHY  RULING — marked REPAIR QUESTION MAY EXIST — NOT YET AUTHORIZED.
SET  a located governing source, or a founder ruling.

OBL-90 †
Q    What is ACCESS_CONTROL_MODE in production? Its value decides whether /api/caseload/* is
     reachable unauthenticated.
WHY  EVIDENCE — "needs a runtime witness this container cannot produce."
SET  a dated production witness of the variable's value.

OBL-91 †
Q    Is `facilitator` one role or two? One actor and two vocabularies on one column.
WHY  RULING — "P1-04 may need this settled before the visibility question can even be stated
     precisely."
SET  a founder ruling.

OBL-92 †
Q    Who may become a practitioner? CAP-I-04 is upstream of CAP-I-01's only check.
WHY  RULING.
SET  a located governing source, or a founder ruling.

OBL-93 †
Q    What rules relationship_spaces — live, member-consent-bearing, claimed by no ruled source, and
     with a consent_status schema default the records do not establish?
WHY  RULING + RECORDS.
SET  a located governing source or founder ruling, and the DDL for the default.

OBL-94 †
Q    Do any practitioner_observation rows exist? Schema and readers exist; no writer was located.
WHY  EVIDENCE + E-1 — "Removed, never built, or outside this tree — UNKNOWN", with no history claim
     made.
SET  a database read, and history beyond the shallow depth.

OBL-95 †
Q    What governs derived visibility — existence inferable from metadata, counts, ordering,
     notifications, latency, or withdrawal-by-difference (D-1…D-8)?
WHY  RULING + LANE — recorded and ungoverned; per D-P1-08 and the F9 boundary this census opens
     nothing and proposes nothing. P1-GOV-ACCESS-01 holds the governance absence.
SET  a ruled access model covering inferred and derived visibility.
```

---

# XI · THE NAMED WITHHOLDINGS OF THE LADDER PASS AND THE REGISTERS

```text
OBL-96
Q    The SEVENTEEN named UNKNOWN sub-questions withheld by slice 06, quoted whole:
     G-02 persistence · G-03 CONSIDERS · G-05 DECIDES · G-08 DECIDES · G-09 whether minimumBloomLevel
     was ever evaluated · G-11 DECIDES and authority · G-15 identity across provider change ·
     H-11 CONTRIBUTES/DECIDES · H-15 reachability of the remaining lib/voice/ surface (119 entries) ·
     I-02 seven of eleven supervision routes † · I-03 production ACCESS_CONTROL_MODE † ·
     I-04 whether any flow requires verify-passcode first † · I-05 the referent of requireMemberId()
     at each call site † · I-06 most of ≈76 Studio routes classified rather than read † ·
     I-10 whether any practitioner_observation row exists † · I-11 the consent_status schema
     default † · I-12 whether any deployment runs app/api/_backend/**.
WHY  RECORDS + EVIDENCE — each was withheld because the authorized record text is silent,
     ambiguous, or in disagreement; several additionally need a runtime or database read.
SET  for each, either the source trace the domain record did not perform, or the runtime/database
     witness the container cannot produce. ⛔ Not enumerated further here; the list is the finding.

OBL-97
Q    The production values the G/H/I records carry as explicitly UNKNOWN: MAIA_INFERENCE_MODE ·
     ACCESS_CONTROL_MODE † · FOUNDER_MEMBER_IDS / LAB_ACCESS_MEMBER_IDS / CIRCLE_ACCESS_MEMBER_IDS †
     · the relationship_spaces DDL and its consent_status default † · whether minimumBloomLevel was
     ever evaluated · whether any deployment runs app/api/_backend/** · the status of seven of
     eleven supervision routes † · reachability of the remaining lib/voice/ surface.
WHY  EVIDENCE — no runtime, no database, no production access in the census container.
SET  a dated production witness for each named value.

OBL-98
Q    The whole-question gaps the A/B/C records declare rather than answer: live tier distribution ·
     whether the 2026-05-23 traffic audit still describes the subject · how many of the 25
     peripheral routes are member-reachable † · whether scrubMemoryAmnesia's result replaces
     member-facing text · whether /api/oracle/conversation serves member traffic · the referent of
     "the SQL confirmation term caps at 0.0225".
WHY  EVIDENCE + RECORDS — restated here because they are declared as gaps, not as findings;
     individually they appear above as OBL-05 · OBL-07 · OBL-12 · OBL-14 and in SC-05.
SET  runtime witnesses for the traffic and tier questions; a located referent for the 0.0225 term.

OBL-99
Q    The cross-cutting NONE FOUND findings carried forward unattached: member deletion or erasure
     of formed memory · the four freeze conditions having no evaluator of any kind · practitioner
     visibility into member memory † · MAIA_SAFE_MODE (no ruling on who may set it or what it may
     remove, though it removes every addendum and standing text) · what a practitioner may see of a
     member's developmental material † · erasure of member_spiral_state,
     member_relational_signals, member_theme_signals, trust_observations.
WHY  RULING — each is a governance absence, not a missing read. ⛔ The census may not invent the
     missing rule: for the freeze conditions specifically, "P1 authority may observe, may not
     invent", and evaluator absence does NOT weaken the freeze.
SET  a founder ruling, or a located governing source, for each named item.

OBL-100
Q    The NOT DETERMINED BY SOURCE RECORD inventories: register 01 — LADDER 60 of 62 rows,
     GOVERNANCE GATE 14 rows (⛔ distinct from NONE FOUND, which is a positive finding of absence;
     every one in domain B), COVERAGE 17 rows; register 02 — 197 occurrences across 111 rows × 11
     fields, LADDER 105 of 111, GOVERNANCE GATE 22, STATUS 9 rows where the source deliberately
     withheld a status word; register 03 — LADDER 41 of 48, GOVERNANCE GATE 11, COVERAGE 1 wholly
     and 12 further rows, STATUS 3.
WHY  RECORDS — "P1-03 restates. It does not decide." A field the source record did not determine
     may not be filled by normalization, and the bounded recovery pass (OBL-101) recovered only
     what record prose already established.
SET  for each undetermined field, the P1-02-scope read that would determine it at a named subject.

OBL-101
Q    The 77 whole-row UNKNOWN participation positions, by the reason each was withheld:
     SILENT (the record says nothing) · AMBIGUOUS (the record's words support more than one
     position) · RECORDS DISAGREE (two records conflict and deriving across them is forbidden) ·
     NOT A PARTICIPATION QUESTION (there is no code object to place — "not 'unknown because nobody
     looked'").
WHY  RECORDS — the four reasons are not one state, and ⛔ they must not be merged: only the first
     two name a read that would settle anything, the third needs the underlying contradiction
     adjudicated, and the fourth has no object to read.
SET  for SILENT and AMBIGUOUS rows, the source read the domain record did not perform; for RECORDS
     DISAGREE rows, an adjudication of the named contradiction; for the fourth class, nothing —
     ⛔ there is no object.

OBL-102
Q    The tier-coverage gap: 16 canonical-lane rows in D·E·F reach getMaiaResponse at a line no
     record attributed to a tier, and COVERAGE is UNKNOWN on I-10 (which MAIA-claiming cognition
     family consumes memoryAtomsLoader).
WHY  RECORDS — coverage is INF-5's field, and an unfilled coverage cell may not be read as
     organism-wide.
SET  a per-family/per-tier trace for the named rows.

OBL-103
Q    X-DEF-2's identity within domains G · H · I: whether the route carrying three characterizations
     lies inside that slice at all, and which six dependent rows it names there.
WHY  SCOPE — no X-DEF label appears in the slice's authorized inputs; "it would have to be named by
     the register that recorded it — which is a register this pass was not authorized to read."
SET  the cross-register read the pass was not authorized to perform.

OBL-104
Q    Whether a labelled vocabulary collision exists on the bare tokens `mode`, `convergence` and
     `voice` — P1-01 asserted collisions on all three, and no collision block in the authorized
     P1-03 inventories is labelled on those tokens.
WHY  SCOPE — "⛔ Nothing is guessed at and nothing is mapped onto a row … UNKNOWN, by scope."
SET  a collision inventory built at P1-02 scope for those three tokens.
```

---

# XII · THE RELATIONS THE MAPS DECLINED TO DRAW

⭐ Each declined edge is an owed relation read: a relation that looked natural and had **no quoted
basis**. ⛔ Not drawing it asserts nothing; the omission is the obligation.

```text
OBL-105
Q    MAP 1's 22 declined relations (N-01…N-22), including: whether the three cognition-family
     vocabularies name the same families (N-01, N-02) · whether the two objects both called "field
     context" are one (N-06) · whether two rows over the same table are one object (N-07, N-08,
     N-09) · whether A-09's other 95 identity-declaration sites belong to any family (N-16) ·
     whether A-15's 25 peripheral routes behave alike (N-17) † · whether I-02's seven unread
     supervision siblings share their sibling's status (N-18) † · whether the untraced 119-entry
     lib/voice/ remainder reaches any family (N-19) · whether any practitioner-observation row is
     ever written (N-20) † · whether the provider guard runs over the enumerated OpenAI surface
     (N-21).
WHY  RECORDS — "endpoint quality is not edge evidence"; an edge needs a quoted relation, and
     P1-04 may not re-read source to find one.
SET  for each, a quoted relation in a record produced at P1-02 scope.

OBL-106
Q    MAP 2's 22 declined causal-altitude relations, and MAP 3's 18 declined authority relations
     plus 8 quoted negatives recorded and not drawn.
WHY  RECORDS — same rule, at the causal and authority altitudes.
SET  for each, a quoted relation at P1-02 scope.

OBL-107
Q    MAP 4's two omitted contradiction edges — one resting on line proximity, one on a shared
     provider name — "recorded so the omission is visible as a discipline rather than an oversight."
WHY  RECORDS.
SET  a quoted relation, or nothing.
```

---

# XIII · THE DIVERGENCES THE RECORDS COULD NOT SETTLE BETWEEN THEMSELVES

```text
OBL-108
Q    member_theme_signals: domain B records it loaded at the live route and reaching the FAST prompt
     inside the influence block; domain C records it WIRED-BUT-UNOBSERVED (write path only, no
     member-facing read located) and explicitly SUSPENDED from the collective surface. Which
     describes the object?
WHY  RECORDS — "Both restated; ⛔ not merged."
SET  a trace of the load and surface paths at a named subject.

OBL-109
Q    Episodic / Coherence liveness: the anchor records "0 live callers"; domain B records both as
     called by MemoryPalaceOrchestrator at three sites.
WHY  RECORDS + RULING — under D-P1-06 the anchor may not settle a governing question by assertion.
SET  a trace, and a founder ruling on the anchor's divergence.

OBL-110
Q    P3-B-24 / MemoryPalaceOrchestrator: domain B traces retrieval and a prompt seam through
     /api/oracle/conversation; domain A records that route BLOCKED, the 410 being the first
     executable statement of POST. "If the POST is refused at its first statement, neither the
     retrievals nor the prompt seam runs; if the seam runs, the route is reached. Both stand."
WHY  RECORDS — no position was derived, not even KNOWS.
SET  a runtime witness of the route, or a trace establishing which statement executes first.

OBL-111
Q    Whether X-DEF-1's two sides describe ONE object or TWO — a sub-question riding inside the
     contradiction itself.
WHY  RECORDS — "⛔ P1-03 does not decide whether these are two descriptions of one object or two
     different objects."
SET  a P1-02-scope read of the named module and its suppression line.
```

---

# XIV · CARRIED FROM P1-01 — GOVERNING QUESTIONS WITH NO LOCATED TEXT

```text
OBL-112
Q    What IS MAIA? Four registers exist, and the infrastructure register directly denies the
     identity register. The is-not statements agree; the positive definition does not.
WHY  RULING.
SET  a founder ruling, or a ratified positive definition.

OBL-113
Q    What is MAIA's identity under provider change or fallback? No ratified text, and the two
     candidate answers are OPPOSITE: fall back to local, versus refuse and never return a degraded
     local answer. No implementation-level invariant proving identity continuity across provider
     substitution was located.
WHY  RULING — and note the narrower claim the census earned: ⛔ this is NOT established identity
     discontinuity.
SET  a founder ruling naming the doctrine.

OBL-114
Q    What is UFI? No definitional document anywhere; two glosses only; no code object at the subject.
WHY  RULING — and the vocabulary rule: sentences about "RFI" and "UFI" are unevaluable until the
     referent is named.
SET  a definitional document, or a founder ruling.

OBL-115
Q    What precedence governs the three total-scope constitutions, each claiming total scope over a
     different subject and deferring to the others, with no precedence rule and no tie-breaker if
     two ever conflict on the same fact?
WHY  RULING — P1-01 found NO universal precedence hierarchy, and the D-P1-06 ruling is expressly
     narrow and does not supply one.
SET  a founder ruling.

OBL-116
Q    Where does schema-deploy authority live? The 2026-09-07 merge-to-canonical finding lives only
     in CLAUDE.md, has no docs/ record, and nothing answers it.
WHY  RULING + LANE — routed out and owned by nobody; ⛔ this census does not adopt it.
SET  a founder ruling; the finding's own lane, if one is ever opened.

OBL-117
Q    What does interpretive Spiralogic consist of? The one ratified definition covers chart-to-
     elemental grammar only; the reference file the anchor points to is eight lines with no phases,
     while an undated document asserts a "consciousness GPS" that two dated canon sources refuse.
WHY  RULING.
SET  a ratified definition, or a founder ruling.

OBL-118
Q    What governs INFERENCE — what MAIA MAY CONCLUDE? The corpus documents govern what MAIA may
     know and may say and are silent on inference; the one document that crosses into concluding
     has no status, no date and no refusal surface.
WHY  RULING.
SET  a founder ruling, or a ratified source governing inference.

OBL-119 †
Q    What may a practitioner see of a member? NO RULED ACCESS MODEL EXISTS: eleven sources touch it,
     none rules it, the one visibility grid disclaims itself as "not a ruled access model" and cites
     an authoritative consent architecture it does not locate, and no document bridges facilitator
     → practitioner.
WHY  RULING + LANE — held by P1-GOV-ACCESS-01 as independent standing; the F9 boundary means this
     census records and opens nothing.
SET  a ruled access model.

OBL-120
Q    Does any of the anchor-versus-canon divergence resolve — the STT/TTS latitude, and the provider
     prohibition against a policy that admits a Lab tier and an accepted ADR leaving an OpenAI TTS
     default openly deferred?
WHY  RULING — D-P1-06 ruled the census comparison rule (an operational anchor cannot amend a
     governing source by assertion) and expressly left the divergences as "recorded defects, not
     census law"; ⛔ repair remains unauthorized.
SET  a founder ruling on which text is wrong.
```

---

```text
P1-05 · ARTIFACT 3 · UNRESOLVED OBLIGATIONS · COMPLETE
120 entries · ⛔ UNORDERED BY IMPORTANCE · ⛔ NO PRIORITY · ⛔ NO SEVERITY · ⛔ NO RECOMMENDATION
⛔ NO OWED READ PERFORMED · ⛔ NO METHOD PRESCRIBED · ⛔ NO LANE OPENED · ⛔ NOTHING REPAIRED
⛔ NO SOURCE CODE READ · NO RUNTIME INSPECTED · NO NEW GOVERNING DOCUMENT SOUGHT
† P1-GOV-ACCESS-01 and AUTH-EXPOSURE-01 hold separate standing over that territory
⛔ AUTH-EXPOSURE-01 NEITHER CITED, AWAITED NOR ASSIGNED WORK
⛔ NO FILE EDITED EXCEPT THIS ONE
```
