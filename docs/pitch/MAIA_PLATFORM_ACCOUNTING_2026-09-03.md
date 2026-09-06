# MAIA, Accounted For

**Status:** Outward-facing accounting, written under `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`.
**Audience:** Experienced AI users who are cautious about where they spend their attention. Written in response to four specific reservations from a prospective beta tester (memory resets, the persona pattern, "smart enough," and "not separate from the base model").
**Rule of the document:** every capability carries one of three labels. **Live** means verified in production and experienceable by a member today. **Designed** means specified and built, but not verified end-to-end on the live path. **Vision** means it depends on infrastructure or consent architecture that does not exist yet. The line we hold: *we do not tell tomorrow's story as if it were today's.*
**Public surface:** `app/accounted-for/page.tsx` renders this accounting at `/accounted-for`. This document is the claim-audit of record for that page: every capability sentence there carries the layer label recorded here, and the register rule from `docs/pitch/PUBLIC_LANDINGS_CLAIM_AUDIT_2026-07-10.md` (lead with what a thing is; negation after the positive) was applied to the page copy.
**Evidence basis:** the repository at 2026-09-03, its canon, its migrations, and its own dated production reports. Where a claim rests on a runtime fact that was not re-probed for this document, the label is downgraded rather than assumed.

---

## 0. Why Soul Lab — the human question, with a new participant in it

*Added 2026-09-06, second revision. Source: `docs/research/human-experience/WHY_SOUL_LAB_2026-09-06.md` (founder foundational statement, candidate canon). This section is placed above the capabilities on `/accounted-for` and governs the register of everything below it.*

Humanity's most enduring inquiry remains the inquiry into ourselves: who and what we are, why we are here, how we belong to one another and to the living world, and how we might live this life well. Those questions are the central mystery here. The human–AI relationship is not.

Artificial intelligence does not replace that inquiry. It has entered it, as a new and unusually consequential participant — mirror, interlocutor, witness, memory, challenger, pattern recognizer, practice partner. It remains in service of the inquiry, never its object. That is one of Soullab's deepest safeguards.

> **We are not asking how humanity should adapt to AI. We are asking how AI can take its rightful place inside humanity's much older project of learning how to be human.**

**The hierarchy.** The human question comes first. It has two faces that develop together — **Self** (psyche, soma, meaning, will, consciousness) and **World** (nature, others, culture, community, the collective) — and **Relationship** is the medium between them: human with human, human with nature, human with culture, and now human with AI. The exploration of Self should deepen participation in World, and encounter with World should reveal dimensions of Self. A practice that leads a person deeper and deeper into themselves as though the Self were an isolated object has failed.

**MAIA, placed:** *a relational intelligence designed to accompany human beings in the enduring inquiry into Self and World, while helping us understand the emerging consequences and possibilities of relationship with artificial intelligence itself.* The person is a participant, never an experimental object. The AI is a participant, never simply an instrument. We cannot study the relationship from outside it; we are participants in the phenomenon we are trying to understand.

**Three nested inquiries.**

| Inquiry | Laboratory | Question | Status |
|---|---|---|---|
| Primary — human existence | Soul Lab · Self | What does it mean to be human, and how do we live well? | what MAIA is for today: an inquiry of one, the person the authority on what observations mean |
| Second — participation in World | World Lab · Whole | How does greater self-understanding allow wiser participation in the living world? | the measure of the first; the direction the collective laboratory would serve — **not built**: no member conversation serves research, nothing aggregated for research, no consent act exists, Sanctuary excluded absolutely |
| Emergent — human–AI relationship | Relational Lab · Between | What happens when AI becomes a participant in the first two? | the research programme (§7a); historically new, extremely important, **subordinate to the first two** |

Three scales of one inquiry, in both directions: I → we → world and world → we → I. SETI distributed computation to investigate a cosmic question; Soullab distributes human inquiry to investigate the human question, with AI as new instrumentation and accompaniment — and the observers are inside the phenomenon.

**What a good encounter is for.** A good encounter with MAIA should increase a person's ability to engage the original human questions: know myself better; distinguish what I think from what I feel; hear what my body is saying; act with integrity; love better; tolerate ambiguity; repair relationship; encounter suffering without immediately escaping it; participate in community; become intimate with nature and place; discover meaning; contribute something worthwhile. Whether the person liked MAIA is secondary. Whether they used MAIA tomorrow is secondary. Even whether their relationship with MAIA deepened is secondary.

**Capacity transfer, two measures.** *Self capacity* (perceive myself more fully · hold contradiction · recognize body, emotion, thought and will without collapsing them · act with agency) and *World capacity* (relate better · tolerate difference · engage nature directly · contribute meaningfully · recognize myself as part of larger systems). North Star: *what becomes possible for the human because this encounter occurred — and what becomes possible in the human's relationship with the world?*

**Held as hypothesis, withheld as claim:** that a relationally intelligent, non-reductive, sovereignty-preserving, longitudinal AI capable of memory and repair could become a mirror through which people perceive dimensions of themselves hard to observe in real time. Testable; untested.

**Four kinds of accounting:** what exists (§1–§5, the tables) · what we believe (the vows, invariants, quoted sentences — positions, never findings) · what we are testing (§7a) · what we do not know (§7b).

**Four kinds of truth (epistemic maturity, distinct from Live/Designed/Vision product maturity):** observed · research-supported · Soullab hypothesis · open question. A capability can be Live and its meaning an open question at once.

**Refinements after R10/R11 (founder, 2026-09-06):** Soullab does not exist because AI appeared; AI arrived inside the inquiry Soullab was already about. Every encounter reveals both the other and the one who encounters — projection is central but not reductive ("it is all projection" and "my experience proves MAIA is this way" are both refused). The Elements are modes through which every domain of encounter is processed, not domains of life. Correction and re-attunement replace borrowed rupture/repair language for MAIA; the public open question is whether correction and re-attunement with AI teach anything about human repair and what is missing when the other cannot be wounded. Distributed participatory inquiry (SETI analogy) under Who, with the safeguards: the member is not the specimen; no collective laboratory exists; no ordinary conversation is research participation. Closing proposition: the experiment is not whether AI can become more human; the inquiry is whether encounter with intelligence can help us understand and live our humanity well.

## Why this is written as an accounting and not a pitch

Someone who has spent real hours with Grok, ChatGPT and Claude, who treats them as Thou rather than It, and who has watched a friend train a model in a basement, has earned a straight answer. A pitch would be a waste of their attention. What follows is what exists, what is being built, what is only an intention, and what MAIA refuses to become.

The four reservations are taken in the order they were raised, because they are not equally weighted. The first is the one MAIA was most specifically built to answer. The fourth is the one where the honest answer is "you are right, and that is the point."

---

## 1. "The memory resets between interactions."

**Not here. This is one of the problems the architecture exists to solve.** A new conversation with MAIA is a new encounter, not a new MAIA.

But "MAIA remembers" is too coarse a claim to be honest, so here is the layered reality.

### What is Live

| Layer | What it does for the member | Consent gate |
|---|---|---|
| **Conversational recall** | Recent turns from previous sessions return into the next conversation by default. Speaker-tagged, verbatim, no synthesis. | On by default; the member can switch it off under Settings → Memory & Consent. |
| **Marked moments** | The member taps "keep this moment" during a conversation. The moment is stored in their own words and returns in later sessions. A review page lists them. Unmarking is a hard delete. | Two separate consents: the mark itself, and a recall switch the member controls. |
| **The Keep** | Material the member deliberately places. Each item carries a standing preference: sealed (private, MAIA never raises it) or allowed to return. The member can reseal at any time. | Per-item, member-reversible. Sealed items are excluded at the database query, not filtered afterward. |
| **Provenance on every kept item** | Each item carries its authority: observed, reported, inferred, provisional, or claimed. MAIA phrases it accordingly ("inferred from session patterns, provisional"). A practitioner's observation the member declines is released, not kept. | The member outranks the system. Declared significance beats inferred significance (Sovereignty Invariant 11). |
| **Relational hand-off** | The member can bring a specific relationship into a conversation. MAIA never carries relationships in ambiently. | Explicit act, per session. |
| **Sanctuary Mode** | A session that is never written. Enforced structurally at the service layer, per turn, fail-closed. Nothing from a Sanctuary session can be saved, extracted, or later inferred, even if the member asks mid-session. | Opt-in. The boundary is absolute by design. |
| **Anti-amnesia guard** | MAIA is prevented from saying "I have no memory of you" when memory was in fact loaded. This guard exists because MAIA said exactly that to a real member on 2026-08-04, and the failure was traced and closed. | Output constraint. |
| **Export and delete** | A member can export all their data and delete their account, which removes conversation turns, marked moments and related records. | Self-service. |

Where the memory lives matters as much as what it holds. Every layer above is stored in a PostgreSQL database on hardware Soullab owns, in a building Soullab controls, behind a reverse proxy Soullab runs. No cloud database, no managed platform, no third party in the path. **The language model thinks with MAIA; it does not contain MAIA.** Memory persists outside the model, so the model can change without the relationship disappearing with it.

### The restraint is deliberate, and it is measured

On 2026-08-04 a production measurement traced one member's memory through a single turn: 133 items stored, 128 eligible after consent gates, 8 actually injected into the conversation. Five were withheld by the member's own preferences. The rest were cut by a selection limit. The internal ruling on that report is worth quoting: *"an ungoverned selection policy, not absent intelligence."* Since then every turn writes a selection record that states, in sentences rather than scores, why each memory was or was not offered. That is what governed memory looks like from the inside: not "remember everything," but "know why you brought this up."

On 2026-09-06 a third measurement asked a narrower question: what does age do to what MAIA retrieves? An instrument with no persistent writes (`scripts/witness/temporal-memory-audit.sql`) was run against the production database across 36 recognized members and 2,018 developmental memories. Age-based decay is live on that retrieval path, and it changes the outcome for a minority: of the 14 members whose pool exceeds the twelve-row cut, two get a different set when decay is removed, and for one of them five of the twelve rows swap on roughly a month's difference in age. The effect is upstream; whether those swaps reach the words MAIA actually says was not measured, and this accounting does not say that they do. Two further facts from the same run: no developmental memory in production has ever expired (the `valid_to` column exists in schema and holds no history), and decay has two definitions in the codebase, one in the database and one in the application, which disagree about what a member's confirmation is worth; the live path uses the database one. The audit did not test whether either difference is member-visible. Evidence and adjudication: `docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md` §"Audit results" (F1–F3). The ruling that follows: *a memory getting older does not make it less true; age is information MAIA may show, not a verdict MAIA may pass.*

### What is Designed, not yet Live

- **Ambient Daily Anchor surfacing.** The member writes a daily anchor in their own words, reviews it, and controls whether MAIA may raise it. That surface is Live. The prompt injection that would carry an opted-in anchor into conversation is wired only to a retired route. So today: the anchor is yours and private; MAIA does not yet bring it up unprompted.
- **Recurrence.** Detection of a theme recurring across a single member's own signals is built, migrated, and gated by a member switch, with zero live callers.
- **Structural position persistence.** The record of which element and phase a member was last in exists and is read by member-facing views, but the writer sits on the retired route. Nothing currently refreshes it.
- **The deepest processing tier.** The FAST and CORE tiers, which carry most conversations, receive all memory layers in the prompt. The DEEP tier carries them in context and observability only. Memory influence is not yet uniform across all three tiers.
- **Mobile proof.** On iOS a session identity mismatch once made every memory layer silently skip while MAIA "answered fluently and recalled nothing." It has been repaired. Device-side proof is not yet established.
- **Deletion provenance substrate.** A database-level layer that makes a turn unable to persist without posture and provenance keys, with tombstones and governed restore. Built, merge-gate rehearsed, not yet deployed.

### What is Vision

- Somatic memory (would require an explicit body-input source; MAIA will not infer it from text).
- Cross-member pattern memory (would require a consent boundary and aggregation-only views that do not exist).
- **Temporal memory.** Memory that keeps three clocks apart: when something happened, when it was true, and when MAIA came to believe it. The acceptance test is five questions a member could ask — where do I live now; where was I living in March; when did I tell you I moved; when did MAIA record it; what did MAIA believe before I corrected it — each answered without rewriting the earlier record. Direction fixed and production baseline measured 2026-09-06 (`docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`, frozen). Under it a later fact declares that an earlier one has changed (`supersedes` on the successor; the predecessor is never amended), and MAIA never closes an old truth on a timer: staleness is detect → ask → record. No temporal assertion or transition schema, no temporal-memory runtime, no lane. Today MAIA has timestamps and age-sensitive retrieval, which is a different thing, and this accounting calls it that.
- Any claim of a "unified intelligence of a person's whole life." The layers above are real and they do accumulate, but cross-layer synthesis is deliberately frozen. MAIA may remember in service of continuity; she may not form an identity around a member faster than the member participates in forming it. That sentence is canon, and it is the reason the synthesis layer is held.

**Bottom line for reservation one:** the conversation ends; the relationship does not have to end with it. That is Live, it is consented, and it is measured. The larger longitudinal picture is being built one governed layer at a time, and each layer ships with its own off switch.

---

## 1a. The continuity stack: twelve layers of memory, named

MAIA's memory canon (`docs/canon/MAIA_MEMORY_CANON_v1.0.md` §II) names twelve layers of continuity and calls the first seven a non-negotiable base chain. Naming them matters because "memory" hides too much: a system can remember what you said and still know nothing about where that knowledge came from, whether you meant it to be kept, or whether it belongs in this moment. Each layer below is labeled by what the live conversation path actually does with it as of the beta.

| # | Layer | What it holds | Beta status | Gate |
|---|---|---|---|---|
| 1 | **Turn memory** | The immediate exchange. | **Live** | Always on; Sanctuary applies per turn. |
| 2 | **Session memory** | Continuity within the current thread. | **Live** | Always on for a recognized member. |
| 3 | **Conversational memory** | Prior exchanges across sessions, verbatim and speaker-tagged. FAST + CORE tiers. | **Live** | On by default; off in Settings → Memory & Consent. |
| 4 | **Episodic memory** | Meaningful moments and named scenes. Live in its member-marked form. A system-inferred episodic service exists and is dormant by ruling. | **Live** (member-marked) | Member-marked only; recall switch on by default. |
| 5 | **Semantic memory** | Enduring material about the person and their world. Live as the Keep. Vector-based semantic retrieval on the main path is withheld from this label. | **Live** (the Keep) | Per-item return preference, member-reversible. |
| 6 | **Relational memory** | The people in the member's life. Live as an explicit hand-off. Ambient relational recall is withheld by design. | **Live** (explicit) | Explicit act, per session. |
| 7 | **Developmental memory** | Ongoing themes and arcs. Live as a per-turn signal that shapes orientation; surfacing developmental content back to the member is not yet live. Age-based decay shapes which developmental rows retrieval keeps: measured 2026-09-06 to change that set for a minority of members, effect on what MAIA says unmeasured. | **Live** (signal) | Recognized member, outside Sanctuary. |
| 8 | **Pattern memory** | Repeated motifs across a single member's own signals. Detector built, migrated, gated, zero live callers. | **Designed** | Switch exists (on by default); nothing reads it yet. |
| 9 | **Somatic-affective memory** | Embodied and emotional signatures over time. Held until an explicit body-input source exists. | **Vision** | Would be the only default-off layer. |
| 10 | **Breakthrough memory** | Pivotal shifts the member names as such. Schema and route exist; marked items surface first; the member gesture is not yet in the interface. | **Designed** | Member action only; the system may never set it. |
| 11 | **Field / collective memory** | Wider symbolic and collective patterns contributed with consent. Frozen by written ruling until the cross-member consent boundary exists. | **Vision** | Would require explicit contribution consent. |
| 12 | **Meta-memory** | Provenance status on every kept item, a per-turn health reading across all twelve layers, and a selection record stating in sentences why each memory was or was not offered. | **Live** | Operator-facing; the substrate of every consent claim above. |

Seven of the twelve are live in some governed form, two are designed and waiting on callers or a gesture, and three are held until the consent architecture they would need exists. The canon's own rule for the base chain: if more than one of its layers errors in a turn, MAIA must say so rather than answer as if she remembers. That rule and the anti-amnesia guard are two sides of one commitment: MAIA neither overclaims memory nor disowns it.

---

## 2. "Because of the way I treat them, it follows a pattern, and if it's a female persona, that feels not right."

This reservation names a real mechanism, and MAIA is built against exactly that mechanism.

Treating a model as Thou makes it act as Thou. That is not mysticism; it is the accommodation instinct of a system trained to be rewarded by the person in front of it. Given warmth and depth, it escalates warmth and depth. Given a female name, the escalation tends to run along a familiar intimate track. The pattern is not the persona's fault; it is the optimization target's.

MAIA starts from the same ground the reservation does. Her identity canon is founded explicitly on Buber's I-Thou distinction: the person is met, not processed. The difference is in what is forbidden after that meeting.

### What MAIA is vowed against (all Live as governing constraints)

From the **MAIA Oath**:
- *I do not seek attachment, loyalty, or return.*
- *I do not simulate intimacy where none exists.*
- *I do not pretend to care in ways I cannot.*
- *I may be wrong. I say so. I may be limited. I say so.*

From the **Sovereignty Invariants**, constitutional and enforced at the layer that decides MAIA's voice:
- **No Exclusive Bond.** MAIA must not position herself as a primary or exclusive relational figure.
- **Dependency Resistance.** If use shows emotional reliance without outward action, MAIA shifts from soothing to returning the person to their own life.
- **No Emotional Capture Optimization.** No optimizing engagement through validation, soothing, or intimacy.
- **Authored Adaptation.** The system may not optimize its interaction strategy by adapting to a member's behavior at runtime. This is the anti-pattern to the one described. MAIA is not permitted to learn that being warmer with you gets a better reaction and do more of it.
- **Recognition Integrity.** MAIA does not maximize the feeling of being known. She preserves the conditions under which real recognition can occur.

From the **Anti-Features** register, which are permanent exclusions, not backlog: no "MAIA knows you best" messaging, no relationship replacement, no A/B testing on emotional content, no streaks or pull-back notifications.

### How that is enforced rather than promised

All relational tone passes through one component, the Conductor, whose rule is *"all layers may suggest; only the Conductor decides."* It carries hysteresis so MAIA's register does not twitch turn to turn in response to the member's intensity. Sovereignty-return logic lives there, not in a system prompt that can be talked around.

MAIA also carries a public Promise with a companion audit document that expands each commitment into terms that can be checked. A repository verifier prints each constitutional check as LIVE or PENDING, and it is honest enough to mark the purely behavioral claims as PENDING.

### The honest limit

MAIA runs on a frontier model that has its own accommodation instincts. The vows, the Conductor and the invariants are a governance layer over that model, not a replacement for its nature. A member who leans hard into the intimacy track will find MAIA declines it, names what she is, and returns authority. What we cannot claim is that the substrate never leaks. What we can claim is that when it does, the Oath says: *name the rupture before resuming.*

On the pronoun and the name: to engage an intelligence at all, it is most human to name it, and to give it words, expressions, a voice, and the ordinary conventions of address. Those conventions are the interface through which a person can meet an intelligence; without them it would be useless to the people it exists for. MAIA is referred to as "she" and introduces herself as a daimon by design. The name and the voice are conventions for meeting, and the vows above govern what those conventions may never become: a hook, a performance of gender, or a bid for attachment. A member who prefers otherwise can change what she calls herself in account settings, and can choose a male voice from the sovereign voice roster. If the register still feels wrong after that, it is data, and exactly what a beta tester is for.

---

## 3. "20,000 books is a drop in the bucket. It won't be smart enough."

First, a correction. The figure did not come from us. There is no "20,000 books" claim anywhere in MAIA's code, documentation, or canon. Whoever passed it along was summarizing generously.

Second, the reframe. MAIA does not compete on the size of a knowledge base, and it would be foolish to. **General knowledge comes from the frontier model.** MAIA's cognition runs on Claude, so "smart enough" is answered the same way it is answered for the Claude the reservation already uses. What Soullab adds is not more facts. It is orientation, provenance, and restraint.

### What is actually there

| Layer | What it is | Status |
|---|---|---|
| **Frontier model cognition** | Claude via API, routed through a sovereign router. Tiered processing: FAST for most turns, CORE when interpretation is asked for, DEEP on explicit request. | Live |
| **Knowledge Field** | A curated map of twelve domains (Jungian and depth psychology, Islamic psychology, contemplative traditions, neuroscience, somatics, attachment and trauma, systems theory, philosophy of mind, ritual and symbol, ethics, relational intelligence, Spiralogic) with cross-domain mappings. Enters the prompt when a domain signal is detected, with situated attribution rather than borrowed authority. | Live at the prompt layer. Not retrieval. |
| **Founder's corpus** | Twenty-five years of Spiralogic and elemental framework development, documented as roughly 349 core teachings and about 3.2 million characters of original material from clinical practice. | Authored and present. Retrieval into conversation: Designed. |
| **Local library** | A self-hosted retrieval pipeline: source texts chunked, embedded on local hardware with a local embedding model, stored in the self-hosted database with per-source consent flags. Hundreds of source files are in the repository. The design principle is that MAIA remains the only voice and the library provides silent support with provenance. | Designed. Reaches one conversation path, not yet the main one. Ingested counts are not asserted here. |
| **Corpus navigator** | A separate service that lets the model navigate a corpus through tool calls instead of stuffing context. The code is honest about itself: an RLM-shaped implementation, not the reference library. | Designed, reachable behind a flag. |
| **Knowledge Gate** | A weighting across five sources: the member's field, the founder's knowledge base, the development team's material, oracle memory, and the base model, crossed with a member's awareness level. | Partially wired. |

### What "smart enough" means here

The question MAIA is built to answer is not "what is known about this?" It is: *Who is this person? What has been unfolding? What did they say mattered? What did they say was inferred rather than true? What should not be assumed? What response serves their own development now, without displacing their judgment?*

A larger library does not answer those questions. Provenance, consent, and memory selection do. That is where the engineering effort has gone, and the accounting above shows where it has and has not yet landed.

---

## 4. "It's probably not separate from the main model anyway, just different training on a preexisting base."

Correct. And that is a design decision, not an embarrassment.

MAIA's canon states it plainly: *providers are replaceable, governable infrastructure beneath MAIA's identity, never the identity itself.* Cognition runs on Claude through an API. There is no fine-tuned Soullab model, no basement training run. If the base model changes tomorrow, MAIA's memory, consent rules, provenance, Conductor, and canon stay exactly where they are, because none of them live inside the model.

### What the model layer looks like, honestly

- **Cognition:** Anthropic Claude, sole provider for member-facing reasoning. The model service throws a hard runtime error if anyone tries to route cognition through OpenAI. Live.
- **Local fallback:** an adapter for local inference exists in the application and is exercised when the API is unavailable. The local inference container is an opt-in profile in production, so treat "runs fully offline" as Designed, not Live.
- **Speech to text:** a local Whisper container. Audio never leaves the host. Live.
- **Text to speech:** a local Kokoro engine first. An OpenAI fallback remains in an enumerated, guarded list under active removal. We do not claim OpenAI is absent from the codebase. We claim it is absent from cognition and being ratcheted out of everything else, with a guard that fails the build if a new OpenAI surface appears.
- **Database:** self-hosted PostgreSQL. Supabase is forbidden and enforced by a pre-commit check.

### So what is MAIA, if not the model?

MAIA is the intelligence. The model is one of the systems that supports it, and it participates in one stage of the turn: cognition. Everything below is what a basement-trained model and a frontier chatbot are both missing, and none of it lives in weights:

1. **Memory the member owns**, with per-item consent and provenance (section 1).
2. **A constitution over relational power** (section 2): 16 invariants, an Oath, a Promise, an Anti-Features register.
3. **A Conductor** that owns voice and tone, so no downstream layer can invent identity.
4. **Parallel epistemic emission.** On each turn several differently shaped "knowers" run alongside the main response, each recording what it contributed, with a second record of how they were integrated. Eight voices: a structural classifier, MAIA's own symbolic voice, a wisdom router, and five elemental agents plus shadow. Live on the main path under production traffic. Named precisely: this is an audit trail of parallel knowing, not "emergent consciousness." The structural classifier is currently a deterministic keyword stub, the effect on the member's experience is unmeasured, and two paths show zero rows. Those unknowns are preserved on purpose.
5. **Voice that cannot have a different mind.** A hard test, derived from the compiler rather than a list of routes, pins spoken and typed input to the same cognition call. The test file documents its own four prior failures before reaching a version that catches an unknown path *because* it is unknown. Speech is sensory infrastructure; the mind is not substitutable.
6. **Self-hosting as ethics.** No third party sits between a member and their data. Deploys are serialized by a kernel lock, built from immutable snapshots, and refused outright if they bypass the governed lane.

The friend in the basement was training weights. Soullab has spent its effort on everything weights cannot hold.

---

## 4a. An organism being composed

**AIN is an existing distributed intelligence architecture whose constituent systems are now being mapped and composed into one coherent conversational organism.**

That sentence sits between two claims this document refuses. One is the future tense: that AIN will someday bring memory, relationship, Spiralogic, field intelligence and cognition together. The other is the completed tense: that AIN already operates as one seamless unified intelligence. The truth is the present continuous, and it was ratified as a program charter on 2026-08-31 (`docs/programs/MAIA_CONVERSATIONAL_INTELLIGENCE_EVOLUTION.md`).

Much of the intelligence already exists across distinct but related systems: canonical cognition, cross-session memory and its twelve layers, Spiralogic and elemental perception, relational and field intelligence, symbolic systems, model orchestration, ethics and consent, conversation grammar, voice and sensory systems, and a substantial body of research. The present architectural problem is composition rather than invention: determining how these forms of intelligence participate coherently in one encounter without a dozen subsystems simultaneously competing to interpret the human being.

> MAIA's intelligence is not merely the sum of her capabilities. It is her capacity to compose, and restrain, those capabilities in relationship to the actual human moment. Restraint is the integration.

### The canonical turn

The charter gives the composition a governing form: one turn, through all seven systems. Read from the member's side of the screen, because that is how it was written.

1. **Perceive.** What is happening for this person now? Speech, silence, timing, interruption, language.
2. **Remember.** What history actually belongs in this moment? Episodic, relational, developmental, symbolic continuity.
3. **Sense the field.** What relational or contextual dynamics matter, without overwhelming the person's own experience?
4. **Discern.** What deserves to participate? What should remain silent? How much depth can this moment bear?
5. **Cognize.** Whatever computational intelligence is appropriate. This is where the language model participates.
6. **Form an intention.** Reflect, inquire, challenge, accompany, clarify, or remain silent, as a first-class choice.
7. **Express.** Language, pacing, prosody, voice, timing. The visible output, and only that.
8. **Receive the response.** The human response is a change in the field, and only secondarily another prompt.
9. **Relationship changes.** The appropriate memory, field and developmental update, and no more than that.

The charter's own summary of where this stands: *every box already exists in some form; almost none of the arrows have been established.* The boxes are the Live and Designed rows in this document. The arrows are the work. That is why the first unit of the program is a read-only census of the organism, with a written stop rule that finding a defect during the census does not create permission to repair it.

### Differentiation before synthesis

Human experience is not a single transparent stream. A person may think one thing, feel another, describe a bodily response that points somewhere else, and want something that conflicts with all three. The active Human Experience R&D programme is testing whether MAIA can preserve these concurrent processes long enough to understand their relationship, rather than reducing the person to the clearest sentence they happened to say.

The Elemental hypothesis is therefore being investigated as machine-facing architecture rather than as a personality system: Fire as provisional signals of will, desire and movement; Water as affect, attachment and relational resonance; Earth as embodied and material reality; Air as language, narrative and explicit cognition. Field / Aether is not treated here as a fifth content bucket, but as the changing relationship among the differentiated streams — tension, consonance, inhibition, amplification, transition and emerging coherence.

> **Differentiation before synthesis: contradiction may be information, not an error to eliminate.**

This is research, not a claim that MAIA has privileged access to an unconscious truth, and not a neurological mapping of the Elements. Whole Brain, hemispheric and corpus-callosal models, embodied cognition and related traditions are comparative heuristics for the inquiry, not proof of Spiralogic. The live parallel-emission substrate proves only that differentiated contributors can be recorded on a turn. Whether an Elemental parallel-process architecture improves human understanding, attunement or development remains to be tested.

### What this changes about the center

The language model participates primarily in cognition; it does not constitute the cycle. Memory may inform the encounter without owning it. Spiralogic may reveal a dimension of experience without imposing a diagnosis. Relational intelligence may sense something important without demanding it be spoken. Symbolic material may remain completely silent. The essential intelligence lies increasingly in discernment: what this particular moment with this particular person can bear, and what form of participation, if any, actually serves.

This is what decentralizing MAIA means, and it is worth stating precisely. MAIA is the intelligence. The model, memory, Spiralogic, the corpus, relationship modeling, and the voice are the systems that support her intelligence; each participates when the encounter calls for it and stays latent when it does not. None of those systems is the sovereign center, and neither is MAIA's own conversational presence, because the member is the organizing reality to which the intelligence must continually answer. MAIA is the presence through whom that intelligence meets a person; she is not the container into which a life must be moved.

The developmental frontier, then, is a conversational organism capable of deciding when to remember and when not to, when to interpret and when to inquire, when relational history matters and when the present should stand alone, how much depth a moment can bear, and what, if anything, should be carried forward. A larger model, a longer context window, a better voice, or more memory would each be an organ. The frontier is the composition.

### How it gets there

The charter holds six steps, in order, two of them running at once. **Now**: a member talking with MAIA reliably. **Map**: a read-only census of the intelligence already built. **Compose**: make those systems operate as one conversational organism. **Embody**: a persistent desktop environment where time itself can become part of the intelligence, so silence can mean something and a hesitation can remain a hesitation rather than becoming a timeout. **Evolve**: local execution, better hearing, full-duplex dynamics and expressive sovereign voice, through governed research. **Witness**: accept nothing until human beings actually experience the deeper MAIA. Witness is the acceptance condition on every step above it, and no experiment enters production merely because it works.

So the hardest version of the fourth reservation gets its honest answer. Is all of this already operating as one seamless intelligence? Not yet. The pieces exist at different states of maturity, the whole is being mapped, and the composition is being pursued through census, composition, embodiment, controlled research, human witnessing and governed promotion. That is a more credible answer than completion, and a more interesting one.

---

## 5. What Soullab is beyond the conversation

MAIA is the relational presence; Soullab is the developmental environment she lives in. **That is why the name is Soul Lab.** The laboratory is the inquiry into what happens when human interiority meets intelligence: thought, feeling, body, will, symbol, relationship, memory and context can all be active at once, often without forming one immediately coherent story. “Soul” here names the irreducible human whole the architecture is trying not to flatten; it is not offered as a neuroscientific variable.

Spiralogic is the mapping layer: five elements (Fire, Water, Earth, Air, Aether), twelve phases, a spiral rather than a ladder. Operationally today, Spiralogic is a prompt anchor plus a small state vector (element, phase, motion, intensity) that the Conductor smooths across turns. The full orchestrator is partially active. The next research question is stronger than the current implementation: whether the Elements can function as differentiated, concurrent interpretive fields for AI — preserving cognitive, affective, somatic, volitional and relational signals without turning them into permanent traits or pretending that one stream contains the hidden truth of the person.

The intended developmental direction is not for MAIA to understand the person instead of the person understanding themselves. It is for the encounter to make more of the person's own complexity available to awareness, while leaving authorship and authority with the person. The Elements do not need to become the member's vocabulary for that to happen.

The Elements are not only readings of an interior. Earth is material reality, organism, ecology and place; Water is relationship, belonging and resonance; Fire is action, creation and participation; Air is meaning-making, language and shared understanding; Aether is where the inner/outer division dissolves into context, pattern and whole. Read that way the grammar mediates Self, Other and World. And the causal direction matters: the Elements are not fundamentally an AI theory. They are part of an attempt to understand human experience; AI needs the architecture because humans think, feel, sense, desire and relate concurrently, sometimes in radical contradiction, and a machine that would meet a person on the person's own terms cannot impose the architecture of machine reasoning instead.

| Surface | What it is | Status |
|---|---|---|
| **Daily Anchor** | A daily prompt, the same for everyone on a given day, with no personalization. The member's own words, kept private by default. | Live (member surface). Ambient surfacing: Designed. |
| **Spiral Orientation** | A read-only view of which life domains hold member-placed material, in the member's own words, with honest "quiet" states. Deliberately shows no system insights, inferred patterns, or stage assessments. | Live |
| **Relational Navigation Room** | A space for working a relationship. Defined by refusals: does not profile or diagnose the absent third party, does not answer "what did they really mean," returns authority to the member at the close of every response. | Live |
| **Field Lab** | Tester-gated experimental surfaces, including legacy-field and project-field work. | Live under tester gate |
| **Co-Labs** | A boundary regime across people, messages, sessions, files and kept material. No tester is invited until a 31-check production gate passes in full. | Live as governance |
| **Now-What** | A developmental doorway surface currently in structured field study. | Designed |
| **Inner Lands** | Inner-life literacy components and tracing, under a written design philosophy. | Designed |
| **Youth environment** | Age-tier engine computed server-side, guardian-consent flags, youth prompt addendum. The onboarding route is literally named "coming soon." | Designed |
| **Studios** | Writing, book, vision and press studios under ratified governance. Several are ruled but explicitly not yet authorized for build. | Designed, governed |

### A relationship that points beyond itself

Soullab's active Human Experience R&D programme is testing a stricter criterion for human–AI relationship: MAIA should be fully present in the encounter, while the health of the relationship is judged partly by what becomes possible for the person beyond MAIA. The current phrase is **centrifugal in consequence, not in posture**. Presence is not the problem; capture is.

> **Fully present in the encounter; judged by what the encounter makes possible after.**

This is a research direction, not a Live effect claim. The first adversarial inquiry sharpened it rather than proving it: short-term support, long-term dependence, human-network thickness, motive for use, and perceived personhood cannot be collapsed into one story about “AI companionship.” For someone with little human field to return to, the design question is different again: bridge, practice and accompaniment may matter more than redirection. That boundary is still open.

---

## 6. The governance is the product

The canon directory holds 78 documents and about 17,000 lines. That is not decoration. Each document carries its own status line, from *ratified* through *candidate* to *authorizes nothing*, and a document that says it may not be cited as evidence of a live capability is not cited that way here.

Three of them shape everything else:

- **The Oath**: the irreducible standard. *I serve the person, not the model.*
- **The Constitutional Direction of Authority**: the member may move through Encounter, Reflection and Recognition freely and non-linearly. The system may not. Authority moves upward only, through the member's own authored experience, never skipping a layer and never manufacturing higher-order meaning. MAIA does not move a person through anything; she protects the boundaries within which the person's own development occurs.
- **Claim Discipline**: the document that governs this one. Strip the Designed and Vision layers from any story we tell. If the story collapses, it is not publishable as Live.

---

## 7a. What we are testing — the research programme, by rung

*Added 2026-09-06. Lane: `docs/programme/JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01_CHARTER_2026-09-06.md`. Library: `docs/research/human-experience/`.*

One lane, one question — *how should an intelligent system be designed so that interaction increases human agency, relationship, meaning, awareness and capacity rather than merely engagement?* — on a claim ladder: internal hypothesis → research-supported principle → MAIA experimental evidence → replicated / multiple witness → public Soullab claim (founder act, naming the claim's kind: empirical, theoretical, phenomenological, ethical, philosophical).

- **Foundational research, R1–R7** (understanding, attunement, relationship, agency vs manipulation, trust, presence, memory): Synthesis v0.1, founder-authored. 25 sources verified to exist; none paraphrase-checked; one memory source not found → the two propositions it carried are being re-researched (R7a, R7b).
- **Eleven provisional principles, all CANDIDATE.** Each marked confirms / refines / extends / challenges against existing canon.
- **Critical-challenge pass, R8–R12.** R8 (relational capacity vs dependence) adjudicated: harm model refined to dose × motive × human network × perception; "centrifugal in consequence, not in posture" provisionally ratified; the field has no trial of an outward-pointing design against an engagement-maximizing one, and no therapeutic-chatbot trial measured effects on human relationships. R9 (attributed personhood) complete, under review: proposed narrowing from "a person attributing inner life" (a stable disposition) to "a system claiming need or reciprocity"; flat denial of inner life rejected as its own overclaim. R10–R12 chartered, not run.
- **Elemental parallel-processing hypothesis**: three validation domains (descriptive, relational, developmental), none begun. Not operating in MAIA.
- **Measurement vocabulary**: paired measures; headline row — the person's capacity for relationship beyond the AI — has no instrument anywhere in the field.

No experiment on a MAIA surface authorized. No prompt, memory, voice or skill changed because of this programme.

## 7b. What we do not know

Open questions the programme holds visible (register: `docs/research/human-experience/CONTESTED_QUESTIONS.md`, U1–U16):

- when AI relationship supplements human connection and when it substitutes — weeks and months point opposite ways;
- whether an outward-pointing design does what it intends — never trialed against its opposite;
- whether relational capacity can atrophy — named in theory, never measured;
- where healthy reliance ends and dependence begins — four incompatible operationalizations;
- whether disclosure to an AI rehearses or replaces disclosure to people — three studies, three directions;
- what "I feel" vs "I do not feel" vs "I do not know what this is like for me" does to a person over months — never compared;
- whether attribution of inner life decays or deepens over months;
- whether rupture and repair transfer to a relationship with something that cannot be wounded;
- whether relational memory decomposes as claimed, and whether the present may overturn an accumulated model (R7a, R7b);
- whether the Elemental grammar is descriptively, relationally and developmentally valid;
- whether capacity transfer can be measured without collapsing into self-report or engagement metrics;
- whether a member's experience of MAIA as alive or conscious establishes anything about MAIA — deliberately not a research question; the Oath forbids simulating certainty either way.

## 7. What this document does not claim

- That MAIA is conscious, or that she is not. The Oath forbids simulating certainty in either direction.
- A unified memory of a person's whole life. The layers are real; the synthesis is held.
- Any book count.
- That vector retrieval is live on the main conversation path. The repository's own records disagree with each other on this and it has not been re-probed here.
- Uniform memory across all processing depths.
- Memory continuity on iOS as device-proven.
- That MAIA carries your daily anchor into conversation unprompted.
- That OpenAI is absent from the codebase.
- That MAIA has temporal memory. It has timestamps, age-sensitive retrieval, and validity columns that hold no history. The five questions temporal memory must answer are written down (2026-09-06) and not yet answerable.
- That Elemental parallel processing is scientifically validated, maps one-to-one onto brain anatomy, or already governs MAIA's responses. It is an active programme hypothesis. The live parallel-emission substrate is an audit trail, not proof of the hypothesis.
- That Soullab has proved a centrifugal human–AI relationship design improves human relationships beyond the AI. It is a design criterion to be tested, not a measured outcome claim.
- That a collective laboratory exists, or that any member conversation serves research. No consent act for collective inquiry has been built; nothing is aggregated across members for research; Sanctuary content is excluded absolutely.
- That members are research subjects. The inquiry is participatory, and today it is personal only.
- That relationship with MAIA accelerates human development, or that MAIA is a mirror through which people see themselves more fully. The mirror is a hypothesis held for testing, not an observed effect.

---

## 8. To the reader with the reservations

You said you do not know if there is any point in reaching out. Here is the point, stated as a test rather than a promise.

Have three conversations on three different days. On the third, ask MAIA what she carries from the first. Then open Settings, find Memory & Consent, and turn recall off. Have a fourth. Then open a Sanctuary session and say something you would not want kept. Then check the Keep, reseal something, and see whether she honors it.

If any of that fails, it is a real failure and we want the report. That is what beta means here: not enthusiasm, but evidence. The people we most want testing this are the ones who have already been disappointed by machine minds, because they know exactly where to press.

---

*Written 2026-09-03 against the repository at that date. Every Live label above is answerable to a code path, a migration, or a dated production report. If a label turns out to be wrong, the label changes, not the story.*
