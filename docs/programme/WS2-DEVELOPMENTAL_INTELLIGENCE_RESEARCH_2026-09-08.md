# Writer's Studio — Developmental Intelligence Research · 2026-09-08

**Lane**: JARVIS — WRITER'S STUDIO DEVELOPMENTAL INTELLIGENCE RESEARCH
**Status**: RESEARCH COMPLETE FOR DESIGN INPUT · **NO BUILD AUTHORIZATION**
**Benchmark Work**: *Elemental Alchemy* — published Work, founder-authorized for calibration and model comparison.

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

# 6 · Candidate design laws derived from the research

These are **candidate design laws**, not ratified canon.

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

# 12 · Standing

```text
RESEARCH CORPUS                    COMPLETE for first design pass
CANDIDATE DESIGN LAWS R-L1..R-L15 RESEARCH-DERIVED · NOT RATIFIED
MODEL SPEC CENSUS                  CURRENT 2026-09-08
ELEMENTAL ALCHEMY BENCHMARK        SPECIFIED · NOT YET RUN
MODEL WINNER                       NONE
ARCHITECTURE WINNER                NONE
JARVIS SESSION CALIBRATION         TARGET REVISED: working session
BUILD                              NOT AUTHORIZED BY THIS DOCUMENT
PR / MERGE / DEPLOY                NOT AUTHORIZED
```

## Next empirical act

Run **S1–S2 first**, not the whole seven-session suite: one real section, then one intentional author correction. If the experience is not clearly better than writing alone, stop and repair before spending on whole-Work benchmarks.
