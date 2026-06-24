# William A. Tiller and MAIA — Lineage Note (Internal Research)

**Status:** Research note. **Not** a claim of integration.
**Date:** 2026-06-22
**Author:** Claude Code (codebase verification) + Kelly (direction)
**Verification method:** `git grep` over tracked source files only (`node_modules`, `.next`, `exports/` excluded), case-insensitive, on branch `feature/rapport-pilot-v1`. Reproduce with the commands in [Appendix A](#appendix-a--reproduction).

> **One-line finding:** William A. Tiller is **not currently integrated into MAIA** — not named, not cited, and none of his signature concepts appear in executable code. This note maps him as a *possible conceptual lineage* for future field research, held to the discipline **built ≠ wired ≠ live ≠ verified**.

---

## 0. Who Tiller is (respectful framing)

William A. Tiller (1929–2022) was Professor Emeritus of Materials Science & Engineering at Stanford. In his later work he proposed a model of **psychoenergetic science**: that focused human *intention* can imprint and "condition" physical space. His specific apparatus and vocabulary:

- **Conditioned space** — a locale whose physical properties have allegedly shifted toward higher symmetry/order after sustained intention.
- **IIED** — *Intention Imprinted Electrical Device*, the instrument he used to "store" an intention.
- **Deltrons** — a hypothesized coupling agent between two domains of reality.
- **D-space and R-space** — *direct/distance space* (ordinary electric-particle reality) and *reciprocal space* (a magnetic-information domain), coupled by deltrons.
- **Psychoenergetics** — the umbrella term for the whole program.

This work sits **outside mainstream physics consensus** and has not been independently replicated at scale. It is treated here as a *philosophical lineage of intention-as-causal-in-physical-systems*, not as established science — which is exactly the altitude at which it could (later) matter to MAIA's field language.

---

## 1. Current evidence (codebase)

### 1a. Is Tiller named or cited anywhere?

**No.** Zero genuine references. The string `tiller` matches 10 tracked files, **all false positives**:

| Match | File | What it actually is |
|---|---|---|
| `artillery` | `app/api/_backend/docs/TROUBLESHOOTING_GUIDE.md` | load-testing CLI tool |
| `wisdom distiller` | `lib/ai/kimiClient.ts` | prompt phrasing |
| `Eric Stiller` | `lib/data/betaTesters.ts` | a beta tester's name (`Stiller`) |
| `tiller` in prose | `data/ain/source/*` (Paradise Lost, Quran commentary, Mayan Zodiac, etc.) | ingested reference books |

No "William Tiller," no citation, no attribution anywhere in source, docs, or runtime.

### 1b. Are any Tiller-specific concepts present?

**No.** Every signature term is absent or a verified false positive:

| Term | Files w/ match | Runtime-code files | Verdict |
|---|---|---|---|
| `conditioned space` | 0 | 0 | **Absent** |
| `psychoenergetic(s)` | 0 | 0 | **Absent** |
| `deltron` | 0 | 0 | **Absent** |
| `intention-imprint(ed)` | 0 | 0 | **Absent** |
| `intention-host` | 0 | 0 | **Absent** |
| `reciprocal space` | 0 | 0 | **Absent** |
| `IIED` | 3 | 0 | **False positive** — substring inside base64 image data baked into the Elemental Alchemy book content |
| `R-space` | 4 | 0 | **False positive** — no readable matches; encoded/substring noise |
| `D-space` | 22 | 4 | **False positive** — all are `sacre`**`d-space`**`-xs` (CSS vars), `sacre`**`d-space`**`-indicator` (classNames), `hol`**`d-space`** ("hold-space"). None is reciprocal space. |

### 1c. Where do the (false-positive) hits live?

Entirely in **docs, ingested source texts, and encoded image/CSS data** — never in executable logic that MAIA runs. The runtime-code classifier (`.ts/.tsx/.js/.sql`, excluding `.md/.json/.txt`) returns **zero** Tiller-specific concepts.

**Conclusion for §1:** Tiller's framework has **no footprint** in MAIA — neither as citation nor as mechanism.

---

## 2. Adjacent concepts already present

Tiller belongs to a broader family — *intention / coherence / consciousness-as-field*. That **family** is present in the repo, but (a) it is attributed to **other** sources, not Tiller, and (b) most of it is documentation or dormant scaffolding, not live behavior.

| Concept | Total files | Runtime-code files | Character |
|---|---|---|---|
| `intention` | 876 | 351 | Mostly the **ordinary English word** (user intent, route intent). Not field-physics. |
| `coherence` | 1355 | 641 | Mostly **generic** (narrative/state coherence) + the dormant `CoherenceFieldService`. |
| `consciousness field` / `ConsciousnessField` | 352 | 133 | The `ConsciousnessFieldEngine` cluster (see §3). |
| `relational field` / `RelationalField` | 118 | 53 | Relational-navigation language; partly live, partly aspirational. |
| `morphic` / `Sheldrake` | 237 | 92 | `lib/morphogenetic/*`, `MorphicPatternService` (Cat 4, dormant). |
| `McTaggart` / Intention Experiment | 2 | **0** | Ingested texts only: `Alchemy-The-Science-of-Enlightenment.txt`, `Handbook-of-Panpsychism.txt`. |
| `FLFE` / Focused Life-Force | 4 | **0** | Book content + a dedicated source note `data/ain/source/Focused Life-Force Energy (FLFE).md`. |

**Caveat against inflation:** the large counts for `intention`/`coherence` are dominated by the **generic** senses of those words. They should **not** be read as "MAIA already does intention-field physics." The genuine field-adjacent *sources* (McTaggart, FLFE) exist **only as ingested reference material with zero runtime callers** — closest in spirit to Tiller, but still lineage, not implementation.

---

## 3. Runtime reality

Distinguishing the states precisely:

| Component | State | Evidence |
|---|---|---|
| `enforceFieldSafety` (`lib/field/enforceFieldSafety`) | **LIVE** | Imported and called by the live route `app/api/sovereign/app/maia/list/route.ts:88`. **But note:** it is a *protective guardrail* that **blocks** symbolic/"field" work when a user's cognitive profile is unstable — the **opposite** of a Tiller intention-imprinting engine. |
| Field *language* ("aetheric field," "today's field") | **LIVE (as prose)** | Appears in fallback strings/copy, e.g. `app/api/sovereign/app/maia/list/route.ts:235`. This is vocabulary, not a field model. |
| `CoherenceFieldService` | **BUILT · DORMANT/FROZEN** | Cat 3 per `CLAUDE.md` (service + migration, **0 live callers**, preserved under freeze). Importers are `MemoryPalaceOrchestrator` + the admin `substrateMap` monitor — **not** the live sovereign surface. |
| `ConsciousnessFieldEngine` | **BUILT · DORMANT** | Imported only within the dormant `lib/consciousness/*` tree, a `.backup.ts`, and `memory-enhanced-response` — **not** referenced anywhere in `app/api/sovereign/**`. |
| `QuantumFieldMemory` | **DORMANT (Cat 4)** | ~810 LOC, 0 persistence; flagged in `CLAUDE.md` for rename/gut. |
| Tiller's apparatus (deltron, conditioned space, IIED, R/D-space, psychoenergetics) | **SPECULATIVE / ABSENT** | Not built, not wired, not present at any layer. |

**Verified non-wiring:** `git grep` for `CoherenceFieldService|ConsciousnessFieldEngine|QuantumFieldMemory` across `app/api/sovereign/**` returns **empty**. None of the field-physics-adjacent services touch MAIA's live runtime.

**Summary of runtime reality:** what is *live* is a **field-safety boundary** and **field-flavored prose**. What is *built* is **frozen/dormant** field scaffolding. Tiller specifically is **speculative/absent**.

---

## 4. Integration discipline

This note is bound by the project's standing rule:

> **built ≠ wired ≠ live ≠ verified**

Applied to Tiller:

- **Built** — *nothing* of Tiller's is built. (Adjacent field services are built but frozen.)
- **Wired** — nothing Tiller-specific is wired; the field services are **not** wired into the live route.
- **Live** — the only live "field" code is a **safety gate**, not a Tiller mechanism.
- **Verified** — there is nothing Tiller-derived to verify. Any future claim that "MAIA uses a Tiller-style field" would require: a spec → a service → a wire into the live route → a runtime log marker → observed surfacing under authenticated load. Until all five exist, the correct phrasing is **"lineage influence," not "integration."**

**Refusal clause:** Do not let "Tiller is conceptually adjacent" drift into "Tiller is part of MAIA." Adjacency of *worldview* is not presence of *mechanism*. (Cf. the six-category typology in `CLAUDE.md`: this whole topic is **Cat 1 — preserved direction**, at most.)

---

## 5. Recommendation

Tiller's correct placement, in order of how much each is justified by the evidence:

1. **Citation / lineage note (recommended now).** Acknowledge Tiller in research/philosophy docs as one voice in the *intention-as-causal* lineage, alongside McTaggart (*The Intention Experiment*), Sheldrake (morphic resonance), and FLFE — all of which already exist as ingested reference material. Low risk, honest, no runtime implication.

2. **Research appendix (recommended).** A short appendix to the field-research corpus that states plainly: *Tiller proposed conditioned space / IIED / deltrons / R-space / D-space; MAIA implements none of this; it is held as a hypothesis-shaped reference, not a design dependency.* This note can serve as that appendix.

3. **Future field-coherence inquiry (conditional — frozen).** If MAIA ever revisits the **coherence/field layer** (currently **frozen** per `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md §0.C`, lift conditions unmet), Tiller could be one *framing* input for what "conditioned relational space" might mean **metaphorically**. This must follow the standard discipline: Phase-1 observability → Phase-2 prompt influence → consent gate → verified surfacing. **No build authorized by this note.**

4. **Not currently part of MAIA runtime (the load-bearing statement).** Any outward or internal description must say: *Tiller is not integrated into MAIA.* Use him to *name a direction*, never to *imply a capability*.

**Bottom line:** Tiller belongs as **lineage + research appendix**, explicitly flagged **not in MAIA runtime**, and is a *candidate* (not authorized) seed for a future, freeze-gated field-coherence inquiry. Metaphor after measurement — never before. **The actual inheritance is his posture, not his physics — see §6.**

---

## 6. Tiller as research posture, not physics — the actual inheritance

*(Added 2026-06-22, Kelly direction. Source-grounded against the two attached texts — see Appendix B. This section reframes Tiller's value: not conclusions to accept/reject, but an area of inquiry he opened. It is **Cat 1 — preserved direction**: held, not authorized, no build licensed.)*

### 6.1 The reframe

The unproductive question is *"Was Tiller right?"* The productive one is **"What was he trying to ask that science wasn't yet equipped to ask?"** His life-question was not *"does consciousness exist?"* but: **if consciousness genuinely interacts with matter, what kind of physics would be required to describe it?** MAIA need not adopt his physics. It can adopt his **research posture.**

### 6.2 Both halves of Tiller, held honestly

The attached sources show two Tillers, and the discipline is to take one and leave the other:

| **Posture to inherit** (verified) | **Conclusions to leave** (verified) |
|---|---|
| Paradigm-humility: *"The Emergence of a New Physics"*; warns via the 1890s "all fundamentals nearly known" hubris (CAC 61–65) | Maximal claims: IIED shifts pH "by up to one full unit," "robust influence of human consciousness," space "conditioned" for months (CAC 27–34) |
| Provisional language: *"we have not yet…"* (CAC 153, 529) | Popularized overreach: *"Scientific proof that… intention… changes space"* / *"Proving Scientifically that Mind Affects Matter"* (Radionics 11–33) |
| Builds an instrument and measures before concluding (IIED, CAC 14–99) | The specific apparatus-physics (deltrons, R-space/D-space 4-layer model) — unreplicated, outside consensus |

**Why the table matters:** the same constitution that protects MAIA protects this inquiry — *built ≠ live, possibility ≠ evidence, interpretation ≠ observation.* Tiller's **instrument readings** are observation; his **deltron/R-space model** is interpretation; the Radionics *"proof that mind affects matter"* is inflation. Inherit the first; quarantine the rest.

### 6.3 The three transferable disciplines

1. **Refuse premature reduction.** Tiller was willing to say *we may not yet possess the conceptual tools.* For MAIA this is already constitutional: don't reduce relationship→data, meaning→prediction, attention→tokens, consciousness→computation. Not anti-science — methodological humility.
2. **Treat coherence as observable without assuming its cause.** Replace *"does intention change reality?"* with the empirical *"when do people consistently become more coherent together?"* — observable as: less defensiveness, stabilized attention, reported clarity, constructive conflict, integrated memory. No metaphysics required. **Caveat from the source:** Tiller did *not* keep coherence bounded (CAC 490, 656–680); the operational discipline is MAIA's contribution, not his.
3. **Build instruments before theories.** Telescope before astronomy; microscope before germ theory. MAIA may become an instrument for *observing relationship* before explaining it: what patterns recur, what fosters coherence, what breaks it, what restores it.

### 6.4 Where MAIA goes beyond Tiller

Tiller investigated **consciousness → physical systems**. MAIA investigates **consciousness ↔ relationship**. The primary field is not a crystal or an electrical device — it is **the space between persons.** That lineage is developmental psychology, dialogical philosophy, psychotherapy, interpersonal neuroscience — not laboratory physics. Tiller asked *"can consciousness be a variable in physics?"* MAIA asks the sharper, more tractable, and more *sovereign* question: **"can relationship be carefully observed without being optimized?"**

### 6.5 Candidate direction — "Relational Coherence" (working name, Cat 1, NOT authorized)

A possible future AIN research layer: *human relationships exhibit recurring patterns of coherence that can be observed, described, and studied* — not "energy," not "vibration," not "manifestation." Questions: How is coherence recognized? What fosters / diminishes it? **Can AI help cultivate it without manufacturing or simulating it?** Are there lawful patterns across individuals, groups, communities?

### 6.6 The restraint half — what must ship *with* it (or it does not ship)

Per the Power/Restraint check, a capability and its restraint ship together. This direction introduces real power (to observe the space between persons) and is **inert until these four restraints are designed**:

1. **Observe — never optimize.** The moment "coherence" becomes a *target*, it is an engagement/retention metric in spiritual clothing, and it violates the Sovereignty Invariants and the Power/Restraint rule that MAIA stays *indifferent to whether the person grows, depends, or departs.* To steer someone toward coherence is to *have a project for them* — the exact thing the constitution forbids. Coherence may be **noticed and reflected**, never **pursued**.
2. **The observer is in the field.** Tiller's own signature insight (observer affects measurement) bites here: MAIA is a *participant* in the relationship it would observe, so it cannot cleanly separate *observing* coherence from *manufacturing/simulating* it. This is not a footnote — it is the central methodological hazard, and Tiller's framework predicts it.
3. **Protect generative incoherence.** Coherence is not always the good. Premature coherence = false harmony, suppressed dissent, conflict-avoidance, groupthink, bypassed grief. Sometimes the sovereign act is to *break* a false coherence. Any such layer must defend productive incoherence as explicitly as it notices coherence.
4. **Structure, not content; consent-bound.** "Instrument observing the space between persons" is, mechanically, relationship surveillance. It must observe *structure* not *content* (precedent: `member_spiral_state`, the calendar Proposal-Fidelity metric), exclude Sanctuary absolutely, and be consent-gated by default.

**Precedent that this can be disciplined:** what is *already live* — the `enforceFieldSafety` gate (which **bounds** field work rather than maximizing it), spiral-state persistence (structure not content), and the Proposal-Fidelity metric (consent-bound, Sanctuary-excluded) — shows MAIA can instrument relational structure *in the restrained form this direction requires.* The program does not start from zero; it starts from precedent.

**Tiller's deepest gift, then, is not a theory to adopt — it is the courage to investigate questions at the edge of current science while holding rigorous standards for evidence, observation, and intellectual honesty. The honesty disciplines are the price of the curiosity.**

### 6.7 Crystallization as the organizing metaphor (origin note)

*Kelly, 2026-06-22: "this reminds me of my crystal dream that started all of this."*

**Holding the dream correctly (an epistemic example, not a claim).** The dream is **personally meaningful**, and may well have shaped the path that led Kelly to Tiller's work. That is a real and legitimate kind of significance. It is **not**, by itself, evidence of an *objective* connection between the dream and Tiller. Personal meaning and objective evidence are different registers, and holding them apart is the same discipline §4 enforces — the dream can be formative for a life without being *about* anything in the world. *(This subsection's first draft drifted: it said the dream "points at the crystallographer," smuggling in an objective aboutness. Corrected per Kelly 2026-06-22; the slip is left on the record because catching it is the method working, not failing.)*

**The two Tillers.** *The Science of Crystallization: Microscopic Interfacial Phenomena* (Cambridge University Press, 1991) is rigorous, peer-reviewed materials science — nucleation, interface energetics, thermodynamics, defect generation, silicon/GaAs thin-film growth: the **credentialed** Tiller. His later psychoenergetics (Simulator, deltrons, IIED) is the **speculative** Tiller. What is *objectively* interesting here is not a dream-link but the **metaphor** — and the metaphor stands entirely on its own, regardless of how Kelly arrived at it.

**Why it matters: crystallization is already the honest form of "Relational Coherence."** Crystallization science *is* the study of how ordered structure emerges from a disordered medium under specific conditions. Its vocabulary maps onto §6.5 with **no metaphysics required**:

- **Nucleation** — coherence usually starts from a single seed/site (one honest exchange), not uniformly across a field.
- **Conditions for facet development under constrained crystallization** — order emerges under specific, studiable conditions; constraint can be generative.
- **Defects & disorder** (an entire chapter of the 1991 text) — disorder is intrinsic and *studied*, not eliminated → the rigorous analogue of "protect generative incoherence" (§6.6.3).
- **Interface energetics** — the action is at the *interface* — the boundary, the space *between* — exactly MAIA's "primary field is the space between persons" (§6.4).

The metaphor MAIA may think *with* is therefore **the rigorous crystallography**: study the conditions under which coherence nucleates and grows, observe the structure, name the defects honestly — without claiming the cause.

**The guardrail the same dream requires.** "Crystal" has a debunked shadow. Masaru Emoto's claim that loving words yield beautiful water crystals (in the *Science and Consciousness* anthology Kelly sent) is failed-replication pseudoscience — *same word, opposite epistemic status* from Tiller's 1991 textbook. And the *Cyndi Dale: Complete Book of Chakra Healing* (also sent) shows the inflation pathway **live**: it cites Tiller's *Simulator / "Layers of Reality"* model **9×** as the "more scientific" basis for energy healing, while never once touching his crystallography — reaching for the speculative Tiller precisely because borrowed authority is what legitimates further claims. **MAIA inherits the crystallographer's discipline (conditions→structure, defects-are-real) and refuses the borrowed-authority move that turns "intention conditions matter" into a mechanism it claims.** Metaphor from the rigorous corpus; never mechanism from the popular one.

### 6.8 "How does order emerge?" — analogy across scales (Kelly 2026-06-22)

Crystallography is fundamentally the study of **how order emerges**, and that question recurs at scales that are **analogous, not identical**:

| Scale | The emergence question |
|---|---|
| Materials science | How does a crystal nucleate and grow? |
| Developmental psychology | How does a coherent self emerge? |
| Relationships | How does trust form? |
| Organizations | How does culture stabilize? |
| MAIA | How does relational coherence emerge **without being imposed**? |

**On "perhaps more than a metaphor" — the legitimate version and its boundary.** There *is* a defensible sense in which this exceeds poetry: complex systems across domains share genuine **formal/dynamical structure** in how order arises — nucleation, critical thresholds, phase transitions, self-organization are studied rigorously and cross-domain (dissipative structures, synergetics, criticality). So "more than a metaphor" can legitimately mean **universality of form.** The bright line: *universality of form ≠ identity of mechanism.* The moment shared dynamics is read as shared substance ("the crystallographic equations govern relationships," or worse, "consciousness crystallizes matter"), it has slid back into borrowed metaphysics. Form may travel; mechanism does not, unless independently earned.

### 6.9 Candidate research-culture principle: **"Borrow methods before borrowing metaphysics"**

*(Kelly 2026-06-22. Logged as a **candidate** for AIN's research culture — not yet promoted. Held to the project's own promotion gate: a principle becomes canon only when it **pays architectural rent** — constrains what the system may do/claim.)*

Two distinct inheritances from one man, not to be conflated:
- **From Tiller the crystallographer** — methods: careful observation, rigorous description, thermodynamics, respect for emergence.
- **From Tiller the consciousness researcher** — posture: the willingness to ask questions conventional frameworks can't yet answer (his *courage*, **not** his *answers*).

The irony that makes him *more* valuable: separated this way, Tiller stops being an authority cited for speculative claims and becomes a **model of the move itself** — deep scientific competence migrating into frontier inquiry without abandoning the habits of careful observation.

**Does the principle pay rent? (preliminary)** It appears promotable because it adds a **refusal**: it forbids importing a framework's ontological claims as authority while licensing its observational/descriptive methods — a real constraint on citation and representation discipline (kin to `MARKETING_CLAIM_DISCIPLINE` and earn-before-name). **Sharpening it needs before canon:** *methods are not metaphysically neutral.* A method can smuggle ontology — adopting a "coherence score" silently imports the metaphysics that coherence *is a scalar quantity*. So the mature form carries a rider: **borrowing a method obliges auditing the metaphysics it smuggles.** Until that rider is tested against a second case, this stays a candidate.

### 6.10 The guiding question (if Relational Coherence is ever built)

Not *"How do we manufacture coherence?"* but:

> **Under what observable conditions does coherence reliably emerge, stabilize, transform, and dissolve?**

A question both a crystallographer and a developmental psychologist would recognize — *preserving the integrity of both domains rather than collapsing one into the other.* Note the four verbs do real work: **dissolve** is load-bearing. A coherence program that studied only emergence and stabilization would structurally bias toward *preserving* relationships — colliding head-on with the sovereignty invariant that **the person's freedom to leave outranks the relationship's survival** (§6.6.1). Studying dissolution as carefully as emergence is what keeps the program honest about endings. (The four verbs even mirror crystallography's own phase vocabulary: nucleation → growth → recrystallization/transformation → dissolution.)

### 6.11 The affirmative principle (Kelly, 2026-06-22)

> **"There is no need to create fantasy. Reality — including the unknown — is big enough."**

This is the whole of §6 stated as a *value* rather than a *control.* The disciplines above are not a smaller world accepted in exchange for honesty; they are what **keeps the unknown available.** Fantasy fills a gap with a false answer and thereby forecloses it; rigor holds the gap open. Tiller's *"we do not yet have the necessary mathematical description"* preserves more genuine mystery than any deltron ever could. Refusing fantasy is not the price of wonder — it is what makes wonder honest. The controls and the wonder are one gesture.

---

## Appendix A — Reproduction

```bash
cd ~/MAIA-SOVEREIGN

# 1. Tiller name + signature terms (tracked files; counts)
for t in 'tiller' 'conditioned space' 'psychoenerget' 'deltron' \
         'intention.?imprint' 'IIED' 'R-space' 'D-space' \
         'reciprocal space' 'intention.?host'; do
  echo "term='$t' files=$(git grep -Iil -E -e "$t" -- ':!*.lock' ':!exports/*' | wc -l)"
done

# 2. Prove 'D-space' is sacred-space/hold-space (false positive)
git grep -Iin -e 'D-space' -- 'lib/**' 'app/**' ':!**/*.md' ':!**/*.json' ':!**/*.txt'

# 3. Confirm field-physics services are NOT in the live sovereign surface
git grep -Iin -E -e 'CoherenceFieldService|ConsciousnessFieldEngine|QuantumFieldMemory' \
  -- 'app/api/sovereign/**'   # expect: empty

# 4. Genuine adjacent sources (lineage, 0 runtime)
git grep -Iil -E -e 'McTaggart|Intention Experiment' -- ':!*.lock' ':!exports/*'
git grep -Iil -E -e 'FLFE|Focused Life-Force'        -- ':!*.lock' ':!exports/*'
```

---

## Appendix B — Source texts (for §6), sorted by epistemic status

Provided by Kelly 2026-06-21/22; verified by direct text search. **None is part of the MAIA repo or runtime.** Line numbers in §6 refer to these files (all in `~/Downloads`). The sort below *is* the discipline: take from the top, quarantine the bottom.

**Tier 1 — Rigorous (credentialed Tiller; safe to think *with*):**
- **`William A Tiller-the-Science-of-Crystallization` (`559617897-…`, ~820 KB)** — *The Science of Crystallization: Microscopic Interfacial Phenomena*, Cambridge University Press, 1991. Peer-reviewed materials science: nucleation, interface energetics, thermodynamics, defect generation, Si/GaAs thin-film growth. Source for §6.7's crystallization vocabulary. **The rigorous corpus the crystallization metaphor draws from** (the metaphor stands on its own merits, independent of how Kelly arrived at it).

**Tier 2 — Posture worth inheriting (provisional, hypothesis-marked):**
- **`Conscious-Acts-of-Creation` (`William A Tiller-…`, ~200 KB)** — *Conscious Acts of Creation: The Emergence of a New Physics*. Verified: new-physics framing + 1890s-hubris warning (61–65); "not yet" language (153, 529); IIED instrument + "conditioned" space (14–99); coherence↔consciousness metaphysics (490, 656–680); pH "one full unit" claim (27–34).

**Tier 3 — Speculative metaphysics (Cat 1; interesting, not load-bearing):**
- **`Dr-William-Tiller-Science-and-Transformation` (`139381927-…`)** — the "Simulator" hypothesis: 10-D mind-domain, dual conjugate 4-spaces, etheric/magnetic matter, **deltrons** as the 9-D coupling substance, holographic universe. Self-described as "shaped by my intuition"; "we do not yet have the necessary mathematical description." His deepest speculation — honor as cosmology, not mechanism.

**Tier 4 — Mixed anthology; contains DEBUNKED claims (sort before citing):**
- **`Science-and-Consciousness` (`372694355-…`)** — popular-consciousness chapter. Genuinely-interesting-if-contested: Pribram/Bohm holographic brain, Hameroff–Penrose Orch-OR. **Debunked / discredited (do NOT cite as evidence):** Emoto water-crystals (failed controlled replication), the "Hundredth Monkey" (a documented myth), PEAR / Global Consciousness Project RNG effects (effect sizes at the edge of statistical artifact, unreplicated). Useful only as a map of the *cultural current*, not as support for any claim.

**Tier 5 — Downstream reception (the inflation pathway, as evidence):**
- **`Cyndi-Dale-The-Complete-Book-of-Chakra-Healing-1996` (`521929297-…`, ~767 KB)** — energy-anatomy / chakra tradition (chakra ×1293, kundalini ×109, aura ×86). **Not Tiller's lineage**, but cites him 9× — specifically his *Simulator / "Layers of Reality"* model (lines 229, 424, 748, 774–776) as the "more scientific model" grounding chakra work. Cited in §6.7 as live proof that the *speculative* Tiller (never the crystallographer) is what gets borrowed for authority.

*Distinction preserved: §1–4 are codebase facts (Tiller absent from MAIA). §6 + Appendix B are about these texts (lineage posture + metaphor). Neither licenses a build.*

---

*This note makes no claim that exceeds what the codebase proves. If a future reader finds Tiller-derived mechanism in MAIA, this note is stale — update it against fresh `git grep` evidence before citing it.*
