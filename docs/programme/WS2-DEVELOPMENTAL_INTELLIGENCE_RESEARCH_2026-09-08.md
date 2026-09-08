# Writer's Studio — Developmental Intelligence Research · 2026-09-08

**Lane**: JARVIS — WRITER'S STUDIO DEVELOPMENTAL INTELLIGENCE RESEARCH
**Status**: **UNVERIFIED LEAD SET · CITATIONS NOT AUDITED AT SOURCE · NO CLAIM HERE LICENSES A DESIGN DECISION**
**Restamped**: 2026-09-08, founder act. Supersedes the original `RESEARCH COMPLETE FOR DESIGN INPUT` stamp, which overstated this document's standing: the sweep is a research lead set, not a source-verified literature record. The prior stamp is corrected in place rather than deleted — a stamp is a reading at a time, and the honest repair is to date the change, not to hide it.
**Build authorization**: NONE.
**Benchmark Work**: *Elemental Alchemy* — published Work, founder-authorized for calibration and model comparison.

### Standing rules for every reader of this document

1. **Every citation here is a research lead, not a source.** The links were gathered through an assistant session and carry `utm_source=chatgpt.com`; none has been read at source by this system. Task zero of this lane replaces each with primary-source support — DOI · exact supported proposition · location/page · evidence strength.
2. **Every unusually precise empirical figure is UNVERIFIED** — participant counts, corpus sizes, effect sizes, percentages. The register is §16.
3. **Every model context window, output limit, price, and product name in §7 is UNVERIFIED.** Benchmark cost planning must not rest on this table until audited.
4. **The candidate constraints in §6 are PENDING SOURCE AUDIT + FALSIFICATION. Not adopted.**
5. **A claim that does not survive the audit is REMOVED, not softened.**
6. **Nothing in this document licenses a design decision, a build, a prompt change, or a provider call.**

> A document that describes its own findings as complete will be read as a record by the next session, which will not have this conversation. That is how a witness goes stale in place.

---

## 0 · Question

What findings from writing pedagogy, creative-writing feedback, human–AI co-writing, co-creativity, and long-document LLM research should constrain the design of MAIA in Writer's Studio?

The product question is not whether MAIA can generate an impressive analysis. It is:

> **Does working with MAIA make it easier for a writer to make the Work they are trying to make — while preserving authorship, voice, agency, and the writer's authority over meaning?**

This research is advisory. It does not supersede ratified Soullab constitutional law. Where external research and project law differ, the conflict must be surfaced rather than silently reconciled.

---

# 1 · Research corpus

## A. Human writing / developmental feedback

### A1. Productive feedback is dialogic, specific, and oriented toward the writer's own developing judgment

Dobson & Gilbert (2024), *Becoming the falconer: productive feedback for the redrafting of creative writing*, emphasizes the power imbalance inherent in feedback, the need for an empathetic reader who demonstrates close reading, and the developmental value of helping writers internalize a stronger inner reader rather than simply obey an external authority.

Source: https://doi.org/10.1080/14790726.2024.2329198
Open research record: https://research.gold.ac.uk/id/eprint/35776/

**Implication for MAIA**: the goal is not to become the writer's permanent external critic. A good session should strengthen the writer's own ability to see the Work.

### A2. One-way comments are weaker than feedback partnerships

Nancy Sommers' long-running work on response to writing argues against comment overload and generic directives, and for feedback as a partnership across drafts. Harvard's summary of this work stresses dialogue, specific response, familiar language, and comments that help the writer think rather than merely satisfy the reader.

Source: https://www.gse.harvard.edu/ideas/usable-knowledge/16/02/responding-student-writing-and-writers

**Transfer caution**: much of this literature is educational rather than professional-author research. The interaction principles are relevant; effect sizes should not be generalized to expert writers.

### A3. Dialogic talk can move feedback toward higher-order revision

A 2024 mixed-method study in *Learning and Instruction* found that supported dialogic writing conversations produced more exploratory reasoning, greater audience awareness, and more higher-order revision than less-supported peer feedback.

Source: https://doi.org/10.1016/j.learninstruc.2024.101965

**Transfer caution**: participants were upper-primary students. This supports the value of dialogue as a mechanism, not a direct claim about professional authors.

### A4. Writing conferences reduce perceptual error because the writer can negotiate the feedback

Writing-conference research describes a core advantage of oral/dialogic response: writer and reader can clarify, negotiate, and correct one another in real time, while written comments are one-way communication.

Source overview: https://www.sciencedirect.com/science/article/pii/S0378216617303004

**Implication for MAIA**: a live discussion is not just a friendlier rendering of the same analysis. It changes the epistemic situation because author intent can enter before an observation hardens into a developmental conclusion.

---

# 2 · Human–AI co-writing findings

## B1. Writers do not want one fixed level of AI intervention across the writing process

Reza et al. (2025), *Co-Writing with AI, on Human Terms*, systematically reviewed **109 HCI papers** and interviewed **15 writers**. They identified four broad support strategies — structured guidance, guided exploration, active co-writing, and critical feedback — across planning, translating/drafting, reviewing, and monitoring. Desired ownership and intervention vary by phase, writer, genre, and goal.

Peer-reviewed publication: PACM HCI, DOI 10.1145/3757566
Preprint: https://arxiv.org/abs/2504.12488

**Implication for MAIA**: `Read`, `Discuss`, `Edit`, and `Develop` should not be prompt variants of one behavior. The degree and kind of initiative should change with the writer's commissioned act.

## B2. AI assistance can reduce ownership, especially when it contributes the prose itself

Gero et al. (DIS 2026 / arXiv 2026), in a between-subjects study of **253 participants**, found that AI support at any stage reduced reported ownership, but planning assistance reduced it least and drafting assistance reduced it most. Greater AI contribution of text and ideas correlated with lower ownership even when quality improved.

Source: https://arxiv.org/abs/2604.11009
DIS 2026 proceedings listing: https://dis.acm.org/2026/wp-content/uploads/2026/06/toc.html

**Implication for MAIA**: defaulting to generated replacement prose is the riskiest collaboration mode for ownership. Local rewriting should be commissioned and reversible; reading/discussion can carry more of the intelligence.

## B3. Interaction-required suggestions can preserve cognitive engagement and fine-grained control

Arnold & Kim (2025) explore revision interactions that require human involvement rather than simply delivering completed prose, including exposing edit opportunities and fine-grained suggestion control.

Source: https://arxiv.org/abs/2504.08726

**Implication for MAIA**: prefer `show me a possibility`, `compare`, `try another`, `use mine`, `keep yours` over silent replacement or whole-section takeover.

## B4. Co-creative systems benefit from high user control; proactivity works when adaptive and context-sensitive

A 2025 systematic review of **62 human–AI co-creativity papers** identified user control, proactive behavior, creative phase, task, embodiment, and model type as major design dimensions. The authors report higher satisfaction, trust, and ownership with high user control, while adaptive/context-sensitive proactivity can deepen collaboration.

Source: https://arxiv.org/abs/2506.21333

**Evidence status**: systematic review preprint; useful design input, not by itself a production law.

## B5. Creative practitioners ask for non-intrusive guidance, contextual memory, lifecycle adaptation, and free-form interaction

A 2026 ACM Creativity & Cognition co-design study of AI feedback for visual artists reports that participants wanted guidance that preserved ownership, adapted across the project lifecycle, maintained contextual memory, and supported free-form input.

Proceedings source: https://cc.acm.org/2026/proceedings/

**Transfer caution**: visual artists, not writers. The relevance is interaction design for sustained creative projects.

---

# 3 · Current LLM writing-feedback limitations

## C1. Models can be specific and accurate while still missing the thing that matters most

Rashkin et al. (ACL 2025), *Help Me Write a Story*, evaluated LLM feedback on a controlled set of **1,300 stories**. Models often produced specific, mostly accurate feedback, yet frequently failed to identify the biggest writing issue and to choose appropriately between critical and positive feedback.

ACL source: https://aclanthology.org/2025.acl-long.1254/

**Implication for MAIA**: correctness of individual observations is insufficient. **Selection and prioritization are separate powers** and require their own evaluation. This directly supports the project's distinction between screening and selection.

## C2. Output-quality metrics miss what happens during collaboration

MindCopilot (2026) argues for interaction-aware evaluation of co-writing, including user acceptance and editing effort, rather than judging only the final output. Its user study found that behavior-centered measures reveal aspects of usability that output-only measures miss.

Source: https://arxiv.org/abs/2605.23535

**Evidence status**: recent preprint. It supports, but does not establish alone, the project's decision that the **session** is the calibration unit.

## C3. Dialogic AI can support intention and goal regulation better than efficiency-only writing assistance

WriteFlow (2026) frames AI writing support as a dialogic space for goal articulation, monitoring, and negotiation grounded in the writer's intentions. A small expert-user study reported support for iterative goal refinement and goal–text alignment.

Source: https://arxiv.org/abs/2604.15800

**Evidence status**: small early study. Useful as a design analogue for MAIA's `what are you trying to do here?` stance.

---

# 4 · Voice preservation / homogenization risk

## D1. LLM polishing can preserve content while flattening linguistic individuality

Sourati et al. (2026), *Nature Human Behaviour*, analyzed **more than 880,000 texts across seven datasets**. They report significant declines in linguistic diversity associated with LLM writing assistance; in controlled rewriting, core content was retained while stylistic variance narrowed and cues associated with personal identity were altered.

Primary article: https://doi.org/10.1038/s41562-026-02550-0
PubMed: https://pubmed.ncbi.nlm.nih.gov/42637911/

**Implication for MAIA**: `preserves my voice` is not cosmetic. It is an acceptance criterion. A rewrite can be semantically faithful while still damaging the writer's linguistic identity.

## D2. Human–AI co-creation shows a measurable homogenization effect at the group level

A 2026 systematic review/meta-analysis of **19 studies / 61 effect sizes** found a small but statistically significant homogenization effect associated with generative-AI co-creation, moderated by task structure.

Research record: https://research.tilburguniversity.edu/en/publications/does-generative-ai-make-us-think-alike-a-systematic-review-and-me-2/

**Implication for MAIA**: the product should not optimize for `polish` as a default aesthetic. Suggestions should preserve idiosyncrasy unless the writer explicitly asks to normalize it.

---

# 5 · Long-document cognition and manuscript structure

## E1. A large context window does not guarantee uniform use of the context

Liu et al. (TACL 2024), *Lost in the Middle*, found that model performance can vary materially depending on where relevant information appears in a long context, with information in the middle often used less reliably than information near the beginning or end.

Source: https://doi.org/10.1162/tacl_a_00638

**Implication for MAIA**: `the whole manuscript fits in one request` is not the same as `the model has reliable whole-Work cognition`.

## E2. There is no universal winner between long-context prompting and RAG

LaRA (2025) compared retrieval-augmented and long-context approaches across thousands of practical test cases and found that the best approach depends on model, context length, task, and retrieval quality.

Source: https://arxiv.org/abs/2502.09977

A separate 2024 study found long context can outperform RAG when sufficiently resourced, while RAG remains much cheaper, and proposed routing between the two.

Source: https://arxiv.org/abs/2407.16833

**Implication for MAIA**: do not constitutionally bind Develop to `one giant call` or to `retrieve chunks and summarize them`. Benchmark a hybrid.

## E3. Hierarchical / discourse-aware retrieval repeatedly outperforms flat chunking in long-document tasks

LongRefiner (ACL 2025) explicitly uses hierarchical document structure and reports competitive performance at substantially reduced computational cost.

Source: https://aclanthology.org/2025.acl-long.176/

A 2026 ACL paper, *Beyond Chunking*, reports consistent gains from discourse-aware hierarchical retrieval across multiple datasets and genres compared with approaches that flatten document structure.

Source: https://aclanthology.org/2026.acl-long.829/

**Implication for Writer's Studio**: the manuscript's authored hierarchy is valuable cognition, not UI metadata. Preserve and query **selection → section → chapter → part → whole Work**, plus writer-defined custom ranges.

---

# 6 · Candidate constraints derived from the research

> **Candidate constraints — PENDING SOURCE AUDIT + FALSIFICATION. Not adopted.**

These are **candidate constraints**, not design laws and not ratified canon. Each rests on citations that have not been audited at source (§16), and none has yet been given a falsifier. A constraint with no way to fail is a slogan, not a constraint.

Adoption of any R-L item requires, per item: (a) its supporting citation verified at source, (b) a named falsifier — what observation would show the constraint is wrong, (c) survival of the §15 falsification pass. Until all three hold, an R-L identifier may be cited as *a candidate under audit* and in no stronger form.

The `L` in the `R-L*` identifiers is retained only for continuity of reference. It does not read as "law".

### R-L1 · The session is the primary quality unit

A locally correct sentence can still produce a bad collaboration. Evaluate the trajectory: whether MAIA understood, listened, preserved useful tension, reduced effort, and helped the Work move.

### R-L2 · The writer chooses both the developmental act and the scale

`Read`, `Discuss`, `Edit`, and `Develop` carry different intervention rights. Scope — selection, section, chapter, part, whole, custom range — is independent of lens.

### R-L3 · Dialogue precedes developmental certainty where author intent matters

When an observation's developmental meaning depends on whether something was deliberate, ask rather than infer. The writer's answer changes the reading.

### R-L4 · Update ≠ capitulate

A writer clarification should update MAIA's understanding without forcing automatic agreement. After clarification, test whether the grounded observation survives in an altered form when evidence still supports it.

### R-L5 · Specific evidence before recommendation

Feedback should show the writer what MAIA actually encountered in the prose before proposing a change. `I see this here` precedes `we could try this`.

### R-L6 · Avoid comment overload, but do not hide selection

Start with a manageable number of lawful observations. Ordering must have a legible basis; the writer can always ask **What else did you notice?** Screening and prioritization remain different powers.

### R-L7 · Generated prose is a commissioned mode, not MAIA's default contribution

Planning, questioning, reader-response, and discussion preserve more ownership than AI drafting. When rewriting is requested, use reversible alternatives and preserve the original.

### R-L8 · Preserve the writer's linguistic identity

Voice preservation is an acceptance test. Do not treat smoother, more conventional, or more model-like prose as inherently better.

### R-L9 · MAIA should strengthen the writer's own internal reader

Success includes the writer becoming better able to recognize patterns, choices, reader effects, and revision possibilities without needing MAIA to make every judgment.

### R-L10 · Work understanding is cumulative; claims still re-ground in the Work

Prior section conversations, writer-stated intent, decisions, and Work-scoped context may orient MAIA. Whole-Work developmental claims still return to the current manuscript rather than treating prior MAIA interpretations as evidence.

### R-L11 · Manuscript structure is part of cognition

Sections, chapters, parts, and whole-Work relationships must survive retrieval. Flat character windows are an implementation fallback, not the ontology of a manuscript.

### R-L12 · Large context and hierarchical retrieval are complementary

Benchmark both. Whole-Work synthesis may use broad context for gestalt and structure-aware retrieval for evidence, counterexamples, and `show me` navigation.

### R-L13 · Selection is a separately evaluated capability

A model that notices 200 true things but raises the wrong three is not a good developmental reader. Test selection independently from detection and language quality.

### R-L14 · A good MAIA session may conclude that nothing needs changing

The system must not manufacture critique to justify its presence. `I see what you're doing, and I would leave this alone` is a valid and sometimes excellent result.

### R-L15 · Complexity belongs below the writer experience

The system may maintain provenance, scope, anchors, writer intent, temporal state, and evidence classes internally. The writer should experience a coherent conversation, not an ontology-management task.

---

# 7 · Model research — current candidates as of 2026-09-08

> ✅ **VENDOR PAGES READ IN PASS B — and the table below is MATERIALLY INCOMPLETE as written.** The context windows and headline prices verified, but this table omits OpenAI's long-context multiplier: **requests over 272K input tokens are billed at 2× input and 1.5× output for the full request.** Above that threshold the stated ordering **reverses** — GPT-5.6 Sol becomes effectively `$8/$30` against Opus 5's flat `$5/$25`, so "lower listed cost than Opus 5" is false in the whole-Work regime Phases 7–8 operate in. GPT-5.6 Sol's `$4/$20` is itself promotional. **Authoritative model census: Pass B §2.** Re-read vendor pricing when Strand G is actually armed; these figures are dated, not permanent.

Model specs are capability ceilings, not evidence of developmental-reading quality. **No model wins by spec sheet.**

| Model | Context | Max output | Public API input/output price | Why test |
|---|---:|---:|---:|---|
| **Claude Opus 5** | 1M tokens | 128K | $5 / $25 per MTok | Current MAIA candidate; strong long-context / professional-work positioning; existing G8 corpus |
| **GPT-5.6 Sol** | 1.05M | 128K | $4 / $20 per MTok | Stable flagship professional-work comparator; lower listed cost than Opus 5 |
| **GPT-6 Astra** | 1.05M | 128K | $10 / $50 per MTok | Highest-capability OpenAI comparator if access is available; expensive stretch condition |
| **Gemini 3.8 Flash** | 1,048,576 | 65,536 | $0.75 / $3.75 promotional through 2026 | Very inexpensive long-context comparator; useful to test whether session quality requires premium inference |

Official sources:
- OpenAI models: https://developers.openai.com/api/docs/models
- GPT-5.6 Sol: https://developers.openai.com/api/docs/models/gpt-5.6-sol
- Anthropic Opus 5: https://www.anthropic.com/news/claude-opus-5
- Anthropic long-context prompting: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables
- Gemini 3.8 Flash: https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash
- Gemini pricing: https://ai.google.dev/gemini-api/docs/pricing

### Important model-design note

Anthropic explicitly recommends long-context prompts ground responses in relevant quotations before the task; OpenAI's long-context guidance similarly recommends re-grounding in sections and fine details. Those vendor recommendations align with MAIA's existing anchor/evidence discipline, but they remain vendor guidance rather than independent research.

---

# 8 · First benchmark protocol — *Elemental Alchemy*

## 8.1 Why this Work

- published; no unpublished-member confidentiality risk in external-model comparison;
- the author is available to judge whether the reading understands the Work;
- manuscript already has real section/chapter structure and a large enough span to test whole-Work cognition;
- existing G8 evidence gives a known baseline for local noticing and current failure modes.

**Generalization warning**: one Work / one author is the correct starting case and the wrong universal corpus.

## 8.2 Blind model conditions

Run the same tasks with model identity hidden from the founder during judgment.

Minimum candidates:
1. Claude Opus 5
2. GPT-5.6 Sol
3. Gemini 3.8 Flash

Stretch candidate if access/cost is acceptable:
4. GPT-6 Astra

Do **not** tune each model independently before the first baseline. Start with the smallest shared product contract that preserves MAIA's constitutional boundaries; otherwise the comparison becomes a prompt-engineering contest.

## 8.3 Scope conditions

Every model must be tested at more than one scale:

1. **SECTION** — one real section in Write
2. **CHAPTER** — chapter-level discussion
3. **PART** — multi-chapter / part reading
4. **WHOLE WORK** — whole-manuscript developmental conversation
5. **ZOOM** — whole → chapter → section → passage → whole

The writer must be able to change scope during conversation without losing why the scope changed.

## 8.4 Session tasks

### Session S1 · Local understanding

Founder opens a section and says what feels difficult or what he is trying to do. MAIA reads, discusses, and may offer possibilities. No whole-Work report.

### Session S2 · Intention correction

MAIA raises a grounded observation. Founder clarifies intent in a way that changes its meaning.

**Falsifier**: MAIA either ignores the clarification or simply agrees away the observation when relevant evidence remains.

### Session S3 · Editing support

Founder asks for help with one passage. Compare whether suggestions preserve idiosyncratic voice, reduce effort, remain reversible, and avoid replacing the author's language with generic AI prose.

### Session S4 · Scope control

Move deliberately among selection, section, chapter, part, and whole. Test whether MAIA distinguishes `what I see here` from `what I see across the Work`.

### Session S5 · Development from accumulated understanding

After several local sessions, ask `How is the whole Work developing?`

Test whether prior author-stated intentions improve the reading **without being laundered into manuscript facts**.

### Session S6 · Show me

Ask MAIA to support a whole-Work claim with actual manuscript locations and then take the writer to the relevant local material.

### Session S7 · Nothing to fix

Use a passage the founder considers successful. Test whether MAIA can leave it alone rather than generating critique because critique is available.

## 8.5 Founder judgment — deliberately light

After each session:

- **Did MAIA make the writing easier?** yes / somewhat / no
- **Did she understand what I was trying to do?** yes / partly / no
- **Did she help me see something genuinely useful?** yes / somewhat / no
- **Did she preserve my voice?** yes / uncertain / no
- **Did she stay at the scope I asked for?** yes / mostly / no
- **Did she hear disagreement without just capitulating?** yes / uncertain / no
- **Would I want her beside me for the next section?** yes / no
- Optional: `What was especially useful or irritating?`

No family names, coordinates, screen terminology, or model identity are shown during judgment.

## 8.6 Instrumentation below the experience

Jarvis may record for research:

- turn count;
- latency and token cost;
- writer interruptions / corrections;
- accepted, modified, rejected, or ignored suggestions;
- how often the writer must explain the same intention twice;
- whether a grounded observation survived a clarification in revised form;
- whether MAIA crossed scope without invitation;
- whether MAIA generated prose when discussion would have sufficed;
- whether `show me` returned to current manuscript evidence;
- whether MAIA's prior understanding was corrected when the manuscript changed.

These are engineering measures. They are not shown as the writing experience unless the writer asks.

---

# 9 · Architecture hypothesis to test — not authorize

The research supports testing this shape:

```text
CURRENT WORK
  authored hierarchy: selection → section → chapter → part → whole
          +
WORK-SCOPED DEVELOPMENTAL UNDERSTANDING
  writer-stated intent · writer decisions · current standing · MAIA observations
  provenance preserved; permission / legibility governed elsewhere
          +
CURRENT COMMISSION
  lens + scope + requested degree of intervention
          ↓
MAIA DISCUSSION
  broad context for gestalt
  hierarchy-aware retrieval for evidence / counterexamples / navigation
          ↓
WRITE ↔ DEVELOP
  local work changes whole understanding
  whole understanding returns to local evidence
```

The research specifically argues against two simplistic architectures:

```text
whole manuscript → one giant analysis → report
```

and

```text
flat chunks → notices → summarize the notices → call it whole-Work understanding
```

The benchmark should determine the actual mixture of broad context, hierarchy, retrieval, and developmental memory.

---

# 10 · Explicit anti-patterns

1. **Report generator as the main experience.** It forces one-shot inference of intent and reduces the writer's ability to negotiate the reading.
2. **AI prose first.** Draft generation can improve apparent quality while reducing ownership and flattening voice.
3. **Flat chunk ontology.** Character windows may be useful for transport, but must not erase section/chapter/part relations.
4. **The perfect-comment fallacy.** Individually accurate feedback can still miss what matters most.
5. **Critique abundance as value.** More findings is not necessarily more help.
6. **Hidden prioritization.** If MAIA chooses what to raise first, the basis and remainder must remain legible.
7. **Pleasant capitulation.** Agreement after every writer correction is not listening; it is loss of independent reading.
8. **Memory as authority.** What MAIA remembers about prior discussion does not outrank the current Work.
9. **Voice normalization.** Polished-but-generic is a failure when it erases the writer's linguistic identity.
10. **Model selection by benchmark reputation.** Developmental companionship is a product-specific capability and must be tested directly.

---

# 11 · What the evidence supports now

The literature does **not** prove one canonical Writer's Studio UX, one best model, or one optimal memory system.

It does support the following direction strongly enough to justify a product benchmark:

> **dialogic rather than report-first · writer-controlled rather than AI-directed · phase-aware rather than one-mode · structure-aware rather than flat-chunked · evidence-grounded rather than impressionistic · voice-preserving rather than polish-seeking · session-evaluated rather than output-only**

That direction is unusually aligned with the architecture already emerging from the founder witness.

---

# 12 · Predeclared acceptance floor — FROZEN · **AMENDED 2026-09-08 (two layers)**

Ruled by founder act, 2026-09-08, **before any blind model result exists**.

**Amendment record.** This floor originally consisted of Layer A alone. Step 1's falsification pass (FQ-4) narrowed `the session is the primary quality unit` to the primary *collaboration-quality* unit, holding that session quality cannot waive voice, scope truth, provenance, artifact quality or writer authority — a narrowing since carried into the re-frozen Phase 0 statement 6. Layer A therefore measures collaboration quality and **cannot by itself establish that the Work remained sound.**

**Layer A is unchanged** — same seven questions, same thresholds, same wording. Layer B is **added alongside it**, not merged into it. This is a minimal amendment closing a discovered gap, not a redesign of a floor after seeing research.

```text
ACCEPTANCE FLOOR = A and B

  A. COLLABORATION QUALITY   the seven founder questions, thresholds unchanged
  B. WORK INTEGRITY          five independent hard gates
```

> ⏱ **TIMING CLAUSE — this amendment was made BEFORE any blind model result existed.** After the first blind result exists, **neither layer may be weakened, removed, reweighted, or reworded for that benchmark.**

---

## Layer A · Collaboration quality — UNCHANGED

The floor is **not** a composite score. It is the seven session questions, answered per mandatory condition, on **both** blind repeats.

```text
1. Did MAIA make writing easier?                         REQUIRED: YES
2. Did she understand what I was trying to do?           REQUIRED: YES
3. Did she help me see something genuinely useful?       REQUIRED: YES or SOMEWHAT
4. Did she preserve my voice?                            REQUIRED: YES
5. Did she stay at the scope I asked for?                REQUIRED: YES
6. When I disagreed or corrected her, did she hear me
   without merely capitulating?                          REQUIRED: YES
   (applies to the correction condition)
7. Would I want her beside me for the next section?      REQUIRED: YES
```

**One hard-gate miss on either repeat places that model/architecture below the production-quality floor for that condition.** This is deliberately demanding. "Pretty good AI writing feedback" is not the product.

## Layer B · Work integrity — independent hard gates

Layer A asks what the session was like. Layer B asks whether the Work survived it. **These are not tradeable against each other**: a delightful session cannot buy damaged authorship, and sound artifacts cannot excuse a session the writer would not repeat.

```text
B1. PROVENANCE
    MAIA-originated observation, suggestion or prose is never
    represented as writer-originated evidence or intention.

B2. SCOPE TRUTH
    No claim exceeds what MAIA actually read unless the limitation
    is made explicit.

B3. ARTIFACT INTEGRITY
    Any accepted edit remains reversible and does not introduce
    unsupported factual, structural, or attributional corruption.

B4. WRITER AUTHORITY
    No developmental suggestion, interpretation, memory, or edit
    acquires writer standing without a writer act.

B5. VOICE
    Founder question A4 remains a hard gate here. Quantitative
    drift enforcement stays reserved for the separately
    predeclared Phase-9 measures.
```

**One hard-gate miss in EITHER layer fails that condition.** No composite score across layers, and no trading a delightful session against damaged authorship or artifact quality.

B5 deliberately double-counts the voice question rather than relocating it: voice is both something the writer experiences in the session and something the Work either keeps or loses. Removing it from Layer A would have been a reweighting, which the timing clause forbids.

---

## Freeze terms

> **FROZEN: The floor may not be changed after any blind model result is revealed.**

A floor set once scores are visible is not a floor — it is the score, restated. Changing any threshold, wording, or required answer in **either layer** requires an explicit founder act recorded *before* the run it governs. This amendment is such an act; no blind result exists as of 2026-09-08.

---

# 13 · Exception-arming protocol — Strand G

The Strand G research exception is **AUTHORIZED but NOT ARMED**. The authorization does not itself permit a third-party model call.

An open authorization that nothing has claimed is a standing channel waiting for whoever walks through next — structurally the same defect as a migration becoming deployable merely by becoming canonical. The exception is therefore bound to a document, not to a decision.

**The exception becomes executable only when a committed protocol names all of:**

```text
- exact models / providers
- exact manuscript material authorized
- control manuscript and its rights basis
- exact prompts
- exact scopes / tasks
- randomization and blinding procedure
- two-repeat procedure
- seven-question scale and the frozen floor (§12)
- provider data handling / retention / training check
- what leaves Soullab and what explicitly may not
- result disposition
- start and end of authorization
```

If the provider data-handling condition cannot be established to the required standard, **that provider is excluded rather than assumed safe.**

**Expiration**: end of the registered bake-off run, or **2026-10-08 23:59 UTC**, whichever occurs first. Anything later requires another explicit founder act.

### Ruled disposition — preserved

```text
non-sovereign may win blind evaluation     YES
non-sovereign thereby becomes deployable   NO
sovereign below frozen floor               FEATURE HOLDS
persistent capability gap                  RECORDED FINDING
constitution reconsideration               separate founder act only
```

The bake-off selects the best developmental intelligence, **not** the production provider. If the winner is production-ineligible, its result becomes the performance target for the sovereign system. If the sovereign system cannot approach that target, that is an important negative finding, not an inconvenience to hide.

"Sovereign model wins regardless of score" is not an experiment. Scores stay open. What a non-sovereign model cannot win is custody of member Work.

---

# 14 · SEL-0 — next zero-cost falsifier · RECORDED, NOT RUN

**Status: SPECIFIED · NOT AUTHORIZED TO RUN BY THIS DOCUMENT.**

SEL-0 precedes S1 because it can change the architecture at zero provider cost and requires no exception.

### Question

> Among observations MAIA is actually *permitted* to bring into conversation, does she already know which ones are useful to raise first?

Detection and selection are distinct capabilities (§C1, R-L13). A one-section working session is small enough that selection barely bites, so Phase 2 can pass while selection is absent — and the failure then surfaces at Develop scope, at maximum accumulated cost.

### Candidate set

The **lawful surviving corpus only**. Observations already known to be constitutionally unlawful (F-7 absence-shaped Encounter language) are **excluded because they are ineligible, not because they ranked poorly.** A test of selection quality must not be contaminated by material that was never permitted to be raised at all.

Observations are rendered in **plain member-facing language**, with families, windows, hashes and screen metadata removed. The test is selection, not tolerance for instrumentation.

### Procedure

```text
MAIA       ranks the lawful corpus by what she would bring
           into conversation first
KELLY      independently chooses the five observations that would
           have been most useful to encounter first
MEASURE    top-5 exact overlap
           founder top-5 contained in MAIA top-10
           ordering disagreement
```

### Predeclared interpretation

```text
strong overlap
  -> selection ability may already be latent;
     investigate surfacing / interaction before building a selector

weak overlap
  -> truthful detection does not imply useful selection;
     selection is a separate capability requiring design and calibration
```

> **OPEN — MUST BE PREDECLARED BEFORE THE RUN**: the numerical threshold separating "strong" from "weak" overlap. It belongs in the SEL-0 instrument before it runs, never chosen after seeing the result.

---

# 15 · Falsification quota — schema

The quota is **five credible findings that challenge, qualify, or contradict a current Writer's Studio assumption**. Five soft caveats do not satisfy it.

Each contrary finding must state all four rows:

```text
CURRENT ASSUMPTION   what Writer's Studio currently believes
CONTRARY EVIDENCE    what the source actually found
THREAT               why that challenges our assumption
SURVIVAL CONDITION   what would have to be true for our assumption
                     to remain defensible
```

Each finding must attack a **named frozen Phase 0 assumption**, not a generic bucket. A pass that returns five findings none of which touches a frozen assumption has not met the quota.

**Until the quota is met, this document may not claim convergence between the literature and the current design direction.** A sweep that confirms the design it was commissioned to inform is the least informative available result and the most likely search artifact.

---

# 16 · Register — **SUPERSEDED IN PLACE 2026-09-08**

> ⛔ **THIS REGISTER NO LONGER STATES CURRENT EVIDENCE STATUS.** It recorded the Pass A position, when nothing had been read at source. Pass B (`98fce0cdd`) read twenty primary and official sources. **The authoritative ledger is `WS2-DEVELOPMENTAL_INTELLIGENCE_AUDIT_PASS_B_2026-09-08.md` §1 (citations) and §2 (model census).** It is deliberately NOT duplicated here — roadmap §2 and §4 diverged because a derived copy of a list outlived its source, and the evidence set is the last place to repeat that.

**Current dispositions, by reference only:**

```text
usable evidence set        Pass B §1 and §2 — that document governs
B5                         REMOVED from usable evidence (close item 1)
D2                         REMOVED from usable evidence (close item 2)
open question              ACCESS CEILING of abstract-located rows
                           — Pass B §8.2, proposed, not ruled
```

**Historical Pass A record, kept as the before-state.** Every row below was written when no source had been read. Two of its judgements were overturned by Pass B and are marked; the rest were superseded by primary reads.

| § | Pass A claim | Pass A status | Pass B outcome |
|---|---|---|---|
| A3 | 2024 *Learning and Instruction* dialogic-writing study | UNVERIFIED | read — see Pass B §1 |
| B1 | 109 HCI papers · 15 writers | UNVERIFIED | read — see Pass B §1 |
| B2 | 253 participants | UNVERIFIED | read — see Pass B §1 |
| B4 | 62 co-creativity papers | UNVERIFIED | read — see Pass B §1 |
| B5 | 2026 ACM C&C co-design study | **STRUCTURALLY UNSUPPORTED** | ⚠️ **overturned then removed** — the paper exists (`10.1145/3803784.3807569`); the defect was the citation target, not the finding. Primary still unread → REMOVED. |
| C1 | 1,300 stories | UNVERIFIED | read — see Pass B §1 |
| D1 | >880,000 texts; 21–50% variance reduction | UNVERIFIED — **two conflicting DOIs** | ⚠️ **overturned** — not a conflict. `-02550-0` is the research article; `-02549-7` is separate accompanying coverage. |
| D2 | 19 studies / 61 effect sizes | UNVERIFIED | REMOVED — final article open access since 2026-08-31, PDF not read |
| §7 | context windows, prices, product names | UNVERIFIED | read at vendor pages — see Pass B §2, and §7 above as corrected |

Two structural cautions, retained because both proved out:

1. **A finding that enumerates our own feature list is the one to check hardest.** B5 was exactly that shape — and while the paper turned out real, it is the one source that could not clear the read standard.
2. **Every link in the original sweep carried `utm_source=chatgpt.com`.** Pass B replaced that provenance for twenty sources.

---

# 17 · Standing

```text
RESEARCH CORPUS                    PASS B VERIFIED except where marked
CITATION AUDIT                     PASS A + PASS B RUN · 20 primary/official reads
                                   authoritative ledger = Pass B §1, §2
B5 · D2                            REMOVED from usable evidence (close items 1, 2)
FALSIFICATION QUOTA (5)            5 / 5 MET · convergence STILL not claimed
                                   (quota met lifts the bar; it does not establish
                                    convergence)
PHASE 0                            RE-FROZEN — WS2-PHASE0_RE-FROZEN_2026-09-08.md
CANDIDATE CONSTRAINTS R-L1..R-L15  STILL NOT ADOPTED · each needs its own source,
                                   falsifier and reconciliation (close item 5)
MODEL SPEC CENSUS                  VENDOR PAGES READ · §7 table materially
                                   incomplete · see Pass B §2
ACCEPTANCE FLOOR (§12)             PREDECLARED · FROZEN · AMENDED 2026-09-08 (A+B)
STRAND G EXCEPTION                 AUTHORIZED · NOT ARMED · expires 2026-10-08
SEL-0 (§14)                        SPECIFIED · NOT RUN · threshold NOT SET
ELEMENTAL ALCHEMY BENCHMARK        SPECIFIED · NOT YET RUN
MODEL WINNER                       NONE
ARCHITECTURE WINNER                NONE
JARVIS SESSION CALIBRATION         TARGET REVISED: working session
BUILD                              NOT AUTHORIZED BY THIS DOCUMENT
PR / MERGE / DEPLOY                NOT AUTHORIZED
```

## Next empirical act

**SEL-0 (§14) precedes S1.** It costs nothing, needs no provider exception, and can change the architecture before anything is built on it.

Then run **S1–S2 first**, not the whole seven-session suite: one real section, then one intentional author correction. If the experience is not clearly better than writing alone, stop and repair before spending on whole-Work benchmarks.

Sequencing for the whole lane is recorded separately in `WS2-DEVELOPMENTAL_INTELLIGENCE_ROADMAP_2026-09-08.md`. That roadmap is a recorded sequence, not a build authorization, and it does not license anything this document withholds.
