# HCI/CSCW evidence on AI writing assistants and co-writing (2019–2026)

Notes compiled 2026-11-09. Evidence strength key: **STRONG** = randomized/controlled, N≥~100, or replicated; **MODERATE** = controlled but small N, or large qualitative/systematic review; **WEAK** = small qualitative probe, interview-only, or preprint not yet peer reviewed. Items marked *(not re-fetched this session)* are cited from known canonical records whose abstracts were not reopened during this research pass; the report writer should treat their specifics with more caution.

Product-constraint flags used below: **[C1]** work central on screen · **[C2]** AI does not write the writer's prose unasked · **[C3]** writer keeps authority over every change · **[C4]** no ranking/grading of the writer.

---

## 1. Proactive vs reactive suggestions, timing/interruption, mixed-initiative design

### Takeaway
Proactivity is not inherently bad, but how it's presented matters as much as when it arrives. Writers accept system initiative when it is peripheral, easy to ignore, fades on its own and is framed as a non-directive question. Pause or sentence-end triggers are only *candidate* moments, never proof that help is needed. Higher frequency of unsolicited suggestions harms experience (evidence from adjacent domains).

### Cited Findings
- Mixed-initiative interaction (both user and system may take initiative toward a shared goal) is the foundational frame. Timing is identified as key to system initiative. Recent proactive-AI papers build directly on Horvitz (1999) and Bailey et al. (2001) on interruption cost. — [Zhang et al., "Designing Proactive Thought Partners for Writing," arXiv 2609.01588, Sep 2026 (related work §2.2)](https://arxiv.org/html/2609.01588v1)
- Horvitz's original principles: weigh the expected value of acting against the costs of interrupting, consider uncertainty about user goals, allow efficient invocation and dismissal, and support graceful degradation when the system misjudges. — [Horvitz, "Principles of Mixed-Initiative User Interfaces," CHI 1999](https://doi.org/10.1145/302979.303030) *(not re-fetched this session)*
- **One-week deployment, N=16 (WEAK–MODERATE; preprint, Google DeepMind/Cornell):** writers configured "thought partners" in advance by choosing role and proactivity level, and used suggestions both for idea generation and for **self-monitoring**. — [Zhang et al. 2026, abstract](https://arxiv.org/abs/2609.01588)
- The same study treats observable events (long pause, sentence end, text selection) as *candidate* moments only. "A pause might indicate writer's block, focused reflection, or a moment when the writer already knows what to write next." The design implication (DI3) is that triggers should start a contextual assessment, not fire an intervention directly. — [Zhang et al. 2026 §7.2](https://arxiv.org/html/2609.01588v1)
- KF9: suggestions felt non-intrusive when they were **peripheral** (a right-side panel, small floating tags that open only when inspected) and **fading** (automatically dismissed after inaction). One participant called this "perfect because when I didn't want them, it kind of disappeared." — [Zhang et al. 2026 §6.4](https://arxiv.org/html/2609.01588v1)
- KF10 / DI9: **acknowledgments** that showed the system's reading of local context built trust, and **non-directive suggestions (questions) preserved sense of control**. Interventions should be "lightweight bids for attention that can recede." — [Zhang et al. 2026 §7.4](https://arxiv.org/html/2609.01588v1)
- Factorial vignette study, N=50 knowledge workers drafting email (WEAK, preprint): users' **predicted** preferences for AI assistance diverged from their actual choices. The authors cite interruption research showing task structure and breakpoints predict disruption better than urgency. — [arXiv 2601.04461, "Users Mispredict Their Own Preferences for AI Writing Assistance," Jan 2026](https://arxiv.org/html/2601.04461v1)
- In an RCT on proactive *programming* assistants, raising suggestion frequency hurt user experience. This is an adjacent domain and only analogical for writing. — [arXiv 2410.04596](https://arxiv.org/html/2410.04596v2) (as summarized in search results; full text not reviewed)

### Inferences
- **[C1]** The evidence favours a side or margin channel over overlays on the writer's text. Peripheral, collapsible, fading presence is the pattern most associated with "available but not intrusive."
- **[C3]** "Present but not demanding" appears achievable when initiative is framed as an offer the writer can bypass *without explicit dismissal*. Requiring the writer to dismiss each suggestion is itself an imposition.
- A mentor-like presence could take initiative mainly through *acknowledgment* ("I see you're working on X") and *questions*, rather than proposed text. The 2026 probe links exactly these two forms to trust and to felt control.
- Self-reported preferences are unreliable (2601.04461), so preference toggles alone should not be treated as evidence of good timing. Behavioural witness is needed.

### Gaps
- I found no large controlled study of interruption *timing* specifically for long-form creative or editorial writing. The timing evidence is a 16-person probe plus adjacent domains.
- I did not locate the Lehmann et al. 2026, Pu et al. 2025 or Yin et al. 2026 (Wizard-of-Oz proactive writing) papers cited inside Zhang et al. They are worth a follow-up.

---

## 2. What preserves ownership, agency and voice, and what increases over-reliance

### Takeaway
Ownership falls as the share and length of AI-generated text rises. It is protected by the writer having the final say, by suggestions the writer must consciously accept, reject or modify (never direct insertion), and by the writer controlling the parts they consider their primary contribution. People also under-declare AI help even when they feel they don't own the text (the "AI ghostwriter effect"). Opinionated or instruction-tuned models shift writers' views and homogenize output, mostly without the writers noticing.

### Cited Findings
**Ownership scales with how much the writer wrote**
- CoAuthor dataset: 63 writers, 4 GPT-3 instances, 1,445 sessions (STRONG as a dataset; the analysis is correlational). — [Lee, Liang & Yang, CHI 2022, arXiv 2201.06796](https://arxiv.org/abs/2201.06796)
- In CoAuthor, self-reported ownership correlated directly with the proportion of user-written vs AI-generated text. — [as summarized by Reza et al. 2025 §2.3](https://arxiv.org/html/2504.12488v1)
- **Within-subjects field experiment, N=131, Latin square (STRONG):** next-paragraph suggestions (high scaffolding) raised quality and productivity, especially for non-regular writers and less tech-savvy users. Next-sentence suggestions gave no significant gain, so the effect was U-shaped. High scaffolding caused a **moderate decrease in text ownership and satisfaction**, with no significant added cognitive burden. — [Dhillon et al., "Shaping Human-AI Collaboration: Varied Scaffolding Levels in Co-writing with Language Models," CHI 2024, arXiv 2402.11723](https://arxiv.org/abs/2402.11723)
- Across studies, suggestion length is inversely associated with perceived ownership. Sentence-level suggestions promote original content, while paragraph-level suggestions improve efficiency (Fu et al. 2023). — [Reza et al. 2025 §5.3.1, §2.2](https://arxiv.org/html/2504.12488v1)
- Autocomplete suggestions can threaten autonomy (Robertson et al. 2021), and more AI support corresponded to lower perceived control (Draxler et al. 2024). — [Reza et al. 2025 §2.3](https://arxiv.org/html/2504.12488v1)

**AI Ghostwriter Effect**
- Users of AI-written text do not perceive ownership, yet usually do not declare the AI as author. Participants attributed ownership more readily to a supposed *human* ghostwriter than to an AI one. Personalization did not change the effect. **Greater control over the model increased sense of ownership** (MODERATE; controlled online experiments). — [Draxler et al., "The AI Ghostwriter Effect," ACM TOCHI 2024, DOI 10.1145/3637875; arXiv 2303.03283](https://arxiv.org/abs/2303.03283); [LMU press release](https://www.lmu.de/en/newsroom/news-overview/news/who-wrote-it-the-ai-ghostwriter-effect-80ece661.html)

**Writers' values decide what they will delegate**
- Interviews with storywriters (DIS 2022, Honourable Mention): writers' *reasons for writing* determine how much AI involvement they want. Those who value emotional expression, or who are confident and distrust AI, want to keep control. Professionals were more willing to trade control at the sentence level to focus on high-level planning, while hobbyists who enjoy the process were less suited to AI writing for them (MODERATE, qualitative). — [Biermann, Ma & Yoon, "From Tool to Companion: Storywriters Want AI Writers to Respect Their Personal Values and Writing Strategies," DIS 2022 — UBC news](https://science.ubc.ca/news/storytellers-want-ai-writers-respect-their-personal-values-and-writing-strategies); [UBC CS news](https://www.cs.ubc.ca/news/2022/06/dis-conference-paper-ubc-shows-what-writers-want-or-dont-want-ai)
- Biermann et al. found that writers emphasizing expressive and emotional value insisted on direct control over *translation* (turning ideas into sentences), which they treated as essential to writerly identity. — [Reza et al. 2025 §2.3](https://arxiv.org/html/2504.12488v1)
- **Systematic review of 109 papers (2018–2024) plus interviews with 15 writers (MODERATE, PACMHCI/CSCW 2025):** writers value ownership most over what they see as their *primary contribution* and are more open to delegating tangential tasks. Fiction and personal writers are **form-centric** (voice, style, flow). Academic and non-fiction writers are **content-centric**. Existing research systems give *more* AI support in translating and reviewing than form-centric writers want. — [Reza et al., "Co-Writing with AI, on Human Terms," arXiv 2504.12488 §4.2.2, §5.2.1](https://arxiv.org/html/2504.12488v1)
- In the same interviews, suggestions the writer can accept, reject or modify were described as a **"non-negotiable aspect of preserving their sense of agency"**. Direct insertion or overwriting in the writer's space "encroaches on their sense of ownership." Writers stressed having the "final say" and described a conscious "moment of decision" as the place where ownership is kept. — [Reza et al. 2025 §4.2.3](https://arxiv.org/html/2504.12488v1)
- Ownership demand also varies with time pressure, importance of the piece, the writer's confidence and their trust in the AI. — [Reza et al. 2025 §4.2.1/§6.1.2](https://arxiv.org/html/2504.12488v1)

**Influence, homogenization and over-reliance**
- **Online experiment, N≈1,506 writers + 500 judges (STRONG):** a GPT-3 assistant configured to favour one side made participants about twice as likely to write paragraphs agreeing with it, and shifted their *later-reported attitudes* ("latent persuasion"). Most participants did not notice the bias. — [Jakesch et al., "Co-Writing with Opinionated Language Models Affects Users' Views," CHI 2023 (Honorable Mention), arXiv 2302.00560](https://arxiv.org/abs/2302.00560); [Cornell coverage](https://cis.cornell.edu/node/2584); [AIhub](https://aihub.org/2023/05/23/writing-with-ai-help-can-shift-your-opinions/)
- **Controlled experiment, 38 Upwork writers, 100 essays per condition on 10 topics (MODERATE–STRONG, ICLR 2024):** writing with InstructGPT (feedback-tuned) significantly *reduced* lexical and content diversity across essays. Base GPT-3 did not. The reduction came mainly from model-contributed text, and **user-contributed text remained unaffected**. — [Padmakumar & He, "Does Writing with Language Models Reduce Content Diversity?" ICLR 2024](https://proceedings.iclr.cc/paper_files/paper/2024/hash/02dec8877fb7c6aa9a79f81661baca7c-Abstract-Conference.html); [arXiv 2309.05196](https://arxiv.org/abs/2309.05196v3)
- **Pre-registered experiment, ~300 writers (STRONG, Science Advances, Jul 2024):** GPT-4 story ideas made stories rate as more creative, better written and more enjoyable, with most of the gain going to less creative writers and the most creative benefiting least. AI-assisted stories were **more similar to each other**, which the authors frame as a social dilemma: individuals gain while collective diversity narrows. — [Doshi & Hauser, Science Advances 10(28) eadn5290](https://pmc.ncbi.nlm.nih.gov/articles/PMC11244532); [Exeter news](https://news.exeter.ac.uk/?p=13749)
- Chat-based interfaces "obscure referential context and risk amplifying automation bias and overreliance". AI comments anchored to text spans produced more targeted revisions and stronger control and ownership than a chat interface (controlled user study; N not confirmed; preprint). — [Lou, Crowley, Dodson & Yoon, "AnchoredAI," arXiv 2509.16128, Sep 2025](https://arxiv.org/abs/2509.16128)

### Inferences
- **[C2] is strongly supported.** The most consistent finding across CoAuthor, Dhillon, Draxler, Reza and Maier (below) is that AI-generated prose volume erodes ownership. Padmakumar & He add that homogenization lives in the *model's* text, not the writer's, so withholding unrequested prose also protects voice diversity.
- **[C3] is strongly supported.** "Final say" and the conscious accept/reject/modify decision are the mechanisms writers name as preserving ownership. Direct insertion is the anti-pattern.
- Jakesch implies a mentor that offers *opinions* about content (e.g. what the argument should be) can covertly steer the writer. A wise editor's restraint about substantive positions is therefore a safety property, not just a matter of style.
- For a fiction or memoir-heavy population (form-centric), the evidence says to be most restrained in translation and revision of *their sentences* and most available for planning, reflection and noticing.
- Doshi & Hauser's "less creative writers gain most" result could tempt a system to tier help by ability. **[C4]** Any such tiering would need the writer to declare it rather than the system assessing them.

### Gaps
- No longitudinal (months-long) studies of ownership or skill atrophy with sustained AI writing help surfaced in this pass.
- Draxler's exact sample sizes and AnchoredAI's N were not confirmed.

---

## 3. AI that asks questions or gives feedback vs AI that generates text

### Takeaway
The strongest new evidence (a CHI 2026 RCT, N=486, replicated with N=640) shows that a reflective, human-led mode, where the AI asks questions or prompts elaboration, improves idea quality while **preserving diversity and ownership**. A model-led rewriting mode improves quality more but reduces both. A substantial design tradition (writing-centre-style non-directive feedback, anchored comments, structured guidance) converges on feedback-giver rather than text-generator.

### Cited Findings
- **RCT N=486, independently validated in a second context with N=640 (STRONG, CHI '26):** two reflective, human-led modes (the LLM elicits elaboration via suggestions or via questions) were compared with a proactive model-led mode (the LLM rewrites ideas). The model-led mode "substantially improved idea quality but reduced idea diversity and users' perceived idea ownership". The reflective mode "also improved idea quality, yet while preserving diversity and ownership." The authors recommend designing AI "as reflective thought partners." — [Maier, Schneider & Feuerriegel, "Partnering with Generative AI: Experimental Evaluation of Human-Led and Model-Led Interaction," arXiv 2510.23324 (CHI'26)](https://arxiv.org/abs/2510.23324)
- The 109-paper review names a "**Structured Guidance**" strategy, in which the AI acts as coach or tutor and preserves autonomy. Its components are pattern mapping in the writer's own content, scaffolded feedback that "encourag[es] the user to perform their own revisions," and **workspace control** that physically separates AI and user workspaces so users "maintain control over textual changes." It contrasts with "Active Co-writing" (direct generation), which is the plurality strategy in research even for form-centric writers it doesn't suit. — [Reza et al. 2025 §3.2.2, §5.2.1](https://arxiv.org/html/2504.12488v1)
- Writor (CHI '26 prototype) deliberately restrains copyable text output in favour of non-directive, writing-centre-style feedback. It was grounded in tutor interviews and reviewed by 30 domain experts (WEAK–MODERATE; expert review rather than a writer outcome study). — [search summary; Liu et al. PDF](https://yijunliu523.github.io/file/writor.pdf)
- Non-directive questioning framing preserved sense of control in a proactive writing probe (N=16). — [Zhang et al. 2026 §6.4 KF10](https://arxiv.org/html/2609.01588v1)
- Sparks (science writing, DIS 2022) generated "sparks", short sentences meant to inspire rather than be inserted. Writers used them as material for their own thinking, not as copy *(not re-fetched this session)*. — [Gero, Liu & Chilton, "Sparks: Inspiration for Science Writing using Language Models," DIS 2022, arXiv 2110.07640](https://arxiv.org/abs/2110.07640)

### Inferences
- **[C2], [C3]:** the question-asking / feedback-giver posture is now the best-evidenced design for preserving ownership *without* giving up quality gains. It is the closest empirical analogue to "a present, wise editor or mentor."
- The Maier RCT shows a trade: model-led help gives the larger quality boost. A mentor product accepts a somewhat smaller immediate quality gain in exchange for ownership and diversity, and the evidence suggests that trade is real, not imaginary.
- Separate workspaces ("workspace control") align with **[C1]**: the manuscript stays the writer's surface and the mentor speaks beside it.

### Gaps
- I found no studies measuring whether reflective-question AI improves *long-term writing skill* compared with generation.
- There is no direct evidence on whether question-asking can feel *patronizing* or Socratic-tedious to experienced writers, which is a plausible risk.

---

## 4. Conversational interfaces vs direct manipulation / inline suggestions

### Takeaway
The evidence favours **anchored, in-context** feedback over free-floating chat, because chat loses the referential link to the text and invites over-reliance. It also favours **separated** suggestion surfaces over direct in-text insertion, because separation keeps the writer as decision-maker. Conversation is most valuable as an optional follow-up on a specific, anchored observation.

### Cited Findings
- AnchoredAI vs a chat-based LLM: anchoring comments to text spans led to more targeted revisions and stronger control and ownership. Chat interfaces "obscure referential context and risk amplifying automation bias and overreliance" (controlled study, preprint). — [Lou et al., arXiv 2509.16128](https://arxiv.org/abs/2509.16128)
- Suggestion placement: systems that place suggestions in the user's workspace (Chen 2019; Buschek 2021; Bhat 2023) feel integrated but blur contribution boundaries. Separated interfaces (Goodman 2022; Lehmann 2022; Dhillon 2024) create "a deliberate boundary that reinforces the writer's role as decision-maker." Visual differentiation of AI text is a recurring design response. — [Reza et al. 2025 §5.3.1](https://arxiv.org/html/2504.12488v1)
- Writers said a "pop-up window" of suggestions would not change their ownership, but AI "inserting values in a more direct way" would. — [Reza et al. 2025 §4.2.3, participant W7](https://arxiv.org/html/2504.12488v1)
- The proactive probe let writers "inspect suggestions and optionally continue a dialogue" (DI6: low-commitment ways to use suggestions as material for thinking without immediately incorporating AI text). — [Zhang et al. 2026 §7](https://arxiv.org/html/2609.01588v1)
- Repurposing static LLM feedback as conversation starters lets writers seek clarification and examples (preprint; details not reviewed). — [search summary: arXiv 2504.08726 / 2504.08687](https://arxiv.org/pdf/2504.08726v1.pdf)

### Inferences
- A good fit for **[C1]/[C3]** is an anchored margin presence: observations pinned to passages, with optional conversation *about* that passage. A chat pane disconnected from the manuscript, or inline ghost text, fits less well.
- Any proposed change should appear as a visibly differentiated proposal the writer adopts, never an in-place edit.

### Gaps
- I found no head-to-head RCT of chat vs inline vs margin for *long-form manuscripts*. Most comparisons involve short essays or idea tasks.

---

## 5. Presence, trust and relational feel

### Takeaway
Direct evidence on "presence" in writing AI is thin. The closest findings are these: writers choose between human and computer help according to the *social* role of the helper. Trust is built when the AI shows it has understood the context (acknowledgment). Writers in some studies explicitly frame what they want as "companion" rather than "tool," but on *their* values and strategies.

### Cited Findings
- Interviews with 20 creative writers: whether writers seek help from a computer rather than a peer or mentor depends on (1) the kind of help wanted, (2) how they view potential helpers, and (3) their values. Some help is sought from computers precisely because computers carry no social cost or judgment (MODERATE, qualitative, CHI 2023). — [Gero, Long & Chilton, "Social Dynamics of AI Support in Creative Writing," CHI 2023, DOI 10.1145/3544548.3580782](https://iamtaolong.github.io/assets/documents/2023_SocialDynamics_CHI.pdf); [aminer summary](https://aminer.org/pub/644a34be582c1376bbccc5c4/social-dynamics-of-human-ai-collaboration-in-creative-writing)
- "From Tool to Companion": storywriters want AI to respect their *personal values and writing strategies*. Companionship is conditional on that respect. — [Biermann et al. DIS 2022, UBC](https://science.ubc.ca/news/storytellers-want-ai-writers-respect-their-personal-values-and-writing-strategies)
- Acknowledgments that make the system's understanding of the local context visible "helped establish trust." — [Zhang et al. 2026 §7.4](https://arxiv.org/html/2609.01588v1)
- Dramatron, a study of 15 theatre and film professionals co-writing scripts with open-ended interviews (13 completed the feedback form), reported both usefulness and concerns about the system's role in creative work (MODERATE, qualitative). — [Mirowski et al., "Co-Writing Screenplays and Theatre Scripts with Language Models," arXiv 2209.14958 (CHI 2023)](https://ar5iv.labs.arxiv.org/html/2209.14958). Venue year is inconsistent across sources (DeepMind lists CHI 2022, others CHI '23).
- Wordcraft writers workshop: professional writers using an LLM editor found it most useful for ideation and least for producing text in *their voice*, and noted the model's tendency toward clichéd or generic output *(not re-fetched this session; verify before quoting)*. — [Ippolito et al., "Creative Writing with an AI-Powered Writing Assistant: Perspectives from Professional Writers," arXiv 2211.05030, 2022](https://arxiv.org/abs/2211.05030)

### Inferences
- **[C4]** Gero et al.'s point that computers are sometimes chosen because they *don't* judge suggests that any ranking or grading of the writer would destroy exactly the safety that makes AI help attractive in the first place.
- The relational feel of a mentor seems to come from **demonstrated understanding** (acknowledgment), **respect for the writer's stated values and process**, and **restraint**, rather than from warmth cues. This is inference. No study measured "presence" directly in a writing context.
- Jakesch's latent-persuasion result is the counterweight: a trusted, relational AI has *more* influence, so restraint about content opinions matters more as trust grows.

### Gaps
- I found **no peer-reviewed study that measures "presence" or relational feel** for writing assistants specifically. The evidence here is interview-based or comes from adjacent constructs (trust, acknowledgment).
- I found no studies on anthropomorphic and relational cues versus tool framing in writing tools. The broader HCI anthropomorphism and over-trust literature was out of scope for this pass.
- I found no evidence on dependency or attachment to a writing mentor-AI over long periods.
