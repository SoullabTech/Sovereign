# Standing Patterns — Filing (2026-07-10)

**Date:** 2026-07-10
**Type:** FILING — a descriptive document per the four-type taxonomy (descriptive / generative / evaluative / architectural gate). It *records* the standing of recurring design patterns; it *confers* none. Nothing in this document mints, ratifies, promotes, or narrows anything. Where a pattern has a canonical home elsewhere, this document points and does not fork — the "edit in one home only" rule applies to this filing itself.
**Why it exists:** this week produced several recurring patterns that live scattered across memory files, spec sections, and session syntheses. Future sessions rediscover them as taste instead of inheriting them as rules. This filing gives each one statement, sightings, standing, home, and the judgment (if any) that remains Kelly's.
**Authority note:** all standing labels below (RATIFIED / CANDIDATE / PATTERN-SIGHTING / HELD) report states that already exist elsewhere, with citations. Any change of standing happens at Kelly's sitting, in the pattern's own home — not by editing this file.
**Related:** [[project_document_type_taxonomy]] · [[project_canon_constrains_doctrine_interprets]] · [[feedback_epigram_index]] · [[feedback_candidate_as_constitutional_standing]] (ADR-011)

---

## 1. Announce, never mutate

**Statement.** Modules announce new capability; they never mutate saved member/practitioner state. The system may inform and offer; only the member's own act changes the member's configuration. Watermarks advance only by member acts (dismiss, save); toggles are never pre-flipped; retroactive append to a saved set is rejected because a saved set is recorded authorship.

**Sightings.**
- Module announce build (2026-07-10, branch `claude/vigilant-meitner-046989`, dev-verified end-to-end): `ModuleDefinition.addedAt` in `lib/studio/moduleDefinitions.ts` + `practitioners.modules_seen_at` watermark (migration `20260709000001`) + announce UI in `app/studio/settings/page.tsx`. Saved set verified byte-identical through badge → banner → dismiss.
- Same consent shape as the Daily Anchor standing-consent gate (LIVE; `member_daily_anchors.surface_preference`, refusal R08) and the atoms `return_preference` model.

**Standing.** Branch-only, dev-verified, NOT merged/deployed. The generalized one-liner — *"The periphery may inform and offer; only the member's act changes the member's state"* — is a canon CANDIDATE (reviewer-endorsed 2026-07-10, not ratified; Canon Freeze in force; proposed placement: one line in `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`).

**Canonical home.** Memory `project_module_announce_pattern.md` (staging area, per its own words). No repo doc articulates it yet; if ratified, its home becomes the Sovereignty Invariants line, and the memory file becomes a pointer.

**Reserved for Kelly.** Ratification of the candidate line + its freeze-handling. Note for the sitting: this candidate is explicitly recorded as the *third instance* of Pattern 3's shape (guidance narrow-only; registration C-fence; module announce) — the sitting may treat it as an instance rather than a separate mint.

---

## 2. Never merely absent

**Statement.** A degraded, missing, or undecidable state is first-class and named — never silently absent, never silently defaulted. Two faces, same rule:
- *Audit face:* "a finding may be fixed, deferred-with-named-home, or superseded — but never merely absent."
- *Runtime face:* absence of data must render as absence, mechanically; absence of evidence must never render as a confident verdict.

**Sightings.**
- Audit face articulated verbatim: `docs/specs/SPIRALOGIC_REGISTRATION_CONFORMANCE_REPORT_2026-07-09.md:93`, satisfied by its Complete Disposition Ledger (all 12 findings exit with a stated disposition).
- Runtime face: the `?? 'fire'` fallback crown (`lib/astrology/spiralogicReportGenerator.ts:455-456`), named in `docs/architecture/RENDERER_DOMINANCE_RECON_2026-07-10.md` §item 7 as "the exact inverse of first-class ambiguity: absence of evidence rendered as a confident verdict," with the directive "absence of data must render as absence, mechanically" (recon line 133); deletion carried in PR #578.
- The `none` verdict: the ratified C decision (Q1/Q6, 2026-07-09) requires that the versioned dominance rule *may return `none`* where no stable dominance is warranted — undecidability as a legitimate output, not an error to paper over.

**Standing.** PATTERN-SIGHTING with one verbatim in-repo articulation (the audit face). Not minted as a named pattern; the two faces have not been unified anywhere authoritative.

**Canonical home.** None yet. The audit face lives in the conformance report; the runtime face lives in the recon + the C ratification (grammar spec).

**Overlap to reconcile at the sitting.** Memory `feedback_absence_as_signal.md` is adjacent but distinct: it governs *deliberately held* absences (with falsification criteria); this pattern governs *representing* absence honestly. The sitting should decide whether they are siblings under one name or stay separate.

**Reserved for Kelly.** Whether to mint, and whether the two faces are one rule.

---

## 3. Core defines; periphery modulates/narrows; conflicts resolve toward the versioned center

**Statement (candidate general form, superseded wording noted below).** Kelly's narrowed candidate invariant (MINT FRAME REFINED, 2026-07-10): *"Authority-bearing registrations occur exactly once and are inherited thereafter. Other layers may inherit, display, modulate, or contextualize the result, but may not redefine it."* Fence triggers only when three conditions coexist: (1) authority claim · (2) inheritance across surfaces · (3) divergence risk. This narrowed form supersedes the broader "every kind of change has exactly one versioned place where it becomes real" as the sitting's input — the broader phrasing is counterexampled by the ~100 out-of-jurisdiction `dominant=reduce(...)` echoes (own signals, not natal registration).

**Sightings (the evidence is the layer spread, not the tally).**
1. MAIA Guidance narrow-only — practitioner preferences specialize, never override constitution; widening PUT → 422 zero-residue (live 2026-07-08 proofs).
2. C-fence — renderers consume ONE versioned interpretive rule (`interpretation_version`); no renderer defines its own dominance. Ratified 2026-07-09 (grammar spec Ratification block); enforcement in flight as PR #578 (OPEN: "single versioned dominance rule (dominance_v1) + removal of the seven renderer crowns").
3. Regulatory inheritance — deployments inherit constitutional safeguards automatically, may only narrow further (`docs/architecture/AIN_OS_REGULATORY_CAPACITY_CANDIDATE_2026-07-09.md` rev 2; chain AIN OS→MAIA→Studio→Larry→clients). Cross-trust-boundary recurrence is what makes this canon-grade.
4. Possible fourth face (authorship): "deliberate anywhere, ratify at the file, EDIT IN ONE HOME ONLY" — added after the suspected spec fork (2026-07-10) proved benign; the grammar spec now declares its canonical home in its own header.

**Standing — three distinct states, do not collapse:**
- **SETTLED:** dominance has one authoritative home. The C ratification (2026-07-09, verbatim "defined once... no renderer may define its own") already decided this; the census's crown sites are therefore *violations of an existing ratification, not evidence in an open debate*. Reading 2 ("authority is plural") is FORECLOSED for dominance specifically.
- **HELD:** the mint itself. Kelly dismissed the mint question on 2026-07-10 — no name recorded; *"not yet" is the standing state.* The adjacency check WAS run (do not re-derive): [[project_canon_constrains_doctrine_interprets]] = kin but distinct (and settles placement: any mint is doctrine-shaped CANDIDATE, not canon); [[feedback_configuration_vs_primitive_diagnostic]] applied to the four sightings cuts *toward* minting. Advisor grounds were filed post-hold as evidence, not ruling.
- **OPEN (preserved verbatim, decided by no one here):** whether authority-home (sightings 1–3, where *authority* lives) and authorship-home (sighting 4, where *authorship* lives) are one pattern or two adjacent ones. Reading A (one pattern): "every kind of change has exactly one versioned place where it becomes real" — the versioned home IS the authority boundary made mechanical (advisor's read); the unified form does diagnostic work — every pathology on the week's board (`?? 'fire'` default, hardcoded WATER banner, seven crowns, pushed-not-merged, pulled-not-rebuilt) reduces to "a thing became real outside its one versioned home." Reading B (two patterns): the authority face's evidence is cross-trust-boundary (unequal parties); the authorship face's is intra-system hygiene — if the faces differ in kind, unification loses that. Both readings filed; this document decides nothing.

**Canonical home.** Memory `project_spiralogic_registration_grammar.md` (PATTERN CANDIDATE + MINT FRAME REFINED + PATTERN MINT — HELD sections) and the ratification blocks in `docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md`. This section is a pointer, not a second home.

**Reserved for Kelly.** The mint (held), including the one-vs-two-patterns judgment. Also related but already RULED, not open: Finding 6 (vector/circle/spiral = interpretive-layer display vocabulary for phases 1/2/3, modality-keyed, sourced from Kelly's manuscript; commit `008a8a0a5`).

---

## 4. Probe-induction rule

**Statement (verbatim from its home).** *"No probe enters the suite without one witnessed manual pass."* Hand-verify once, automate forever — the manual run is the probe's ratification, so the automated check inherits a known-good baseline instead of encoding an assumption.

**Sightings.**
- Articulated as a standing rule in `docs/specs/WHAT_NOW_EVAL_HARNESS_SPEC_2026-07-10.md` (Tier 1), with its own precedent recorded: probe #1 (the `served`-field assertion) was run by hand against prod `3ad09fdfc` on 2026-07-10 — `served: {"provider":"anthropic","model":"claude-sonnet-4-6"}` on a live turn — before entering the spec.

**Standing.** Declared "standing" within that spec's jurisdiction (the What Now? eval harness). Not filed anywhere as a cross-surface rule. One articulation, one witnessed precedent.

**Canonical home.** `docs/specs/WHAT_NOW_EVAL_HARNESS_SPEC_2026-07-10.md` — POINT there; do not restate elsewhere.

**Overlap.** Kin to [[feedback_verify_or_label_and_label_travels]] and [[feedback_record_informs_observation_authorizes]] (epigram index); the probe rule is those principles applied to test induction.

**Reserved for Kelly.** Whether the rule generalizes beyond the What Now? suite (e.g., to the registration conformance suite, refusal registry probes, pre-deploy gate extensions).

---

## 5. Demonstrated-before-written — **articulation UNGROUNDED**

**Statement (best reconstruction — needs its origin text confirmed at the sitting).** Nothing enters a spec, claim, or suite as fact until it has been demonstrated in contact — writing records what was witnessed; it does not manufacture it. The written artifact inherits authority from the demonstration, never the reverse.

**Grounding status.** No verbatim articulation found in the repo under "demonstrated before written" or close variants (grep of `docs/` and memory, 2026-07-10). It may live only in session transcripts. Filed here without invented provenance. Adjacent in-repo articulations that the sitting can check as possible origins or kin — none of these IS the pattern's origin text:
- The probe-induction precedent clause (§4 above) is a mechanized instance.
- `docs/methodology/DEVELOPMENTAL_GATES_CANDIDATE.md:66,68` — "Translation hesitates until runtime coherence is demonstrated"; "Public commitments follow demonstrated institutional practice rather than aspiration."
- `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — Live/Designed/Vision; "We do not tell tomorrow's story as if it were today's."
- `docs/fields/larry/NOW_WHAT_DEMO_JOURNEY_2026-07-07.md` — "Recognition first. Explanation last." (demonstration-before-explanation, a different but neighboring cut).

**Standing.** PATTERN-SIGHTING, UNGROUNDED articulation.

**Reserved for Kelly.** Confirm (or supply) the origin text; decide whether this is a distinct pattern or already covered by the claim-discipline canon + probe-induction.

---

## 6. Instrument over inventory — first filing

**Statement (freshly named in session synthesis, 2026-07-10).** Site lists rot; claims must migrate from *"a session checked"* to *"a machine re-checks."* An inventory suggests where to look; only an instrument that inspects the whole space — and can be re-run — certifies. Acceptance criteria for consolidation work should be instrument-shaped (a grep gate, a conformance suite, a completeness check), not list-shaped.

**Sightings (all this week).**
- (a) The dominance-crown inventory was counted three times in one day by three verified sessions: recon said 7 (`docs/architecture/RENDERER_DOMINANCE_RECON_2026-07-10.md` — "3 named + 2 structurally distinct additional crown mechanisms + 2 downstream phrasing sites"); a census said 6 + 1 suspect (memory `project_spiralogic_registration_grammar.md`, CROWN CENSUS CORRECTED — 6 compute sites / 5 files, journey page's different route flagged as possible 7th); the build found 8 (PR #578, extra consumer `components/SpiralogicEvolutionaryReport.tsx:317`). Each count wrong in a different direction. PR #578's acceptance therefore shifted from checklist to a post-removal grep gate: no chart-derived dominance computation survives outside `lib/spiralogic/interpretation/`.
- (b) The registration conformance suite replacing session-reading of `spiralogicEngine.ts` (`docs/specs/SPIRALOGIC_REGISTRATION_CONFORMANCE_REPORT_2026-07-09.md`; failures classified spec-hole / engine-bug / undocumented-decision).
- (c) The What Now? probe suite (`docs/specs/WHAT_NOW_EVAL_HARNESS_SPEC_2026-07-10.md`; run cadence: before every What Now? deploy, as a gate extension).
- (d) The transit parser's completeness gate (hand-count vs parser-count) catching a 9-transit silent under-count on first contact (2026-07-10). **No repo artifact found for this sighting** — carried here from session synthesis; confirm its artifact at the sitting.

**Standing.** PATTERN-SIGHTING — freshly named, NOT minted.

**Canonical home.** None yet. This filing is its first written landing.

**Overlap to reconcile at the sitting — likely the same pattern already filed.** Memory `feedback_worklist_suggests_instrument_establishes.md` (Kelly-named 2026-07-06, retired-model sweep): *"a worklist suggests what to inspect; a verification instrument establishes what is true"* — same core cut, one week earlier, already in the epigram family with kin links. What this week adds is the *re-check cadence* (the instrument runs again on every deploy/PR, not once) and the three-counts-three-answers evidence. The sitting should decide: extend the existing memory (its home) rather than mint a duplicate. Also kin: [[feedback_mechanization_after_stabilization]], [[feedback_verification_requires_a_frozen_subject]], [[project_verification_instrument_jurisdiction]] (RATIFIED).

**Reserved for Kelly.** Whether this is a new mint or an extension of worklist-vs-instrument; whether the re-check cadence ("a machine re-checks") is part of the rule or an implementation detail.

---

## Judgments that remain Kelly's (one place)

1. **Pattern 3 mint — HELD** (dismissed 2026-07-10; "not yet" is the standing state), including the preserved one-vs-two-patterns question (authority-home vs authorship-home; both readings filed verbatim in §3). *Not* on this list: Finding 6 (RULED, `008a8a0a5`) and the dominance-one-home question (SETTLED by the C ratification).
2. **PR #578's in-diff editorial words** — banner fate; binary-vs-graded dominance vocabulary; deficient/strengthen framing.
3. **Pattern 1's candidate line** — ratification + Canon Freeze handling of *"the periphery may inform and offer; only the member's act changes the member's state"* (and whether it files as an instance of Pattern 3).
4. **Pattern 2** — whether to mint never-merely-absent, and whether its audit and runtime faces are one rule; reconciliation with `feedback_absence_as_signal`.
5. **Pattern 4** — whether probe-induction generalizes beyond the What Now? suite.
6. **Pattern 5** — origin text for demonstrated-before-written (currently UNGROUNDED), and whether it survives as distinct from claim-discipline + probe-induction.
7. **Pattern 6** — new mint vs extension of worklist-suggests-instrument-establishes; standing of the transit-parser sighting (currently repo-unwitnessed).
8. **This filing itself** — ratification, correction, or discard at the sitting.
