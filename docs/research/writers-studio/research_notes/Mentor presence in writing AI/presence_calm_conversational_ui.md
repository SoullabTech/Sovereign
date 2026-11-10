# Presence, calm and low-control conversational interfaces (for a manuscript-first writing environment with an accompanying AI guide)

Scope note: research notes only. Sources were fetched 2026-11-09 unless marked "search summary only". Product constraints I tested each source against: the writer's work fills the screen; the AI writes no prose unless asked; the writer authorizes every change; no grading.

## 1. Calm technology: periphery vs centre, ambient awareness

### Takeaway
Calm technology is not "less technology". It is technology that moves easily between the periphery and the centre of attention and then goes back. Its purpose is *locatedness*: you stay aware of what is happening without being pulled out of your task. For a writing room, the guide should live in the periphery by default, come to the centre only when the writer turns to it, and then step back.

### Cited Findings
- Weiser & Brown (Xerox PARC, 1996): "Calm technology engages both the center and the periphery of our attention, and in fact moves back and forth between the two." — [The Coming Age of Calm Technology](https://calmtech.com/papers/coming-age-calm-technology)
- Their three signs: (1) technologies "encalm as they empower our periphery", either by moving easily from centre to periphery and back, or by bringing more detail into the periphery *without increasing information overload*; (2) "the result of calm technology is to put us at home, in a familiar place"; the connection to the world through the periphery is called "locatedness", "the fundamental gift that the periphery gives us". — [Weiser & Brown](https://calmtech.com/papers/coming-age-calm-technology)
- Canonical example, the Dangling String: a string on a motor that twitches with network traffic. "At first it creates a new center of attention just by being unique. But this center soon becomes peripheral". Being both visible and audible adds cues for "peripheral attunement". — [Weiser & Brown](https://calmtech.com/papers/coming-age-calm-technology)
- Amber Case's principles (calmtech.com), which apply directly here:
  - Technology "should require the smallest possible amount of attention".
  - It "can communicate, but doesn't need to speak".
  - It should "communicate information without taking the user out of their environment or task".
  - "Give people what they need to solve their problem, and nothing more."
  - It should "move easily from the periphery of our attention, to the center, and back".
  - "Machines shouldn't act like humans. Humans shouldn't act like machines."
  - "Technology should work even when it fails… Does it default to a usable state or does it break down completely?"
  - "The right amount of technology is the minimum needed."
  - "Slowly introduce features so that people have time to get accustomed."
  — [Principles of Calm Technology](https://calmtech.com/)
- Calm examples: the tea kettle is "off or quiet the rest of the time… until it sings". The inner office window shows whether someone is busy "without the need to interrupt them". — [calmtech.com](https://calmtech.com/)
- Geoffrey Litt (2025) revives Mark Weiser's 1992 objection to the "copilot" metaphor. In Weiser's example, the agentic answer to collision avoidance is a voice that yells "collision, go right and down!". The calm answer is to design the cockpit so that the pilot is "naturally aware of their surroundings", like a head-up display (HUD). Spellcheck is the everyday HUD: "spellcheck isn't designed as a 'virtual collaborator' talking to you about your spelling… You now have a new sense you didn't have before." — [Litt, Enough AI copilots! We need AI HUDs](https://www.geoffreylitt.com/2025/07/27/enough-ai-copilots-we-need-ai-huds)
- Litt's tradeoff: routine, predictable work may suit a virtual assistant. "When you're shooting for extraordinary outcomes, perhaps the best bet is to equip human experts with new superpowers." He credits the spellcheck example to Jeffrey Heer's paper *Agency plus Automation* (PNAS 2019). — [Litt 2025](https://www.geoffreylitt.com/2025/07/27/enough-ai-copilots-we-need-ai-huds)

### Inferences
- Pattern: **margin marks, not messages.** A faint mark in the margin next to a passage where the guide has noticed something is a HUD-style signal. A chat bubble that interrupts is copilot-style. Opening the mark brings it to the centre; closing it sends it back.
- Pattern: **a calm presence indicator.** One unobtrusive sign, like the inner office window, that says the guide is here, reading or idle. No badges, no counts that demand action.
- Pattern: **fail to a usable state.** If the AI is down, the manuscript still opens and saves normally. The guide's absence is stated plainly, and the room does not break.
- "Machines shouldn't act like humans" warns against simulated intimacy. Presence should come from attention to the actual work, not from performing personality.

### Gaps
- I found no controlled study that measures "calm" or "presence" in AI writing tools. The calm-technology literature is mainly principles and examples, not experiments.
- Heer's *Agency plus Automation* paper was cited through Litt; I did not read it directly.

## 2. Progressive disclosure, choice overload, cognitive load, flow, distraction-free writing

### Takeaway
Progressive disclosure has strong support: show a few core options and move the rest behind a clearly labelled step. The famous "choice overload" effect is much weaker and less reliable than its popular reputation. The better argument for few controls is focus and flow, not paralysis.

### Cited Findings
- Nielsen (NN/g, 2006):
  - Progressive disclosure means "initially, show users only a few of the most important options. Offer a larger set of specialized options upon request."
  - It improves "learnability, efficiency of use, and error rate".
  - "The very fact that something appears on the initial display tells users that it's important."
  - Research says the worry that hiding features creates limited mental models is "groundless": people "understand a system better when you help them prioritize features".
  — [NN/g, Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- Two things have to be right: (1) the split between primary and secondary features, where "the initial display can't contain confusing features"; (2) it "must be obvious how users progress", with simple mechanics and labels that carry strong "information scent". — [NN/g](https://www.nngroup.com/articles/progressive-disclosure/)
- Choice overload: a meta-analysis of 63 conditions from 50 experiments (N = 5,036) found a mean effect "of virtually zero", with large variation between studies. Pre-existing preferences or expertise reduced the effect, and published studies reported larger effects than unpublished ones. — [Scheibehenne, Greifeneder & Todd 2010, J. Consumer Research 37(3):409–425](https://abcwest.cogs.indiana.edu/pmwiki/pdf/scheibehenne.options.2010.pdf) (search summary only; the specific D = 0.02 figure comes from a secondary [Psychology Today](https://www.psychologytoday.com/us/blog/pop-psych/201602/is-choice-overload-real-thing) report)
- Flow (Csikszentmihalyi) is commonly summarized as needing clear goals, immediate feedback, and a balance between challenge and skill. Sources at this level do not study interruption directly. — [Flow (psychology), Wikipedia mirror](https://ipfs.ssi.eecc.de/ipns/en.wikipedia-on-ipfs.org/wiki/Flow_(psychology)) (secondary; weak)
- Interruption cost:
  - Mark, Gonzalez & Harris (CHI 2005) report a mean return time to interrupted work of 25 min 26 s (SD 54 min 48 s). The popular "23 minutes" figure is a rounded public restatement.
  - Mark, Gudith & Klocke (CHI 2008) found that interruptions raised reported workload and stress (NASA-TLX) without increasing errors.
  — [search summary via secondary sources](https://concepts.dsebastien.net/concept/interruption-cost/) (primary papers not read; verify before quoting)
- PAIR guidebook: "Remember that your product likely isn't the focus of your users' lives, so keep engagement requests strategic, minimal, and allow for easy dismissal." It also recommends always providing "a way for users to complete their task the regular, non-automated way" as a fallback. — [Google PAIR, Feedback + Control](https://pair.withgoogle.com/chapter/feedback-controls/)

### Inferences
- For the writing room, the primary layer should be the manuscript plus one way to reach the guide. Everything else (settings, history, lenses, coverage detail) is the secondary layer, behind clearly named doors.
- Because the choice-overload evidence is weak, avoid claiming that "fewer buttons means less paralysis". The stronger arguments are attention and flow. Each visible control is a standing claim of importance (NN/g) and a possible pull out of the text.
- Interruption research points to *when* the guide may speak, not only *whether*. Speaking at natural breaks costs less than speaking mid-thought (see §4).

### Gaps
- I did not locate an authoritative primary source on Hick's law for this note; it is omitted rather than cited from memory.
- No primary study was found on the effect of "distraction-free" writing apps (iA Writer, focus modes). The iA page I tried returned a 404. Claims about their benefit are currently anecdotal.
- John Sweller's cognitive-load theory was not researched in this pass.

## 3. Conversational UI replacing menus: evidence and pitfalls

### Takeaway
Chat as the main control surface has a discoverability and affordance problem: a blank box gives no hint of what the system can do or how well it does it. The strongest designers in this area argue that the shared work itself (the document) should be the interface, with AI acting on and alongside it. For a manuscript-first room, the guide converses *about anchored places in the work*. Chat does not replace the work as the main object.

### Cited Findings
- Nielsen (2023) calls AI the third UI paradigm after batch processing and command-based interaction: "intent-based outcome specification", where "users tell the computer what they want, not how to do it — thus reversing the locus of control". He warns: "When users don't know how something was done, it can be harder for them to identify or correct the problem." He doubts high usability within this paradigm and contrasts it with "noncommand" systems, where the computer acts as a side effect of the user's normal actions. — [NN/g, AI: First New UI Paradigm in 60 Years](https://www.nngroup.com/articles/ai-paradigm/)
- Wattenberger:
  - "Text inputs have no affordances… The interface looks the same as a Google search box, a login form, and a credit card field." The "burden to learn what works" falls on each user "when it could instead be baked into the interface".
  - "Everything you put in a prompt is a piece of context." Her writing-tutor prototype gathers context through explicit controls (type of writing, audience, feel, inspirations) instead of typing.
  - On the spectrum from human task to tool to machine, past roughly 50% automation "the human is no longer in control… users feel like machine operators… There isn't much craft in operating a machine."
  — [Why Chatbots Are Not the Future](https://wattenberger.com/thoughts/boo-chatbots)
- Maggie Appleton calls chat "the lazy solution… only the obvious tip of the iceberg". Her "daemons" sketch: characters in the writing environment "hang out in the background and suggest ideas every now and then". One "might highlight a sentence and suggest a revision, or ask you to defend a claim. You can always ignore them if you like and the suggestion will fade." Her framing of the LLM is an "epistemic rubber duck" that strengthens the writer's own reasoning. — [Language Model Sketchbook, or Why I Hate Chatbots](https://maggieappleton.com/lm-sketchbook)
- Linus Lee proposes "documents you can talk to". When human and model share context, "it's best to reify that context into a real thing in the interface rather than try to have a conversation subsume it". Rather than reaching the world "through the narrow pipe of a text conversation", both parties manipulate "some shared environment collaboratively". — [Imagining better interfaces to language models](https://thesephist.com/posts/latent/)
- Geoffrey Litt (2023) frames LLMs as enabling end-user modification of software ("malleable software"), meaning tools users reshape rather than agents that act for them. He points to his earlier "tools vs machines" distinction. — [Malleable software in the age of LLMs](https://www.geoffreylitt.com/2023/03/25/llm-end-user-programming)
- NN/g (Moran & Neusesser, 2025):
  - Prompt suggestions address the "blank page" problem, but "users often ignore them, especially when they're not in the right place or don't feel useful".
  - They "must be contextually relevant, personalized, and specific to the task and the user's level of experience".
  - The three types are use-case suggestions (learnability), autocomplete (efficiency) and followup-question suggestions ("increase engagement").
  — [NN/g, Prompt Suggestions](https://www.nngroup.com/articles/prompt-suggestions/)

### Inferences
- **Anchor the conversation to the text.** Each exchange should start from a selected passage or a margin mark, as in Lee's shared environment and Appleton's highlighted sentence. That makes context explicit and removes the blank-box problem.
- **Suggested next moves must be situated and few**, offered at the passage in question rather than as a generic carousel. Followup suggestions that exist to "increase engagement" (NN/g's own phrasing) are a known risk for a product that refuses attachment capture. Use them to orient, never to keep the writer talking.
- Wattenberger's spectrum supports the constraint that the AI does not write unasked: a guide that stays at the "tool" end keeps the craft with the writer.
- Nielsen's point about the locus of control means every AI-proposed change must show *what* would change and *where* before the writer authorizes it.

### Gaps
- I did not find large-sample evidence comparing chat and direct-manipulation interfaces for writing tasks specifically. The strongest material here is expert essays, not controlled studies.
- Litt's "Is chat a good UI for AI?" piece and Wattenberger's later writing were not fetched.

## 4. Proactive and ambient agents: when should an AI speak unprompted? (HAX, PAIR, Horvitz, 2026 writing study)

### Takeaway
The established guidance is consistent. Speak at contextually appropriate moments. When unsure, scope down or ask rather than act. Make invocation, dismissal and correction cheap. A 2026 Google DeepMind/Cornell field study of proactive writing partners found that writers preferred lightweight visual signals and non-directive phrasing, with suggestions that fade if ignored.

### Cited Findings
- Amershi et al., "Guidelines for Human-AI Interaction", CHI 2019 (Honorable Mention): 18 guidelines, "validated through multiple rounds of evaluation including a user study with 49 design practitioners who tested the guidelines against 20 popular AI-infused products". — [Microsoft Research](https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/)
- The 18 guidelines are grouped by phase: initially, during interaction, when wrong, and over time.
  - G1 Make clear what the system can do.
  - G2 Make clear how well the system can do what it can do ("help the user understand how often the AI system may make mistakes").
  - G3 Time services based on context.
  - G4 Show contextually relevant information.
  - G5 Match relevant social norms.
  - G6 Mitigate social biases.
  - G7 Support efficient invocation.
  - G8 Support efficient dismissal.
  - G9 Support efficient correction.
  - G10 Scope services when in doubt ("engage in disambiguation or gracefully degrade the AI system's services when uncertain about a user's goals").
  - G11 Make clear why the system did what it did.
  - G12 Remember recent interactions.
  - G13 Learn from user behavior.
  - G14 Update and adapt cautiously.
  - G15 Encourage granular feedback.
  - G16 Convey the consequences of user actions.
  - G17 Provide global controls.
  - G18 Notify users about changes ("inform the user when the AI system adds or updates its capabilities").
  — [HAX Design Library](https://www.microsoft.com/en-us/haxtoolkit/library/); [HAX Guidelines](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/)
- PAIR guidebook:
  - Keep engagement requests "strategic, minimal, and allow for easy dismissal".
  - "Allow for opting out… respect their decision not to use the feature. Keep in mind, they may decide to use it later."
  - "When users have the right level of control over the system, they're more likely to trust it."
  - Implicit feedback (for example, how often recommendations are accepted or rejected) should be disclosed: "let users know you're collecting it, and get their permission up front."
  — [PAIR, Feedback + Control](https://pair.withgoogle.com/chapter/feedback-controls/)
- Zhang, Davis, Chen & Hsu (2026), "Designing Proactive Thought Partners for Writing" (Google DeepMind / Cornell; one-week deployment, 16 participants):
  - Writers configure AI "partners" by role and by level of proactivity.
  - Activation combines rule-based keystroke triggers with contextual relevance heuristics. One trigger is **Long Pause**, because "opportune moments for interruption often occur during natural breaks", and pauses in writing mark breaks in cognitive process.
  - Proactive output first appears as a small floating tag. If ignored, it "gradually fades out and disappears after 15 seconds", so the system can "make a bid for the writer's attention without requiring an explicit dismissal". The authors cite Horvitz's 1999 principle of efficient direct termination for mixed-initiative interfaces.
  - Clicking expands the tag into a suggestion card ("inspiring"), with an option to start a follow-up conversation.
  - Findings: participants preferred "lightweight visual displays and non-directive phrasing", and used suggestions both to generate ideas and to check their own writing.
  — [arXiv:2609.01588](https://arxiv.org/pdf/2609.01588); [DeepMind publication page](https://deepmind.google/research/publications/265605/)
- The same paper cites Arnold, Chauncey & Gajos (IUI 2020), "Predictive text encourages predictable writing", as evidence that inline generation shapes what writers produce. — [arXiv:2609.01588 references](https://arxiv.org/pdf/2609.01588); [DOI 10.1145/3377325.3377523](https://dx.doi.org/10.1145/3377325.3377523)

### Inferences
- Concrete timing rule for the guide: speak only at natural breaks (a long pause, the end of a paragraph or section, a save, or the writer opening the guide), never mid-sentence. Signal first and explain on request (tag → card → conversation).
- **Unanswered bids fade; nothing is lost.** An ignored mark fades from view but stays recoverable in a quiet history. This honours G8 without nagging.
- **Proactivity is the writer's dial**, per HAX G17 and the Zhang et al. configurable proactivity. The writer chooses how often the guide may step forward. The guide never infers it.
- Arnold et al. support the "no prose unasked" constraint: even well-meant inline completions make writing more predictable, which is a reason to keep generated prose behind an explicit request.
- **Phrase non-directively.** Use "I notice…" or "What were you going for here?", not "Change X". This fits the Zhang et al. findings and the no-grading constraint.
- G16 "Convey the consequences" plus explicit authorization means every proposed edit appears as a visible, reversible diff anchored in the text, and nothing applies silently.

### Gaps
- Horvitz's 1999 CHI paper "Principles of Mixed-Initiative User Interfaces" was fetched as a compressed PDF and was not readable, so its 12 principles are not listed here; only the efficient-termination principle is cited, through Zhang et al. Verify against the original.
- The individual HAX guideline pages (examples and patterns for G3 and G8) were not opened.
- The Zhang et al. sample is small (16 participants, one week). Treat it as directional.

## 5. What makes an AI feel present: anchoring, memory and continuity, pacing, voice, restraint, error honesty

### Takeaway
None of the sources defines "presence" as a measurable construct. The converging design signals are: attention to specific spots in the work (anchoring), remembering what was just discussed (HAX G12), measured pacing at natural breaks, restraint (the minimum needed), and plain honesty about capability and failure (HAX G2 and G11; Calm principle 6).

### Cited Findings
- Anchoring: Appleton's daemons highlight specific sentences, and Lee's "documents you can talk to" put the shared context into the interface. — [Appleton](https://maggieappleton.com/lm-sketchbook); [Lee](https://thesephist.com/posts/latent/)
- Memory: HAX G12 "Remember recent interactions"; G13 "Learn from user behavior"; G14 "Update and adapt cautiously". — [HAX Library](https://www.microsoft.com/en-us/haxtoolkit/library/)
- Explanation and honesty: HAX G2 asks systems to show "how often the AI system may make mistakes". G11 asks them to "make clear why the system did what it did". Nielsen notes that hidden process makes errors harder to correct. Wattenberger criticizes chat that is "endlessly confident" with no sign of whether it understood or where information came from. — [HAX](https://www.microsoft.com/en-us/haxtoolkit/library/); [NN/g](https://www.nngroup.com/articles/ai-paradigm/); [Wattenberger](https://wattenberger.com/thoughts/boo-chatbots)
- Restraint and pacing: "Give people what they need… and nothing more"; "the minimum needed"; "slowly introduce features". — [calmtech.com](https://calmtech.com/). Also: "keep engagement requests strategic, minimal". — [PAIR](https://pair.withgoogle.com/chapter/feedback-controls/)
- Voice: Case says "machines shouldn't act like humans". Weiser opposed the anthropomorphic copilot in favour of extending the person's own senses. — [calmtech.com](https://calmtech.com/); [Litt 2025](https://www.geoffreylitt.com/2025/07/27/enough-ai-copilots-we-need-ai-huds)
- Graceful failure: technology should "default to a usable state" when it fails. — [calmtech.com](https://calmtech.com/)

### Inferences
- **Presence as attention.** The guide demonstrably read *this* passage: it quotes a location, not a summary, and says what it did and did not read (coverage). Generic warmth does not create presence.
- **Continuity without capture.** Resume where the writer left off ("last time we were looking at chapter 3's opening") under HAX G12. The writer can see and edit what is remembered (PAIR disclosure of implicit feedback). Memory never pressures the writer to return.
- **Plain failure states.** "I couldn't read chapter 4; I've said nothing about it" is better than a silent omission or invented confidence. This follows HAX G2 and G11 and Calm principle 6.
- **One voice and one channel.** Weiser's and Case's warnings suggest a single quiet presence rather than several chatty personas. Appleton's multiple daemons is an alternative design to weigh against the no-attachment and no-grading constraints.

### Gaps
- No empirical source found operationalizes "feeling of presence" for AI companions in creative tools. Social-presence theory (Short, Williams & Christie) and recent CHI work on AI "co-presence" were not researched in this pass.
- No source was found on optimal response pacing or latency for a companion's "felt attentiveness" in writing contexts.
