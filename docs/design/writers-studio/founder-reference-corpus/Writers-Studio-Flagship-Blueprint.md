# Writer’s Studio: flagship experience blueprint

19 September 2026 · Design proposal grounded in the existing implementation

## The product promise

A person with something important to say can develop it with MAIA while remaining in relationship with their own words. The workspace helps them perceive what their work is becoming, make deliberate choices, and carry those choices into the manuscript.

The Work remains primary. Developmental intelligence helps the writer perceive the Work. The page, conversation, and proposed changes belong to one continuous experience.

Elemental Alchemy and Spiralogic retain their foundational standing within Soullab. The interface must make that relational orientation useful through attention to intention, experience, embodiment, understanding, and relationship. Writers need not learn that vocabulary to use the Studio. Claims about usability still require observation with writers.

## What we can build on

Read-only inspection of checkout `/Users/soullab/ws-mode-place-20260919`, commit `2c974c3d3`, found a clean working tree and these integration points. This is a code inventory, not a fresh end-to-end runtime certification.

| Existing foundation | Evidence inspected | Design treatment |
| --- | --- | --- |
| Shared manuscript surface | DevelopRoom imports and embeds RebuildStudioClient | Keep a single manuscript authority across views. |
| Developmental lenses and scoped readings | DevelopRoom scope/lens controls and reading request | Preserve the intelligence; MAIA recommends a relevant starting point, with manual choice available. |
| Passage discussion and revision requests | RevisionDesk, including author-intention instructions | Develop a continuous discussion that can change the interpretation before proposing edits. |
| Preview, application, and undo connections | RevisionDesk callbacks and RebuildStudioClient undo integration | Preserve explicit application and recovery; make the visible state unmistakable. |
| Related readings and passages | InsightReadings within the manuscript workspace | Bring relevant passages onto the main canvas when relationships are the subject. |
| Progress and failure feedback | RevisionDesk request feedback and chapter-reading status | Make loading, failure, unchanged wording, and generated proposals distinct states. |

The current arrangement still asks writers to coordinate scopes, lenses, findings, and revision controls. The redesign gives that coordination to the experience while preserving access to the underlying capabilities.

## Compare the major approaches before choosing the shell

| Approach | Strength | Risk | Proposed role |
| --- | --- | --- | --- |
| Conversation leads, document beside it | Easy to ask for help | Writing becomes secondary; lengthy chat obscures changes | Useful for arrival and early exploration |
| Visual map leads, passages open from it | Makes relationships and sequence visible | A map can become another system to learn | Temporary whole-work and structural view |
| Manuscript leads, conversation appears at the relevant place | Keeps meaning, evidence, and revision together | Large structural questions need a wider view | Recommended daily workspace |

Prototype the manuscript-led approach with a temporary whole-work view and conversational arrival. Changing scale must retain the selected material and conversation. Avoid three disconnected products or duplicated drafts.

## Arrival: meet the writer where the work is

MAIA asks one useful question: “What are you bringing today?” Existing work can supply an initial suggestion; the writer can correct it.

| Starting point | First useful experience | Concrete result |
| --- | --- | --- |
| An idea | Explore the intended experience, audience, and a possible starting scene or passage | A first piece of writing and a provisional direction |
| Fragments or interrelated material | Lay out actual fragments; explore possible relationships | A provisional arrangement that preserves the sources |
| An existing draft | Establish intention; examine the broad movement and reading coverage | A small set of significant choices and a recommended next one |
| A particular passage | Open it in context and ask what the writer wants help with | A focused discussion connected to the larger work |

Arrival is optional and revisitable. Returning writers resume their work rather than repeat onboarding.

## The continuous editorial journey

1. **Orient.** Show the work, the current purpose, and one suggested next step. For a full draft, usually address consequential structural questions before sentence polish. Let the writer choose otherwise.
2. **Make the observation visible.** Highlight the exact relevant text. For a relationship, show the related passages as full-width sections in book order. Explain what MAIA noticed in ordinary language.
3. **Establish whether a change would help.** Separate textual evidence from a possible reader response. Ask about intention when it would affect the recommendation. A repeated image can be doing useful work.
4. **Develop understanding together.** Keep the writer’s explanation in the same conversation. MAIA can revise her interpretation, withdraw the concern, or explain why a tension remains.
5. **Try a concrete alternative.** Put a proposed wording change inside its paragraph, with additions and removals visibly distinguished. For a structural proposal, preview the changed arrangement and its affected passages.
6. **Refine.** The writer can edit the proposal, ask for another approach, read it cleanly, or keep the original. Never require agreement with MAIA to continue.
7. **Apply and reconnect.** Explicitly apply the reviewed change, show the clean manuscript, confirm what changed, and offer Undo. Reassess affected observations and suggest the next useful decision.

These are interaction states, not a seven-step wizard. Writers can move back, revise their purpose, or work directly on the page.

## A concrete example from Elemental Alchemy

The dream opening presents an experience of unity; Chapter 1 describes a departure into a journey. Their relationship should be visible together before judging it.

An appropriate opening from MAIA would be: “The dream lets us experience belonging before Chapter 1 takes us into the journey. Is the dream meant to offer a glimpse of where the journey leads?”

If Kelly explains that this is intentional, MAIA should retain that purpose and consider whether the transition communicates it. Possible outcomes are to keep both passages, clarify the transition, or explore a different arrangement. The explanation should not automatically trigger a rewrite of the dream.

This is illustrative dialogue. A real recommendation must be grounded in the actual passages MAIA has read.

## Visual hierarchy

- Give the continuous manuscript the main canvas and readable typography. Full-size means room for writing; line length should remain comfortable.
- Place small markers in the margin, never over words. Use subtle highlights tied to specific observations.
- Open a short explanation and conversation immediately beneath the relevant passage. Show the essential concern without requiring “continue reading.”
- Use the established sage for evidence and gold for proposed additions, plus clear removal marks and labels. Color alone must not carry meaning.
- Keep one conversation composer and context-appropriate actions. A proposal should expose “Use this revision,” “Adjust,” and “Keep original”; an observation should not imply a proposal exists.
- Offer rationale, teaching, intention, and history through optional disclosure. Editorial explanations summarize evidence and tradeoffs; they do not claim access to a model’s private internal reasoning.
- Related passages expand independently at full width. Returning restores reading position.
- A structural overview opens deliberately and returns to the same manuscript. Reading tools never overlay or obscure prose.
- Preserve poetry line breaks, stanza boundaries, lyrics and refrains, and meaningful formatting. Genre affects editorial judgment as well as display.
- Provide keyboard access, visible focus, readable contrast, and text equivalents for listening features.

## The substantive new product layer

These are proposed capabilities; their full implementation has not been established by the code inspection.

**Shared intention.** Store writer-confirmed purposes with an explicit scope: whole work, chapter, or passage. Keep MAIA’s tentative interpretations separate. Let the writer revise or remove them. Do not silently promote a local preference into a global rule.

**Guided next decisions.** Recommend a manageable next question based on the work’s stage and unresolved choices. Show why it matters in a sentence. Avoid a dashboard of defect counts or a mandatory task backlog.

**Dependencies.** Associate observations and proposals with exact source versions and relevant structural decisions. When material changes, reconsider affected guidance. Warn against applying obsolete wording without silently rerunning every reading.

**Structural proposals.** Represent moves, splits, combinations, and transition work explicitly. A structural decision may involve several passages; preview its full scope and apply it as a coherent, reversible operation only when the underlying service supports that operation.

**Continuity.** Preserve the conversation and writer decisions across changes of view and sessions. Resuming should answer: what were we working on, what did we decide, and what remains open?

**Ecosystem integration.** MAIA remains the single conversational voice. Cross-platform context must respect existing ownership and consent boundaries; making Writer’s Studio the flagship does not imply unrestricted reuse of private material elsewhere.

## Build sequence

1. Establish this experience contract and map existing services against it. Verify service semantics before choosing replacements.
2. Build a complete interactive journey using clearly identified demonstration material. Include whole-work orientation, two connected passages, author disagreement, revised interpretation, inline proposal, clean preview, application, undo, and continuation.
3. Observe nonprofessional writers attempting that journey without coaching. Revise the layout and language based on where they hesitate or misunderstand.
4. Connect the agreed experience to real reading, conversation, persistence, and application services. Keep prototype-only behavior visibly distinguished until replaced.
5. Expand the same architecture to fragments, ideas, poetry, and songwriting. Test their different needs explicitly.
6. Validate the real application visually and behaviorally before deployment. Existing tests do not establish that the redesigned experience is understandable.

The prototype establishes the whole interaction architecture before production integration proceeds in bounded pieces. It is not a claim that the flagship is complete.

## Acceptance scenarios

| Scenario | Observable success |
| --- | --- |
| Writer opens a developmental observation | Can identify the relevant words and explain the concern in their own language |
| Writer disagrees | MAIA addresses the explanation; keeping the original is a normal outcome |
| Writer asks for a revision | A visible proposal, a clear no-change response, or an actionable failure appears |
| Writer reviews a proposal | Can distinguish original, additions, removals, and the clean result |
| Writer applies and returns later | Correct version persists; application status and available Undo are accurate |
| Writer changes chapter structure | Affected guidance is identified; stale proposals cannot silently overwrite current work |
| Reading covers only part of the work | MAIA accurately describes that coverage and limits her claims |
| Writer changes view | Passage, conversation, draft reply, and reading position remain coherent |
| Writer ends the session | Knows what changed and can resume without reconstructing the process |

Measure comprehension, successful completion without coaching, perceived authorship, recoverability, and willingness to continue. Suggestion acceptance alone is not a success metric. Confidence and reduced intimidation are goals to test, not promised psychological outcomes.

## Research informing the direction

- Horvitz, *Principles of Mixed-Initiative User Interfaces*: combining direct manipulation with intelligent assistance. https://www.microsoft.com/en-us/research/publication/principles-mixed-initiative-user-interfaces/
- Coenen et al., *Wordcraft*: conversational interaction within a writing editor. https://arxiv.org/abs/2107.07430
- Lee et al., *CoAuthor*: observing the process of accepting, dismissing, and revising suggestions. Its short-session setting does not validate whole-book development. https://coauthor.stanford.edu/
- Ink & Switch: visual creative environments and exploration of alternatives/history. https://www.inkandswitch.com/
- Amershi et al., *Guidelines for Human-AI Interaction*: evaluated guidance for designing human-AI interaction and handling failures. https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/

These sources informed the design research in this conversation. The architecture above is our synthesis to test, not an empirical conclusion established by those sources.

## Status

Blueprint prepared; existing component connections inspected. No production code changed or deployment performed in this design pass. Next concrete deliverable: the interactive journey described above, followed by observation and integration.
